import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/brand";
import { SPACES, getSpaceBySlug } from "@/lib/spaces";

export function generateStaticParams() {
  return SPACES.map((space) => ({ slug: space.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const space = getSpaceBySlug(slug);
  if (!space) return {};

  return {
    title: `${space.name} | ${BRAND.name}`,
    description: space.tagline,
    openGraph: {
      title: `${space.name} | ${BRAND.name}`,
      description: space.tagline,
      images: [space.heroImage],
    },
  };
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = getSpaceBySlug(slug);
  if (!space) notFound();

  const otherSpaces = SPACES.filter((s) => s.slug !== space.slug);

  return (
    <div className="flex flex-col">
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[75svh] items-end overflow-hidden">
        <Image
          src={space.heroImage}
          alt={space.heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/35" />

        <div className="relative z-10 w-full px-6 pb-16 text-white md:px-10 md:pb-20">
          <div className="mx-auto w-full max-w-6xl">
            <Link
              href="/#stays"
              className="text-xs font-medium tracking-wide text-white/75 transition-colors duration-300 hover:text-white"
            >
              ← 스테이 압해의 공간들
            </Link>
            <p className="mt-6 text-[0.7rem] font-medium uppercase tracking-[0.45em] text-white/80">
              {space.nameEn}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-light leading-[1.25] tracking-tight sm:text-5xl md:text-6xl">
              {space.name}
            </h1>
          </div>
        </div>
      </section>

      {/* ---------- Body ---------- */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center md:py-32">
        <Reveal>
          <p className="whitespace-pre-line text-base leading-9 text-stone md:text-lg">
            {space.body}
          </p>
        </Reveal>
      </section>

      {/* ---------- Gallery walk ---------- */}
      <section className="bg-cream-deep py-24 md:py-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-20 px-6 md:gap-28 md:px-10">
          {space.gallery.map((photo, i) => (
            <Reveal key={photo.src} delay={(i % 3) as 0 | 1 | 2}>
              <figure
                className={`img-zoom relative aspect-[4/3] w-full overflow-hidden rounded-sm ${
                  i % 2 === 1 ? "md:ml-auto md:w-[85%]" : "md:w-[85%]"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 70vw, 100vw"
                  className="object-cover"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Other spaces ---------- */}
      <section className="py-24 md:py-32">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <Reveal className="text-center">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.45em] text-bronze">
              Continue the Walk
            </p>
            <h2 className="mt-5 font-serif text-2xl font-light tracking-tight text-ink md:text-3xl">
              다른 공간도 둘러보세요
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {otherSpaces.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) as 0 | 1 | 2}>
                <Link href={`/space/${s.slug}`} className="group block">
                  <figure className="img-zoom relative aspect-[3/4] w-full overflow-hidden rounded-sm">
                    <Image
                      src={s.heroImage}
                      alt={s.heroAlt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </figure>
                  <div className="mt-5 flex items-baseline justify-between">
                    <h3 className="font-serif text-lg text-ink">{s.name}</h3>
                    <span className="text-[0.6rem] font-medium uppercase tracking-[0.3em] text-stone">
                      {s.nameEn}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative flex min-h-[60svh] items-center justify-center overflow-hidden">
        <Image
          src={space.heroImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <Reveal className="relative z-10 flex flex-col items-center px-6 text-center text-white">
          <h2 className="font-serif text-3xl font-light leading-snug tracking-tight sm:text-4xl md:text-5xl">
            이 공간에서,
            <br />
            하루를 보내보세요
          </h2>
          <Link
            href="/reservations"
            className="mt-10 rounded-full bg-white px-10 py-4 text-sm font-medium tracking-wide text-ink transition-all duration-300 hover:bg-cream hover:shadow-xl hover:shadow-black/25"
          >
            하루의 유일한 손님 되기
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
