import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { MAP_LINKS } from "@/lib/map-links";
import { SPACES } from "@/lib/spaces";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/utils/supabase/server";

/**
 * 콘텐츠 데이터 — 실제 스테이 정보/사진이 준비되면 이 배열만 교체하면 됩니다.
 * 이미지는 Unsplash 플레이스홀더입니다.
 *
 * 스테이 압해는 하루 한 팀만 받는 단일 독채 — SPACES(src/lib/spaces.ts)는
 * "객실 목록"이 아니라 그 한 채를 이루는 공간들의 장면이며, 각 카드는
 * /space/[slug] 상세 갤러리로 연결된다.
 */

const EXPERIENCES = [
  {
    label: "01 — Stillness",
    title: "아무것도 하지 않을 자유",
    body: `${BRAND.name}의 하루는 비워내는 것에서 시작합니다.\n텔레비전 대신 바람에 흔들리는 향나무를,\n알람 대신 새소리를 두었습니다.\n머무는 동안만큼은 시간이 당신을 재촉하지 않습니다.`,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1800&auto=format&fit=crop",
    alt: "빛이 스며드는 숲",
  },
  {
    label: "02 — Morning",
    title: "섬의 아침으로 깨어나는 일",
    body: `침대에 누운 채로 섬의 아침이 서서히 환해지는 것을 바라보세요.\n준비된 원두를 내리고,\n창을 열어 새벽 공기를 방 안으로 들이는 것.\n그것이 ${BRAND.name}의 모닝 리추얼입니다.`,
    image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1800&auto=format&fit=crop",
    alt: "창밖 풍경이 보이는 침실",
  },
];

/**
 * 압해 컨시어지(AI 스테이 프로그램) 기능 목록.
 * 홈페이지에는 소개만 노출한다 — 실제 가이드(/guide)와 향후 컨시어지 웹앱은
 * 예약 확정 고객에게만 QR/링크로 공유하는 프라이빗 서비스.
 * CONCIERGE_LINK는 공개 링크가 필요해질 때만 URL을 넣을 것 (null = 소개만).
 */
const CONCIERGE_LINK: string | null = null;

const CONCIERGE_FEATURES = [
  { icon: "flame", title: "바베큐 예약", body: "원하는 시간에 맞춰 준비되는 프라이빗 바베큐." },
  { icon: "navigation", title: "T맵 길안내 연동", body: "터치 한 번으로 내비게이션까지 목적지 전송." },
  { icon: "compass", title: "프라이빗 투어", body: "머무는 동안만 열리는 소규모 로컬 투어." },
  { icon: "ticket", title: "지역상생 시크릿 쿠폰", body: "이웃 가게들과 함께 만든 투숙객 전용 혜택." },
  { icon: "bowl", title: "주인장 로컬 맛집", body: "관광지 말고, 주인장이 진짜 다니는 곳들." },
  { icon: "route", title: "일정별 추천 코스", body: "1박, 2박 — 머무는 길이에 맞춘 여행 동선." },
  { icon: "book", title: "이용 매뉴얼", body: "체크인부터 퇴실까지, 필요한 안내를 한곳에." },
  { icon: "bolt", title: "전기차 충전", body: "충전 인프라 위치와 이용 방법 안내." },
  { icon: "chip", title: "IoT 컨트롤", body: "조명·냉난방을 손안에서 조용하게." },
] as const;

/** 컨시어지 카드용 미니멀 라인 아이콘 */
function ConciergeIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    flame: (
      <path d="M12 3c1.5 3-2.5 4.5-2.5 8a4.5 4.5 0 0 0 9 0c0-1.5-.5-2.5-1-3.5-.5 1-1 1.5-2 2 .5-2.5-1-5-3.5-6.5Z" />
    ),
    navigation: <path d="M12 3 20 21l-8-5-8 5 8-18Z" />,
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </>
    ),
    ticket: (
      <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 2v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-2V8Zm10-2v12" />
    ),
    bowl: <path d="M4 11h16a8 8 0 0 1-16 0Zm4-2c0-2 1-2.5 1-4m4 4c0-2 1-2.5 1-4" />,
    route: (
      <path d="M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" />
    ),
    book: <path d="M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5V4Zm14 0h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6V4Z" />,
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    chip: (
      <>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M10 7V4m4 3V4m-4 16v-3m4 3v-3M7 10H4m3 4H4m16-4h-3m3 4h-3" />
      </>
    ),
  };

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const AMENITIES = [
  { title: "하루 한 팀", body: "독채 전체를 단 한 팀이 온전히 사용합니다." },
  { title: "웰컴 티 세트", body: "계절의 차와 다과를 준비해 두었습니다." },
  { title: "스페셜티 커피", body: "핸드드립 도구와 갓 볶은 원두가 머무는 동안 제공됩니다." },
  { title: "아웃도어 배스", body: "마당의 향나무를 바라보며 몸을 데우는 노천 스타일 욕조." },
  { title: "린넨 & 어메니티", body: "고밀도 린넨 침구와 저자극 내추럴 어메니티." },
  { title: "불멍 파이어핏", body: "밤에는 마당의 파이어핏에서 하루를 정리하세요." },
];

