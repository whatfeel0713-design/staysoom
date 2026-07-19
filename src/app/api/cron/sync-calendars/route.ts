import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { syncAllActiveSources } from "@/lib/calendar-sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results = await syncAllActiveSources(supabase);

  return NextResponse.json({ results });
}
