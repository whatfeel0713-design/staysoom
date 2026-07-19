"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { syncAllActiveSources } from "@/lib/calendar-sync";

export async function createCalendarSource(formData: FormData) {
  const platform = String(formData.get("platform") ?? "").trim();
  const icalUrl = String(formData.get("ical_url") ?? "").trim();

  if (!platform || !icalUrl) return;

  const supabase = await createClient();
  await supabase.from("external_calendar_sources").insert({ platform, ical_url: icalUrl });
  revalidatePath("/admin/calendar");
}

export async function deleteCalendarSource(id: string) {
  const supabase = await createClient();
  await supabase.from("external_calendar_sources").delete().eq("id", id);
  revalidatePath("/admin/calendar");
}

export async function syncCalendarsNow() {
  const supabase = await createClient();
  await syncAllActiveSources(supabase);
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/reservations");
}
