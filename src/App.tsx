/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { GrainOverlay } from "./components/ui/GrainOverlay";
import { WalletConnectModal } from "./components/ui/WalletConnectModal";
import { LandingScreen } from "./screens/LandingScreen";
import { GalleryScreen } from "./screens/GalleryScreen";
import { VaultScreen } from "./screens/VaultScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { SubmitScreen } from "./screens/SubmitScreen";
import { StudioScreen } from "./screens/StudioScreen";
import { FilmPage } from "./screens/FilmPage";
import { TokenPurchaseFlow } from "./screens/TokenPurchaseFlow";
import { CinePassScreen } from "./screens/CinePassScreen";
import { GovernanceScreen } from "./screens/GovernanceScreen";
import { MarketScreen } from "./screens/MarketScreen";
import { PiracyScreen } from "./screens/PiracyScreen";
import { CuratorProfileScreen } from "./screens/CuratorProfileScreen";
import { FilmmakerRevenueDashboard } from "./screens/FilmmakerRevenueDashboard";

export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [selectedFilmId, setSelectedFilmId] = useState<number>(1);
  const [selectedCuratorHandle, setSelectedCuratorHandle] = useState<string>("CineVault Curator");

  // Wallet / auth state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // CineCredit balance (starts at 2500 CC on connect)
  const [cineCredits, setCineCredits] = useState(2500);

  // CINE token balance for governance
  const [cineBalance, setCineBalance] = useState(350);

  // Token purchase flow state
  const [purchaseFilmId, setPurchaseFilmId] = useState<number | null>(null);
  const [purchaseTier, setPurchaseTier] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);

  // Unified navigation handler — handles both simple views and views that need data
  const navigate = (view: string, filmId?: number, curatorHandle?: string) => {
    if (filmId !== undefined) setSelectedFilmId(filmId);
    if (curatorHandle !== undefined) setSelectedCuratorHandle(curatorHandle);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setCineCredits(2500);
    setShowWalletModal(false);
  };

  const handlePurchaseRequest = (filmId: number, tierName: string, price: number) => {
    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }
    setPurchaseFilmId(filmId);
    setPurchaseTier(tierName);
    setPurchasePrice(price);
  };

  const handlePurchaseConfirm = (price: number) => {
    setCineCredits((prev) => Math.max(0, prev - price));
    // Keep modal open to show confirmation; close is handled inside TokenPurchaseFlow
  };

  const noNavViews = ["studio", "revenue"];

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary selection:text-white">
      <GrainOverlay />

      {/* Wallet Connect Modal */}
      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      )}

      {/* Token Purchase Flow Modal */}
      {purchaseFilmId !== null && (
        <TokenPurchaseFlow
          filmId={purchaseFilmId}
          tierName={purchaseTier}
          price={purchasePrice}
          cineCredits={cineCredits}
          onClose={() => setPurchaseFilmId(null)}
          onConfirm={handlePurchaseConfirm}
        />
      )}

      {!noNavViews.includes(currentView) && (
        <Navbar
          currentView={currentView}
          setView={navigate}
          walletAddress={walletAddress}
          cineCredits={cineCredits}
          onConnect={() => setShowWalletModal(true)}
        />
      )}

      <main className={`flex-grow ${!noNavViews.includes(currentView) ? "pt-16" : ""}`}>
        {currentView === "landing" && (
          <LandingScreen setView={navigate} onConnect={() => setShowWalletModal(true)} />
        )}
        {currentView === "gallery" && (
          <GalleryScreen setView={navigate} />
        )}
        {currentView === "film" && (
          <FilmPage
            filmId={selectedFilmId}
            setView={navigate}
            onPurchase={handlePurchaseRequest}
            cineCredits={cineCredits}
          />
        )}
        {currentView === "vault" && (
          <VaultScreen setView={navigate} />
        )}
        {currentView === "community" && (
          <CommunityScreen setView={navigate} />
        )}
        {currentView === "submit" && (
          <SubmitScreen setView={navigate} />
        )}
        {currentView === "studio" && (
          <StudioScreen setView={navigate} />
        )}
        {currentView === "pass" && (
          <CinePassScreen cineCredits={cineCredits} setView={navigate} />
        )}
        {currentView === "governance" && (
          <GovernanceScreen cineBalance={cineBalance} />
        )}
        {currentView === "market" && (
          <MarketScreen cineCredits={cineCredits} setView={navigate} />
        )}
        {currentView === "piracy" && (
          <PiracyScreen setView={navigate} />
        )}
        {currentView === "curator" && (
          <CuratorProfileScreen
            curatorHandle={selectedCuratorHandle}
            setView={(view, filmId) => navigate(view, filmId)}
          />
        )}
        {currentView === "revenue" && (
          <FilmmakerRevenueDashboard setView={navigate} />
        )}
      </main>

      {!noNavViews.includes(currentView) && (
        <Footer setView={navigate} />
      )}

      {/* Studio / Revenue exit button */}
      {noNavViews.includes(currentView) && (
        <button
          onClick={() => navigate("landing")}
          className="fixed bottom-4 right-4 z-50 bg-on-surface text-surface px-4 py-2 font-label text-xs uppercase tracking-widest font-bold shadow-hard hover:-translate-y-1 hover:translate-x-1 hover:shadow-hard-hover transition-all"
        >
          Exit Dashboard
        </button>
      )}
    </div>
  );
}
