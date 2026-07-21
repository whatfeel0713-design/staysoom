import { createClient } from "@/utils/supabase/server";
import { updateConciergeLogStatus } from "../../concierge-actions";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  bbq: "바베큐 신청",
  chat: "챗 대화",
  tmap_send: "T맵 전송",
  coupon_view: "시크릿 쿠폰 열람",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  done: "처리 완료",
  cancelled: "취소",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  done: "bg-teal-100 text-teal-800",
  cancelled: "bg-stone-200 text-stone-600",
};

interface ConciergeLogRow {
  id: string;
  request_type: string;
  payload: Record<string, unknown> | null;
  status: string;
  created_at: string;
  reservation: { guest_name: string; check_in: string; check_out: string } | null;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default async function AdminConciergePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("concierge_logs")
    .select(
      "id, request_type, payload, status, created_at, reservation:reservations(guest_name, check_in, check_out)",
    )
    .order("created_at", { ascending: false });

  const logs = (data ?? []) as unknown as ConciergeLogRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">
          압해 컨시어지 신청 목록 ({logs.length})
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          바베큐 신청·시크릿 쿠폰 열람 등 컨시어지 앱(concierge.stayaphae.com)에서
          들어온 요청입니다.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-900">
                    {REQUEST_TYPE_LABELS[log.request_type] ?? log.request_type}
                    {log.reservation ? ` · ${log.reservation.guest_name}님` : ""}
                  </p>
                  {log.reservation && (
                    <p className="mt-1 text-sm text-stone-600">
                      {log.reservation.check_in} ~ {log.reservation.check_out}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(log.created_at).toLocaleString("ko-KR")}
                  </p>
                  {log.payload && (
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </div>
                <StatusBadge status={log.status} />
              </div>

              <form
                action={updateConciergeLogStatus.bind(null, log.id)}
                className="mt-4 flex items-center gap-2"
              >
                <select
                  name="status"
                  defaultValue={log.status}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
                >
                  <option value="pending">대기</option>
                  <option value="done">처리 완료</option>
                  <option value="cancelled">취소</option>
                </select>
                <button
                  type="submit"
                  className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                >
                  상태 변경
                </button>
              </form>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center text-stone-500">
            아직 들어온 신청이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
