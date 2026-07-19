"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { sendReservationNotification } from "@/lib/notifications";

export interface ReservationFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function createReservation(
  _prevState: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const guestPhone = String(formData.get("guest_phone") ?? "").trim();
  const guestEmail = String(formData.get("guest_email") ?? "").trim();
  const checkIn = String(formData.get("check_in") ?? "");
  const checkOut = String(formData.get("check_out") ?? "");
  const guestCount = Number(formData.get("guest_count") ?? 1);

  if (
    !guestName ||
    !guestPhone ||
    !checkIn ||
    !checkOut ||
    !Number.isFinite(guestCount) ||
    guestCount < 1
  ) {
    return { status: "error", message: "필수 항목을 모두 입력해 주세요." };
  }

  if (checkOut <= checkIn) {
    return { status: "error", message: "체크아웃 날짜는 체크인 이후여야 합니다." };
  }

  // RLS 정책상 익명 사용자도 status='pending' 예약 요청은 생성 가능 — service role 불필요.
  const supabase = await createClient();
  const { error } = await supabase.from("reservations").insert({
    guest_name: guestName,
    guest_phone: guestPhone,
    guest_email: guestEmail || null,
    check_in: checkIn,
    check_out: checkOut,
    guest_count: guestCount,
    status: "pending",
  });

  if (error) {
    console.error("[reservations] insert failed:", error);
    return {
      status: "error",
      message: "예약 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // DB 저장은 이미 성공했으므로, 알림 실패가 예약 접수 자체를 실패시키지 않도록 별도 처리한다.
  await sendReservationNotification({
    guestName,
    checkIn,
    checkOut,
    guestCount,
    phone: guestPhone,
    email: guestEmail || undefined,
    channel: "홈페이지",
  });

  revalidatePath("/admin/reservations");

  return {
    status: "success",
    message: "예약 요청이 접수되었습니다. 확인 후 연락드리겠습니다.",
  };
}
