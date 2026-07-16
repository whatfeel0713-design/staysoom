import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
