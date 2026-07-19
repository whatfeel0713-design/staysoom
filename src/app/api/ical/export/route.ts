import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function formatICSDate(d: string) {
  return d.replace(/-/g, "");
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_confirmed_reservation_ranges");

  if (error) {
    return NextResponse.json({ error: "failed to load reservations" }, { status: 500 });
  }

  const ranges = (data ?? []) as { check_in: string; check_out: string }[];

  const events = ranges
    .map(
      (r, i) =>
        `BEGIN:VEVENT\r\nUID:stay-aphae-${r.check_in}-${r.check_out}-${i}@stay-aphae\r\nDTSTART;VALUE=DATE:${formatICSDate(r.check_in)}\r\nDTEND;VALUE=DATE:${formatICSDate(r.check_out)}\r\nSUMMARY:Reserved\r\nEND:VEVENT`,
    )
    .join("\r\n");

  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//StayAphae//Reservations//KO\r\n${events}${events ? "\r\n" : ""}END:VCALENDAR\r\n`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="stay-aphae.ics"',
    },
  });
}
