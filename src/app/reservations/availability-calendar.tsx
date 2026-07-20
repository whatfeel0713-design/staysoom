"use client";

import { useMemo, useState } from "react";
import type { BlockedRange } from "@/lib/availability";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
/** 현재 달 포함, 앞으로 몇 달까지 탐색 가능한지 */
const MAX_MONTHS_AHEAD = 5;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function fmt(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

interface AvailabilityCalendarProps {
  blockedRanges: BlockedRange[];
  checkIn: string;
  checkOut: string;
  onChange: (next: { checkIn: string; checkOut: string }) => void;
}

/**
 * 예약 폼용 미니멀 달력.
 * 마감된 밤(숙박 불가일)은 취소선으로 표시하고 선택을 막는다.
 * 날짜를 눌러 체크인 → 체크아웃 순으로 기간을 고른다.
 */
export function AvailabilityCalendar({
  blockedRanges,
  checkIn,
  checkOut,
  onChange,
}: AvailabilityCalendarProps) {
  const now = new Date();
  const today = fmt(now.getFullYear(), now.getMonth(), now.getDate());
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  // 불가 "기간"을 날짜 Set으로 전개 — 체크아웃일(end_date)은 새 체크인이 가능하므로 제외
  const blockedDates = useMemo(() => {
    const set = new Set<string>();
    for (const range of blockedRanges) {
      const cursor = new Date(`${range.start_date}T00:00:00`);
      const end = new Date(`${range.end_date}T00:00:00`);
      while (cursor < end && set.size < 2000) {
        set.add(fmt(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return set;
  }, [blockedRanges]);

  const monthOffset =
    (view.year - now.getFullYear()) * 12 + (view.month - now.getMonth());

  function moveMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function spanIsFree(start: string, end: string) {
    const cursor = new Date(`${start}T00:00:00`);
    const until = new Date(`${end}T00:00:00`);
    while (cursor < until) {
      if (
        blockedDates.has(
          fmt(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
        )
      ) {
        return false;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return true;
  }

  function handleSelect(date: string) {
    if (!checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: date, checkOut: "" });
    } else if (date <= checkIn) {
      onChange({ checkIn: date, checkOut: "" });
    } else if (spanIsFree(checkIn, date)) {
      onChange({ checkIn, checkOut: date });
    } else {
      // 중간에 마감된 밤이 끼어 있으면 그 날짜를 새 체크인으로 다시 시작
      onChange({ checkIn: date, checkOut: "" });
    }
  }

  const firstDayOffset = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  return (
    <div
      data-testid="availability-calendar"
      className="rounded-2xl border border-line bg-cream p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          disabled={monthOffset <= 0}
          aria-label="이전 달"
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-cream-deep hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ‹
        </button>
        <p className="text-sm font-medium tracking-wide text-ink">
          {view.year}년 {view.month + 1}월
        </p>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          disabled={monthOffset >= MAX_MONTHS_AHEAD}
          aria-label="다음 달"
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-cream-deep hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="pb-2 text-[0.65rem] font-medium uppercase tracking-widest text-stone"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = fmt(view.year, view.month, i + 1);
          const isPast = date < today;
          const isBlocked = blockedDates.has(date);
          const isEndpoint = date === checkIn || date === checkOut;
          const inRange =
            !!checkIn && !!checkOut && date > checkIn && date < checkOut;

          const stateClass = isEndpoint
            ? "bg-ink text-cream"
            : inRange
              ? "bg-cream-deep text-ink"
              : isPast
                ? "text-stone/30"
                : isBlocked
                  ? "text-stone/40 line-through"
                  : "text-ink hover:bg-cream-deep";

          return (
            <button
              key={date}
              type="button"
              data-date={date}
              onClick={() => handleSelect(date)}
              disabled={isPast || isBlocked}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${stateClass}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-stone">
        취소선 날짜는 예약이 마감된 날입니다. 날짜를 눌러 체크인, 체크아웃
        순서로 선택해 주세요.
      </p>
    </div>
  );
}
