import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `개인정보처리방침 | ${BRAND.name}`,
  description: `${BRAND.name} 개인정보처리방침 — 예약 접수 시 수집하는 개인정보의 항목·목적·보유 기간 안내.`,
};

/**
 * 개인정보처리방침 초안.
 * ⚠️ [확정 필요] 표시 부분(사업자 정보·보호책임자)은 실제 정보로 교체 후 오픈할 것.
 */
const SECTIONS = [
  {
    title: "1. 수집하는 개인정보의 항목과 방법",
    body: [
      "예약 요청 시 홈페이지 예약 폼을 통해 다음 항목을 수집합니다: 예약자명, 연락처(휴대전화), 이메일(선택), 투숙 인원, 체크인·체크아웃 날짜.",
      "별도의 회원가입 절차는 없으며, 예약 목적 외의 개인정보는 수집하지 않습니다.",
    ],
  },
  {
    title: "2. 수집·이용 목적",
    body: [
      "예약 접수 확인 및 확정·취소 안내 연락",
      "체크인 안내(주소·출입 방법 등) 전달",
      "예약 관련 문의 응대",
    ],
  },
  {
    title: "3. 보유 및 이용 기간",
    body: [
      "수집한 개인정보는 예약 서비스 제공 완료 후 지체 없이 파기하는 것을 원칙으로 합니다.",
      "다만 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다: 계약 또는 청약철회 등에 관한 기록 5년, 대금결제 및 재화 등의 공급에 관한 기록 5년, 소비자의 불만 또는 분쟁처리에 관한 기록 3년.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: [
      "수집한 개인정보를 제3자에게 제공하지 않습니다. 법령에 근거한 요청이 있는 경우는 예외로 합니다.",
    ],
  },
  {
    title: "5. 개인정보 처리의 위탁",
    body: [
      "서비스 운영을 위해 최소한의 범위에서 개인정보 처리를 위탁합니다: 데이터 보관 — Supabase Inc.(클라우드 데이터베이스), 웹사이트 호스팅 — Vercel Inc.",
      "위탁받은 업체는 위탁 목적 범위를 벗어나 개인정보를 처리하지 않습니다.",
    ],
  },
  {
    title: "6. 정보주체의 권리",
    body: [
      "예약자는 언제든지 본인 개인정보의 열람·정정·삭제·처리정지를 요구할 수 있습니다. 아래 연락처로 요청해 주시면 지체 없이 조치합니다.",
    ],
  },
  {
    title: "7. 개인정보 보호책임자",
    body: [
      `성명: [확정 필요] · 연락처: ${BRAND.email}`,
      "개인정보 처리에 관한 문의·불만·피해구제는 위 연락처로 접수해 주세요.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-28 pt-36 md:pt-44">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
        Privacy
      </p>
      <h1 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
        개인정보처리방침
      </h1>
      <p className="mt-6 text-sm leading-7 text-stone">
        {BRAND.name}(이하 &ldquo;스테이&rdquo;)는 예약 서비스를 제공하기 위해
        필요한 최소한의 개인정보만을 수집하며, 개인정보보호법 등 관계 법령을
        준수합니다.
      </p>

      <div className="mt-14 flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="border-t border-ink/15 pt-6 text-base font-medium tracking-wide text-ink">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-stone">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-ink/15 pt-6 text-xs leading-6 text-stone">
        본 방침은 2026년 7월 20일부터 적용됩니다. 내용이 변경되는 경우 이
        페이지를 통해 고지합니다.
      </p>
    </div>
  );
}
