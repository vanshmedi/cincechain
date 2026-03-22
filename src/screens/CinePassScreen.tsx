import { useState } from "react";
import { Button } from "../components/ui/Button";
import { RainbowStripe } from "../components/ui/RainbowStripe";
import { cinePasses } from "../data/mockData";
import { CheckCircle2, Wallet } from "lucide-react";

interface CinePassScreenProps {
  cineCredits: number;
  setView: (view: string, filmId?: number, curatorHandle?: string) => void;
  onSubscribe?: (tier: string, bonus: number) => void;
}

export function CinePassScreen({ cineCredits, setView, onSubscribe }: CinePassScreenProps) {
  const [activePlan, setActivePlan] = useState<string | null>(null);

  return (
    <div className="w-full pt-16 bg-surface min-h-screen">
      {/* Header */}
      <div className="w-full bg-on-surface pt-20 pb-16 relative overflow-hidden">
        <RainbowStripe className="absolute top-0 left-0 h-3 w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-surface-variant/10 border border-surface-variant/20 px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-label text-xs uppercase tracking-widest text-outline-variant">
              Monthly Subscription
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline font-black uppercase tracking-tighter text-surface-container-lowest mb-6">
            CinePass
          </h1>
          <p className="text-xl font-body text-surface-variant max-w-2xl mx-auto">
            Your all-access pass to the decentralized cinema collective.
            Billed monthly in CineCredits (1 CC = $0.10).
          </p>
        </div>
        <div className="absolute -bottom-16 -right-10 text-[12rem] font-headline font-black text-surface-variant/5 select-none pointer-events-none leading-none">
          PASS
        </div>
      </div>

      {/* Wallet balance bar */}
      <div className="bg-surface-container border-b border-outline-variant/30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-4 w-4 text-primary mr-2" />
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">
              Your CineCredit Balance
            </span>
          </div>
          <span className="font-headline font-black text-lg">{cineCredits.toLocaleString()} CC</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {cinePasses.map((plan, index) => {
              const isRecommended = plan.recommended;
              const isActive = activePlan === plan.id;
              const canAfford = cineCredits >= plan.priceCC;

              return (
                <div
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isRecommended ? "md:-translate-y-6 shadow-film" : "shadow-film"
                  }`}
                >
                  {/* Top accent */}
                  {isRecommended ? (
                    <div className="absolute top-0 left-0 right-0 h-2 rainbow-bg" />
                  ) : (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-outline-variant/30" />
                  )}

                  <div
                    className={`border p-8 pt-10 ${
                      isRecommended
                        ? "bg-on-surface text-surface-container-lowest border-on-surface"
                        : "bg-surface-container-lowest border-outline-variant"
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute top-5 right-5 bg-primary text-white font-label text-xs uppercase tracking-widest px-3 py-1 font-bold">
                        Recommended
                      </div>
                    )}

                    {/* Plan name & price */}
                    <h3
                      className={`text-3xl font-headline font-black uppercase tracking-tight mb-1 ${
                        isRecommended ? "text-surface-container-lowest" : "text-on-surface"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`font-label text-xs uppercase tracking-widest mb-6 ${
                        isRecommended ? "text-outline-variant" : "text-on-surface-variant"
                      }`}
                    >
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      <span
                        className={`text-5xl font-headline font-black ${
                          isRecommended ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        ${plan.priceUSD}
                      </span>
                      <span
                        className={`ml-2 font-body text-sm ${
                          isRecommended ? "text-surface-variant" : "text-on-surface-variant"
                        }`}
                      >
                        / month
                      </span>
                      <p
                        className={`font-label text-xs uppercase tracking-widest mt-1 ${
                          isRecommended ? "text-outline-variant" : "text-outline"
                        }`}
                      >
                        = {plan.priceCC} CC / month
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-10">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start text-sm font-body ${
                            isRecommended ? "text-surface-variant" : "text-on-surface-variant"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                              isRecommended ? "text-primary" : "text-tertiary"
                            }`}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        isRecommended
                          ? "bg-primary text-white hover:bg-white hover:text-primary border-none"
                          : ""
                      }`}
                      variant={isRecommended ? "primary" : "outline"}
                      size="lg"
                      onClick={() => setActivePlan(plan.id)}
                    >
                      {isActive ? "✓ Selected" : `Get ${plan.name}`}
                    </Button>

                    {!canAfford && (
                      <p className="text-center font-label text-xs uppercase tracking-widest text-error mt-3">
                        Need {(plan.priceCC - cineCredits).toLocaleString()} more CC
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA for selected plan */}
          {activePlan && (
            <div className="mt-16 text-center">
              <div className="inline-block bg-surface-container-lowest border-2 border-primary p-8 shadow-film">
                <p className="font-headline font-bold text-2xl uppercase tracking-tight mb-2">
                  Subscribe to {cinePasses.find((p) => p.id === activePlan)?.name}
                </p>
                <p className="font-body text-on-surface-variant mb-6">
                  {cinePasses.find((p) => p.id === activePlan)?.priceCC} CC will be added to your wallet (simulated fiat purchase).
                </p>
                <Button 
                  size="lg" 
                  onClick={() => {
                    const pass = cinePasses.find(p => p.id === activePlan);
                    if (onSubscribe && pass) {
                      onSubscribe(pass.id, pass.priceCC);
                    }
                  }}
                >
                  Confirm Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Fine print */}
          <div className="mt-16 text-center">
            <p className="font-body text-sm text-on-surface-variant max-w-2xl mx-auto">
              All prices in USD for reference. Actual payment is in CineCredits (CC).{" "}
              <strong>1 CC = $0.10</strong>. Subscriptions auto-renew monthly. Cancel anytime.
              Protocol fee of 5% applies to all transactions on the platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
