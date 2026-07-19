import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role 키로 RLS를 우회하는 클라이언트.
// 크론 등 인증 세션이 없는 신뢰된 서버 전용 작업(예: 캘린더 동기화)에서만 사용할 것 —
// 요청 경로(Route Handler/Server Action의 사용자 흐름)에서는 절대 사용하지 않는다.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
