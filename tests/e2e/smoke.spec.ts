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

test("가이드: 코드 없이 접근하면 예약 확정 고객 전용 안내만 보인다 (noindex)", async ({
  page,
}) => {
  await page.goto("/guide");
  await expect(
    page.getByRole("heading", { name: /예약 확정 고객을 위한/ })
  ).toBeVisible();
  // 코드 없이는 실제 가이드 콘텐츠(맛집 등)가 노출되지 않아야 한다
  await expect(page.getByRole("heading", { name: /머무는 동안/ })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
});

test("가이드: 잘못된 코드로도 콘텐츠가 노출되지 않는다", async ({ page }) => {
  await page.goto("/guide?code=invalid-code-0000");
  await expect(
    page.getByRole("heading", { name: /예약 확정 고객을 위한/ })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /네이버 지도/ })
  ).toHaveCount(0);
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
