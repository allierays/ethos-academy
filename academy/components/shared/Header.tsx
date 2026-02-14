"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlossary } from "../../lib/GlossaryContext";

const NAV_ITEMS = [
  { label: "Explore", href: "/explore" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Framework", href: "/framework" },
  { label: "Records", href: "/records" },
  { label: "Alumni", href: "/alumni" },
];

export default function Header() {
  const pathname = usePathname();
  const { openGlossary } = useGlossary();

  return (
    <header className="relative z-10 border-b border-white/20 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-action text-white text-sm font-bold">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Ethos Academy
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "text-foreground font-bold"
                    : "text-foreground font-semibold hover:text-foreground/80 transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => openGlossary()}
            aria-label="Open glossary"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 2h4.5c.8 0 1.5.7 1.5 1.5V14l-1-1H2V2z" />
              <path d="M14 2H9.5C8.7 2 8 2.7 8 3.5V14l1-1H14V2z" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
