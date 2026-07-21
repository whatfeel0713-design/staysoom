"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { sendCheckoutLetter } from "@/lib/notifications/checkout-letter";

const STATUSES = ["pending", "confirmed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export async function updateReservationStatus(id: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as Status)) return;

  const supabase = await createClient();

  if (status === "confirmed") {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("check_in, check_out")
      .eq("id", id)
      .single();

    if (reservation) {
      const { data: overlaps } = await supabase
        .from("external_calendar_blocks")
        .select("id")
        .lt("start_date", reservation.check_out)
        .gt("end_date", reservation.check_in)
        .limit(1);

      if (overlaps && overlaps.length > 0) {
        throw new Error(
          "같은 기간에 외부 플랫폼(에어비앤비 등) 예약이 있습니다. 캘린더를 다시 확인한 후 확정해 주세요.",
        );
      }
    }
  }

  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);

  if (error) {
    throw new Error(
      error.code === "23P01"
        ? "같은 기간에 이미 확정된 예약이 있어 처리할 수 없습니다."
        : "예약 상태 변경에 실패했습니다.",
    );
  }

  revalidatePath("/admin/reservations");
}

/**
 * 압해 컨시어지 개인화 인사·서프라이즈 제안에 쓰이는 자유 메모(신혼여행,
 * 생일 등). 빈 값으로 제출하면 null로 지워진다.
 */
export async function updateSpecialOccasion(id: string, formData: FormData) {
  const raw = String(formData.get("special_occasion") ?? "").trim();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reservations")
    .update({ special_occasion: raw || null })
    .eq("id", id);

  if (error) {
    throw new Error("기념일 메모 저장에 실패했습니다.");
  }

  revalidatePath("/admin/reservations");
}

/**
 * 퇴실 후 감성 여정 편지 발송 (고도화 C그룹) — RESEND_API_KEY가 없으면
 * sendCheckoutLetter가 조용히 건너뛴다(로그만 남김). 게스트 이메일이 없는
 * 예약은 버튼 자체를 노출하지 않는다(reservations/page.tsx에서 처리).
 */
export async function sendGuestCheckoutLetter(id: string) {
  const supabase = await createClient();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("guest_name, guest_email, check_in, check_out, special_occasion")
    .eq("id", id)
    .single();

  if (error || !reservation || !reservation.guest_email) {
    throw new Error("이메일이 없는 예약이라 편지를 보낼 수 없습니다.");
  }

  await sendCheckoutLetter({
    guestName: reservation.guest_name,
    guestEmail: reservation.guest_email,
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    specialOccasion: reservation.special_occasion,
  });

  revalidatePath("/admin/reservations");
}
