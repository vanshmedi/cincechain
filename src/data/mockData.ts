/**
 * Shared mock data for CineChain — all values match PRD spec:
 * 1 CC = $0.10 | Protocol fee 5% | Resale royalty 10%
 * CinePass: Observer $12 | Curator $22 | Auteur $45
 * Token tiers: Rental / Ownership / Collector (FLT)
 */

export interface Film {
  id: number;
  title: string;
  director: string;
  year: number;
  genre: string;
  runtime: string;
  synopsis: string;
  image: string;
  fundingGoal: number;
  fundingRaised: number;
  status: "Now Minting" | "Funded" | "In Production" | "Released";
  festivalBadges: string[];
  curatorEndorsed: boolean;
  curatorName?: string;
  tokens: {
    rental: { price: number; supply: number; remaining: number };
    ownership: { price: number; supply: number; remaining: number };
    collector: { price: number; supply: number; remaining: number };
  };
  revenueSplit: { director: number; producer: number; crew: number; protocol: number };
  backers: number;
}

export const films: Film[] = [
  {
    id: 1,
    title: "The Silent Echo",
    director: "Elena Rostova",
    year: 2024,
    genre: "Drama",
    runtime: "98 min",
    synopsis: "A visually stunning exploration of isolation in a hyper-connected world. A deaf painter retreats to a lighthouse only to find the silence broken by mysterious signals from the sea.",
    image: "https://picsum.photos/seed/film3/600/400",
    fundingGoal: 150000,
    fundingRaised: 127500,
    status: "Now Minting",
    festivalBadges: ["Sundance Official Selection", "IDFA Winner"],
    curatorEndorsed: true,
    curatorName: "CineVault Curator",
    tokens: {
      rental: { price: 150, supply: 5000, remaining: 3420 },   // 150 CC = $15
      ownership: { price: 500, supply: 1000, remaining: 287 }, // 500 CC = $50
      collector: { price: 2500, supply: 100, remaining: 12 },  // 2500 CC = $250
    },
    revenueSplit: { director: 60, producer: 25, crew: 10, protocol: 5 },
    backers: 412,
  },
  {
    id: 2,
    title: "Neon Dreams",
    director: "Kaito Mori",
    year: 2024,
    genre: "Sci-Fi",
    runtime: "112 min",
    synopsis: "In 2077 Tokyo, a rogue AI composer escapes containment and teams up with a down-and-out musician to perform one last concert before the city shuts it down forever.",
    image: "https://picsum.photos/seed/film1/600/400",
    fundingGoal: 200000,
    fundingRaised: 200000,
    status: "Funded",
    festivalBadges: ["SXSW Midnight"],
    curatorEndorsed: true,
    curatorName: "NeonCurator",
    tokens: {
      rental: { price: 200, supply: 8000, remaining: 6120 },
      ownership: { price: 800, supply: 2000, remaining: 450 },
      collector: { price: 4000, supply: 50, remaining: 3 },
    },
    revenueSplit: { director: 55, producer: 30, crew: 10, protocol: 5 },
    backers: 890,
  },
  {
    id: 3,
    title: "The Last Heist",
    director: "Marcus Chen",
    year: 2023,
    genre: "Action",
    runtime: "105 min",
    synopsis: "A retired safecracker is pulled back for one final job — stealing the master print of the world's most valuable lost film from a private vault in Monaco.",
    image: "https://picsum.photos/seed/film2/600/400",
    fundingGoal: 180000,
    fundingRaised: 180000,
    status: "Released",
    festivalBadges: [],
    curatorEndorsed: false,
    tokens: {
      rental: { price: 100, supply: 10000, remaining: 8000 },
      ownership: { price: 400, supply: 3000, remaining: 2100 },
      collector: { price: 2000, supply: 200, remaining: 88 },
    },
    revenueSplit: { director: 65, producer: 20, crew: 10, protocol: 5 },
    backers: 1204,
  },
  {
    id: 4,
    title: "Whispers in the Dark",
    director: "Sarah Jenkins",
    year: 2024,
    genre: "Thriller",
    runtime: "91 min",
    synopsis: "A grief counselor discovers her clients are all dreaming the same dream — a house that doesn't exist. Until it does.",
    image: "https://picsum.photos/seed/film4/600/400",
    fundingGoal: 90000,
    fundingRaised: 62000,
    status: "Now Minting",
    festivalBadges: ["Tribeca Spotlight"],
    curatorEndorsed: true,
    curatorName: "DarkCuratorDao",
    tokens: {
      rental: { price: 120, supply: 4000, remaining: 2890 },
      ownership: { price: 450, supply: 800, remaining: 620 },
      collector: { price: 2000, supply: 75, remaining: 60 },
    },
    revenueSplit: { director: 70, producer: 15, crew: 10, protocol: 5 },
    backers: 228,
  },
  {
    id: 5,
    title: "A Distant Star",
    director: "Aisha Patel",
    year: 2025,
    genre: "Sci-Fi",
    runtime: "124 min",
    synopsis: "The first interstellar colony's sole survivor returns to Earth after 40 years — to find she has only aged three months, and Earth doesn't remember sending her.",
    image: "https://picsum.photos/seed/film5/600/400",
    fundingGoal: 250000,
    fundingRaised: 75000,
    status: "Now Minting",
    festivalBadges: [],
    curatorEndorsed: false,
    tokens: {
      rental: { price: 180, supply: 6000, remaining: 5988 },
      ownership: { price: 700, supply: 1500, remaining: 1498 },
      collector: { price: 3500, supply: 80, remaining: 79 },
    },
    revenueSplit: { director: 60, producer: 25, crew: 10, protocol: 5 },
    backers: 94,
  },
  {
    id: 6,
    title: "Concrete Jungle",
    director: "Leo Vance",
    year: 2023,
    genre: "Documentary",
    runtime: "78 min",
    synopsis: "An intimate portrait of the last five remaining independent theater owners in Manhattan, fighting to keep the art of cinema alive against the streaming tide.",
    image: "https://picsum.photos/seed/film6/600/400",
    fundingGoal: 60000,
    fundingRaised: 60000,
    status: "Released",
    festivalBadges: ["DOC NYC Award"],
    curatorEndorsed: true,
    curatorName: "DocuCollective",
    tokens: {
      rental: { price: 80, supply: 12000, remaining: 9500 },
      ownership: { price: 300, supply: 2000, remaining: 1800 },
      collector: { price: 1500, supply: 100, remaining: 65 },
    },
    revenueSplit: { director: 75, producer: 10, crew: 10, protocol: 5 },
    backers: 567,
  },
];

