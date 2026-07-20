# 압해 컨시어지 앱 — 별도 웹앱 설계

> 랜딩(`stayaphae.com`)의 AI 컨시어지 섹션은 소개만 노출한다. 실제 서비스는
> 예약 확정 고객에게만 QR·링크로 전달되는 별도 웹앱(`concierge.stayaphae.com`
> 가칭)으로 분리 구축한다. 이 문서는 그 설계다. roadmap.md의 Phase 3(3a~3d)를
> 구체화한 버전이며, 실제 착수 시 이 문서를 갱신해 간다.

## 왜 별도 앱인가 (분리 근거)

지금 메인 사이트(`stayaphae.com`) 안에 `/guide`로 3a(정적 가이드)+3b(예약 코드
게이트)를 이미 구현해 두었다 — 오늘 당장 쓸 수 있고 잘 동작한다. 하지만 3c(AI
챗)·3d(IoT 컨트롤)까지 같은 앱에 계속 쌓으면:

- 마케팅 사이트가 무거워진다 (챗 스트리밍, 대화 상태, IoT 제어 로직은 예약 폼과
  전혀 다른 런타임 특성).
- 배포 주기가 엉킨다 — 랜딩 카피 하나 고치려다 컨시어지 기능 배포까지 같이
  나간다.
- 브랜딩 리스크 — 공개 사이트와 프라이빗 서비스가 같은 코드베이스에 있으면
  "프라이빗"이라는 개념이 코드 구조로도 흐려진다.

그래서 **별도 Next.js 앱 + 별도 Vercel 프로젝트 + 서브도메인**으로 분리하되,
**Supabase 프로젝트는 그대로 공유**한다(신규 DB 불필요, 추가 비용 없음). 이미
만든 `guide_code` / `verify_guide_access` RPC를 그대로 재사용할 수 있어
백엔드 이관 비용이 거의 없다.

## 아키텍처 개요

```
stayaphae.com (마케팅 사이트, 기존 리포)
  └─ 컨시어지 섹션: 소개 카피만, 링크 없음
  └─ /admin/reservations: 확정 건마다 QR·링크 발급 (이미 구현됨)
         │
         │  https://concierge.stayaphae.com/?code=xxxxx
         ▼
concierge.stayaphae.com (신규 리포, 신규 Vercel 프로젝트)
  └─ 같은 Supabase 프로젝트에 연결 (anon key만 사용, service role 불필요)
  └─ guide_code 검증 → httpOnly 서명 쿠키 발급 → 이후 페이지 이동엔 코드 불필요
  └─ 정적 가이드 + 서비스 신청 + AI 챗
```

**도메인**: 새 도메인을 사지 않고 `stayaphae.com`의 서브도메인(`concierge.` 또는
`app.`)으로 발급한다 — Vercel 프로젝트에 서브도메인만 추가 연결하면 되고
DNS 레코드 1개(CNAME) 추가로 끝난다. 별도 도메인 비용 없음.

**인증 이관**: 지금 메인 사이트가 하는 일(코드 발급, QR 생성, 예약 검증 RPC)은
그대로 두고, `/admin/reservations`가 만드는 링크의 목적지만
`stayaphae.com/guide?code=` → `concierge.stayaphae.com/?code=`로 바꾸면 된다.
즉 **백엔드 인증 로직 재작성이 필요 없다** — RPC는 Supabase에 있고 어느
클라이언트에서 호출하든 동일하게 동작한다.

### 세션 방식 (신규 앱에서 개선할 점)

메인 사이트의 `/guide`는 페이지마다 `?code=`가 쿼리로 붙어 있어야 했다(간단하지만
링크 공유·새로고침 시 코드가 URL에 계속 노출됨). 신규 앱에서는:

1. 첫 진입 시 `?code=`를 검증(`verify_guide_access` RPC)
2. 성공하면 **서명된 httpOnly 쿠키**(코드 자체가 아니라 `{reservationId, exp}`를
   담은 JWT, `exp`는 체크아웃 자정으로 설정)를 발급
3. 이후 내비게이션은 쿠키만으로 인증 — URL에 코드가 계속 붙어있지 않아도 됨
4. 미들웨어(Next 16 `proxy.ts`)에서 쿠키 검증 후 없으면 코드 입력 화면으로

이러면 앱 내 이동이 자연스러워지고, 링크를 실수로 다른 사람에게 전달해도
쿠키가 없는 기기에서는 코드 없이 열리지 않는다.

## 정보 구조 (IA) — 화면 목록

기존 `CONCIERGE_FEATURES`(9개)와 `/guide`에 이미 만든 콘텐츠를 아래처럼 재배치한다.

| 화면 | 내용 | 데이터 출처 | 단계 |
|---|---|---|---|
| **홈 (오늘)** | 체크인/체크아웃 D-day, 오늘 날씨(추후), 오늘의 한마디 | 예약 정보(체크인/아웃) | 3a 이관 |
| **이용 안내** | 체크인·와이파이·바베큐·분리수거·안전 등 | 기존 `/guide` MANUAL_ITEMS 그대로 이관 | 3a 이관 |
| **오시는 길** | 주소, 지도앱 딥링크 | `map-links.ts` 그대로 이관 | 3a 이관 |
| **로컬 가이드** | 맛집, 추천 코스 | 기존 데이터 이관 | 3a 이관 |
| **서비스 신청** | 바베큐 예약 신청, T맵 목적지 전송 | 신규 폼 → `concierge_logs` insert | 3b-연장 (신규) |
| **시크릿 쿠폰** | 지역상생 쿠폰 안내 | 기존 데이터 이관 | 3a 이관 |
| **AI 컨시어지 챗** | 대화형 질의응답("노을 스팟 추천해줘" 등) | 가이드 콘텐츠 + 예약 정보 컨텍스트 + Claude API | 3c (신규) |
| **IoT 컨트롤** | 조명/냉난방 제어 | 장비 API 연동 필요 | 3d (후순위, 하드웨어 의존) |

