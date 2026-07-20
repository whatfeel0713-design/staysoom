"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createReservation, type ReservationFormState } from "./actions";
import { AvailabilityCalendar } from "./availability-calendar";
import type { BlockedRange } from "@/lib/availability";
import { BRAND } from "@/lib/brand";

const initialState: ReservationFormState = { status: "idle" };

export function ReservationForm({
  blockedRanges,
}: {
  blockedRanges: BlockedRange[];
}) {
  const [state, formAction, isPending] = useActionState(
    createReservation,
    initialState
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="mt-12 flex flex-col gap-9">
      <AvailabilityCalendar
        blockedRanges={blockedRanges}
        checkIn={checkIn}
        checkOut={checkOut}
        onChange={(next) => {
          setCheckIn(next.checkIn);
          setCheckOut(next.checkOut);
        }}
      />

      <div className="grid grid-cols-2 gap-8">
        <label className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
            체크인
          </span>
          <input
            type="date"
            name="check_in"
            required
            min={minDate}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="field-underline"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
            체크아웃
          </span>
          <input
            type="date"
            name="check_out"
            required
            min={minDate}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="field-underline"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <label className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
            예약자명
          </span>
          <input
            name="guest_name"
            required
            placeholder="성함을 입력해 주세요"
            className="field-underline"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
            인원수
          </span>
          <input
            type="number"
            name="guest_count"
            min={1}
            max={BRAND.maxGuests}
            required
            defaultValue={2}
            className="field-underline"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
          연락처
        </span>
        <input
          type="tel"
          name="guest_phone"
          required
          placeholder="010-1234-5678"
          className="field-underline"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
          이메일 (선택)
        </span>
        <input
          type="email"
          name="guest_email"
          placeholder="example@email.com"
          className="field-underline"
        />
      </label>

      <label className="flex items-start gap-3 text-sm leading-6 text-stone">
        <input
          type="checkbox"
          name="privacy_consent"
          required
          className="mt-1 h-4 w-4 accent-ink"
        />
        <span>
          예약 접수를 위한 개인정보 수집·이용에 동의합니다.{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="underline underline-offset-2 hover:text-ink"
          >
            처리방침 보기
          </Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-ink px-8 py-4 text-sm font-medium tracking-wide text-cream transition-all duration-300 hover:bg-ink-soft hover:shadow-lg hover:shadow-ink/20 disabled:opacity-50"
      >
        {isPending ? "접수 중..." : "예약 접수하기"}
      </button>

      {state.status !== "idle" && (
        <p
          role="status"
          className={`text-sm leading-6 ${
            state.status === "success" ? "text-bronze" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
