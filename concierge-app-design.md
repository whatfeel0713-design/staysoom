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

## 진행 상황 (2026-07-20)

`stayaphae-concierge` 리포에 Phase A(리포 뼈대 + 정적 콘텐츠 이식)와
Phase C(AI 챗)를 구현·푸시 완료. 원래 순서(B→C)를 바꿔 C를 먼저 한 이유는
AI 컨시어지가 이 앱의 존재 이유를 가장 직접적으로 보여주는 기능이기
때문 — 자세한 내용은 해당 리포의 `README.md` 참고.

- **Phase A**: 정적 콘텐츠(이용안내·오시는길·맛집·코스) 이식,
  `verify_guide_access` 재사용 + httpOnly 서명 쿠키 세션, `proxy.ts` 게이트.
- **Phase C**: `/chat` — Claude API(`claude-opus-4-8`, 스트리밍) 기반 대화형
  컨시어지. "이 집을 잘 아는 사람" 1인칭 페르소나, 이용 안내 전체를
  컨텍스트로 주입, KST 시간대(노을/저녁 등)를 인지해 추천 질문·답변 톤을
  조절. 게스트 세션 쿠키로 보호되어 예약 확정 손님만 호출 가능(비용 방어).
  대화 로그는 아직 미저장(Phase B의 `concierge_logs` 대기).
