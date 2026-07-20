import { test, expect } from "@playwright/test";

/** 핵심 페이지 스모크 — 렌더링과 페이지 간 연결이 살아있는지 */

test("홈: 히어로가 렌더링되고 컨시어지는 소개만 노출된다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /머무는 것만으로/ })
  ).toBeVisible();
  // 컨시어지는 프라이빗 서비스 — 홈에는 안내 문구만 있고 가이드 공개 링크는 없어야 한다
  await expect(page.getByText(/예약이 확정된 분께/)).toBeVisible();
  await expect(page.locator('a[href="/guide"]')).toHaveCount(0);
});

test("가이드: 비공개 링크로 직접 접근 가능하고 검색엔진 비노출이다", async ({
  page,
}) => {
  await page.goto("/guide");
  await expect(
    page.getByRole("heading", { level: 1, name: /머무는 동안/ })
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await expect(
    page.getByRole("link", { name: /네이버 지도/ })
  ).toHaveAttribute("href", /map\.naver\.com/);
  await expect(page.getByRole("link", { name: /카카오맵/ })).toHaveAttribute(
    "href",
    /map\.kakao\.com/
  );
});

test("예약 페이지: 달력·폼·개인정보 동의가 함께 노출된다", async ({ page }) => {
  await page.goto("/reservations");
  await expect(page.getByTestId("availability-calendar")).toBeVisible();
  await expect(page.locator('input[name="privacy_consent"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "예약 접수하기" })).toBeVisible();
});

test("개인정보처리방침 페이지가 렌더링되고 푸터에서 연결된다", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "개인정보처리방침" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "개인정보처리방침" })
  ).toBeVisible();
});

test("없는 주소는 브랜드 404 페이지를 보여준다", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(
    page.getByRole("heading", { name: /찾으시는 페이지가/ })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "처음으로" })).toBeVisible();
});
