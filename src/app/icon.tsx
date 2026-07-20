import { ImageResponse } from "next/og";

/** 브랜드 파비콘 — 잉크 배경 + 크림 이니셜 (next/og 자동 생성) */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16150f",
          color: "#f7f5f0",
          fontSize: 38,
          letterSpacing: 1,
          borderRadius: 14,
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
