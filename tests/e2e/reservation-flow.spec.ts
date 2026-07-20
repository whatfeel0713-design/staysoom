import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * 예약 플로우 E2E — DB 없이 도는 UI 검증이 중심.
 * 달력 날짜 선택 로직(체크인→체크아웃→리셋)과 폼 제출 피드백을 확인한다.
 */

/** 현재 달에 선택 가능한 날이 3개 미만이면 다음 달로 이동 */
async function enabledDays(page: Page): Promise<Locator> {
  const calendar = page.getByTestId("availability-calendar");
  await expect(calendar).toBeVisible();
  const days = calendar.locator("button[data-date]:not([disabled])");
  if ((await days.count()) < 3) {
    await calendar.getByRole("button", { name: "다음 달" }).click();
  }
  return calendar.locator("button[data-date]:not([disabled])");
}

test.describe("예약 가용성 달력", () => {
  test("과거 날짜는 선택할 수 없다", async ({ page }) => {
    await page.goto("/reservations");
    const calendar = page.getByTestId("availability-calendar");
    await expect(calendar).toBeVisible();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // 선택 가능한 모든 날짜는 오늘 이후여야 한다 (ISO 문자열 비교)
    const dates = await calendar
      .locator("button[data-date]:not([disabled])")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-date")));
    expect(dates.length).toBeGreaterThan(0);
    for (const date of dates) {
      expect(date! >= todayStr).toBe(true);
    }
  });

  test("달력에서 체크인→체크아웃 순으로 선택하면 입력란에 반영된다", async ({
    page,
  }) => {
    await page.goto("/reservations");
    const days = await enabledDays(page);

    const checkInDate = await days.nth(0).getAttribute("data-date");
    const middleDate = await days.nth(1).getAttribute("data-date");
    const checkOutDate = await days.nth(2).getAttribute("data-date");

    await days.nth(0).click();
    await expect(page.locator('input[name="check_in"]')).toHaveValue(
      checkInDate!
    );
    await expect(page.locator('input[name="check_out"]')).toHaveValue("");

    await days.nth(2).click();
    await expect(page.locator('input[name="check_out"]')).toHaveValue(
      checkOutDate!
    );

    // 기간이 정해진 상태에서 다시 날짜를 누르면 새 체크인으로 리셋
    await days.nth(1).click();
    await expect(page.locator('input[name="check_in"]')).toHaveValue(
      middleDate!
    );
    await expect(page.locator('input[name="check_out"]')).toHaveValue("");
  });

  test("이전 달 버튼은 현재 달에서 비활성화된다", async ({ page }) => {
    await page.goto("/reservations");
    const calendar = page.getByTestId("availability-calendar");
    await expect(
      calendar.getByRole("button", { name: "이전 달" })
    ).toBeDisabled();
  });
});

test.describe("예약 폼", () => {
  test("인원수 입력은 brand 최대 인원으로 제한된다", async ({ page }) => {
    await page.goto("/reservations");
    const guestCount = page.locator('input[name="guest_count"]');
    await expect(guestCount).toHaveAttribute("max", /^\d+$/);
    await expect(guestCount).toHaveAttribute("min", "1");
  });

  test("제출하면 상태 피드백 메시지가 표시된다", async ({ page }) => {
    await page.goto("/reservations");
    const days = await enabledDays(page);
    await days.nth(0).click();
    await days.nth(2).click();

    await page.locator('input[name="guest_name"]').fill("E2E 테스트");
    await page.locator('input[name="guest_phone"]').fill("010-0000-0000");
    await page.getByRole("button", { name: "예약 접수하기" }).click();

    // 실제 DB 연결 시 성공 문구, 미연결(더미 env) 시 실패 안내 —
    // 어느 쪽이든 사용자에게 피드백이 보여야 한다.
    const status = page.getByRole("status");
    await expect(status).toBeVisible({ timeout: 15_000 });
    await expect(status).not.toHaveText("");
  });
});
