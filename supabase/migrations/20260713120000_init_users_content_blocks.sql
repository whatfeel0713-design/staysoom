-- ============================================================
-- 스테이숨 Phase 1: Users, Content_Blocks 테이블
-- architecture-rules.md 핵심 DB 스키마 반영
-- ============================================================

-- --------------------------------------------------------------
-- Users
-- Supabase Auth(auth.users)와 1:1로 연결되는 프로필 테이블
-- --------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'guest' check (role in ('admin', 'guest')),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- role 판별용 SECURITY DEFINER 함수
-- public.users를 조회하는 RLS 정책 안에서 다시 public.users를 direct subquery로 참조하면
-- 그 서브쿼리에도 동일한 정책이 재적용되어 무한 재귀(42P17)가 발생한다.
-- SECURITY DEFINER 함수는 RLS를 우회해 조회하므로 재귀 없이 안전하게 role을 확인할 수 있다.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 본인 정보는 본인이 조회 가능, admin은 전체 조회 가능
create policy "users_select_self_or_admin"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

-- --------------------------------------------------------------
-- Content_Blocks
-- 관리자가 관리하는 홈페이지 동적 콘텐츠(배너/객실/유튜브/후기)
-- --------------------------------------------------------------
create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('banner', 'room', 'youtube', 'testimonial')),
  title text not null,
  media_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.content_blocks enable row level security;

-- 활성 콘텐츠는 누구나(비로그인 게스트 포함) 조회 가능 — 랜딩페이지 렌더링용
create policy "content_blocks_public_read_active"
  on public.content_blocks for select
  using (is_active = true);

-- 생성/수정/삭제는 admin만 가능
create policy "content_blocks_admin_write"
  on public.content_blocks for all
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------------------
-- 더미 데이터 (랜딩페이지 렌더링 테스트용)
-- --------------------------------------------------------------
insert into public.content_blocks (type, title, media_url, is_active) values
  ('room', '그레이 타일 마감 외관', null, true),
  ('room', '물결 거울 포토존', null, true),
  ('room', '스카이로켓 향나무 조경', null, true);
