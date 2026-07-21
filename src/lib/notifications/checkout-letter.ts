import "server-only";
import { BRAND } from "@/lib/brand";

export interface CheckoutLetterPayload {
  guestName: string;
  guestEmail: string;
  /** 체크인 날짜 (YYYY-MM-DD) */
  checkIn: string;
  /** 체크아웃 날짜 (YYYY-MM-DD) */
  checkOut: string;
  specialOccasion?: string | null;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * 퇴실 후 감성 여정 편지 — concierge_logs(Phase B)가 아직 없어 "이번 스테이 동안
 * 물으신 질문·언급한 장소"를 근거로 한 진짜 개인화는 못 한다(그 데이터가 없다).
 * 대신 예약 정보(이름·날짜·기념일)만으로 따뜻한 톤의 정적 회고 편지를 보낸다 —
 * 대화 기록 기반 개인화는 챗 로그 저장이 생긴 뒤 고도화할 것.
 */
export function composeCheckoutLetter(payload: CheckoutLetterPayload): {
  subject: string;
  html: string;
} {
  const occasionLine = payload.specialOccasion
    ? `<p>${escapeHtml(payload.specialOccasion)}과 함께한 시간이었다고 들었어요. 오래 기억에 남는 시간이었기를 바랍니다.</p>`
    : "";

  const subject = `${payload.guestName}님, ${BRAND.name}에서의 시간은 어떠셨나요`;
  const html = `
    <div style="font-family: Georgia, 'Noto Serif KR', serif; color: #16150f; max-width: 480px; margin: 0 auto; line-height: 1.8;">
      <p style="font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #9a8b6f;">${BRAND.nameEnUpper}</p>
      <h1 style="font-weight: 300; font-size: 1.4rem;">${escapeHtml(payload.guestName)}님, 다녀가 주셔서 감사합니다</h1>
      <p>${payload.checkIn} ~ ${payload.checkOut}, ${BRAND.name}에 머물러 주셨습니다.</p>
      ${occasionLine}
      <p>섬의 느린 시간과 노을, 갯벌의 물때가 좋은 기억으로 남았기를 바랍니다.
      다음에 또 압해를 찾아주시면 언제나 반갑게 맞이하겠습니다.</p>
      <p style="margin-top: 2rem;">${BRAND.name} 드림<br/><a href="mailto:${BRAND.email}" style="color: #16150f;">${BRAND.email}</a></p>
    </div>
  `;

  return { subject, html };
}

/**
 * Resend REST API로 발송한다. RESEND_API_KEY가 없으면(4순위 예정 — 아직
 * 미설정 가능) 조용히 건너뛴다 — 다른 알림 채널과 동일하게 발송 실패가
 * 관리자 화면의 다른 동작을 막지 않는다.
 *
 * ⚠️ 발신 주소(BRAND.email)는 Resend에서 도메인 인증을 마쳐야 실제로
 * 발송된다 — 미인증 도메인이면 Resend API가 에러를 반환한다.
 */
export async function sendCheckoutLetter(payload: CheckoutLetterPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[checkout-letter] RESEND_API_KEY is not set — skipping send.");
    return;
  }

  const { subject, html } = composeCheckoutLetter(payload);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: BRAND.email,
        to: payload.guestEmail,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[checkout-letter] Resend responded with ${res.status}: ${body}`);
    }
  } catch (error) {
    console.error("[checkout-letter] Failed to send:", error);
  }
}
