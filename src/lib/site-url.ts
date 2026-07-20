/** 배포 URL — sitemap/robots/OG/iCal 등 절대 URL이 필요한 곳에서 공용 사용 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}
