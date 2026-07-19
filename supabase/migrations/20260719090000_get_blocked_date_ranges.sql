-- ============================================================
-- 스테이숨: 게스트용 예약 불가 날짜 조회 RPC
-- 확정 예약 + 외부 플랫폼(에어비앤비 등) 차단 기간을
-- 게스트 개인정보 없이 날짜 범위로만 반환. 익명 호출 허용.
-- (reservations / external_calendar_* 테이블은 admin 전용 RLS이므로
--  security definer 함수로만 안전한 최소 정보를 노출한다)
-- ============================================================

create or replace function public.get_blocked_date_ranges()
returns table (start_date date, end_date date)
language sql
security definer
set search_path = public
stable
as $$
  select check_in as start_date, check_out as end_date
  from public.reservations
  where status = 'confirmed'
    and check_out >= current_date
  union all
  select b.start_date, b.end_date
  from public.external_calendar_blocks b
  join public.external_calendar_sources s on s.id = b.source_id
  where s.is_active
    and b.end_date >= current_date;
$$;

grant execute on function public.get_blocked_date_ranges() to anon, authenticated;
