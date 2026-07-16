# 스테이숨 (STAYSOOM)

자연 속 프라이빗 스테이 "스테이숨"의 공식 웹앱. Next.js 16 (App Router) + Tailwind CSS v4 + Supabase.

## Git 규칙

- **항상 `claude/staysoom-feature-1` 브랜치에서 작업한다.** main에 직접 커밋하지 않는다.

## 구조 핵심

- `src/lib/brand.ts` — 브랜드명·슬로건·이메일 등 아이덴티티 설정. 브랜드명 변경 시 이 파일만 수정.
- `src/app/globals.css` — 디자인 토큰(크림/잉크/스톤/브론즈 팔레트), 리빌 애니메이션, 폼 스타일.
- `src/app/page.tsx` — 메인 랜딩. 상단의 `STAYS` / `EXPERIENCES` / `CONCIERGE_FEATURES` / `AMENITIES` 배열이 콘텐츠 데이터. `CONCIERGE_LINK`에 URL을 넣으면 AI 컨시어지 섹션의 "준비 중" 안내가 링크 버튼으로 바뀐다.
- `src/app/reservations/` — 예약 폼(서버 액션) → Supabase `reservations` 테이블 저장 + 텔레그램/구글챗 알림(`src/lib/notifications/`).
- 환경 변수는 `.env.local` (gitignore됨): Supabase URL/service role key, 알림 채널 토큰.

## 주의사항

- 사진은 전부 Unsplash 플레이스홀더. 실사진 교체 시 `/public`에 넣고 `next.config.ts`의 `images.unoptimized: true`를 제거할 것 (로컬 개발망 SSL 프록시 때문에 외부 이미지 서버 측 최적화가 실패해서 켜둔 임시 설정).
- 디자인 톤: Apple/Tesla/Stayfolio 참조 — 절제된 여백, Noto Serif KR 제목, 풀스크린 섹션. 새 섹션 추가 시 이 톤을 유지할 것.
