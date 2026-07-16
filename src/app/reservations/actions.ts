"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { sendReservationNotification } from "@/lib/notifications";

export interface ReservationFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

// 실제 reservations 테이블의 컬럼명에 맞게 이 부분만 수정하면 됩니다.
const RESERVATIONS_TABLE = "reservations";

export async function createReservation(
  _prevState: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const partySize = Number(formData.get("partySize"));
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !date || !phone || !Number.isFinite(partySize) || partySize <= 0) {
    return { status: "error", message: "모든 항목을 올바르게 입력해 주세요." };
  }

  const { error } = await supabaseAdmin.from(RESERVATIONS_TABLE).insert({
    name,
    reservation_date: date,
    party_size: partySize,
    phone,
    status: "pending",
    source: "web",
  });

  if (error) {
    console.error("[reservations] insert failed:", error);
    return {
      status: "error",
      message: "예약 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // DB 저장은 이미 성공했으므로, 알림 실패가 예약 접수 자체를 실패시키지 않도록 별도 처리한다.
  await sendReservationNotification({
    name,
    date,
    partySize,
    phone,
    channel: "홈페이지",
  });

  return {
    status: "success",
    message: "예약이 접수되었습니다. 확인 후 연락드리겠습니다.",
  };
}
