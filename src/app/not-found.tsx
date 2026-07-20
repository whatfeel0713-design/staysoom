import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
        404
      </p>
      <h1 className="mt-6 font-serif text-3xl font-light leading-snug tracking-tight text-ink md:text-4xl">
        찾으시는 페이지가
        <br />
        여기에는 없습니다
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-7 text-stone">
        주소가 바뀌었거나 잘못 입력된 것 같아요.
        {BRAND.name}의 처음으로 돌아가 천천히 둘러보세요.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-ink px-9 py-3.5 text-sm font-medium tracking-wide text-cream transition-all duration-300 hover:bg-ink-soft hover:shadow-lg hover:shadow-ink/20"
        >
          처음으로
        </Link>
        <Link
          href="/reservations"
          className="rounded-full border border-ink/30 px-9 py-3.5 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
        >
          예약하기
        </Link>
      </div>
    </div>
  );
}