- **Phase A/C 확장 — 프라이빗 투어**: 딥리서치(천사대교가 실제로 연결하는
  섬 구성 — 압해·암태·팔금·안좌·자은도, 퍼플교로 이어지는 반월·박지도)를
  반영해 `src/lib/private-tours.ts` 추가. 반나절~3박 4일 프라이빗 투어
  코스 4종을 홈 화면(#tours)과 AI 컨시어지 컨텍스트에 모두 반영. 렌터카·
  기사·보트는 아직 자동 예약이 없어 "컨시어지 문의로 조율"하는 여정
  제안으로 프레이밍. 전기차 충전 안내도 완속(현장 콘센트)/급속(환경부
  EV.or.kr 앱 안내)으로 구체화.
- **고도화 A그룹 + 신안 특산품·축제**: 백로그의 A그룹(저비용 고효과) 5개를
  전부 구현 — 무드 온보딩, 사진으로 물어보기(Claude Vision), T맵 원클릭
  전송, 조용한 시간 넛지, 갯벌 유네스코 서사. 동시에 딥리서치를 반영해
  호스트 직판 천일염·무화과(`local-products.ts`)와 신안·목포 축제 정보를
  추가했는데, 축제는 해마다 날짜가 바뀌므로 하드코딩 대신 Claude의
  `web_search` 서버 도구를 챗에 연결해 실시간으로 정확한 날짜를 찾아
  답하도록 했다(턴당 최대 3회 검색으로 비용 제한). 자세한 내용은
  `stayaphae-concierge`의 `README.md` 참고.
- **고도화 B그룹 1 — 실시간 날씨·물때**: `get_weather_forecast`/`get_tide_info`
  커스텀 도구를 챗에 연결. 기상청 단기예보(신뢰도 높음)와 국립해양조사원
  조위 API(⚠️ 이번 세션 웹 검색 장애로 스펙 미재확인 — 서비스키 발급 후
  실제 응답 검증 필요)를 붙여, "노을 드는 시간" 수준의 뭉뚱그린 답변에서
  진짜 정확한 답변으로. 스트리밍 중 도구 호출을 처리하는 루프(최대 6회)를
  `/api/chat`에 구현.
- **고도화 B그룹 2·3 — 개인화된 첫 인사·시크릿 쿠폰 실물화**: 메인 리포에
  `get_guide_session_info` RPC 추가(마이그레이션
  `20260721090000_guide_session_info.sql` — ⚠️ Supabase SQL Editor에서
  직접 실행 필요, `reservations.special_occasion` 컬럼 신규 + `/admin/
  reservations`에 입력 폼 추가). 컨시어지 앱이 이름·기념일을 세션 쿠키에
  담아 홈 인사·챗 톤에 반영하고, 체크아웃 날짜로 세션 TTL도 정교화했다.
  RPC 미적용 환경에서도 기존 방식으로 우아하게 폴백. 시크릿 쿠폰은
  `reveal_secret_coupon` 도구로 QR을 챗 화면에 띄우되, `concierge_logs`가
  아직 없어 발급 이력은 남기지 않는다(예약 코드+날짜 기반 결정론적 코드).
  이걸로 고도화 백로그 A·B그룹 전부 구현 완료.
- **Phase 1 확장 준비 — 기기 사용법**: 사용자가 나중에 핸드드립·에어컨·
  커피머신·와이파이·다도·블루투스 스피커·씨네빔 큐브 빔프로젝터·넷플릭스
  연결 등 실제 사용법을 정리해 알려주면 바로 반영할 수 있도록
  `stayaphae-concierge`에 `src/lib/device-manuals.ts` 구조를 미리 준비.
  현재는 전부 `ready: false`(플레이스홀더) — 챗은 지어내지 않고 "정리
  중"이라고 솔직히 답한다. 사용자가 내용을 주면 해당 항목만 채우면 됨.
- **고도화 C그룹 — 여행 사진 캡션·퇴실 후 편지**: 여행 사진 캡션은 기존
  비전 인프라 위에 프롬프트만 추가한 저비용 기능. 퇴실 후 감성 여정
  편지는 게스트 이메일이 메인 리포에만 있어 **메인 리포**에 구현—
  `src/lib/notifications/checkout-letter.ts`(Resend REST API) +
  `/admin/reservations`의 "퇴실 편지 보내기" 버튼(확정+체크아웃 완료+
  이메일 있는 예약에만 노출). RESEND_API_KEY 없으면 다른 알림 채널과
  동일하게 조용히 로그만 남기고 건너뛴다. ⚠️ 백로그 원안(대화 기록 기반
  개인화)은 `concierge_logs`가 없어 아직 못 하고, 지금은 예약 정보(이름·
  날짜·기념일)만으로 정적 편지를 보낸다 — 챗 로그 저장이 생긴 뒤 고도화
  대상. 이걸로 고도화 백로그 A~C그룹 전부 구현 완료.
- **Phase B — 서비스 신청 (concierge_logs)**: 마이그레이션
  `20260722090000_concierge_logs.sql`(⚠️ Supabase SQL Editor에서 직접
  실행 필요)로 `concierge_logs` 테이블 + `create_concierge_log` RPC 추가.
  `/admin/concierge`에서 신청 목록 조회·상태 변경 가능(admin-nav에 탭
  추가). 바베큐 신청은 별도 폼 대신 챗의 `request_bbq_service` 도구로
  구현 — 손님이 확정 의사를 밝히면 희망 시간과 함께 로그를 남기고
  "호스트가 확인 후 준비한다"고만 안내(컨시어지가 직접 확정하는 척하지
  않음). 시크릿 쿠폰 열람도 `coupon_view`로 함께 기록. `request_type='chat'`
  대화 로깅·`tmap_send` 클릭 로깅은 아직 안 함(필요성 확인되면 추가).
- **아직 안 함**: Vercel 프로젝트/서브도메인 연결(위 결정대로 Phase 0
  이후), Phase D 컷오버, Phase E(IoT), 고도화 백로그의 D그룹(오프라인
  대비 등), 챗 대화 로깅.

## 고도화 아이디어 백로그 (2026-07-20)

지금까지 만든 것(정적 이식 → AI 챗 → 프라이빗 투어)에 이어, "스테이 압해만의"
색깔을 더 진하게 만들 수 있는 아이디어. 전부 당장 하자는 게 아니라
우선순위를 붙여 남겨두는 백로그다 — 실행은 사용자 확인 후 하나씩.

### A. 지금 바로 해볼 만한 것 (데이터 연동 없이 가능)

- **무드 온보딩**: `/chat` 첫 진입 시 "오늘은 완전히 아무것도 안 하기 / 섬을
  돌아보기 / 둘만의 저녁" 같은 3택 칩을 한 번 보여주고, 선택을 세션(로컬
  스토리지)에 저장해 이후 모든 제안의 결을 거기 맞춘다. RPC 변경 없이 챗
  UI만으로 가능 — 가장 저비용 고효과.
- **사진으로 물어보기**: Claude는 비전을 지원하므로, 게스트가 커피머신·
  보일러 조작판 등을 촬영해 챗에 올리면 "이렇게 쓰시면 됩니다" 답변.
  이용안내 텍스트보다 훨씬 실용적 — `/api/chat`에 이미지 입력만 추가하면
  됨(신규 인프라 불필요).
- **T맵 원클릭 전송**: 챗이 코스를 언급할 때, 답변 아래 "T맵으로 길안내"
  버튼을 붙여 `tmap://` 딥링크를 바로 열게 한다. `map-links.ts`에 이미
  있는 링크를 챗 UI에 노출만 하면 되는 손쉬운 확장.
