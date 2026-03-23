/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { GrainOverlay } from "./components/ui/GrainOverlay";
import { WalletConnectModal } from "./components/ui/WalletConnectModal";
import type { DbUser } from "./lib/supabase";
import { 
  loginWithWallet, 
  loadWalletFromStorage, 
  clearWalletFromStorage,
  purchaseFilmToken,
  subscribeToCinePass
} from "./lib/auth";
import { LandingScreen } from "./screens/LandingScreen";
import { GalleryScreen } from "./screens/GalleryScreen";
import { VaultScreen } from "./screens/VaultScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { SubmitScreen } from "./screens/SubmitScreen";
import { StudioScreen } from "./screens/StudioScreen";
import { FilmPage } from "./screens/FilmPage";
import { TokenPurchaseFlow } from "./screens/TokenPurchaseFlow";
import { GovernanceScreen } from "./screens/GovernanceScreen";
import { MarketScreen } from "./screens/MarketScreen";
import { PiracyScreen } from "./screens/PiracyScreen";
import { CuratorProfileScreen } from "./screens/CuratorProfileScreen";
import { FilmmakerRevenueDashboard } from "./screens/FilmmakerRevenueDashboard";

export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [selectedFilmId, setSelectedFilmId] = useState<number>(1);
  const [selectedCuratorHandle, setSelectedCuratorHandle] = useState<string>("CineVault Curator");
  const [selectedMarketItem, setSelectedMarketItem] = useState<number | null>(null);

  // ── Auth state: full Supabase user row (null = logged out) ──────────────
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isRehydrating, setIsRehydrating] = useState(true);

  // Derived convenience values
  const walletAddress = currentUser?.wallet_address ?? null;
  const cineCredits   = currentUser?.credit_balance ?? 0;

  // CINE token balance for governance (on-chain, not in DB yet)
  const [cineBalance, setCineBalance] = useState(350);

  // ── Session persistence: rehydrate from localStorage on mount ───────────
  useEffect(() => {
    const initSession = async () => {
      const savedWallet = loadWalletFromStorage();
      if (savedWallet) {
        try {
          const user = await loginWithWallet(savedWallet);
          setCurrentUser(user);
        } catch (err) {
          console.error("[App] Failed to rehydrate session:", err);
          clearWalletFromStorage();
        }
      }
      setIsRehydrating(false);
    };
    initSession();
  }, []);

  // Token purchase flow state
  const [purchaseFilmId, setPurchaseFilmId] = useState<number | null>(null);
  const [purchaseTier, setPurchaseTier] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<number>(0);

  // Unified navigation handler
  const navigate = (view: string, filmId?: number, curatorHandle?: string, marketItemId?: number) => {
    if (filmId !== undefined) setSelectedFilmId(filmId);
    if (curatorHandle !== undefined) setSelectedCuratorHandle(curatorHandle);
    if (marketItemId !== undefined) {
      setSelectedMarketItem(marketItemId);
    } else if (view !== "market") {
      setSelectedMarketItem(null);
    }
    
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWalletConnect = (user: DbUser) => {
    setCurrentUser(user);
    setShowWalletModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearWalletFromStorage();
    setCurrentView("landing");
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

  const handlePurchaseConfirm = async (price: number) => {
    if (!currentUser || purchaseFilmId === null) return;

    try {
      const updatedUser = await purchaseFilmToken(
        currentUser.id,
        purchaseFilmId.toString(),
        purchaseTier.toLowerCase() as any,
        price
      );
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error("[App] Purchase failed:", err);
    }
  };

  const handleSubscribe = async (tier: string, bonus: number) => {
    if (!currentUser) {
      setShowWalletModal(true);
      return;
    }
    try {
      const updatedUser = await subscribeToCinePass(currentUser.id, tier, bonus);
      setCurrentUser(updatedUser);
      alert(`Success! Simulated fiat payment complete. Added ${bonus} CC to your balance.`);
      navigate("vault");
    } catch (err) {
      console.error("[App] Subscription failed:", err);
      alert("Subscription failed. Check console.");
    }
  };

  const noNavViews = ["studio", "revenue"];

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary selection:text-white">
      <GrainOverlay />

      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />
      )}

      {purchaseFilmId !== null && (
        <TokenPurchaseFlow
          filmId={purchaseFilmId}
          tierName={purchaseTier}
          price={purchasePrice}
          cineCredits={cineCredits}
          onClose={() => setPurchaseFilmId(null)}
          onConfirm={handlePurchaseConfirm}
          setView={navigate}
        />
      )}

      {!noNavViews.includes(currentView) && (
        <Navbar
          currentView={currentView}
          setView={navigate}
          walletAddress={walletAddress}
          cineCredits={cineCredits}
          onConnect={() => setShowWalletModal(true)}
          onLogout={handleLogout}
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
          <VaultScreen
            setView={navigate}
            currentUser={currentUser}
            onConnect={() => setShowWalletModal(true)}
            onSubscribe={handleSubscribe}
            cineCredits={cineCredits}
          />
        )}
        {currentView === "community" && (
          <CommunityScreen setView={navigate} currentUser={currentUser} onConnect={() => setShowWalletModal(true)} />
        )}
        {currentView === "submit" && (
          <SubmitScreen setView={navigate} currentUser={currentUser} />
        )}
        {currentView === "studio" && (
          <StudioScreen setView={navigate} currentUser={currentUser} />
        )}
        {currentView === "governance" && (
          <GovernanceScreen cineBalance={cineBalance} currentUser={currentUser} onConnect={() => setShowWalletModal(true)} />
        )}
        {currentView === "market" && (
          <MarketScreen cineCredits={cineCredits} setView={navigate} selectedMarketItem={selectedMarketItem} currentUser={currentUser} />
        )}
        {currentView === "piracy" && (
          <PiracyScreen setView={navigate} />
        )}
        {currentView === "curator" && (
          <CuratorProfileScreen
            curatorHandle={selectedCuratorHandle}
            setView={navigate}
          />
        )}
        {currentView === "revenue" && (
          <FilmmakerRevenueDashboard setView={navigate} currentUser={currentUser} />
        )}
      </main>

      {!noNavViews.includes(currentView) && (
        <Footer setView={navigate} />
      )}

      {isRehydrating && (
        <div className="fixed inset-0 z-[100] bg-surface flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-headline font-black uppercase tracking-widest text-on-surface-variant">CineChain</p>
          </div>
        </div>
      )}
    </div>
  );
}
