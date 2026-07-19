export interface ReservationNotificationPayload {
  guestName: string;
  /** 체크인 날짜 (YYYY-MM-DD) */
  checkIn: string;
  /** 체크아웃 날짜 (YYYY-MM-DD) */
  checkOut: string;
  guestCount: number;
  phone: string;
  email?: string;
  /** 예약 유입 경로 — 예: "홈페이지", "네이버", "야놀자", "에어비앤비", "아고다" */
  channel?: string;
}

/** NEXT_PUBLIC_SITE_URL이 설정되어 있으면 관리자 예약 페이지 링크를 반환 */
export function adminReservationsUrl(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return siteUrl ? `${siteUrl.replace(/\/$/, "")}/admin/reservations` : null;
}
