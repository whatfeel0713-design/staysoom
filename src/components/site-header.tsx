"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/#stays", label: "스테이" },
  { href: "/#experience", label: "머무름" },
  { href: "/#concierge", label: "AI 컨시어지" },
  { href: "/#location", label: "오시는 길" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Transparent-over-hero only applies on the home page before scrolling.
  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        overHero
          ? "bg-transparent"
          : "border-b border-line bg-cream/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:h-20 md:px-10">
        <Link
          href="/"
          className={`flex items-baseline gap-2.5 transition-colors duration-500 ${
            overHero ? "text-white" : "text-ink"
          }`}
        >
          <span className="font-serif text-xl font-semibold tracking-tight md:text-[1.35rem]">
            {BRAND.name}
          </span>
          <span
            className={`hidden text-[0.65rem] font-medium uppercase tracking-[0.3em] sm:inline ${
              overHero ? "text-white/70" : "text-stone"
            }`}
          >
            {BRAND.nameEn}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors duration-300 ${
                overHero
                  ? "text-white/85 hover:text-white"
                  : "text-ink-soft/75 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservations"
            className={`rounded-full px-5 py-2 text-sm font-medium tracking-wide transition-all duration-300 ${
              overHero
                ? "border border-white/60 text-white hover:bg-white hover:text-ink"
                : "bg-ink text-cream hover:bg-ink-soft"
            }`}
          >
            예약하기
          </Link>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((open) => !open)}
          className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden ${
            overHero ? "text-white" : "text-ink"
          }`}
        >
          <span
            className={`h-px w-5 bg-current transition-transform duration-300 ${
              menuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-current transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-line bg-cream/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          menuOpen ? "max-h-80 border-b" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 font-serif text-lg text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reservations"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-full bg-ink px-6 py-3 text-center text-sm font-medium tracking-wide text-cream"
          >
            예약하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
