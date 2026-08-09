/*
  DIRECTION CONTRACT (Impeccable)
  THESIS: the landing page IS the night build, not a photo behind marketing copy —
    the hero is the actual atmosphere the product produces, and the pipeline is told
    as a lit path through that scene, not three identical feature cards.
  OWN-WORLD: near-black night ground, warm ember accent (#f16b46) sampled from the
    reference photo's window glow, cool cyan-teal (#4cbacf) as a rare second accent,
    Pixelify Sans for display/numerals (the medium's own blocky grammar), Geist Sans
    for body/UI. Soft warm-tinted glow shadows, not flat borders.
  STORY: a visitor understands in seconds that a sentence becomes a real, installable
    Minecraft build via AI, sees the three-step mechanism honestly, and starts.
  FIRST VIEWPORT: full-bleed reference photo, gradient scrim for legibility, headline
    in Pixelify Sans sitting in the photo's own dark lower ground, no eyebrow badge,
    CTA pair in the ember accent.
  FORM: brief-pinned by the user's own reference photo — no concept-seed roll.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
import Link from 'next/link';
import Image from 'next/image';
import { Pixelify_Sans } from 'next/font/google';

const pixelify = Pixelify_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-pixelify',
});

const STEPS = [
  {
    n: '01',
    title: 'Anlat',
    desc: '"Küçük taş bir gözetleme kulesi, ahşap çatılı" gibi tek cümlelik bir açıklama yaz.',
    accent: 'ember' as const,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" className="size-7">
        <path d="M6 9h20M6 15.5h14M6 22h9" stroke="currentColor" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Görsele ve 3D’ye dönüştür',
    desc: 'Yapay zeka önce bir kavram görseli üretir, sonra Gaussian Splatting ile bunu gerçek bir 3D asset’e dönüştürür.',
    accent: 'cyan' as const,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M16 5 27 11v10L16 27 5 21V11z" stroke="currentColor" />
        <path d="M16 5v22M5 11l11 6 11-6" stroke="currentColor" opacity="0.55" />
        <circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="12.7" r="1" fill="currentColor" stroke="none" opacity="0.7" />
        <circle cx="21.5" cy="19.3" r="1" fill="currentColor" stroke="none" opacity="0.7" />
      </svg>
    ),
  },
  {
    n: '03',
    title: "Minecraft'a kur",
    desc: 'Data pack’i dünyana koy, /reload yap, /function ile icadını anında oyuna getir.',
    accent: 'ember' as const,
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M16 6v14" stroke="currentColor" />
        <path d="M10.5 14.5 16 20l5.5-5.5" stroke="currentColor" />
        <path d="M7 24h18" stroke="currentColor" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className={`${pixelify.variable} relative flex flex-1 flex-col overflow-hidden bg-[#050807] text-stone-100`}>
      <div className="absolute inset-0">
        <Image
          src="/images/hero-night.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-hero-drift object-cover object-[38%_60%] motion-reduce:animate-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050807]/55 via-[#050807]/35 to-[#050807]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-transparent to-transparent" />
        <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_20%_100%,rgba(241,107,70,0.16),transparent_60%)]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-end gap-10 px-6 pt-32 pb-20 sm:pb-24">
        <div className="max-w-2xl animate-rise-in [animation-delay:80ms] motion-reduce:animate-none">
          <h1
            className="text-[2.75rem] leading-[1.05] font-semibold tracking-wide text-balance text-stone-50 sm:text-6xl"
            style={{ fontFamily: 'var(--font-pixelify)' }}
          >
            Fikrini yaz,{' '}
            <span className="text-[#ff8a63]">gecenin içinde</span>{' '}
            Minecraft&apos;a getir
          </h1>

          <p className="mt-6 max-w-[62ch] text-lg text-stone-300/90">
            Aklındaki icadı birkaç cümleyle anlat. Yapay zeka bir kavram görseli çizer, onu
            Gaussian Splatting ile gerçek bir 3D asset&apos;e dönüştürür ve Minecraft Java
            Edition dünyana direkt kurabileceğin, gerçekten çalışan bir data pack üretir.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/generate"
              className="rounded-md bg-[#f1653f] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(241,101,63,0.55)] transition hover:bg-[#ff7a4d] hover:shadow-[0_12px_34px_-6px_rgba(241,101,63,0.7)]"
            >
              Fikrini Üret
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-stone-100/20 bg-stone-950/30 px-6 py-3 text-center text-sm font-semibold text-stone-100 backdrop-blur-sm transition hover:border-stone-100/40 hover:bg-stone-950/50"
            >
              Giriş Yap
            </Link>
          </div>
        </div>

        <ol className="grid animate-rise-in gap-x-8 gap-y-10 [animation-delay:220ms] motion-reduce:animate-none sm:grid-cols-3 sm:gap-y-0">
          {STEPS.map((step, i) => (
            <li key={step.n} className="relative flex flex-col gap-3">
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-[1.35rem] left-[calc(50%+2.75rem)] hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-stone-100/25 to-transparent sm:block"
                />
              )}
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-md border ${
                    step.accent === 'ember'
                      ? 'border-[#f1653f]/35 bg-[#f1653f]/10 text-[#ff8a63]'
                      : 'border-[#4cbacf]/35 bg-[#4cbacf]/10 text-[#7fd6e6]'
                  }`}
                >
                  {step.icon}
                </span>
                <span
                  className="text-sm text-stone-400/80"
                  style={{ fontFamily: 'var(--font-pixelify)' }}
                >
                  {step.n}
                </span>
              </div>
              <h3 className="font-semibold text-stone-100">{step.title}</h3>
              <p className="max-w-[38ch] text-sm text-stone-400">{step.desc}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