/** /admin/content 에서 관리하는 랜딩 동적 콘텐츠 */
interface ContentBlock {
  id: string;
  type: "banner" | "room" | "youtube" | "testimonial";
  title: string;
  media_url: string | null;
  body: string | null;
  sort_order: number;
}

/**
 * 활성 콘텐츠 블록 조회 — 실패(env 미설정, 마이그레이션 미적용 등) 시 빈 배열로
 * 폴백해 아래 하드코딩된 기본 콘텐츠가 대신 렌더링된다.
 */
async function getContentBlocks(): Promise<ContentBlock[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("id, type, title, media_url, body, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[home] content_blocks fetch failed:", error.message);
      return [];
    }
    return (data as ContentBlock[]) ?? [];
  } catch {
    return [];
  }
}

/** 구글 검색 리치 결과용 구조화 데이터 (schema.org LodgingBusiness) */
function buildLodgingJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BRAND.name,
    alternateName: BRAND.nameEnUpper,
    description: `${BRAND.placeLine} — 하루 한 팀만 머무는 프라이빗 독채 스테이.`,
    url: getSiteUrl(),
    email: BRAND.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "수련의금길 27",
      addressLocality: "신안군 압해읍",
      addressRegion: "전남광주통합특별시",
      addressCountry: "KR",
    },
    checkinTime: "15:00",
    checkoutTime: "11:00",
    numberOfRooms: 1,
  };
}

