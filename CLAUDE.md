# 스테이숨 (STAYSOOM)

자연 속 프라이빗 스테이 "스테이숨"의 공식 웹앱. Next.js 16 (App Router) + Tailwind CSS v4 + Supabase.

## Git 규칙

- **모든 새 작업은 최신 main에서 새 브랜치를 파서 시작한다**: `git checkout main && git pull && git checkout -b claude/<작업명>`.
- **이미 PR이 병합된 브랜치는 재사용하지 않는다.** 병합 즉시 끝난 것으로 취급하고, 후속 작업은 main에서 새로 시작한다.
- 작업 단위가 끝나면 PR로 main에 병합해 브랜치를 오래 살려두지 않는다.
- **로컬(VS Code)과 클라우드(코드웹) 세션이 같은 브랜치를 동시에 만지지 않는다.** 작업을 넘겨받을 때는 커밋+푸시(넘기는 쪽) → fetch+pull(받는 쪽) 순서를 지킨다.

## 구조 핵심

- `src/lib/brand.ts` — 브랜드명·슬로건·이메일 등 아이덴티티 설정. 브랜드명 변경 시 이 파일만 수정.
- `src/app/globals.css` — 디자인 토큰(크림/잉크/스톤/브론즈 팔레트), 리빌 애니메이션, 폼 스타일.
- `src/app/page.tsx` — 메인 랜딩. 상단의 `STAYS` / `EXPERIENCES` / `CONCIERGE_FEATURES` / `AMENITIES` 배열이 콘텐츠 데이터. `CONCIERGE_LINK`에 URL을 넣으면 AI 컨시어지 섹션의 "준비 중" 안내가 링크 버튼으로 바뀐다.
- `src/app/reservations/` — 공개 예약 폼(서버 액션) → Supabase `reservations` 테이블에 `pending` 상태로 저장 + 텔레그램/구글챗 알림(`src/lib/notifications/`). 폼 위 가용성 달력은 `get_blocked_date_ranges` RPC(확정 예약 + 외부 캘린더 차단일, 익명 호출 가능)로 마감일을 표시하고, 서버 액션도 접수 전에 같은 RPC로 겹침을 검사한다(날짜 로직은 `src/lib/availability.ts`).
- `src/app/admin/` — 관리자 영역. `/admin/login`(이메일/비밀번호)은 가드 밖, 나머지는 `(protected)` 라우트 그룹 안. 콘텐츠 관리(`/admin/content`), 예약 관리(`/admin/reservations`), 외부 캘린더 동기화(`/admin/calendar`).
- `src/middleware.ts` + `src/utils/supabase/` — 세션 갱신과 `/admin/*` 가드. `client.ts`(브라우저)/`server.ts`(서버 컴포넌트·액션)/`admin.ts`(service role, 크론 전용) 클라이언트를 반드시 용도에 맞게 구분해서 사용한다. `src/lib/` 아래에 Supabase 클라이언트를 새로 만들지 말 것.
- `src/lib/calendar-sync.ts` + `src/app/api/cron/sync-calendars/` — 외부 플랫폼(에어비앤비 등) iCal 동기화. `src/app/api/ical/export/`는 우리 확정 예약을 외부로 내보내는 iCal 피드.
- `supabase/migrations/` — DB 스키마. 중복예약 방지는 `reservations` 테이블의 EXCLUDE 제약(`confirmed` 상태끼리 날짜 겹침 차단)이 DB 레벨에서 강제한다.
- 환경 변수는 `.env.local` (gitignore됨) — 목록은 `.env.local.example` 참고.
- 아키텍처 원칙과 트러블슈팅 누적 기록은 `architecture-rules.md` 참고 (RLS 재귀 함정, Server Component 폴백 패턴 등).

## 주의사항

- 사진은 전부 Unsplash 플레이스홀더. 실사진 교체 시 `/public`에 넣고 `next.config.ts`의 `images.unoptimized: true`를 제거할 것 (로컬 개발망 SSL 프록시 때문에 외부 이미지 서버 측 최적화가 실패해서 켜둔 임시 설정).
- 디자인 톤: Apple/Tesla/Stayfolio 참조 — 절제된 여백, Noto Serif KR 제목, 풀스크린 섹션. 새 섹션 추가 시 이 톤을 유지할 것.
- 새 테이블 마이그레이션은 파일 작성과 별개로 사용자가 Supabase SQL Editor에서 직접 실행해야 적용된다. `PGRST205` 에러가 나면 마이그레이션 미적용 신호.
