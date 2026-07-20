import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/reservations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // /guide는 예약 확정 고객 전용(비공개 링크, noindex) — sitemap에 포함하지 않는다
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
