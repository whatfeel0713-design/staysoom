"use client";

import { useActionState } from "react";
import { createReservation, type ReservationFormState } from "./actions";

const initialState: ReservationFormState = { status: "idle" };

export default function ReservationsPage() {
  const [state, formAction, isPending] = useActionState(
    createReservation,
    initialState
  );

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <form
        action={formAction}
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          예약하기
        </h1>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          예약자명
          <input
            name="name"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          날짜
          <input
            type="date"
            name="date"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          인원수
          <input
            type="number"
            name="partySize"
            min={1}
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          연락처
          <input
            type="tel"
            name="phone"
            required
            placeholder="010-1234-5678"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-zinc-900"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-full bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {isPending ? "접수 중..." : "예약 접수"}
        </button>

        {state.status !== "idle" && (
          <p
            className={
              state.status === "success"
                ? "text-sm text-green-600 dark:text-green-400"
                : "text-sm text-red-600 dark:text-red-400"
            }
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
