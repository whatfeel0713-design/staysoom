import { createClient } from "@/utils/supabase/server";
import { createCalendarSource, deleteCalendarSource, syncCalendarsNow } from "../../calendar-actions";
import { DeleteSourceButton } from "./delete-source-button";
import { CopyExportUrlButton } from "./copy-export-url-button";

const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "에어비앤비",
  yanolja: "야놀자",
  other: "기타",
};

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const { data: sources } = await supabase
    .from("external_calendar_sources")
    .select("id, platform, ical_url, is_active, last_synced_at")
    .order("created_at", { ascending: false });

  const exportUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/ical/export`
    : "/api/ical/export";

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-semibold text-stone-900">우리 예약 내보내기</h2>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-stone-600">
              아래 URL을 에어비앤비/야놀자 등 외부 플랫폼의 &quot;캘린더 가져오기(iCal
              동기화)&quot; 설정에 등록하면, 우리 사이트에서 확정된 예약이 자동으로 반영됩니다.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-stone-500">{exportUrl}</p>
          </div>
          <CopyExportUrlButton text={exportUrl} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            외부 캘린더 소스 ({sources?.length ?? 0})
          </h2>
          <form action={syncCalendarsNow}>
            <button
              type="submit"
              className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              지금 동기화
            </button>
          </form>
        </div>

        <form
          action={createCalendarSource}
          className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-[140px_1fr_auto]"
        >
          <select
            name="platform"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
          >
            <option value="airbnb">에어비앤비</option>
            <option value="yanolja">야놀자</option>
            <option value="other">기타</option>
          </select>
          <input
            type="url"
            name="ical_url"
            required
            placeholder="https://www.airbnb.co.kr/calendar/ical/....ics"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
          />
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            등록
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3">
          {sources && sources.length > 0 ? (
            sources.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-stone-900">
                    {PLATFORM_LABELS[s.platform] ?? s.platform}
                  </p>
                  <p className="mt-1 break-all text-xs text-stone-500">{s.ical_url}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    마지막 동기화:{" "}
                    {s.last_synced_at
                      ? new Date(s.last_synced_at).toLocaleString("ko-KR")
                      : "아직 없음"}
                  </p>
                </div>
                <DeleteSourceButton action={deleteCalendarSource.bind(null, s.id)} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center text-stone-500">
              등록된 외부 캘린더가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
