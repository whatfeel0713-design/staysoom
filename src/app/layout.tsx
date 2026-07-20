import type { Metadata } from "next";
import { Geist, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `${BRAND.name} | ${BRAND.nameEnUpper} — ${BRAND.tagline}`,
  description: `${BRAND.placeLine} — 섬의 속도로 쉬어가도록 설계된 하루 한 팀 프라이빗 독채, ${BRAND.name}입니다.`,
  openGraph: {
    title: `${BRAND.name} | ${BRAND.nameEnUpper}`,
    description: `${BRAND.tagline}, 프라이빗 스테이 ${BRAND.name}.`,
    siteName: BRAND.name,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${notoSansKr.variable} ${notoSerifKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
