"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/content", label: "콘텐츠 관리" },
  { href: "/admin/reservations", label: "예약 관리" },
  { href: "/admin/calendar", label: "캘린더 연동" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-stone-200 bg-white px-6 sm:px-10">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
