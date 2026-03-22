import { RainbowStripe } from "../ui/RainbowStripe";
import { Film } from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="bg-on-surface text-surface-container-lowest pt-16 pb-8 relative overflow-hidden">
      <RainbowStripe className="absolute top-0 left-0 w-full" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div
              className="flex items-center mb-6 cursor-pointer"
              onClick={() => setView("landing")}
            >
              <Film className="h-8 w-8 text-primary" />
              <span className="ml-2 font-headline font-black text-2xl tracking-tighter uppercase">
                Cine<span className="text-primary">Chain</span>
              </span>
            </div>
            <p className="font-body text-surface-variant max-w-md">
              Decentralizing the future of cinema. Own, fund, and distribute
              films without intermediaries. The power belongs to the creators and
              the audience.
            </p>
          </div>
          <div>
            <h4 className="font-label text-sm uppercase tracking-widest text-outline-variant mb-6">
              Platform
            </h4>
            <ul className="space-y-4 font-body text-surface-variant">
              {[
                { label: "Gallery", view: "gallery" },
                { label: "Market", view: "market" },
                { label: "Submit Film", view: "submit" },
                { label: "Vault", view: "vault" },
                { label: "CinePass", view: "pass" },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => setView(item.view)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-label text-sm uppercase tracking-widest text-outline-variant mb-6">
              Community
            </h4>
            <ul className="space-y-4 font-body text-surface-variant">
              {[
                { label: "Discourse", view: "community" },
                { label: "Governance", view: "governance" },
                { label: "Piracy Reports", view: "piracy" },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => setView(item.view)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-variant/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-label text-xs uppercase tracking-widest text-outline-variant mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CineChain Collective. All rights reserved. 1 CC = $0.10 · Protocol Fee 5%
          </p>
          <div className="flex space-x-6 font-label text-xs uppercase tracking-widest text-outline-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-20 -right-10 text-[15rem] font-headline font-black text-surface-variant/5 select-none pointer-events-none leading-none">
        CC
      </div>
    </footer>
  );
}
