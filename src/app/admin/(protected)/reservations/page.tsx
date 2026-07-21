import QRCode from "qrcode";
import { createClient } from "@/utils/supabase/server";
import { updateReservationStatus, updateSpecialOccasion } from "../../reservation-actions";
import { getSiteUrl } from "@/lib/site-url";
import { CopyGuideLinkButton } from "./copy-guide-link-button";

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  confirmed: "확정",
  cancelled: "취소",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-teal-100 text-teal-800",
  cancelled: "bg-stone-200 text-stone-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function hasExternalOverlap(
  checkIn: string,
  checkOut: string,
  blocks: { start_date: string; end_date: string }[],
) {
  return blocks.some((b) => b.start_date < checkOut && b.end_date > checkIn);
}

export default async function AdminReservationsPage() {
  const supabase = await createClient();
  const [{ data: reservations }, { data: externalBlocks }] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, guest_name, guest_phone, guest_email, check_in, check_out, guest_count, total_price, status, guide_code, special_occasion, created_at",
      )
      .order("check_in", { ascending: true }),
    supabase.from("external_calendar_blocks").select("start_date, end_date"),
  ]);

  const siteUrl = getSiteUrl();
  const guideQrCodes = new Map<string, string>();
  await Promise.all(
    (reservations ?? [])
      .filter((r) => r.status === "confirmed" && r.guide_code)
      .map(async (r) => {
        const url = `${siteUrl}/guide?code=${r.guide_code}`;
        guideQrCodes.set(r.id, await QRCode.toDataURL(url, { width: 128, margin: 1 }));
      }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-stone-900">
        예약 관리 ({reservations?.length ?? 0})
      </h2>

      <div className="flex flex-col gap-4">
        {reservations && reservations.length > 0 ? (
          reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-900">
                    {r.guest_name} 님 · {r.guest_count}인
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {r.check_in} ~ {r.check_out}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {r.guest_phone}
                    {r.guest_email ? ` · ${r.guest_email}` : ""}
                  </p>
                  {r.total_price != null && (
                    <p className="mt-1 text-sm text-stone-600">
                      {Number(r.total_price).toLocaleString()}원
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={r.status} />
                  {r.status === "pending" &&
                    hasExternalOverlap(r.check_in, r.check_out, externalBlocks ?? []) && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        ⚠ 외부 플랫폼 예약과 겹침
                      </span>
                    )}
                </div>
              </div>

              {r.status === "confirmed" && guideQrCodes.has(r.id) && (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideQrCodes.get(r.id)}
                    alt="압해 컨시어지 가이드 QR"
                    width={72}
                    height={72}
                    className="rounded-md bg-white p-1"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-stone-600">
                      압해 컨시어지 가이드 — 체크인 안내와 함께 전달하세요
                    </p>
                    <CopyGuideLinkButton
                      text={`${siteUrl}/guide?code=${r.guide_code}`}
                    />
                  </div>
                </div>
              )}

              <form
                action={updateReservationStatus.bind(null, r.id)}
                className="mt-4 flex items-center gap-2"
              >
                <select
                  name="status"
                  defaultValue={r.status}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
                >
                  <option value="pending">대기</option>
                  <option value="confirmed">확정</option>
                  <option value="cancelled">취소</option>
                </select>
                <button
                  type="submit"
                  className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  상태 변경
                </button>
              </form>

              <form
                action={updateSpecialOccasion.bind(null, r.id)}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  name="special_occasion"
                  defaultValue={r.special_occasion ?? ""}
                  placeholder="기념일 메모 (예: 신혼여행, 생일) — 압해 컨시어지 개인화에 사용"
                  className="w-80 max-w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
                />
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400"
                >
                  메모 저장
                </button>
              </form>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center text-stone-500">
            아직 접수된 예약이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
