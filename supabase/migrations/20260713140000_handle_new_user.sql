-- ============================================================
-- 스테이숨 Phase 1: auth.users -> public.users 자동 동기화
-- 관리자 로그인 시 role을 확인하려면 public.users에 행이 있어야 한다.
-- ============================================================

-- 신규 가입 시 public.users에 기본 role='guest'로 프로필 행 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'guest')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 트리거 생성 이전에 이미 만들어진 auth.users 계정 백필
insert into public.users (id, email, role)
select id, email, 'guest' from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 관리자(장모님) 계정 승격 예시 — 아래 이메일을 실제 계정으로 바꿔서 별도 실행할 것
-- update public.users set role = 'admin' where email = 'mother-in-law@example.com';
-- ------------------------------------------------------------