// CinePass tiers - exact PRD pricing
export const cinePasses = [
  {
    id: "observer",
    name: "Observer",
    priceUSD: 12,
    priceCC: 120, // 1 CC = $0.10, so $12 = 120 CC
    description: "Watch, discover, explore.",
    features: [
      "Unlimited streaming of funded films",
      "Access to public film catalog",
      "Community forum participation",
      "Standard SD quality (1080p)",
      "Monthly new releases",
    ],
    color: "on-surface" as const,
  },
  {
    id: "curator",
    name: "Curator",
    priceUSD: 22,
    priceCC: 220,
    description: "Curate, endorse, influence.",
    features: [
      "All Observer features",
      "4K / HDR streaming",
      "Endorse films & earn reputation",
      "Early access to new mints",
      "Curator badge on profile",
      "Priority support",
    ],
    color: "primary" as const,
    recommended: true,
  },
  {
    id: "auteur",
    name: "Auteur",
    priceUSD: 45,
    priceCC: 450,
    description: "Create, govern, profit.",
    features: [
      "All Curator features",
      "Governance voting rights",
      "Revenue share from Auteur pool",
      "Filmmaker upload credentials",
      "Piracy detection alerts",
      "Private Discord access",
      "Annual Auteur NFT badge",
    ],
    color: "secondary" as const,
  },
];

// Governance proposals
export const proposals = [
  {
    id: "CIP-042",
    title: "Increase Documentary Funding Pool to 30%",
    author: "DocuMaker99",
    description: "Proposal to reallocate 5% of the general funding pool specifically to documentary films, increasing the documentary category allocation from 25% to 30%.",
    votesFor: 12847,
    votesAgainst: 3421,
    quorum: 20000,
    status: "Active",
    endsIn: "2d 14h",
    cineRequired: 1,
  },
  {
    id: "CIP-041",
    title: "Reduce Protocol Fee from 7% to 5%",
    author: "CoreTeam",
    description: "A protocol-level change to reduce the standard transaction fee from 7% to 5%, making CineChain more competitive and passing more revenue to filmmakers.",
    votesFor: 28100,
    votesAgainst: 2900,
    quorum: 20000,
    status: "Passed",
    endsIn: "Ended",
    cineRequired: 1,
  },
  {
    id: "CIP-040",
    title: "Add Korean Cinema Category",
    author: "KoreanFilmDao",
    description: "Formal creation of a dedicated Korean Cinema category within the gallery, with a dedicated curator council and separate funding track.",
    votesFor: 8200,
    votesAgainst: 11300,
    quorum: 20000,
    status: "Failed",
    endsIn: "Ended",
    cineRequired: 1,
  },
  {
    id: "CIP-039",
    title: "CinePass Revenue Sharing: Auteur Tier Expansion",
    author: "AuteurCollective",
    description: "Expand Auteur tier revenue sharing to include 2% of all secondary market sales, not just primary mints.",
    votesFor: 9800,
    votesAgainst: 4100,
    quorum: 20000,
    status: "Active",
    endsIn: "5d 8h",
    cineRequired: 1,
  },
];

