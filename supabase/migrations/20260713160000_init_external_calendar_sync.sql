-- ============================================================
-- 스테이숨 Phase 2: 외부 플랫폼(에어비앤비/야놀자 등) iCal 동기화
-- ============================================================

-- 등록된 외부 iCal 소스 (플랫폼별 캘린더 URL)
create table if not exists public.external_calendar_sources (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  ical_url text not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- 외부 소스에서 읽어온 예약 불가 기간 (게스트 정보 없는 '불투명한' 차단 기간)
create table if not exists public.external_calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.external_calendar_sources (id) on delete cascade,
  uid text not null,
  start_date date not null,
  end_date date not null,
  summary text,
  synced_at timestamptz not null default now(),
  unique (source_id, uid)
);

alter table public.external_calendar_sources enable row level security;
alter table public.external_calendar_blocks enable row level security;

-- 두 테이블 모두 admin만 접근 (내부 운영 데이터, 공개 노출 불필요)
create policy "external_calendar_sources_admin_all"
  on public.external_calendar_sources for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "external_calendar_blocks_admin_all"
  on public.external_calendar_blocks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 우리 쪽 확정 예약을 외부 플랫폼에 내보내기 위한 RPC
-- 게스트 개인정보(이름/연락처) 없이 날짜 범위만 반환, 익명 호출 허용
-- (에어비앤비/야놀자 서버가 로그인 없이 이 iCal export 엔드포인트를 주기적으로 읽어감)
-- ------------------------------------------------------------
create or replace function public.get_confirmed_reservation_ranges()
returns table (check_in date, check_out date)
language sql
security definer
set search_path = public
stable
as $$
  select check_in, check_out from public.reservations where status = 'confirmed';
$$;

grant execute on function public.get_confirmed_reservation_ranges() to anon, authenticated;
