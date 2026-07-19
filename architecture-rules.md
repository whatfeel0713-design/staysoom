# 스테이숨(StaySoom) 아키텍처 원칙

## 기술 스택 및 배포

- **프론트엔드**: Next.js (App Router), Tailwind CSS, Vercel 호스팅
- **백엔드 및 DB**: Supabase (PostgreSQL 기반, Auth 및 자체 결제/예약 처리)

## 핵심 DB 스키마

- **Users**: `id`, `role`, `email`, `created_at`
- **Content_Blocks**: 홈페이지 동적 관리용 (`id`, `type`, `title`, `media_url`, `is_active`)
- **Reservations**: `id`, `user_id`, `check_in`, `check_out`, `status`, `total_price`, `airbnb_sync_id`
- **Concierge_Logs**: `id`, `reservation_id`, `request_type`, `status`, `created_at`
- **IoT_Logs** (Phase 3 대비용): `id`, `device_type`, `action_time`, `status`

## 에이전틱 AI 및 데이터 분석 (Phase 2, 3)

- **능동형 게스트 케어 (Proactive Concierge)**: 기상청/구글 캘린더 연동 맞춤형 알림톡
- **무인 재고 관리 (Autonomous Operations)**: 컨시어지 로그 분석 및 자동 발주
- **능동적 공실 관리 (Dynamic Marketing)**: 고객 데이터 기반 타겟 할인 링크 발송
- **애널리틱스**: GA4 이벤트(`click_youtube_aphaedo` 등) + BigQuery + Looker Studio 연동

## 개발 원칙 (TOC/CHLP)

- 모든 `useEffect`는 클린업 함수를 포함해 이벤트 리스너를 해제하고 메모리 누수를 방지할 것.
- 기능 구현 완료 시 리팩토링 및 재사용 가능 패턴을 진단할 것.

## 🧠 누적 스킬 및 트러블슈팅

### Supabase client/server 클라이언트 분리 (Next.js App Router)

- Next.js App Router에서 Supabase를 쓸 때는 `@supabase/ssr`로 브라우저용과 서버용 클라이언트를 **반드시 분리**해서 생성한다.
  - `src/utils/supabase/client.ts`: `createBrowserClient` — 클라이언트 컴포넌트에서 사용.
  - `src/utils/supabase/server.ts`: `createServerClient` — 서버 컴포넌트/라우트 핸들러에서 사용, `next/headers`의 `cookies()`로 세션 쿠키를 읽고 쓴다.
- 서버 클라이언트의 `setAll`은 Server Component 렌더링 중에는 쿠키 쓰기가 불가능해 에러가 날 수 있으므로 `try/catch`로 무시하고, 실제 세션 토큰 갱신은 별도의 `middleware.ts`가 담당하도록 역할을 분리한다(관리자 로그인 세션 유지 구현 시 middleware 추가 필요).

### Supabase RLS 정책 패턴 (Users / Content_Blocks)

- `public.users`는 `id uuid references auth.users(id) on delete cascade`로 Supabase Auth와 1:1 연결한다. `role`은 `check (role in ('admin','guest'))`로 값 범위를 제한한다.
- **"본인 또는 admin" 판별 패턴 — `is_admin()` SECURITY DEFINER 함수 사용 (필수)**: RLS 정책 `using` 절에서 `public.users`를 직접 서브쿼리로 재참조하면 그 서브쿼리에도 동일한 정책이 다시 적용되어 **무한 재귀(Postgres 에러 `42P17`)**가 발생한다. 반드시 `SECURITY DEFINER` 함수로 RLS를 우회해 role을 조회해야 한다.
  ```sql
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

  create policy "users_select_self_or_admin"
    on public.users for select
    using (auth.uid() = id or public.is_admin());
  ```
  ⚠️ 아래처럼 정책 안에서 같은 테이블을 직접 subquery로 재참조하는 패턴은 **절대 쓰지 말 것** (무한 재귀 발생, 실제 장애 경험함):
  ```sql
  -- 금지: infinite recursion detected in policy for relation "users"
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  ```
- **공개 콘텐츠 테이블 패턴**: `content_blocks`처럼 비로그인 게스트에게도 노출해야 하는 테이블은 정책을 두 개로 분리한다.
  - 읽기: `is_active = true`인 행만 익명 포함 누구나 조회 가능 (`for select using (is_active = true)`).
  - 쓰기: `for all` 정책의 `using`과 `with check` 양쪽에 `public.is_admin()`을 걸어 admin만 생성/수정/삭제 가능하게 한다.
- 새로운 테이블을 추가할 때마다 `alter table ... enable row level security`를 빠뜨리지 않는다 — anon key로 클라이언트가 직접 Supabase에 접근하는 구조이므로 RLS 미설정 테이블은 전체 공개되는 것과 같다.
- role 판별이 필요한 정책을 새로 추가할 때는 항상 `public.is_admin()`을 재사용한다(중복 정의 금지).

### Server Component에서 Supabase 조회 시 안전한 폴백 패턴

