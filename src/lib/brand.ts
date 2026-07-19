/**
 * 브랜드 아이덴티티 설정 — 브랜드명 변경 시 이 파일만 수정하면
 * 헤더·푸터·메타데이터·본문 문구에 모두 반영됩니다.
 *
 * 이 파일 밖에서 바꾸는 것들:
 * - 컬러: src/app/globals.css 상단의 CSS 변수 (--cream, --ink, --sand 등)
 * - 서체(무드): src/app/layout.tsx 의 폰트 설정
 * - 사진·공간 소개 문구: src/app/page.tsx 상단의 SPACES / EXPERIENCES / AMENITIES 배열
 */
export const BRAND = {
  /** 한글 브랜드명 */
  name: "스테이 압해",
  /** 로마자 표기 (로고 옆, 푸터 등) */
  nameEn: "Stay Aphae",
  /** 대문자 로마자 (© 표기 등) */
  nameEnUpper: "STAY APHAE",
  /** 한 줄 슬로건 */
  tagline: "머무는 것만으로 쉼이 되는 곳",
  /** 푸터 영문 슬로건 */
  taglineEn: "Breathe in, stay still.",
  /** 장소를 담은 한 줄 — 압해(押海), "바다를 안은 섬" */
  placeLine: "바다를 안은 섬, 압해",
  /** 대표 이메일 (실제 사용 주소로 수정하세요) */
  email: "stay@stayaphae.com",
  /** 인스타그램 URL */
  instagram: "https://instagram.com",
  /** 입실/퇴실 안내 */
  checkInOut: "입실 15:00 · 퇴실 11:00",
  /** 수용 인원 안내 문구 — 실제 인원 기준으로 수정하세요 */
  capacityLabel: "기준 2인 · 최대 4인",
  /** 최대 인원 (예약 폼 입력 제한과 서버 검증에 사용) */
  maxGuests: 4,
} as const;
