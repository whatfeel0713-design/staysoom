import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { BRAND } from "@/lib/brand";
import type { BlockedRange } from "@/lib/availability";
import { ReservationForm } from "./reservation-form";

/**
 * 예약 불가 기간(확정 예약 + 외부 캘린더 차단일) 조회.
 * RPC 미적용·네트워크 장애 시에도 페이지가 죽지 않도록 빈 배열로 폴백 —
 * 최종 방어는 서버 액션의 겹침 검사와 DB EXCLUDE 제약이 담당한다.
 */
async function getBlockedRanges(): Promise<BlockedRange[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_blocked_date_ranges");
    if (error) {
      console.error("[reservations] blocked ranges fetch failed:", error.message);
      return [];
    }
    return (data as BlockedRange[]) ?? [];
  } catch {
    return [];
  }
}

export default async function ReservationsPage() {
  const blockedRanges = await getBlockedRanges();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Editorial panel */}
      <aside className="relative hidden min-h-svh md:block md:w-[45%]">
        <Image
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop"
          alt={`따뜻한 조명이 감도는 ${BRAND.name} 침실`}
          fill
          priority
          sizes="45vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-white/75">
            Reservation
          </p>
          <p className="mt-4 font-serif text-3xl font-light leading-snug tracking-tight">
            머무름의 시작,
            <br />
            그날을 비워두겠습니다
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32 md:px-16 md:pt-40">
        <div className="w-full max-w-md">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
            Reservation
          </p>
          <h1 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
            예약하기
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone">
            하루 한 팀만 모시는 독채 스테이입니다. 예약 가능한 날짜를 확인하고
            내용을 남겨주시면 확인 후 연락드립니다.
            <br />
            {BRAND.checkInOut} · {BRAND.capacityLabel}
          </p>

          <ReservationForm blockedRanges={blockedRanges} />
        </div>
      </div>
    </div>
  );
}
