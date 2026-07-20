# 스테이 압해 (STAY APHAE)

전남 신안 압해도의 하루 한 팀 프라이빗 독채 "스테이 압해"의 공식 웹앱. (구명 스테이숨 — 에어비앤비에서 선점된 이름이라 리브랜딩됨. 리포지토리명 등 인프라 식별자는 staysoom 유지.) Next.js 16 (App Router) + Tailwind CSS v4 + Supabase.

## Git 규칙

- **모든 새 작업은 최신 main에서 새 브랜치를 파서 시작한다**: `git checkout main && git pull && git checkout -b claude/<작업명>`.
- **이미 PR이 병합된 브랜치는 재사용하지 않는다.** 병합 즉시 끝난 것으로 취급하고, 후속 작업은 main에서 새로 시작한다.
- 작업 단위가 끝나면 PR로 main에 병합해 브랜치를 오래 살려두지 않는다.
- **로컬(VS Code)과 클라우드(코드웹) 세션이 같은 브랜치를 동시에 만지지 않는다.** 작업을 넘겨받을 때는 커밋+푸시(넘기는 쪽) → fetch+pull(받는 쪽) 순서를 지킨다.

## 구조 핵심

- `src/lib/brand.ts` — 브랜드명·슬로건·이메일 등 아이덴티티 설정. 브랜드명 변경 시 이 파일만 수정.
- `src/app/globals.css` — 디자인 토큰(크림/잉크/스톤/브론즈 팔레트), 리빌 애니메이션, 폼 스타일.
- **스테이 압해는 하루 한 팀만 받는 단일 독채다.** 객실/유닛 개념이 없으므로 예약·캘린더·문구 모두 단일 유닛 전제로 작성한다(`reservations`에 `room_id` 없음). 수용 인원은 `src/lib/brand.ts`의 `capacityLabel`/`maxGuests`로 관리.
- `src/app/page.tsx` — 메인 랜딩. 상단의 `SPACES`(독채를 이루는 공간 장면들) / `EXPERIENCES` / `CONCIERGE_FEATURES` / `AMENITIES` 배열이 기본 콘텐츠 데이터. `/admin/content`의 `content_blocks`가 있으면 히어로 배경(banner)·스테이 섹션 카드(room)·영상 밴드(youtube)·후기 섹션(testimonial)은 DB 콘텐츠가 우선 렌더링되고, 없거나 조회 실패 시 하드코딩 기본값으로 폴백한다. `CONCIERGE_LINK`에 URL을 넣으면 AI 컨시어지 섹션의 "준비 중" 안내가 링크 버튼으로 바뀐다.
- `src/app/guide/` — 게스트 가이드(압해 컨시어지 3a+3b). **예약 코드 인증 필수** — `?code=` 쿼리를 `verify_guide_access` RPC(확정 상태 + 체크인 전날~체크아웃 기간 검사)로 검증하고, 실패 시 콘텐츠 없이 안내만 표시. 코드 발급·QR/링크 공유는 `/admin/reservations`에서 확정 예약마다 자동 생성(`guide_code` 컬럼). noindex·sitemap 제외 병행. 랜딩 컨시어지 섹션은 소개만 노출(`CONCIERGE_LINK = null` 유지). 콘텐츠는 파일 상단 데이터 배열만 수정하면 됨.
- `src/app/privacy/` — 개인정보처리방침. 예약 폼의 필수 동의 체크박스가 이 페이지로 링크되고 서버 액션도 동의를 검증한다. `[확정 필요]` 표기(보호책임자 성명 등)는 오픈 전 실제 정보로 교체할 것.
- `src/app/reservations/` — 공개 예약 폼(서버 액션) → Supabase `reservations` 테이블에 `pending` 상태로 저장 + 텔레그램/구글챗 알림(`src/lib/notifications/`). 폼 위 가용성 달력은 `get_blocked_date_ranges` RPC(확정 예약 + 외부 캘린더 차단일, 익명 호출 가능)로 마감일을 표시하고, 서버 액션도 접수 전에 같은 RPC로 겹침을 검사한다(날짜 로직은 `src/lib/availability.ts`).
- `src/app/admin/` — 관리자 영역. `/admin/login`(이메일/비밀번호)은 가드 밖, 나머지는 `(protected)` 라우트 그룹 안. 콘텐츠 관리(`/admin/content`), 예약 관리(`/admin/reservations`), 외부 캘린더 동기화(`/admin/calendar`).
- `src/proxy.ts` (Next 16 프록시, 구 middleware 컨벤션) + `src/utils/supabase/` — 세션 갱신과 `/admin/*` 가드. `client.ts`(브라우저)/`server.ts`(서버 컴포넌트·액션)/`admin.ts`(service role, 크론 전용) 클라이언트를 반드시 용도에 맞게 구분해서 사용한다. `src/lib/` 아래에 Supabase 클라이언트를 새로 만들지 말 것.
- `src/lib/calendar-sync.ts` + `src/app/api/cron/sync-calendars/` — 외부 플랫폼(에어비앤비 등) iCal 동기화. `src/app/api/ical/export/`는 우리 확정 예약을 외부로 내보내는 iCal 피드.
- `supabase/migrations/` — DB 스키마. 중복예약 방지는 `reservations` 테이블의 EXCLUDE 제약(`confirmed` 상태끼리 날짜 겹침 차단)이 DB 레벨에서 강제한다.
- 환경 변수는 `.env.local` (gitignore됨) — 목록은 `.env.local.example` 참고.
- 아키텍처 원칙과 트러블슈팅 누적 기록은 `architecture-rules.md` 참고 (RLS 재귀 함정, Server Component 폴백 패턴 등).
- 향후 구축 로드맵(오픈 전 체크리스트, 4순위 이후 고도화 단계)은 `roadmap.md` 참고.
- 압해 컨시어지를 별도 웹앱(신규 리포·서브도메인)으로 분리하는 설계는 `concierge-app-design.md` 참고 (3c AI 챗·3d IoT 대상, 메인 사이트의 `guide_code`/`verify_guide_access` RPC를 그대로 재사용하는 것이 핵심).

