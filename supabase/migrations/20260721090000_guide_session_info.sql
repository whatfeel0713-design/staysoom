-- ============================================================
-- 압해 컨시어지 고도화 B그룹 — 개인화된 첫 인사
-- 기존 verify_guide_access(boolean)는 메인 사이트 /guide가 그대로 쓰므로
-- 건드리지 않는다. 컨시어지 앱(stayaphae-concierge)이 이름·인원·체크아웃
-- 날짜·기념일 메모로 개인화된 인사를 하고, 세션 쿠키를 체크아웃 자정 기준
-- 만료로 정교화할 수 있도록 별도 RPC로 최소한의 정보만 노출한다.
-- ============================================================

alter table public.reservations
  add column if not exists special_occasion text;

comment on column public.reservations.special_occasion is
  '기념일 등 자유 메모(예: 신혼여행, 생일) — 관리자가 예약 확정 시 직접 입력. 컨시어지 챗이 서프라이즈 제안에 참고.';

-- guide_code + 투숙 기간(체크인 전날~체크아웃) + confirmed 상태를 검사하는
-- 것은 verify_guide_access와 동일하고, 통과 시에만 이름·인원·날짜를 반환한다.
-- 조건에 맞는 예약이 없으면 행이 0개 반환된다(= 검증 실패) — 호출 측에서
-- 결과 배열의 길이로 유효성을 판단할 것.
create or replace function public.get_guide_session_info(p_code text)
returns table (
  guest_name text,
  guest_count int,
  check_in date,
  check_out date,
  special_occasion text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.guest_name,
    r.guest_count,
    r.check_in,
    r.check_out,
    r.special_occasion
  from public.reservations r
  where r.guide_code = p_code
    and r.status = 'confirmed'
    and current_date between (r.check_in - interval '1 day')::date and r.check_out
  limit 1;
$$;

grant execute on function public.get_guide_session_info(text) to anon, authenticated;
