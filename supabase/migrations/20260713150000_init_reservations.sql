-- ============================================================
-- 스테이숨 Phase 2: Reservations (비회원 예약 + 수동 승인 + 이중예약 방지)
-- ============================================================

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  check_in date not null,
  check_out date not null,
  guest_count int not null default 1 check (guest_count > 0),
  total_price numeric(10, 2),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint reservations_valid_dates check (check_out > check_in)
);

-- 같은 기간에 'confirmed' 상태 예약이 겹치는 것을 DB 레벨에서 원천 차단
-- (room_id 등 다지점 확장 시에는 btree_gist + equality 컬럼을 추가해 확장할 것)
alter table public.reservations
  add constraint reservations_no_overlapping_confirmed
  exclude using gist (
    daterange(check_in, check_out, '[)') with &&
  )
  where (status = 'confirmed');

alter table public.reservations enable row level security;

-- 비회원 포함 누구나 예약 "요청"은 생성 가능 — 단 상태는 반드시 pending으로 시작
create policy "reservations_public_insert"
  on public.reservations for insert
  with check (status = 'pending');

-- 조회/수정/삭제는 admin만 — 다른 예약자의 연락처가 노출되지 않도록 익명 조회는 차단
create policy "reservations_admin_all"
  on public.reservations for all
  using (public.is_admin())
  with check (public.is_admin());
