"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createReservation, type ReservationFormState } from "./actions";
import { BRAND } from "@/lib/brand";

const initialState: ReservationFormState = { status: "idle" };

export default function ReservationsPage() {
  const [state, formAction, isPending] = useActionState(
    createReservation,
    initialState
  );

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Editorial panel */}
      <aside className="relative hidden min-h-svh md:block md:w-[45%]">
        <Image
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop"
          alt={`따뜻한 조명이 감도는 ${BRAND.name} 침실`}
          fill
          priority
          sizes="45vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-white/75">
            Reservation
          </p>
          <p className="mt-4 font-serif text-3xl font-light leading-snug tracking-tight">
            머무름의 시작,
            <br />
            그날을 비워두겠습니다
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 pb-24 pt-32 md:px-16 md:pt-40">
        <div className="w-full max-w-md">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
            Reservation
          </p>
          <h1 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
            예약하기
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone">
            아래 내용을 남겨주시면 확인 후 연락드립니다.
            <br />
            {BRAND.checkInOut}
          </p>

          <form action={formAction} className="mt-12 flex flex-col gap-9">
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                예약자명
              </span>
              <input
                name="name"
                required
                placeholder="성함을 입력해 주세요"
                className="field-underline"
              />
            </label>

            <div className="grid grid-cols-2 gap-8">
              <label className="flex flex-col gap-1">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                  날짜
                </span>
                <input type="date" name="date" required className="field-underline" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                  인원수
                </span>
                <input
                  type="number"
                  name="partySize"
                  min={1}
                  required
                  placeholder="2"
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
                name="phone"
                required
                placeholder="010-1234-5678"
                className="field-underline"
              />
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
        </div>
      </div>
    </div>
  );
}