export default async function Home() {
  const blocks = await getContentBlocks();
  const lodgingJsonLd = buildLodgingJsonLd();

  const heroBanner = blocks.find((b) => b.type === "banner" && b.media_url);
  const roomBlocks = blocks.filter((b) => b.type === "room");
  const youtubeBlock = blocks.find((b) => b.type === "youtube" && b.media_url);
  const testimonials = blocks.filter((b) => b.type === "testimonial");

  // 관리자가 등록한 공간 장면이 있으면 그것을, 없으면 기본 SPACES를 렌더링.
  // 이미지가 없는 블록은 기본 플레이스홀더 이미지를 돌려쓴다.
  // 관리자 콘텐츠는 상세 갤러리가 없으므로 slug 없이 카드만 렌더링된다.
  const sceneCards: {
    slug: string | null;
    name: string;
    nameEn: string;
    description: string;
    image: string;
  }[] = roomBlocks.length
    ? roomBlocks.map((b, i) => ({
        slug: null,
        name: b.title,
        nameEn: `SCENE ${String(i + 1).padStart(2, "0")}`,
        description: b.body ?? "",
        image: b.media_url ?? SPACES[i % SPACES.length].heroImage,
      }))
    : SPACES.map((s) => ({
        slug: s.slug,
        name: s.name,
        nameEn: s.nameEn,
        description: s.tagline,
        image: s.heroImage,
      }));

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingJsonLd) }}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
        <Image
          src={
            heroBanner?.media_url ??
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2600&auto=format&fit=crop"
          }
          alt={heroBanner?.title ?? "안개 낀 호수와 숲 속의 스테이"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55" />

        <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
          <p className="hero-rise hero-rise-1 text-[0.7rem] font-medium uppercase tracking-[0.5em] text-white/80">
            Private Stay · {BRAND.nameEn}
          </p>
          <h1 className="hero-rise hero-rise-2 mt-6 font-serif text-4xl font-light leading-[1.25] tracking-tight sm:text-5xl md:text-6xl">
            머무는 것만으로
            <br />
            쉼이 되는 곳
          </h1>
          <p className="hero-rise hero-rise-3 mt-7 max-w-md text-base font-light leading-8 text-white/85 md:text-lg">
            {BRAND.placeLine} — 숨을 고르듯 하루를 고르는 시간.
            <br className="hidden sm:block" />
            섬의 속도로 쉬어가도록 설계된 {BRAND.name}입니다.
          </p>
          <div className="hero-rise hero-rise-3 mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservations"
              className="rounded-full bg-white px-9 py-3.5 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:bg-cream hover:shadow-xl hover:shadow-black/20"
            >
              예약하기
            </Link>
            <Link
              href="/#stays"
              className="rounded-full border border-white/50 px-9 py-3.5 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              스테이 둘러보기
            </Link>
          </div>
        </div>

        <div className="scroll-hint absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/80">
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none" aria-hidden="true">
            <path d="M10 4v18m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ---------- Philosophy ---------- */}
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-28 text-center md:py-44">
        <Reveal>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
            Philosophy
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-8 font-serif text-3xl font-light leading-[1.55] tracking-tight text-ink sm:text-4xl md:text-[2.6rem]">
            숨은, 들이쉬는 것보다
            <br />
            내쉬는 것이 먼저입니다
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-10 max-w-xl text-base leading-9 text-stone md:text-lg">
            {BRAND.name}는 무언가를 더하는 여행이 아니라, 덜어내는 여행을 제안합니다.
            <br />
            소음과 일정, 해야 할 일들을 잠시 내려놓고 — 섬의 속도에 몸을 맡기는 것.
            <br />
            그 단순한 경험을 위해 공간의 모든 요소를 설계했습니다.
          </p>
        </Reveal>
      </section>

      {/* ---------- Stays ---------- */}
      <section id="stays" className="scroll-mt-20 bg-cream-deep py-24 md:py-36">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
                The Stay
              </p>
              <h2 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
                하루에 단 한 팀,
                <br className="md:hidden" /> 집 전체의 숨
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-7 text-stone">
                침실부터 마당까지, 독채 전체가 오직 한 팀의 것이 됩니다.
                <br />
                다른 투숙객과 마주칠 일 없이 집의 모든 공간을 그대로 누리세요.
              </p>
              <p className="mt-3 text-xs tracking-wide text-bronze">
                독채 전체 사용 · {BRAND.capacityLabel}
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 md:mt-20 md:gap-8 lg:grid-cols-4">
            {sceneCards.map((space, i) => {
              const cardBody = (
                <>
                  <figure className="img-zoom relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                    <Image
                      src={space.image}
                      alt={`${space.name} 전경`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </figure>
                  <div className="mt-6 flex items-baseline justify-between">
                    <h3 className="font-serif text-xl text-ink">{space.name}</h3>
                    <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-stone">
                      {space.nameEn}
                    </span>
                  </div>
                  {space.description && (
                    <p className="mt-3 text-sm leading-7 text-stone">{space.description}</p>
                  )}
                  {space.slug && (
                    <span className="mt-4 inline-block text-xs font-medium tracking-wide text-bronze transition-colors duration-300 group-hover:text-ink">
                      공간 자세히 보기 →
                    </span>
                  )}
                </>
              );

              return (
                <Reveal key={`${space.nameEn}-${i}`} delay={(i % 3) as 0 | 1 | 2}>
                  {space.slug ? (
                    <Link href={`/space/${space.slug}`} className="group block">
                      {cardBody}
                    </Link>
                  ) : (
                    <div>{cardBody}</div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-14 flex justify-center md:mt-20">
            <Link
              href="/reservations"
              className="rounded-full border border-ink/30 px-9 py-3.5 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
            >
              하루의 유일한 손님 되기
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Experience bands ---------- */}
      <section id="experience" className="scroll-mt-20 py-24 md:py-36">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 md:gap-40 md:px-10">
          {EXPERIENCES.map((exp, i) => (
            <div
              key={exp.label}
              className={`flex flex-col items-center gap-10 md:gap-20 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <Reveal className="w-full md:w-[55%]">
                <figure className="img-zoom relative aspect-[4/3] w-full overflow-hidden rounded-sm">
                  <Image
                    src={exp.image}
                    alt={exp.alt}
                    fill
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="object-cover"
                  />
                </figure>
              </Reveal>
              <Reveal delay={1} className="w-full md:w-[45%]">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.4em] text-bronze">
                  {exp.label}
                </p>
                <h3 className="mt-5 font-serif text-2xl font-light leading-snug tracking-tight text-ink md:text-[2rem]">
                  {exp.title}
                </h3>
                <p className="mt-6 max-w-md whitespace-pre-line text-[0.95rem] leading-8 text-stone">
                  {exp.body}
                </p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Film (관리자 유튜브 링크가 있을 때만) ---------- */}
      {youtubeBlock && (
        <section className="border-y border-line bg-cream-deep py-20 md:py-28">
          <Reveal className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
              Film
            </p>
            <h2 className="mt-5 font-serif text-2xl font-light leading-snug tracking-tight text-ink md:text-3xl">
              {youtubeBlock.title}
            </h2>
            {youtubeBlock.body && (
              <p className="mt-5 max-w-md text-sm leading-7 text-stone">
                {youtubeBlock.body}
              </p>
            )}
            <a
              href={youtubeBlock.media_url!}
              target="_blank"
              rel="noreferrer"
              className="mt-8 rounded-full border border-ink/30 px-9 py-3.5 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
            >
              영상으로 미리 만나기 →
            </a>
          </Reveal>
        </section>
      )}

      {/* ---------- AI Concierge (dark band) ---------- */}
      <section
        id="concierge"
        className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-cream md:py-36"
      >
        {/* 따뜻한 불빛의 야경 — 어두운 섹션에 온기를 더하는 배경 */}
        <Image
          src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2600&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-70"
        />
        {/* 앰버 워시 — 사진 위에 따뜻한 톤을 한 겹 입힌다 */}
        <div className="absolute inset-0 bg-[#8a5a2b]/20 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink/90" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-sand">
              Aphae Concierge · AI Stay
            </p>
            <h2 className="mt-6 font-serif text-3xl font-light leading-snug tracking-tight sm:text-4xl md:text-[2.6rem]">
              머무름을 돕는,
              <br />
              아주 작은 AI
            </h2>
            <p className="mt-8 text-base leading-9 text-cream/65">
              집 안에 놓인 QR 하나면 충분합니다.
              <br />
              바베큐 준비부터 길 안내, 동네 맛집과 숨은 혜택까지 — {BRAND.name}
              의 컨시어지가 머무는 동안 필요한 모든 것을 조용히 곁에서
              챙깁니다.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-2 md:mt-24 lg:grid-cols-3">
            {CONCIERGE_FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={(i % 3) as 0 | 1 | 2}
                className="group bg-ink/65 p-8 backdrop-blur-md transition-colors duration-500 hover:bg-ink-soft/65 sm:last:col-span-2 md:p-10 lg:last:col-span-1"
              >
                <div className="text-sand/80 transition-colors duration-500 group-hover:text-sand">
                  <ConciergeIcon name={feature.icon} />
                </div>
                <h3 className="mt-6 text-base font-medium tracking-wide">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-cream/55">{feature.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 flex flex-col items-center gap-5 text-center">
            {CONCIERGE_LINK ? (
              <a
                href={CONCIERGE_LINK}
                className="rounded-full bg-cream px-10 py-4 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-black/30"
              >
                압해 컨시어지 열기
              </a>
            ) : (
              <p className="rounded-full border border-white/20 px-7 py-3 text-xs tracking-[0.2em] text-cream/60">
                예약이 확정된 분께 체크인 안내와 함께 QR·링크로 열어드립니다
              </p>
            )}
            <p className="max-w-md text-xs leading-6 text-cream/40">
              압해 컨시어지는 앱 설치 없이 브라우저에서 바로 열리는
              투숙객 전용 서비스입니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Amenities ---------- */}
      <section className="border-y border-line bg-cream-deep py-24 md:py-32">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
              Amenities
            </p>
            <h2 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
              머무름을 채우는 것들
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
            {AMENITIES.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) as 0 | 1 | 2}>
                <div className="border-t border-ink/15 pt-6">
                  <h3 className="text-base font-medium tracking-wide text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Voices (관리자 이용 후기가 있을 때만) ---------- */}
      {testimonials.length > 0 && (
        <section className="py-24 md:py-36">
          <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
            <Reveal className="text-center">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
                Voices
              </p>
              <h2 className="mt-5 font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
                머문 이들의 기록
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) as 0 | 1 | 2}>
                  <blockquote className="border-t border-ink/15 pt-6">
                    <p className="font-serif text-lg font-light leading-9 text-ink">
                      “{t.title}”
                    </p>
                    {t.body && (
                      <footer className="mt-4 text-xs tracking-wide text-stone">
                        — {t.body}
                      </footer>
                    )}
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Location ---------- */}
      <section id="location" className="scroll-mt-20 py-24 md:py-36">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-start md:justify-between md:px-10">
          <Reveal className="max-w-md">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
              Location
            </p>
            <h2 className="mt-5 font-serif text-3xl font-light leading-snug tracking-tight text-ink md:text-4xl">
              다리 하나를 건너면,
              <br />
              섬의 시간이 시작됩니다
            </h2>
          </Reveal>
          <Reveal delay={1} className="flex max-w-sm flex-col gap-8 text-sm leading-7">
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                Address
              </p>
              <p className="mt-2 text-ink-soft">{BRAND.address}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {MAP_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-ink/25 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-soft transition-all duration-300 hover:border-ink hover:bg-ink hover:text-cream"
                  >
                    {link.name} →
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                Check in — out
              </p>
              <p className="mt-2 text-ink-soft">{BRAND.checkInOut}</p>
            </div>
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone">
                Contact
              </p>
              <p className="mt-2 text-ink-soft">{BRAND.email}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2600&auto=format&fit=crop"
          alt="새벽 안개가 내려앉은 산의 능선"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <Reveal className="relative z-10 flex flex-col items-center px-6 text-center text-white">
          <h2 className="font-serif text-3xl font-light leading-snug tracking-tight sm:text-4xl md:text-5xl">
            이번 주말,
            <br />
            숨을 고르러 오세요
          </h2>
          <Link
            href="/reservations"
            className="mt-10 rounded-full bg-white px-10 py-4 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:bg-cream hover:shadow-xl hover:shadow-black/25"
          >
            예약하기
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
