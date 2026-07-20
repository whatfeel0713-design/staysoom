import { createClient } from "@/utils/supabase/server";

/**
 * 예약 코드로 압해 컨시어지 가이드 접근 가능 여부 확인.
 * verify_guide_access RPC는 확정(confirmed) 상태 + 투숙 기간(체크인 전날~체크아웃)
 * + 코드 일치를 모두 검사하고 boolean만 반환한다 — 게스트 정보는 노출되지 않는다.
 */
export async function verifyGuideAccess(code: string): Promise<boolean> {
  if (!code) return false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("verify_guide_access", {
      p_code: code,
    });
    if (error) {
      console.error("[guide] access check failed:", error.message);
      return false;
    }
    return data === true;
  } catch {
    return false;
  }
}
