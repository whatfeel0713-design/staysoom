-- ============================================================
-- 압해 컨시어지 Phase B — 서비스 신청 로그
-- 바베큐 신청, 시크릿 쿠폰 발급, T맵 전송, 챗 등 컨시어지 앱에서 일어나는
-- 요청을 기록한다. 게스트는 이 테이블에 직접 접근하지 않고
-- create_concierge_log RPC로만 기록한다(guide_code로 예약을 검증한 뒤
-- 최소 정보만 insert) — concierge-app-design.md의 원래 설계와 동일하다.
-- ============================================================

create table if not exists public.concierge_logs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  request_type text not null check (request_type in ('bbq', 'chat', 'tmap_send', 'coupon_view')),
  payload jsonb,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.concierge_logs enable row level security;

-- 게스트는 직접 테이블에 접근하지 않는다 — RPC로만 기록.
create or replace function public.create_concierge_log(
  p_code text, p_request_type text, p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation_id uuid;
  v_log_id uuid;
begin
  select id into v_reservation_id
  from public.reservations
  where guide_code = p_code
    and status = 'confirmed'
    and current_date between (check_in - interval '1 day')::date and check_out;

  if v_reservation_id is null then
    raise exception 'invalid or expired guide code';
  end if;

  insert into public.concierge_logs (reservation_id, request_type, payload)
  values (v_reservation_id, p_request_type, p_payload)
  returning id into v_log_id;

  return v_log_id;
end;
$$;

grant execute on function public.create_concierge_log(text, text, jsonb) to anon, authenticated;

-- 조회·상태 변경은 admin만 (메인 사이트 /admin/concierge에서 신청 목록 확인·처리용)
create policy "concierge_logs_admin_all"
  on public.concierge_logs for all
  using (public.is_admin())
  with check (public.is_admin());
