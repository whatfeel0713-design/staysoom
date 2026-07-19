import "server-only";
import { adminReservationsUrl, type ReservationNotificationPayload } from "./types";

/**
 * Sends a new-reservation alert to a Google Chat space via an Incoming Webhook.
 * Failures are logged, not thrown — a notification outage must never roll back
 * or block the reservation write that already succeeded.
 */
export async function sendReservationChatNotification(
  reservation: ReservationNotificationPayload
): Promise<void> {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(
      "[google-chat] GOOGLE_CHAT_WEBHOOK_URL is not set — skipping notification."
    );
    return;
  }

  const adminUrl = adminReservationsUrl();
  const text =
    `📅 *새 예약이 접수되었습니다 (대기중)*\n` +
    `• 유입 경로: ${reservation.channel ?? "홈페이지"}\n` +
    `• 예약자명: ${reservation.guestName}\n` +
    `• 날짜: ${reservation.checkIn} ~ ${reservation.checkOut}\n` +
    `• 인원수: ${reservation.guestCount}명\n` +
    `• 연락처: ${reservation.phone}` +
    (reservation.email ? `\n• 이메일: ${reservation.email}` : "") +
    (adminUrl ? `\n• 확인하기: ${adminUrl}` : "");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[google-chat] Webhook responded with ${res.status}: ${body}`
      );
    }
  } catch (error) {
    console.error("[google-chat] Failed to send notification:", error);
  }
}