## 배포 인프라 (확정 방향, 2026-07)

- **호스팅: Vercel** — GitHub 리포 연결로 push 자동 배포. 순서: ① Vercel 배포(`*.vercel.app`으로 전체 기능 검증) → ② 도메인 구매(`stayaphae.com` 권장) → ③ Vercel 도메인 연결(SSL 자동) → ④ Google Workspace(운영자 수신용 이메일, MX 레코드) → ⑤ Resend(예약 자동 발송용, 4순위 전제).
- 상업 사이트이므로 Vercel **Pro 플랜**($20/월)이 약관상 정석. Hobby로 시작할 경우 `vercel.json`의 크론(현재 매시 정각)을 하루 1회로 낮춰야 한다(Hobby 크론 제한).
- Vercel 환경 변수: `.env.local.example`의 전체 목록을 프로젝트 설정에 직접 등록해야 한다(파일은 자동 반영 안 됨). `CRON_SECRET`은 같은 이름으로 등록하면 Vercel Cron이 `Authorization: Bearer` 헤더를 자동으로 붙인다.
- **도메인 연결 시 함께 갱신할 것**: `NEXT_PUBLIC_SITE_URL`, Supabase Auth의 Site URL/Redirect URLs(관리자 로그인), 에어비앤비 등에 등록한 iCal export 피드 URL.
- **이메일은 용도별로 분리**: 사람이 주고받는 운영 메일 = Google Workspace / 코드가 API로 보내는 자동 메일(예약 확인 등) = Resend. DNS의 SPF TXT 레코드는 하나로 병합해야 한다(`v=spf1 include:_spf.google.com include:<resend 지정값> ~all` 형태 — 도메인당 SPF 레코드는 1개만 유효).

## 주의사항

- 사진은 전부 Unsplash 플레이스홀더. 실사진 교체 시 `/public`에 넣고 `next.config.ts`의 `images.unoptimized: true`를 제거할 것 (로컬 개발망 SSL 프록시 때문에 외부 이미지 서버 측 최적화가 실패해서 켜둔 임시 설정).
- 디자인 톤: Apple/Tesla/Stayfolio 참조 — 절제된 여백, Noto Serif KR 제목, 풀스크린 섹션. 새 섹션 추가 시 이 톤을 유지할 것.
- 새 테이블 마이그레이션은 파일 작성과 별개로 사용자가 Supabase SQL Editor에서 직접 실행해야 적용된다. `PGRST205` 에러가 나면 마이그레이션 미적용 신호.
