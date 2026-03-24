// test/CineChain.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture }  = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// Mock USDC: 6 decimals
const USDC_DECIMALS = 6n;
const toUsdc = (n) => BigInt(n) * 10n ** USDC_DECIMALS;

describe("CineChain", function () {
  // ── Fixture ────────────────────────────────────────────────────────────────
  async function deployFixture() {
    const [owner, filmmaker, coProducer, talent, buyer, buyer2, outsider] =
      await ethers.getSigners();

    // Deploy a mock ERC-20 as USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6);

    // Mint USDC to the owner (Common Pool) and buyers
    await usdc.mint(owner.address, toUsdc(10_000));
    await usdc.mint(buyer.address, toUsdc(1_000));
    await usdc.mint(buyer2.address, toUsdc(1_000));

    // Deploy CineChain
    const CineChain = await ethers.getContractFactory("CineChain");
    const cc = await CineChain.deploy(await usdc.getAddress(), owner.address);

    // Approve contract to spend from owner (Common Pool) and buyers
    await usdc.connect(owner).approve(await cc.getAddress(), ethers.MaxUint256);
    await usdc.connect(buyer).approve(await cc.getAddress(), ethers.MaxUint256);
    await usdc.connect(buyer2).approve(await cc.getAddress(), ethers.MaxUint256);

    // Standard revenue split: filmmaker 70%, talent 25%, protocol 5%
    const recipients = [
      { wallet: filmmaker.address, shareBps: 7000 },
      { wallet: talent.address,    shareBps: 2500 },
      { wallet: owner.address,     shareBps:  500 }, // protocol fee
    ];

    return { cc, usdc, owner, filmmaker, coProducer, talent, buyer, buyer2, outsider, recipients };
  }

  async function filmFixture() {
    const base = await deployFixture();
    const { cc, filmmaker, recipients } = base;

    const tx = await cc.registerFilm(
      "ipfs://QmTestMetadata",
      toUsdc(1),   // $1 rental
      toUsdc(10),  // $10 ownership
      toUsdc(25),  // $25 collector
      filmmaker.address,
      recipients
    );
    const receipt = await tx.wait();
    const filmId = 0n; // first film

    return { ...base, filmId };
  }

  // ── Film Registration ──────────────────────────────────────────────────────
  describe("registerFilm", function () {
    it("registers a film and emits FilmRegistered", async function () {
      const { cc, filmmaker, recipients } = await loadFixture(deployFixture);

      await expect(
        cc.registerFilm("ipfs://QmTest", toUsdc(1), toUsdc(10), toUsdc(25), filmmaker.address, recipients)
      )
        .to.emit(cc, "FilmRegistered")
        .withArgs(0n, "ipfs://QmTest", filmmaker.address);
    });

    it("reverts if recipient shares don't sum to 10_000", async function () {
      const { cc, filmmaker } = await loadFixture(deployFixture);
      const badRecipients = [{ wallet: filmmaker.address, shareBps: 5000 }];
      await expect(
        cc.registerFilm("ipfs://QmTest", 0, 0, 0, filmmaker.address, badRecipients)
      ).to.be.revertedWithCustomError(cc, "InvalidRecipients");
    });

    it("reverts if called by non-owner", async function () {
      const { cc, filmmaker, outsider, recipients } = await loadFixture(deployFixture);
      await expect(
        cc.connect(outsider).registerFilm("ipfs://x", 0, 0, 0, filmmaker.address, recipients)
      ).to.be.revertedWithCustomError(cc, "OwnableUnauthorizedAccount");
    });
  });

  // ── Ownership Purchase ────────────────────────────────────────────────────
  describe("purchaseOwnership", function () {
    it("distributes USDC to all recipients atomically", async function () {
      const { cc, usdc, filmmaker, talent, owner, buyer, filmId } =
        await loadFixture(filmFixture);

      const filmakerbefore = await usdc.balanceOf(filmmaker.address);
      const talentBefore   = await usdc.balanceOf(talent.address);
      const protocolBefore = await usdc.balanceOf(owner.address);

      await cc.purchaseOwnership(filmId, buyer.address);

      // $10 * 70% = $7 to filmmaker
      expect(await usdc.balanceOf(filmmaker.address)).to.equal(filmakerbefore + toUsdc(7));
      // $10 * 25% = $2.50 to talent
      expect(await usdc.balanceOf(talent.address)).to.equal(talentBefore + toUsdc(25) / 10n);
      // $10 * 5%  = $0.50 to protocol (deducted from owner/pool, then re-added)
    });

    it("mints an ERC-1155 token to buyer", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseOwnership(filmId, buyer.address);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");

      const tokenId = event.args.tokenId;
      expect(await cc.balanceOf(buyer.address, tokenId)).to.equal(1n);
    });

    it("emits FilmPurchased with correct tier", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseOwnership(filmId, buyer.address);
      await expect(tx)
        .to.emit(cc, "FilmPurchased")
        .withArgs(filmId, 1, buyer.address, /* tokenId: any */ anyValue, toUsdc(10));
    });
  });

  // ── Rental Purchase ───────────────────────────────────────────────────────
  describe("purchaseRental", function () {
    it("sets 48-hour expiry on the token", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseRental(filmId, buyer.address);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      const block = await ethers.provider.getBlock(receipt.blockNumber);
      const expiry = await cc.rentalExpiry(tokenId);
      expect(expiry).to.equal(BigInt(block.timestamp) + 48n * 3600n);
    });

    it("hasValidToken returns false after expiry", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseRental(filmId, buyer.address);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      // Fast-forward 49 hours
      await ethers.provider.send("evm_increaseTime", [49 * 3600]);
      await ethers.provider.send("evm_mine");

      expect(await cc.hasValidToken(tokenId, buyer.address)).to.be.false;
    });

    it("rental token cannot be transferred", async function () {
      const { cc, buyer, buyer2, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseRental(filmId, buyer.address);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      await expect(
        cc.connect(buyer).safeTransferFrom(buyer.address, buyer2.address, tokenId, 1, "0x")
      ).to.be.revertedWithCustomError(cc, "TransferRestricted");
    });
  });

  // ── Resale ────────────────────────────────────────────────────────────────
  describe("resaleTransfer", function () {
    it("executes royalty split and NFT transfer atomically", async function () {
      const { cc, usdc, buyer, buyer2, filmmaker, owner, filmId } =
        await loadFixture(filmFixture);

      // Buy collector token
      const buyTx = await cc.purchaseCollector(filmId, buyer.address);
      const receipt = await buyTx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      const filmmakerBefore = await usdc.balanceOf(filmmaker.address);
      const sellerBefore    = await usdc.balanceOf(buyer.address);

      // Resale at $50
      await cc.resaleTransfer(tokenId, buyer.address, buyer2.address, toUsdc(50));

      // Filmmaker gets 10% = $5
      expect(await usdc.balanceOf(filmmaker.address)).to.equal(filmmakerBefore + toUsdc(5));
      // Seller gets 85% = $42.50
      expect(await usdc.balanceOf(buyer.address)).to.equal(sellerBefore + toUsdc(425) / 10n);
      // NFT moved to buyer2
      expect(await cc.balanceOf(buyer2.address, tokenId)).to.equal(1n);
      expect(await cc.balanceOf(buyer.address,  tokenId)).to.equal(0n);
    });

    it("reverts if seller doesn't own the token", async function () {
      const { cc, buyer, buyer2, outsider, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseCollector(filmId, buyer.address);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      await expect(
        cc.resaleTransfer(tokenId, outsider.address, buyer2.address, toUsdc(50))
      ).to.be.revertedWithCustomError(cc, "NotTokenOwner");
    });

    it("reverts for non-collector tier", async function () {
      const { cc, buyer, buyer2, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseOwnership(filmId, buyer.address);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");
      const tokenId = event.args.tokenId;

      await expect(
        cc.resaleTransfer(tokenId, buyer.address, buyer2.address, toUsdc(50))
      ).to.be.revertedWithCustomError(cc, "TransferRestricted");
    });
  });

  // ── Token ID encoding ────────────────────────────────────────────────────
  describe("Token ID encoding", function () {
    it("encodes filmId, tier, and sequence correctly", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);

      const tx1 = await cc.purchaseOwnership(filmId, buyer.address);
      const r1 = await tx1.wait();
      const e1 = r1.logs.map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } }).find((e) => e?.name === "FilmPurchased");

      const tx2 = await cc.purchaseOwnership(filmId, buyer.address);
      const r2 = await tx2.wait();
      const e2 = r2.logs.map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } }).find((e) => e?.name === "FilmPurchased");

      // Two ownership tokens should have different sequence numbers
      expect(e1.args.tokenId).to.not.equal(e2.args.tokenId);

      // filmId is encoded in upper 128 bits (shifted by 72)
      const id1 = e1.args.tokenId;
      expect(id1 >> 72n).to.equal(BigInt(filmId));
    });
  });

  // ── URI ───────────────────────────────────────────────────────────────────
  describe("uri", function () {
    it("returns the film's IPFS metadata URI", async function () {
      const { cc, buyer, filmId } = await loadFixture(filmFixture);
      const tx = await cc.purchaseOwnership(filmId, buyer.address);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((l) => { try { return cc.interface.parseLog(l); } catch { return null; } })
        .find((e) => e?.name === "FilmPurchased");

      expect(await cc.uri(event.args.tokenId)).to.equal("ipfs://QmTestMetadata");
    });
  });
});
