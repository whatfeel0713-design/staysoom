import type { SupabaseClient } from "@supabase/supabase-js";
import type * as NodeIcal from "node-ical";

type Source = { id: string; ical_url: string };

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toSummaryString(value: NodeIcal.VEvent["summary"] | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return String(value.val);
}

export async function syncCalendarSource(supabase: SupabaseClient, source: Source) {
  // node-ical(의 temporal-polyfill 의존성)이 Turbopack의 RSC 모듈 그래프 평가 시점에
  // 정적 import되면 깨지는 알려진 호환성 문제가 있어, 함수 호출 시점에만 동적으로 로드한다.
  const ical: typeof NodeIcal = await import("node-ical");
  const events = await ical.async.fromURL(source.ical_url);

  type EventWithEnd = NodeIcal.VEvent & { end: NonNullable<NodeIcal.VEvent["end"]> };

  const blocks = Object.values(events)
    .filter((e): e is EventWithEnd => !!e && e.type === "VEVENT" && !!e.start && !!e.end)
    .map((e) => ({
      source_id: source.id,
      uid: String(e.uid),
      start_date: toDateString(e.start),
      end_date: toDateString(e.end),
      summary: toSummaryString(e.summary),
      synced_at: new Date().toISOString(),
    }));

  if (blocks.length > 0) {
    const { error } = await supabase
      .from("external_calendar_blocks")
      .upsert(blocks, { onConflict: "source_id,uid" });
    if (error) throw error;
  }

  // 소스에서 사라진(취소/삭제된) 이벤트 정리
  const { data: existing } = await supabase
    .from("external_calendar_blocks")
    .select("id, uid")
    .eq("source_id", source.id);

  const newUids = new Set(blocks.map((b) => b.uid));
  const staleIds = (existing ?? [])
    .filter((row) => !newUids.has(row.uid))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    await supabase.from("external_calendar_blocks").delete().in("id", staleIds);
  }

  await supabase
    .from("external_calendar_sources")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", source.id);

  return blocks.length;
}

export async function syncAllActiveSources(supabase: SupabaseClient) {
  const { data: sources } = await supabase
    .from("external_calendar_sources")
    .select("id, ical_url")
    .eq("is_active", true);

  const results: { sourceId: string; ok: boolean; count?: number; error?: string }[] = [];

  for (const source of sources ?? []) {
    try {
      const count = await syncCalendarSource(supabase, source);
      results.push({ sourceId: source.id, ok: true, count });
    } catch (e) {
      results.push({
        sourceId: source.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return results;
}
