export interface ReservationNotificationPayload {
  name: string;
  date: string;
  partySize: number;
  phone: string;
  /** 예약 유입 경로 — 예: "홈페이지", "네이버", "야놀자", "에어비앤비", "아고다" */
  channel?: string;
}
