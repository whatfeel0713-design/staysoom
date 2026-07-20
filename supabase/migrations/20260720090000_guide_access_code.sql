-- ============================================================
-- 스테이 압해: 압해 컨시어지 3b — 예약 확정 고객 전용 가이드 접근 코드
-- 지금까지 /guide는 noindex + 비공개 URL이었지만, 링크를 아는 사람은
-- 누구나 열 수 있었다. 예약별 고유 코드로 진짜 프라이빗을 구현한다.
-- ============================================================

alter table public.reservations
  add column if not exists guide_code text
  default lower(replace(gen_random_uuid()::text, '-', ''));

update public.reservations
  set guide_code = lower(replace(gen_random_uuid()::text, '-', ''))
  where guide_code is null;

alter table public.reservations
  alter column guide_code set not null;

alter table public.reservations
  add constraint reservations_guide_code_unique unique (guide_code);

-- 코드 + 투숙 기간(체크인 전날 ~ 체크아웃 당일) + confirmed 상태를 확인하는
-- RPC. reservations는 admin 전용 RLS라 이 함수로만 최소 정보(boolean)를
-- 노출한다 — 게스트 개인정보는 응답에 포함하지 않는다.
create or replace function public.verify_guide_access(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.reservations
    where guide_code = p_code
      and status = 'confirmed'
      and current_date between (check_in - interval '1 day')::date and check_out
  );
$$;

grant execute on function public.verify_guide_access(text) to anon, authenticated;
