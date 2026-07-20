import { test, expect } from "@playwright/test";

/** 핵심 페이지 스모크 — 렌더링과 페이지 간 연결이 살아있는지 */

test("홈: 히어로와 핵심 섹션이 렌더링된다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /머무는 것만으로/ })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "압해 컨시어지 열기" })).toBeVisible();
});

test("홈 → 컨시어지 버튼 → 게스트 가이드로 이동한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "압해 컨시어지 열기" }).click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /머무는 동안/ })
  ).toBeVisible();
});

test("가이드: 지도 앱 링크가 주소를 담고 있다", async ({ page }) => {
  await page.goto("/guide");
  await expect(
    page.getByRole("link", { name: /네이버 지도/ })
  ).toHaveAttribute("href", /map\.naver\.com/);
  await expect(page.getByRole("link", { name: /카카오맵/ })).toHaveAttribute(
    "href",
    /map\.kakao\.com/
  );
});

test("예약 페이지: 달력과 폼이 함께 노출된다", async ({ page }) => {
  await page.goto("/reservations");
  await expect(page.getByTestId("availability-calendar")).toBeVisible();
  await expect(page.getByRole("button", { name: "예약 접수하기" })).toBeVisible();
});
