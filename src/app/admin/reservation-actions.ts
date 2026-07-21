"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

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
