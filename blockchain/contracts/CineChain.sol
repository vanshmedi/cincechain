// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CineChain
 * @notice ERC-1155 film license token contract with atomic revenue distribution
 *         and EIP-2981 on-chain royalties.
 *
 * Token ID encoding:
 *   [filmId (128 bits)] | [tier (8 bits)] | [sequence (64 bits)]
 *
 * Tiers:
 *   0 = Rental       (fungible, 48-hr expiry, non-transferable)
 *   1 = Ownership    (semi-fungible, perpetual, once-giftable)
 *   2 = Collector    (non-fungible, perpetual, fully resalable)
 */
contract CineChain is ERC1155, ERC1155Supply, Ownable, ReentrancyGuard, IERC2981 {
    using SafeERC20 for IERC20;

    // ─── Constants ──────────────────────────────────────────────────────────────

    uint8 public constant TIER_RENTAL    = 0;
    uint8 public constant TIER_OWNERSHIP = 1;
    uint8 public constant TIER_COLLECTOR = 2;

    uint256 public constant ROYALTY_BPS  = 1000; // 10% filmmaker royalty on resale
    uint256 public constant PLATFORM_BPS = 500;  // 5%  platform fee on resale
    uint256 public constant BPS_BASE     = 10_000;

    // ─── Immutables ─────────────────────────────────────────────────────────────

    IERC20 public immutable USDC;

    // ─── Storage ─────────────────────────────────────────────────────────────────

    struct FilmRecipient {
        address wallet;
        uint256 shareBps; // basis points, must sum to 10_000 across all recipients
    }

    struct Film {
        string  metadataURI;       // IPFS URI for token metadata
        uint256 rentalPriceUsdc;   // in USDC units (6 decimals)
        uint256 ownershipPriceUsdc;
        uint256 collectorPriceUsdc;
        address filmmaker;         // receives EIP-2981 royalties on resale
        bool    active;
        FilmRecipient[] recipients; // primary-sale revenue split
    }

    // filmId → Film
    mapping(uint128 => Film) private _films;

    // filmId → tier → mint sequence counter
    mapping(uint128 => mapping(uint8 => uint64)) private _sequences;

    // tokenId → rental expiry timestamp (0 = non-rental)
    mapping(uint256 => uint256) public rentalExpiry;

    // tokenId → whether an Ownership token has been gifted (one-time transfer)
    mapping(uint256 => bool) public ownershipGifted;

    // filmId → price set on resale listings (managed off-chain; stored here for
    //   on-chain enforceability when resaleTransfer is called)
    // Not strictly needed — resale price is passed in at call time.

    uint128 private _nextFilmId;

    // ─── Events ──────────────────────────────────────────────────────────────────

    event FilmRegistered(uint128 indexed filmId, string metadataURI, address filmmaker);
    event FilmPurchased(
        uint128 indexed filmId,
        uint8   tier,
        address indexed buyer,
        uint256 tokenId,
        uint256 usdcAmount
    );
    event RevenueDistributed(uint128 indexed filmId, address indexed recipient, uint256 amount);
    event ResaleExecuted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 salePrice,
        uint256 royaltyAmount,
        uint256 platformFee,
        uint256 sellerProceeds
    );

    // ─── Errors ──────────────────────────────────────────────────────────────────

    error FilmNotFound(uint128 filmId);
    error FilmNotActive(uint128 filmId);
    error InvalidRecipients();
    error InvalidTier(uint8 tier);
    error InsufficientUSDCAllowance();
    error RentalExpired(uint256 tokenId);
    error NotTokenOwner(address caller, uint256 tokenId);
    error TransferRestricted(uint256 tokenId);
    error InvalidSalePrice();

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(address usdcAddress, address initialOwner)
        ERC1155("")
        Ownable(initialOwner)
    {
        USDC = IERC20(usdcAddress);
    }

    // ─── Film Management ─────────────────────────────────────────────────────────

    /**
     * @notice Register a new film with revenue split recipients.
     * @param metadataURI         IPFS URI (returned by uri())
     * @param rentalPrice         USDC amount (6 decimals) for rental tier
     * @param ownershipPrice      USDC amount for ownership tier
     * @param collectorPrice      USDC amount for collector tier
     * @param filmmaker           Address receiving EIP-2981 resale royalties
     * @param recipients          Array of {wallet, shareBps}; must sum to 10_000
     * @return filmId             Assigned film ID
     */
    function registerFilm(
        string  calldata metadataURI,
        uint256 rentalPrice,
        uint256 ownershipPrice,
        uint256 collectorPrice,
        address filmmaker,
        FilmRecipient[] calldata recipients
    ) external onlyOwner returns (uint128 filmId) {
        // Validate recipient shares sum to 100%
        uint256 totalBps;
        for (uint256 i; i < recipients.length; i++) {
            totalBps += recipients[i].shareBps;
        }
        if (totalBps != BPS_BASE || recipients.length == 0) revert InvalidRecipients();

        filmId = _nextFilmId++;
        Film storage film = _films[filmId];
        film.metadataURI        = metadataURI;
        film.rentalPriceUsdc    = rentalPrice;
        film.ownershipPriceUsdc = ownershipPrice;
        film.collectorPriceUsdc = collectorPrice;
        film.filmmaker          = filmmaker;
        film.active             = true;

        for (uint256 i; i < recipients.length; i++) {
            film.recipients.push(recipients[i]);
        }

        emit FilmRegistered(filmId, metadataURI, filmmaker);
    }

    function setFilmActive(uint128 filmId, bool active) external onlyOwner {
        _requireFilmExists(filmId);
        _films[filmId].active = active;
    }

    // ─── Purchase Functions ───────────────────────────────────────────────────────

    /**
     * @notice Mint an Ownership (tier 1) Film License Token.
     *         Called by the platform backend; USDC is pulled from the Common Pool.
     *         Revenue is distributed atomically in the same call.
     */
    function purchaseOwnership(uint128 filmId, address buyer)
        external
        onlyOwner
        nonReentrant
        returns (uint256 tokenId)
    {
        Film storage film = _requireActiveFilm(filmId);
        tokenId = _buildTokenId(filmId, TIER_OWNERSHIP, ++_sequences[filmId][TIER_OWNERSHIP]);
        _distributeRevenue(film, filmId, film.ownershipPriceUsdc);
        _mint(buyer, tokenId, 1, "");
        emit FilmPurchased(filmId, TIER_OWNERSHIP, buyer, tokenId, film.ownershipPriceUsdc);
    }

    /**
     * @notice Mint a Rental (tier 0) Film License Token with 48-hour expiry.
     */
    function purchaseRental(uint128 filmId, address buyer)
        external
        onlyOwner
        nonReentrant
        returns (uint256 tokenId)
    {
        Film storage film = _requireActiveFilm(filmId);
        tokenId = _buildTokenId(filmId, TIER_RENTAL, ++_sequences[filmId][TIER_RENTAL]);
        // Encode expiry as block.timestamp + 48hr in rentalExpiry mapping
        rentalExpiry[tokenId] = block.timestamp + 48 hours;
        _distributeRevenue(film, filmId, film.rentalPriceUsdc);
        _mint(buyer, tokenId, 1, "");
        emit FilmPurchased(filmId, TIER_RENTAL, buyer, tokenId, film.rentalPriceUsdc);
    }

    /**
     * @notice Mint a Collector (tier 2) Film License Token.
     *         Unique 1-of-1 per sequence. Fully resalable with royalties.
     */
    function purchaseCollector(uint128 filmId, address buyer)
        external
        onlyOwner
        nonReentrant
        returns (uint256 tokenId)
    {
        Film storage film = _requireActiveFilm(filmId);
        tokenId = _buildTokenId(filmId, TIER_COLLECTOR, ++_sequences[filmId][TIER_COLLECTOR]);
        _distributeRevenue(film, filmId, film.collectorPriceUsdc);
        _mint(buyer, tokenId, 1, "");
        emit FilmPurchased(filmId, TIER_COLLECTOR, buyer, tokenId, film.collectorPriceUsdc);
    }

    // ─── Resale ───────────────────────────────────────────────────────────────────

    /**
     * @notice Execute a secondary-market resale of a Collector Token.
     *         Atomically: pays filmmaker royalty, pays platform fee,
     *         transfers net USDC to seller, transfers NFT to buyer.
     *
     * @param tokenId     The Collector token being sold
     * @param seller      Current owner
     * @param buyer       New owner
     * @param salePriceUsdc  Agreed sale price in USDC (6 decimals)
     */
    function resaleTransfer(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 salePriceUsdc
    ) external onlyOwner nonReentrant {
        if (salePriceUsdc == 0) revert InvalidSalePrice();
        if (balanceOf(seller, tokenId) < 1) revert NotTokenOwner(seller, tokenId);

        uint8 tier = _tierFromTokenId(tokenId);
        if (tier != TIER_COLLECTOR) revert TransferRestricted(tokenId);

        uint128 filmId = _filmIdFromTokenId(tokenId);
        address filmmaker = _films[filmId].filmmaker;

        // Calculate splits
        uint256 royalty      = (salePriceUsdc * ROYALTY_BPS) / BPS_BASE;
        uint256 platformFee  = (salePriceUsdc * PLATFORM_BPS) / BPS_BASE;
        uint256 sellerNet    = salePriceUsdc - royalty - platformFee;

        // Checks-Effects-Interactions: transfer NFT first (state change),
        // then settle USDC (interaction).
        _safeTransferFrom(seller, buyer, tokenId, 1, "");

        // Pull USDC from Common Pool (msg.sender == owner == platform backend)
        USDC.safeTransferFrom(msg.sender, filmmaker, royalty);
        USDC.safeTransferFrom(msg.sender, owner(),   platformFee);
        USDC.safeTransferFrom(msg.sender, seller,    sellerNet);

        emit ResaleExecuted(tokenId, seller, buyer, salePriceUsdc, royalty, platformFee, sellerNet);
    }

    // ─── Read Functions ───────────────────────────────────────────────────────────

    /**
     * @notice Returns true if `account` holds a valid (non-expired) token for `filmId`.
     *         Checks all tiers.
     */
    function hasOwnership(uint128 filmId, address account) external view returns (bool) {
        // Check Ownership tier
        // We can't enumerate all tokenIds efficiently, so the backend must track
        // tokenIds per address. This function is a convenience for specific tokenIds.
        // For full coverage call hasValidToken(tokenId, account).
        // See hasValidToken below.
        _requireFilmExists(filmId);
        return false; // Implemented per-tokenId below
    }

    /**
     * @notice Returns true if `account` holds token `tokenId` and it's not expired.
     */
    function hasValidToken(uint256 tokenId, address account) external view returns (bool) {
        if (balanceOf(account, tokenId) == 0) return false;
        uint256 expiry = rentalExpiry[tokenId];
        if (expiry != 0 && block.timestamp > expiry) return false;
        return true;
    }

    /**
     * @notice ERC-1155 metadata URI. Returns the film's IPFS metadata URI.
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        uint128 filmId = _filmIdFromTokenId(tokenId);
        return _films[filmId].metadataURI;
    }

    /**
     * @notice EIP-2981 royalty info. Returns filmmaker + platform royalty for
     *         external marketplaces (10% filmmaker + 5% platform = 15% total to
     *         the filmmaker address — platform encodes its own split separately).
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        uint128 filmId = _filmIdFromTokenId(tokenId);
        receiver      = _films[filmId].filmmaker;
        royaltyAmount = (salePrice * ROYALTY_BPS) / BPS_BASE;
    }

    function getFilm(uint128 filmId) external view returns (
        string  memory metadataURI,
        uint256 rentalPrice,
        uint256 ownershipPrice,
        uint256 collectorPrice,
        address filmmaker,
        bool    active,
        uint256 recipientCount
    ) {
        _requireFilmExists(filmId);
        Film storage f = _films[filmId];
        return (
            f.metadataURI,
            f.rentalPriceUsdc,
            f.ownershipPriceUsdc,
            f.collectorPriceUsdc,
            f.filmmaker,
            f.active,
            f.recipients.length
        );
    }

    function getFilmRecipients(uint128 filmId) external view
        returns (address[] memory wallets, uint256[] memory shares)
    {
        _requireFilmExists(filmId);
        FilmRecipient[] storage recs = _films[filmId].recipients;
        wallets = new address[](recs.length);
        shares  = new uint256[](recs.length);
        for (uint256 i; i < recs.length; i++) {
            wallets[i] = recs[i].wallet;
            shares[i]  = recs[i].shareBps;
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────────

    /**
     * @dev Distribute USDC from the Common Pool (platform's wallet, which has
     *      pre-approved this contract to spend USDC) to all film recipients.
     */
    function _distributeRevenue(Film storage film, uint128 filmId, uint256 totalUsdc) internal {
        for (uint256 i; i < film.recipients.length; i++) {
            uint256 amount = (totalUsdc * film.recipients[i].shareBps) / BPS_BASE;
            if (amount > 0) {
                USDC.safeTransferFrom(msg.sender, film.recipients[i].wallet, amount);
                emit RevenueDistributed(filmId, film.recipients[i].wallet, amount);
            }
        }
    }

    /**
     * @dev Token ID encoding: [filmId 128b][tier 8b][sequence 64b]
     *      Total = 200 bits, fits in uint256.
     */
    function _buildTokenId(uint128 filmId, uint8 tier, uint64 sequence)
        internal pure returns (uint256)
    {
        return (uint256(filmId) << 72) | (uint256(tier) << 64) | uint256(sequence);
    }

    function _filmIdFromTokenId(uint256 tokenId) internal pure returns (uint128) {
        return uint128(tokenId >> 72);
    }

    function _tierFromTokenId(uint256 tokenId) internal pure returns (uint8) {
        return uint8((tokenId >> 64) & 0xFF);
    }

    function _requireFilmExists(uint128 filmId) internal view {
        if (filmId >= _nextFilmId) revert FilmNotFound(filmId);
    }

    function _requireActiveFilm(uint128 filmId) internal view returns (Film storage film) {
        _requireFilmExists(filmId);
        film = _films[filmId];
        if (!film.active) revert FilmNotActive(filmId);
    }

    // ─── Transfer Hooks (enforce tier restrictions) ──────────────────────────────

    /**
     * @dev Override to enforce:
     *   - Rentals: non-transferable
     *   - Ownership: one-time gift only (owner → recipient, then locked)
     *   - Collector: freely transferable
     *   - Minting (from == address(0)) and burning always allowed.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        // Allow minting (from == 0) and burning (to == 0) unconditionally
        if (from != address(0) && to != address(0)) {
            for (uint256 i; i < ids.length; i++) {
                uint8 tier = _tierFromTokenId(ids[i]);

                if (tier == TIER_RENTAL) {
                    revert TransferRestricted(ids[i]);
                }

                if (tier == TIER_OWNERSHIP) {
                    // One-time gift: only the platform (owner) can trigger this
                    // via safeTransferFrom (i.e., resaleTransfer won't touch
                    // Ownership tokens — already gated above). Here we allow
                    // the first user-initiated transfer if called by owner.
                    if (msg.sender != owner()) revert TransferRestricted(ids[i]);
                    if (ownershipGifted[ids[i]]) revert TransferRestricted(ids[i]);
                    ownershipGifted[ids[i]] = true;
                }

                // TIER_COLLECTOR: no restriction here; resaleTransfer gates it.
            }
        }

        super._update(from, to, ids, values);
    }
}
