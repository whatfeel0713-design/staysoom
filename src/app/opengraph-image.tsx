import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

/**
 * 카톡/인스타/트위터 공유 미리보기 이미지 (1200×630, 자동 생성).
 * next/og 기본 폰트는 라틴 글리프만 지원하므로 영문 브랜드 마크로 구성 —
 * 실사진 준비 후 사진 기반 OG로 교체 예정 (roadmap Phase 0-3).
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${BRAND.nameEnUpper} — ${BRAND.taglineEn}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16150f",
          color: "#f7f5f0",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 16, color: "#9a8b6f" }}>
          PRIVATE STAY · APHAE ISLAND
        </div>
        <div style={{ marginTop: 44, fontSize: 118, letterSpacing: 8 }}>
          {BRAND.nameEnUpper}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 30,
            letterSpacing: 3,
            color: "rgba(247, 245, 240, 0.68)",
          }}
        >
          {BRAND.taglineEn}
        </div>
      </div>
    ),
    { ...size }
  );
}
