-- ============================================================
-- 스테이숨 Phase 1: users RLS 무한 재귀(42P17) 수정
-- 이미 20260713120000_init_users_content_blocks.sql을 실행한 프로젝트에서
-- 이 파일을 이어서 실행하면 됩니다.
-- ============================================================

-- role 판별용 SECURITY DEFINER 함수 (RLS를 우회해 재귀 없이 role 조회)
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

-- 재귀를 유발하던 기존 정책 제거 후 is_admin()으로 재생성
drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "content_blocks_admin_write" on public.content_blocks;
create policy "content_blocks_admin_write"
  on public.content_blocks for all
  using (public.is_admin())
  with check (public.is_admin());
