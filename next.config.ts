import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 로컬 네트워크(휴대폰 등)에서 개발 서버 확인 시 필요 — 없으면 Next.js가 보안상
  // 이 origin의 dev 리소스(HMR·클라이언트 JS 번들) 요청을 차단해 하이드레이션이
  // 실패하고, 스크롤 감지로 나타나는 요소(Reveal)가 계속 안 보이게 된다.
  // IP가 바뀌면(DHCP 재할당 등) 이 값도 함께 갱신할 것.
  allowedDevOrigins: ["192.168.10.105"],
  images: {
    // Placeholder photography — swap for self-hosted images when real photos are ready.
    // unoptimized: 로컬 개발 환경의 SSL 프록시가 서버 측 이미지 최적화 fetch를
    // 차단하므로 브라우저가 직접 로드하게 한다. 실사진(로컬 파일)으로 교체 시 제거할 것.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
