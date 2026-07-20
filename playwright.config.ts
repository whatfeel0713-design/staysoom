import { defineConfig } from "@playwright/test";

/**
 * E2E 테스트 설정.
 * - DB(Supabase) 없이도 도는 스모크/UI 테스트가 기본 — env가 없으면 더미 값으로
 *   dev 서버를 띄우고, 데이터 조회는 코드의 폴백 경로를 탄다.
 * - 브라우저: PLAYWRIGHT_CHROMIUM_PATH가 설정돼 있으면 그 실행 파일을 사용
 *   (클라우드 세션의 사전 설치 Chromium 경로), 없으면 Playwright 기본 설치본.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      ...(process.env as Record<string, string>),
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        "https://dummy-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dummy-anon-key",
    },
  },
});