// Secondary market listings
export interface Listing {
  id: number;
  filmId: number;
  filmTitle: string;
  filmImage: string;
  tokenType: "Rental" | "Ownership" | "Collector";
  tokenNumber: string;
  seller: string;
  askPrice: number; // in CC
  originalPrice: number; // in CC
  royalty: number; // 10% PRD spec
  protocolFee: number; // 5% PRD spec
  sellerReceives: number;
  listedAt: string;
}

export const marketListings: Listing[] = [
  {
    id: 1,
    filmId: 2,
    filmTitle: "Neon Dreams",
    filmImage: "https://picsum.photos/seed/film1/600/400",
    tokenType: "Collector",
    tokenNumber: "#042",
    seller: "0xCyber...f1a2",
    askPrice: 6000,
    originalPrice: 4000,
    royalty: 10,
    protocolFee: 5,
    sellerReceives: 5100, // 6000 - 600 royalty - 300 fee
    listedAt: "2h ago",
  },
  {
    id: 2,
    filmId: 1,
    filmTitle: "The Silent Echo",
    filmImage: "https://picsum.photos/seed/film3/600/400",
    tokenType: "Collector",
    tokenNumber: "#007",
    seller: "0xEcho...b3c4",
    askPrice: 3800,
    originalPrice: 2500,
    royalty: 10,
    protocolFee: 5,
    sellerReceives: 3230,
    listedAt: "5h ago",
  },
  {
    id: 3,
    filmId: 3,
    filmTitle: "The Last Heist",
    filmImage: "https://picsum.photos/seed/film2/600/400",
    tokenType: "Ownership",
    tokenNumber: "#118",
    seller: "0xHeist...d5e6",
    askPrice: 500,
    originalPrice: 400,
    royalty: 10,
    protocolFee: 5,
    sellerReceives: 425,
    listedAt: "1d ago",
  },
  {
    id: 4,
    filmId: 6,
    filmTitle: "Concrete Jungle",
    filmImage: "https://picsum.photos/seed/film6/600/400",
    tokenType: "Collector",
    tokenNumber: "#005",
    seller: "0xDoc...f7g8",
    askPrice: 2200,
    originalPrice: 1500,
    royalty: 10,
    protocolFee: 5,
    sellerReceives: 1870,
    listedAt: "2d ago",
  },
];

// Piracy detections
export const piracyDetections = [
  {
    id: 1,
    filmTitle: "Neon Dreams",
    filmImage: "https://picsum.photos/seed/film1/600/400",
    sourceUrl: "https://illegal-stream-xyz.onion/watch?v=neon-dreams-2024",
    detectedAt: "2026-03-21T18:42:00Z",
    severity: "High",
    status: "Under Review",
    fingerprint: "WM-ND-2024-0042",
  },
  {
    id: 2,
    filmTitle: "The Silent Echo",
    filmImage: "https://picsum.photos/seed/film3/600/400",
    sourceUrl: "https://rip-site.com/silentecho",
    detectedAt: "2026-03-20T09:15:00Z",
    severity: "Medium",
    status: "DMCA Sent",
    fingerprint: "WM-SE-2024-0117",
  },
  {
    id: 3,
    filmTitle: "Concrete Jungle",
    filmImage: "https://picsum.photos/seed/film6/600/400",
    sourceUrl: "https://torrent-bay.net/concrete-jungle-2023",
    detectedAt: "2026-03-18T14:30:00Z",
    severity: "Low",
    status: "Resolved",
    fingerprint: "WM-CJ-2023-0008",
  },
];

// Curator profiles
export const curators = [
  {
    handle: "CineVault Curator",
    displayName: "Daria Morozova",
    avatar: "DM",
    bio: "Ex-festival director. I champion films that refuse to fit in a box.",
    reputation: 94,
    endorsements: 18,
    totalVolume: 42000, // CC
    memberSince: "2023",
    endorsedFilms: [1, 4, 6],
  },
  {
    handle: "NeonCurator",
    displayName: "Takeshi Yamamoto",
    avatar: "TY",
    bio: "Future-forward. Genre films with something to say.",
    reputation: 88,
    endorsements: 12,
    totalVolume: 28500,
    memberSince: "2024",
    endorsedFilms: [2, 5],
  },
];
