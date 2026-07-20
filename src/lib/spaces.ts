/**
 * 스테이 압해를 이루는 4개 공간 카테고리 — 거실 / 침실 / 특별한 공간(카페·다도·요가) / 마당.
 * 랜딩(`/`)의 "Stays" 카드와 상세 페이지(`/space/[slug]`)가 이 배열을 함께 사용한다.
 * 사진은 전부 Unsplash 플레이스홀더 — 리모델링 후 실제 감성샷으로 교체할 것(교체는 이 배열만 수정하면 됨).
 */
export interface SpaceGalleryImage {
  src: string;
  alt: string;
}

export interface SpaceDefinition {
  slug: string;
  /** 홈 카드 상단 라벨(영문 소문자 트래킹) */
  nameEn: string;
  /** 공간 이름 */
  name: string;
  /** 홈 카드에 노출되는 짧은 한 줄 소개 */
  tagline: string;
  /** 상세 페이지 본문 */
  body: string;
  heroImage: string;
  heroAlt: string;
  gallery: SpaceGalleryImage[];
}

export const SPACES: SpaceDefinition[] = [
  {
    slug: "living",
    nameEn: "THE LIVING",
    name: "노을의 거실",
    tagline: "압해의 노을이 창 안까지 걸어 들어오는 거실. 낮은 조도와 목재의 결 사이로 커피를 내리는 자리.",
    body: "해가 기울면 압해의 노을은 창을 통해 거실 안까지 걸어 들어옵니다.\n낮은 조도의 조명과 따뜻한 목재의 결, 마당을 향해 열린 창 —\n이곳은 하루를 나누는 이들이 가장 오래 머무는 자리입니다.\n핸드드립 커피 한 잔이면 충분합니다.",
    heroImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2400&auto=format&fit=crop",
    heroAlt: "낮은 조도와 목재의 결이 감도는 거실",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1800&auto=format&fit=crop",
        alt: "라탄 조명 아래 자연광이 스며드는 거실",
      },
      {
        src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1800&auto=format&fit=crop",
        alt: "커튼 사이로 부드러운 빛이 드는 소파",
      },
      {
        src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1800&auto=format&fit=crop",
        alt: "거실과 이어진 주방의 다이닝 자리",
      },
    ],
  },
  {
    slug: "bedroom",
    nameEn: "THE BEDROOM",
    name: "숨의 방",
    tagline: "동틀 녘 바다빛이 통창 가득 밀려드는 침실. 압해의 하루를 가장 느리게 여는 곳.",
    body: "섬의 아침은 소리보다 빛으로 먼저 옵니다.\n통창 가득 밀려드는 바다빛에 눈을 뜨고,\n파도 소리를 알람 삼아 하루를 시작하세요.\n고밀도 린넨 침구와 낮은 조도의 조명이\n압해의 밤과 아침을 가장 편안한 온도로 채웁니다.",
    heroImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2400&auto=format&fit=crop",
    heroAlt: "창가에 자연광이 가득 드는 침실",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1800&auto=format&fit=crop",
        alt: "침대맡 조명이 은은하게 켜진 밤의 침실",
      },
      {
        src: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1800&auto=format&fit=crop",
        alt: "부드러운 린넨이 덮인 침대",
      },
      {
        src: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=1800&auto=format&fit=crop",
        alt: "따뜻한 조명이 감도는 침실 전경",
      },
    ],
  },
  {
    slug: "retreat",
    nameEn: "THE RETREAT",
    name: "고요의 방",
    tagline: "차를 우리고, 몸을 풀고, 커피 한 잔에 머무는 방. 압해의 고요를 가장 가까이서 느끼는 자리.",
    body: "다도의 시간,\n조용한 요가 한 세션, 혹은 그저 창가에 앉아 커피 한 잔을 마시는 시간 —\n이 방은 정해진 쓰임이 없습니다.\n압해의 바람과 빛이 그대로 스며드는 자리에서,\n머무는 이가 그날의 속도를 스스로 정합니다.",
    heroImage:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2400&auto=format&fit=crop",
    heroAlt: "통유리창으로 초록빛이 스며드는 다목적 공간",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1800&auto=format&fit=crop",
        alt: "나무 테이블 위에 우려낸 차 한 잔",
      },
      {
        src: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1800&auto=format&fit=crop",
        alt: "식물과 머그가 놓인 조용한 창가 자리",
      },
      {
        src: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1800&auto=format&fit=crop",
        alt: "따뜻한 차 한 잔과 다과",
      },
    ],
  },
  {
    slug: "garden",
    nameEn: "THE GARDEN",
    name: "달빛 마당",
    tagline: "향나무가 줄지어 선 프라이빗 마당. 달이 오르면 파이어핏에 불을 올리고 하루를 정리하는 곳.",
    body: "향나무가 줄지어 선 마당은 낮에는 햇볕을,\n밤에는 달빛을 그대로 받아들입니다.\n파이어핏에 불을 올리고\n압해의 밤하늘 아래 하루를 조용히 정리하세요.\n다른 투숙객과 마주칠 일 없는,\n온전히 한 팀만을 위한 바깥입니다.",
    heroImage:
      "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=2400&auto=format&fit=crop",
    heroAlt: "노을빛이 나무 사이로 번지는 저녁 마당",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1800&auto=format&fit=crop",
        alt: "향나무가 줄지어 선 프라이빗 마당",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1800&auto=format&fit=crop",
        alt: "빛이 스며드는 마당의 숲",
      },
      {
        src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1800&auto=format&fit=crop",
        alt: "마당을 가꾸는 작은 정원 도구들",
      },
    ],
  },
];

export function getSpaceBySlug(slug: string): SpaceDefinition | undefined {
  return SPACES.find((s) => s.slug === slug);
}
