import "server-only";
import type { ReservationNotificationPayload } from "./types";
import { sendReservationTelegramNotification } from "./telegram";
import { sendReservationChatNotification } from "./google-chat";

export type { ReservationNotificationPayload } from "./types";

/**
 * Fans a new-reservation alert out to every configured channel.
 * A channel is "configured" when its env vars are set; unconfigured
 * channels are skipped. Individual failures never throw.
 */
export async function sendReservationNotification(
  reservation: ReservationNotificationPayload
): Promise<void> {
  const senders: Promise<void>[] = [];

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    senders.push(sendReservationTelegramNotification(reservation));
  }

  if (process.env.GOOGLE_CHAT_WEBHOOK_URL) {
    senders.push(sendReservationChatNotification(reservation));
  }

  if (senders.length === 0) {
    console.error(
      "[notifications] No notification channel is configured — set TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID or GOOGLE_CHAT_WEBHOOK_URL."
    );
    return;
  }

  await Promise.allSettled(senders);
}
