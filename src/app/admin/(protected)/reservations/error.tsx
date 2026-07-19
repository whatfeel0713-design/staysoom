"use client";

export default function ReservationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700">{error.message || "오류가 발생했습니다."}</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
      >
        다시 시도
      </button>
    </div>
  );
}
