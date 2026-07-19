import "server-only";
import { adminReservationsUrl, type ReservationNotificationPayload } from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Sends a new-reservation alert to Telegram via the Bot API.
 * Failures are logged, not thrown — a notification outage must never roll back
 * or block the reservation write that already succeeded.
 */
export async function sendReservationTelegramNotification(
  reservation: ReservationNotificationPayload
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error(
      "[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set — skipping notification."
    );
    return;
  }

  const adminUrl = adminReservationsUrl();
  const text =
    `📅 <b>새 예약이 접수되었습니다 (대기중)</b>\n` +
    `• 유입 경로: ${escapeHtml(reservation.channel ?? "홈페이지")}\n` +
    `• 예약자명: ${escapeHtml(reservation.guestName)}\n` +
    `• 날짜: ${escapeHtml(reservation.checkIn)} ~ ${escapeHtml(reservation.checkOut)}\n` +
    `• 인원수: ${reservation.guestCount}명\n` +
    `• 연락처: ${escapeHtml(reservation.phone)}` +
    (reservation.email ? `\n• 이메일: ${escapeHtml(reservation.email)}` : "") +
    (adminUrl ? `\n• 확인하기: ${escapeHtml(adminUrl)}` : "");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] Bot API responded with ${res.status}: ${body}`);
    }
  } catch (error) {
    console.error("[telegram] Failed to send notification:", error);
  }
}
