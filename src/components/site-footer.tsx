import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream-deep">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold tracking-tight text-ink">
              {BRAND.name}
            </p>
            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-stone">
              {BRAND.nameEn}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-7 text-stone">
              {BRAND.tagline}.
              <br />
              자연 속에서 온전한 숨을 되찾는 프라이빗 스테이.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm md:gap-20">
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                Explore
              </p>
              <Link href="/#stays" className="text-ink-soft/80 transition-colors hover:text-ink">
                스테이
              </Link>
              <Link href="/#experience" className="text-ink-soft/80 transition-colors hover:text-ink">
                머무름
              </Link>
              <Link href="/#concierge" className="text-ink-soft/80 transition-colors hover:text-ink">
                AI 컨시어지
              </Link>
              <Link href="/#location" className="text-ink-soft/80 transition-colors hover:text-ink">
                오시는 길
              </Link>
              <Link href="/reservations" className="text-ink-soft/80 transition-colors hover:text-ink">
                예약하기
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                Contact
              </p>
              <a
                href={`mailto:${BRAND.email}`}
                className="text-ink-soft/80 transition-colors hover:text-ink"
              >
                {BRAND.email}
              </a>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft/80 transition-colors hover:text-ink"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-8 text-xs text-stone md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.nameEnUpper}. All rights reserved.
          </p>
          <p className="tracking-wide">{BRAND.taglineEn}</p>
        </div>
      </div>
    </footer>
  );
}
