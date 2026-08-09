'use client';

/*
  DIRECTION CONTRACT (Impeccable)
  THESIS: the landing page IS the night build, not a photo behind marketing copy —
    the hero is the actual atmosphere the product produces, and the pipeline is told
    as a lit path through that scene, not three identical feature cards. A day/night
    toggle swaps the whole scene (and its own legible palette) rather than just the photo.
  OWN-WORLD: near-black night ground, warm ember accent (#f16b46) sampled from the
    reference photo's window glow, cool cyan-teal (#4cbacf) as a rare second accent,
    Silkscreen for display/numerals (the medium's own blocky grammar, legible pixel form),
    Geist Sans for body/UI. Soft warm-tinted glow shadows, not flat borders.
  STORY: a visitor understands in seconds that a sentence becomes a real, installable
    Minecraft build via AI, sees the three-step mechanism honestly, and starts.
  FIRST VIEWPORT: full-bleed reference photo, gradient scrim for legibility, headline
    in Silkscreen sitting in the photo's own dark lower ground, no eyebrow badge,
    CTA pair in the ember accent.
  FORM: brief-pinned by the user's own reference photos — no concept-seed roll.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
    review, the verdict, and DESIGN.md.
*/
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Silkscreen } from 'next/font/google';

const pixelify = Silkscreen({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-pixelify',
});

type TimeOfDay = 'night' | 'day';

const THEME = {
  night: {
    image: '/images/hero-night.jpg',
    imagePosition: 'object-[38%_60%]',
    wrapperBg: 'bg-[#050807]',
    scrimB: 'bg-gradient-to-b from-[#050807]/55 via-[#050807]/35 to-[#050807]',
    scrimT: 'bg-gradient-to-t from-[#050807] via-transparent to-transparent',
    glow: '[background:radial-gradient(120%_90%_at_20%_100%,rgba(241,107,70,0.16),transparent_60%)]',
    heading: 'text-stone-50',
    accentSpan: 'text-[#ff8a63]',
    body: 'text-stone-300/90',
    secondaryBtn: 'border-stone-100/20 bg-stone-950/30 text-stone-100 hover:border-stone-100/40 hover:bg-stone-950/50',
    divider: 'from-stone-100/25',
    stepNum: 'text-stone-400/80',
    stepTitle: 'text-stone-100',
    stepDesc: 'text-stone-400',
    badge: { ember: 'border-[#f1653f]/35 bg-[#f1653f]/10 text-[#ff8a63]', cyan: 'border-[#4cbacf]/35 bg-[#4cbacf]/10 text-[#7fd6e6]' },
    toggleBg: 'border-stone-100/25 bg-stone-950/50 text-stone-300',
    toggleActive: 'bg-stone-100/15 text-stone-50',
  },
  day: {
    image: '/images/hero-day.jpg',
    imagePosition: 'object-[52%_38%]',
    wrapperBg: 'bg-[#eef7f0]',
    scrimB: 'bg-gradient-to-b from-[#eef7f0]/10 via-[#eef7f0]/40 to-[#eef7f0]/90',
    scrimT: 'bg-gradient-to-t from-[#eef7f0]/60 via-transparent to-transparent',
    glow: '[background:radial-gradient(120%_90%_at_20%_100%,rgba(241,107,70,0.12),transparent_60%)]',
    heading: 'text-stone-900',
    accentSpan: 'text-[#c2410c]',
    body: 'text-stone-700',
    secondaryBtn: 'border-stone-900/20 bg-white/40 text-stone-900 hover:border-stone-900/35 hover:bg-white/60',
    divider: 'from-stone-900/20',
    stepNum: 'text-stone-600/80',
    stepTitle: 'text-stone-900',
    stepDesc: 'text-stone-600',
    badge: { ember: 'border-[#f1653f]/45 bg-[#f1653f]/15 text-[#c2410c]', cyan: 'border-[#4cbacf]/45 bg-[#4cbacf]/15 text-[#0e7490]' },
    toggleBg: 'border-stone-900/20 bg-white/50 text-stone-700',
    toggleActive: 'bg-stone-900/10 text-stone-900',
  },
} as const;

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

function MoonIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M23 18.5A10 10 0 1 1 13.5 9a8 8 0 0 0 9.5 9.5z" stroke="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" className="size-4">
      <circle cx="16" cy="16" r="6" stroke="currentColor" />
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l2.8 2.8M22.2 22.2 25 25M25 7l-2.8 2.8M9.8 22.2 7 25" stroke="currentColor" />
    </svg>
  );
}

export default function Home() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const t = THEME[timeOfDay];

  return (
    <div className={`${pixelify.variable} relative flex flex-1 flex-col overflow-hidden transition-colors duration-500 ${t.wrapperBg}`}>
      <div className="absolute inset-0">
        <Image
          key={t.image}
          src={t.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`animate-hero-drift object-cover ${t.imagePosition} motion-reduce:animate-none`}
        />
        <div className={`absolute inset-0 ${t.scrimB}`} />
        <div className={`absolute inset-0 ${t.scrimT}`} />
        <div className={`absolute inset-0 ${t.glow}`} />
      </div>

      <div className="absolute top-6 right-6 z-10 sm:top-8 sm:right-8">
        <div className={`flex rounded-none border-2 p-1 backdrop-blur-sm transition-colors ${t.toggleBg}`}>
          <button
            type="button"
            onClick={() => setTimeOfDay('night')}
            aria-pressed={timeOfDay === 'night'}
            className={`flex items-center gap-1.5 rounded-none px-2.5 py-1.5 text-xs font-bold tracking-wide transition ${
              timeOfDay === 'night' ? t.toggleActive : ''
            }`}
            style={{ fontFamily: 'var(--font-pixelify)' }}
          >
            <MoonIcon /> Gece
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay('day')}
            aria-pressed={timeOfDay === 'day'}
            className={`flex items-center gap-1.5 rounded-none px-2.5 py-1.5 text-xs font-bold tracking-wide transition ${
              timeOfDay === 'day' ? t.toggleActive : ''
            }`}
            style={{ fontFamily: 'var(--font-pixelify)' }}
          >
            <SunIcon /> Gündüz
          </button>
        </div>
      </div>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-end gap-10 px-6 pt-32 pb-20 sm:pb-24">
        <div className="max-w-2xl animate-rise-in [animation-delay:80ms] motion-reduce:animate-none">
          <h1
            className={`text-[2.75rem] leading-[1.05] font-bold tracking-wide text-balance sm:text-6xl ${t.heading}`}
            style={{ fontFamily: 'var(--font-pixelify)' }}
          >
            Fikrini yaz,{' '}
            <span className={t.accentSpan}>{timeOfDay === 'night' ? 'gecenin içinde' : 'gündüzün içinde'}</span>{' '}
            Minecraft&apos;a getir
          </h1>

          <p className={`mt-6 max-w-[62ch] text-lg ${t.body}`}>
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
              className={`rounded-md border px-6 py-3 text-center text-sm font-semibold backdrop-blur-sm transition ${t.secondaryBtn}`}
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
                  className={`pointer-events-none absolute top-[1.35rem] left-[calc(50%+2.75rem)] hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r to-transparent sm:block ${t.divider}`}
                />
              )}
              <div className="flex items-center gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors ${t.badge[step.accent]}`}>
                  {step.icon}
                </span>
                <span className={`text-sm transition-colors ${t.stepNum}`} style={{ fontFamily: 'var(--font-pixelify)' }}>
                  {step.n}
                </span>
              </div>
              <h3 className={`font-semibold transition-colors ${t.stepTitle}`}>{step.title}</h3>
              <p className={`max-w-[38ch] text-sm transition-colors ${t.stepDesc}`}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