- **조용한 시간 넛지**: 밤 10시가 넘으면 컨시어지가 먼저 "이웃 마을을 위해
  마당 소음을 낮춰주세요" 같은 안내를 배너로 슬쩍 띄운다(`daypart.ts`가
  이미 밤을 인지하고 있음 — UI 트리거만 추가).
- **갯벌·습지 스토리텔링**: 신안 갯벌은 유네스코 세계자연유산(2021년
  등재)이다. 이 사실 하나만 가이드 콘텐츠에 넣어도 "그냥 산책로"가 아니라
  "세계가 지키는 갯벌"이 된다 — 컨시어지가 물때 산책을 권할 때 이 서사를
  자연스럽게 곁들이게 시스템 프롬프트에 추가.

### B. 데이터 연동이 필요한 것 (Phase B~C 확장급)

- **실시간 물때·날씨 연동**: 국립해양조사원 물때 정보나 기상청 단기예보
  API를 Claude의 도구(tool use)로 연결하면 "오늘 갯벌 언제가 좋아요?"에
  진짜 정확하게 답할 수 있다 — 지금은 이 정보가 없다고 솔직히 말하는
  수준인데, 이 앱의 가장 야심찬 다음 스텝.
  갯벌 시간 하나만 정확해도 체감 특별함이 크다.
  일몰 시각도 같은 방식(공공 API)으로 정교화 가능 — 지금은 "노을이 드는
  시간"이라고만 뭉뚱그려 답하는 한계를 해소.
- **개인화된 첫 인사**: `verify_guide_access` RPC가 예약자 이름·인원·
  기념일 메모까지 반환하도록 확장하면(Phase B 스키마 변경과 묶어서),
  "OOO님, 어서오세요" 같은 첫 인사와 기념일 서프라이즈 제안(로컬 케이크·
  꽃집 연계)이 가능해진다. 세션 TTL도 이 참에 체크아웃 자정 기준으로
  정교화(README에 이미 적어둔 한계).
- **시크릿 쿠폰의 실물화**: 지금은 텍스트 안내뿐인 쿠폰을, 컨시어지가
  "지금 이 쿠폰 보여드릴까요?"라고 물으면 QR/코드를 생성해 보여주는
  기능으로 확장 — `concierge_logs`(Phase B)에 `coupon_view` 타입이 이미
  설계돼 있으니 자연스러운 확장점.

### C. 퇴실 이후까지 이어지는 경험 (재방문·바이럴)

- **체크아웃 후 감성 여정 편지**: 퇴실 시 컨시어지가 이번 스테이 동안 물은
  질문·언급한 장소를 바탕으로 짧은 회고 이메일을 자동 작성해 보낸다
  ("첫날 저녁 노을을 물으셨죠, 둘째 날엔 퍼플섬에 다녀오셨고요...").
  Resend 연동(로드맵 4순위)이 되면 바로 얹을 수 있는 기능 — 향수 마케팅
  + 재방문 유도.
- **여행 사진 감성 캡션**: 게스트가 스테이 중 찍은 사진 몇 장을 컨시어지에
  올리면 짧은 캡션(SNS 공유용 한 줄)을 써준다 — 비전 API 하나로 가능한
  저비용 고임팩트 기능.

### D. 신뢰·프라이버시를 브랜드로

- **"완전한 프라이버시" 서사 강화**: 하루 한 팀 독채라는 컨셉을 컨시어지의
  태도로도 증명 — 예를 들어 응급 상황 질문엔 유난히 침착하고 구체적으로
  답하도록(소화기 위치, 연락처 우선순위) 프롬프트에 별도 섹션을 둔다.
- **오프라인 대비**: 섬 지역 특성상 통신이 약한 곳이 있을 수 있다. 이용
  안내 핵심 내용만이라도 PWA 캐시로 오프라인에서 열리게 하면(서비스
  워커), "인터넷 안 터지는 순간"에도 안내가 끊기지 않는다.

### 우선순위 제안

1. A 그룹(무드 온보딩, T맵 버튼, 조용한 시간 넛지, 갯벌 스토리텔링) — 하루
   이틀이면 되는 저비용 고효과. 다음에 진행한다면 이 그룹부터 권장.
2. B의 물때·날씨 실시간 연동 — 가장 야심차지만 이 앱을 "진짜 컨시어지"로
   만드는 핵심 한 방. Phase B(concierge_logs) 작업과 시점을 맞추면 효율적.
3. C·D는 Resend 연동(로드맵 4순위) 이후, 여유 있을 때 얹는 것을 권장.