- Server Component 안에서 Supabase 데이터를 조회할 때는 **클라이언트 생성부터 쿼리 실행까지 하나의 `try/catch`로 감싸고, 실패 시 빈 배열/빈 상태를 반환**한다.
- `.env.local` 미설정, 네트워크 장애, Supabase 프로젝트 미연결 등의 상황에서도 페이지 전체가 500 에러로 죽지 않고 "콘텐츠 준비 중입니다" 같은 빈 상태 UI로 우아하게 대체되도록 한다. (예: [src/app/page.tsx](src/app/page.tsx)의 `getRoomHighlights`)

### 프로젝트 범위 밖 파일은 삭제 전 반드시 사용자 확인

- 프로젝트 디렉토리 바깥에 있는 파일(예: 홈 디렉토리의 잔여 lockfile 등)은, 그것이 자신의 실수로 생긴 부산물이라는 확신이 있어도 **삭제 전에 반드시 사용자에게 먼저 알리고 승인을 받는다.**
- "사소해 보인다", "내가 만든 흔적이 맞는 것 같다"는 판단만으로 스코프 밖 파일을 임의로 삭제하지 않는다 — 되돌릴 수 없는 로컬 파일 삭제는 프로젝트 범위 안/밖을 가리지 않고 항상 신중하게 다룬다.

### 인증 라우트 가드: `(protected)` 라우트 그룹 + 이중 방어

- Next.js App Router에서 인증이 필요한 영역은 `(protected)` 라우트 그룹으로 분리한다. 예: `/admin/login`은 가드 밖, `/admin`(대시보드)은 `admin/(protected)/layout.tsx` 가드 안. URL에는 영향을 주지 않으면서 로그인 페이지가 가드에 걸려 리다이렉트 루프에 빠지는 것을 방지한다.
- **이중 방어 구조**: `middleware.ts`는 "로그인 여부"만 빠르게 확인해 미인증 시 `/admin/login`으로 리다이렉트하고, 실제 `role = 'admin'` 확인은 protected 레이아웃(Server Component)에서 한 번 더 수행한다. 그리고 최종적으로는 RLS(`public.is_admin()`)가 DB 레벨에서 강제한다 — 미들웨어/레이아웃 체크를 우회당해도 데이터는 안전하다.

### 클라이언트 상태 없는 CRUD: Server Actions + `<form action>`

- 단순 CRUD 폼은 `useState`/`useEffect` 없이 Next.js Server Actions를 `<form action={fn}>`, 항목별 액션은 `fn.bind(null, id)`로 직접 연결한다. `revalidatePath`로 서버 데이터가 갱신되면 자동으로 재렌더링된다.
- 리스트/폼 위주의 관리자 UI에는 이 패턴이 클라이언트 컴포넌트보다 낫다 — 등록된 이벤트 리스너 자체가 없어 메모리 누수 리스크가 원천적으로 없다. `confirm()` 같은 브라우저 API가 꼭 필요한 지점(삭제 버튼 등)만 최소 범위로 `"use client"` 컴포넌트로 분리한다.

### 브라우저 프리뷰에서 클릭이 반응하지 않을 때

- 이 프로젝트의 Claude Browser 프리뷰 환경에서 `computer` 클릭 도구가 간헐적으로 무반응일 수 있다. `form_input`으로 값을 채운 뒤 `javascript_tool`로 `element.click()`을 직접 호출하는 방식이 안정적인 우회책이다.

### 새 테이블 마이그레이션은 "파일 작성"과 "실제 적용"을 분리해서 확인

- 새 테이블을 참조하는 기능을 구현한 직후에는, 그 마이그레이션 SQL이 실제 Supabase 프로젝트에 적용됐는지를 먼저 확인한다. 마이그레이션 파일을 만드는 것과 사용자가 그것을 Supabase SQL Editor에서 실행하는 것은 별개의 단계이며, 안 되어 있다면 기능 검증 전에 사용자에게 실행을 요청하는 것을 표준 절차로 삼는다.
- 신호: 에러 코드 `PGRST205`, 메시지 `"Could not find the table '...' in the schema cache"` — 마이그레이션 미적용을 의미한다.

### `useActionState`로 클라이언트 인라인 피드백이 필요한 공개 폼 처리

- 공개 폼처럼 성공/실패를 그 자리에서 보여줘야 하는 곳은 React 19의 `useActionState`를 쓰면 `useEffect` 없이도 처리할 수 있다. Server Action이 `(prevState, formData) => state`를 반환하도록 작성하고, 클라이언트 컴포넌트에서 `const [state, formAction, pending] = useActionState(action, initialState)`로 받는다.
- 관리자 CRUD처럼 인라인 피드백이 꼭 필요하지 않은 곳은 여전히 순수 `<form action>` + `revalidatePath`가 더 단순하므로, 이 패턴은 "제출 즉시 결과를 보여줘야 하는" 화면에만 선택적으로 쓴다.

### DB 제약 위반 등 사용자에게 보여줄 실패는 라우트별 `error.tsx`로 처리

- Server Action이 DB 제약 위반(예: EXCLUDE 제약) 등 사용자에게 보여줄 만한 이유로 실패할 수 있는 라우트에는 Next.js의 라우트 세그먼트별 `error.tsx`(필수로 client component)를 추가한다. `reset()`으로 "다시 시도" 버튼을 제공하면, 클라이언트 상태를 늘리지 않고도 친절한 에러 화면을 얻을 수 있다. 예: [src/app/admin/(protected)/reservations/error.tsx](src/app/admin/(protected)/reservations/error.tsx)