## 데이터 모델 추가

`architecture-rules.md`에 이미 스키마 구상이 있는 `Concierge_Logs`를 실제로 만든다.

```sql
create table public.concierge_logs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  request_type text not null check (request_type in ('bbq', 'chat', 'tmap_send', 'coupon_view')),
  payload jsonb,           -- 요청 상세(바베큐 희망시간, 챗 질문 등)
  status text not null default 'pending' check (status in ('pending','done','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.concierge_logs enable row level security;

-- 게스트는 직접 테이블에 접근하지 않는다 — RPC로만 기록
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

-- 조회는 admin만 (메인 사이트 관리자 화면에서 신청 목록 확인용)
create policy "concierge_logs_admin_all"
  on public.concierge_logs for all
  using (public.is_admin())
  with check (public.is_admin());
```

바베큐 신청·T맵 전송 등은 이 RPC 하나로 처리되고, 메인 사이트
`/admin`에 "서비스 신청 목록" 탭을 하나 추가하면 운영자가 확인할 수 있다
(이건 메인 리포에 남는 유일한 연결점).

## AI 챗 컨시어지 (3c) 설계

- **모델**: Claude API (Anthropic SDK), 스트리밍 응답.
- **컨텍스트 주입**: 시스템 프롬프트에 (1) 이용 안내·맛집·코스 데이터 전체, (2)
  현재 게스트의 체크인/체크아웃 날짜·인원, (3) 오늘 날짜를 넣어 "지금 몇 시에
  바베큐 가능해요?" 같은 질문에 실제 컨텍스트로 답하게 한다.
- **툴 사용은 최소화**: 처음엔 순수 대화형(정보 안내)으로 시작 — "바베큐
  예약해줘"처럼 행동이 필요한 요청은 챗이 `create_concierge_log` RPC를 도구로
  호출하게 확장 가능(2단계).
- **로그**: 모든 대화는 `concierge_logs`(`request_type='chat'`)에 요약 저장 —
  향후 Phase 4 데이터 분석(어떤 질문이 많은지)에도 재사용.
- **비용 관리**: 대화당 최대 턴 수 제한, 시스템 프롬프트는 가이드 데이터가
  바뀔 때만 갱신(캐싱 가능 — Claude API 프롬프트 캐싱 활용).

## 공유 방식 — 코드 중복을 최소화하는 선

두 앱(마케팅 사이트/컨시어지 앱)은 완전히 분리하되, 공유는 최소 필요한 것만:

- **공유하지 않는다**: React 컴포넌트, npm 패키지 단위 디자인 시스템 — 앱 2개
  규모에 패키지 분리는 과설계. 각 앱에 독립적인 Tailwind 설정 + 브랜드 CSS
  변수(`--cream`, `--ink` 등)를 각자 복사해 둔다.
- **공유한다**: Supabase 프로젝트(DB), `guide_code`/RPC 계약(어떤 파라미터를
  주고받는지는 두 리포 모두 알아야 함 — 이 문서가 그 계약서 역할).
- 브랜드 컬러가 바뀌면 두 리포 모두 수동 반영 — 빈도가 낮으므로 자동화 불필요.

## 단계별 구축 순서

1. **Phase A — 리포·배포 뼈대**: 신규 GitHub 리포 생성, Next.js 스캐폴드,
   Vercel 프로젝트 연결(서브도메인), 같은 Supabase env로 연결. 지금 `/guide`에
   있는 정적 콘텐츠(이용안내·오시는길·맛집·코스)를 그대로 이식하고
   `verify_guide_access` 검증 로직도 이식. 이 시점부터 메인 사이트 `/guide`는
   폐기 대상.
2. **Phase B — 서비스 신청**: `concierge_logs` 테이블·RPC 추가, 바베큐 신청
   폼·T맵 전송 버튼 구현. 메인 사이트 `/admin`에 신청 목록 조회 탭 추가(이 한
   군데만 메인 리포를 건드림).
3. **Phase C — AI 챗**: Claude API 연동, 스트리밍 챗 UI, 컨텍스트 주입.
4. **Phase D — 컷오버**: `/admin/reservations`의 QR·링크 생성 URL을
   `concierge.stayaphae.com`으로 전환. 메인 사이트 `/guide` 라우트 제거(또는
   새 앱으로 308 리다이렉트만 남김).
5. **Phase E — IoT (후순위)**: 장비 선정 후 컨트롤 API 연동.

세션 개선(쿠키 발급)은 Phase A에서 정적 이식과 함께 적용하는 게 효율적이다.

## 확정된 결정 (2026-07-20)

- **신규 GitHub 리포 이름**: `stayaphae-concierge`
- **서브도메인**: `concierge.stayaphae.com`
- **Vercel 프로젝트 연결 시점**: Phase 0(메인 사이트 배포·도메인 연결)
  이후로 연기 — Phase A는 리포 스캐폴딩과 정적 콘텐츠 이식까지만 진행하고,
  Vercel 프로젝트 생성·서브도메인 DNS 연결은 메인 사이트가 실제 도메인에서
  안정화된 뒤 별도로 진행한다.
