"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const STATUSES = ["pending", "done", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export async function updateConciergeLogStatus(id: string, formData: FormData) {
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as Status)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("concierge_logs").update({ status }).eq("id", id);

  if (error) {
    throw new Error("신청 상태 변경에 실패했습니다.");
  }

  revalidatePath("/admin/concierge");
}
