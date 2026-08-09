'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type ContentType = 'structure' | 'weapon' | 'tool' | 'item';
export type Platform = 'java' | 'bedrock';

const CATEGORIES: {
  type: ContentType;
  label: string;
  cardDescription: string;
  placeholder: string;
  behaviorPlaceholder: string;
  hasBehavior: boolean;
  loadingSteps: string[];
  estimate: string;
  accent: 'ember' | 'cyan';
  icon: ReactNode;
}[] = [
  {
    type: 'structure',
    label: 'Yapı',
    cardDescription: 'Kuleler, evler, köprüler ve diğer bloklu yapılar.',
    placeholder: 'Örn: küçük taş bir gözetleme kulesi, üstünde ahşap çatı',
    behaviorPlaceholder: '',
    hasBehavior: false,
    loadingSteps: [
      'Kavramsal görsel oluşturuluyor...',
      '3D modele dönüştürülüyor (Gaussian Splatting)...',
      'Minecraft yapısına çevriliyor...',
    ],
    estimate: 'Bu işlem ~30-90 saniye sürebilir.',
    accent: 'ember',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M9 27V13l7-6 7 6v14" stroke="currentColor" />
        <path d="M13 27v-7h6v7" stroke="currentColor" />
      </svg>
    ),
  },
  {
    type: 'weapon',
    label: 'Silah',
    cardDescription: 'Kılıçlar, yaylar, asalar ve diğer savaş odaklı eşyalar.',
    placeholder: 'Örn: ejderha ateşinde dövülmüş, alev efektli bir kılıç',
    behaviorPlaceholder: 'Örn: vurduğu hedef birkaç saniye alevlensin ve geriye savrulsun',
    hasBehavior: true,
    loadingSteps: [
      'Kavramsal görsel oluşturuluyor...',
      'Özellikler ve davranış üretiliyor...',
      'Data pack paketleniyor...',
    ],
    estimate: 'Bu işlem ~15-30 saniye sürebilir.',
    accent: 'cyan',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M23 5 12 16" stroke="currentColor" />
        <path d="M20 2l6 6-3 3-6-6z" stroke="currentColor" />
        <path d="M11 15l6 6-3 3-6-6z" stroke="currentColor" opacity="0.55" />
        <path d="M8 22l-3.5 3.5M5.5 19.5 9 23" stroke="currentColor" />
      </svg>
    ),
  },
  {
    type: 'tool',
    label: 'Alet',
    cardDescription: 'Kazmalar, gadgetlar ve inşa ya da toplama için yardımcı eşyalar.',
    placeholder: 'Örn: madenlerde ışık saçan, hızlı kazan bir kazma',
    behaviorPlaceholder: 'Örn: kullanınca normalden çok daha hızlı kazsın',
    hasBehavior: true,
    loadingSteps: [
      'Kavramsal görsel oluşturuluyor...',
      'Özellikler ve davranış üretiliyor...',
      'Data pack paketleniyor...',
    ],
    estimate: 'Bu işlem ~15-30 saniye sürebilir.',
    accent: 'ember',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path
          d="M21.5 6a5 5 0 0 0-6.9 6.2L6 20.8 8.2 23l8.5-8.6A5 5 0 0 0 23 8.5l-3.4 3.5-2.1-2.1z"
          stroke="currentColor"
        />
      </svg>
    ),
  },
  {
    type: 'item',
    label: 'Eşya',
    cardDescription: 'Olasılıklar sonsuz — aklına ne gelirse tarif et.',
    placeholder: 'Örn: dokunulunca şans getiren, parıldayan bir tılsım',
    behaviorPlaceholder: 'Örn: elde tutulduğunda çevreye ışık saçsın',
    hasBehavior: true,
    loadingSteps: [
      'Kavramsal görsel oluşturuluyor...',
      'Özellikler ve davranış üretiliyor...',
      'Data pack paketleniyor...',
    ],
    estimate: 'Bu işlem ~15-30 saniye sürebilir.',
    accent: 'cyan',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-6">
        <path d="M16 6l2.6 6.4L25 15l-6.4 2.6L16 24l-2.6-6.4L7 15l6.4-2.6z" stroke="currentColor" />
      </svg>
    ),
  },
];

const PLATFORMS: { type: Platform; label: string; description: string }[] = [
  { type: 'java', label: 'Java Edition', description: 'Data pack (.zip) — datapacks klasörüne koy, /reload yap.' },
  { type: 'bedrock', label: 'Bedrock Edition', description: 'Add-On (.mcaddon) — açınca otomatik kurulur, dünyada etkinleştir.' },
];

const ACCENT_CLASSES = {
  ember: {
    badge: 'border-[#f1653f]/35 bg-[#f1653f]/10 text-[#ff8a63]',
    hoverBorder: 'hover:border-[#f1653f]/50',
    arrow: 'group-hover:border-[#f1653f]/60 group-hover:text-[#ff8a63]',
  },
  cyan: {
    badge: 'border-[#4cbacf]/35 bg-[#4cbacf]/10 text-[#7fd6e6]',
    hoverBorder: 'hover:border-[#4cbacf]/50',
    arrow: 'group-hover:border-[#4cbacf]/60 group-hover:text-[#7fd6e6]',
  },
};

const LOADING_STEP_INTERVAL_MS = 9000;

type WizardStep = 'pick' | 'look' | 'behavior' | 'version';

function stepsFor(category: (typeof CATEGORIES)[number]): WizardStep[] {
  return category.hasBehavior ? ['pick', 'look', 'behavior', 'version'] : ['pick', 'look', 'version'];
}

const STEP_LABELS: Record<Exclude<WizardStep, 'pick'>, string> = {
  look: 'Görünüşü tarif et',
  behavior: 'Davranışı tanımla',
  version: 'Versiyon seç',
};

export function GenerateForm({ initialType }: { initialType?: ContentType }) {
  const [contentType, setContentType] = useState<ContentType>(initialType ?? 'structure');
  const category = CATEGORIES.find((c) => c.type === contentType) ?? CATEGORIES[0];
  const wizardSteps = stepsFor(category);

  const [step, setStep] = useState<WizardStep>(initialType ? 'look' : 'pick');
  const [prompt, setPrompt] = useState('');
  const [behavior, setBehavior] = useState('');
  const [platform, setPlatform] = useState<Platform>('java');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading) return;

    stepTimer.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, category.loadingSteps.length - 1));
    }, LOADING_STEP_INTERVAL_MS);

    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [loading, category.loadingSteps.length]);

  function goToNextStep() {
    const currentIndex = wizardSteps.indexOf(step);
    const next = wizardSteps[currentIndex + 1];
    if (next) setStep(next);
  }

  function goToPreviousStep() {
    const currentIndex = wizardSteps.indexOf(step);
    const prev = wizardSteps[currentIndex - 1];
    if (prev) setStep(prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingStep(0);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType, behavior: category.hasBehavior ? behavior : undefined, platform }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Bir şeyler ters gitti');
        setLoading(false);
        return;
      }

      router.push(`/result/${data.id}`);
    } catch {
      setError('Bağlantı hatası, tekrar dener misin?');
      setLoading(false);
    }
  }

  if (step === 'pick') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const accent = ACCENT_CLASSES[c.accent];
          return (
            <button
              key={c.type}
              type="button"
              onClick={() => {
                setContentType(c.type);
                setStep('look');
              }}
              className={`group flex flex-col gap-4 rounded-lg border border-stone-800 bg-stone-950/70 p-5 text-left backdrop-blur-sm transition ${accent.hoverBorder} hover:bg-stone-900/80`}
            >
              <span className={`flex size-11 items-center justify-center rounded-md border ${accent.badge}`}>
                {c.icon}
              </span>
              <div>
                <h3 className="font-semibold text-stone-100">{c.label}</h3>
                <p className="mt-1 text-sm text-stone-400">{c.cardDescription}</p>
              </div>
              <span
                className={`ml-auto flex size-8 items-center justify-center rounded-md border border-stone-700 text-stone-400 transition ${accent.arrow}`}
              >
                →
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const progressSteps = wizardSteps.filter((s): s is Exclude<WizardStep, 'pick'> => s !== 'pick');
  const currentProgressIndex = progressSteps.indexOf(step as Exclude<WizardStep, 'pick'>);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => setStep('pick')}
        className="self-start text-sm text-stone-500 transition hover:text-stone-300"
      >
        ← Kategori değiştir
      </button>

      <div className="flex items-center gap-2 text-stone-100">
        <span className={`flex size-8 items-center justify-center rounded-md border ${ACCENT_CLASSES[category.accent].badge}`}>
          {category.icon}
        </span>
        <h2 className="font-semibold">{category.label}</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          {progressSteps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentProgressIndex ? 'bg-[#4ade80]' : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
        <div className="flex text-xs text-stone-500">
          {progressSteps.map((s, i) => (
            <span
              key={s}
              style={{ flex: 1 }}
              className={i === currentProgressIndex ? 'font-medium text-stone-300' : undefined}
            >
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      {step === 'look' && (
        <div className="flex flex-col gap-4">
          <textarea
            autoFocus
            required
            minLength={3}
            rows={4}
            placeholder={category.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="rounded-md border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500"
          />
          <button
            type="button"
            disabled={prompt.trim().length < 3}
            onClick={goToNextStep}
            className="rounded-md bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7a4d] disabled:opacity-50"
          >
            Devam et →
          </button>
        </div>
      )}

      {step === 'behavior' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-400">
            {category.label} kullanıldığında ya da vurduğunda ne olsun? (opsiyonel)
          </p>
          <textarea
            autoFocus
            rows={4}
            placeholder={category.behaviorPlaceholder}
            value={behavior}
            onChange={(e) => setBehavior(e.target.value)}
            className="rounded-md border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              className="rounded-md border border-stone-700 px-6 py-3 text-sm font-semibold text-stone-300 transition hover:border-stone-500"
            >
              ← Geri
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className="flex-1 rounded-md bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7a4d]"
            >
              Devam et →
            </button>
          </div>
        </div>
      )}

      {step === 'version' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => setPlatform(p.type)}
                className={`rounded-lg border p-4 text-left transition ${
                  platform === p.type
                    ? 'border-[#f1653f]/60 bg-[#f1653f]/10'
                    : 'border-stone-800 bg-stone-950/70 hover:border-stone-600'
                }`}
              >
                <h3 className="font-semibold text-stone-100">{p.label}</h3>
                <p className="mt-1 text-xs text-stone-400">{p.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={loading}
              className="rounded-md border border-stone-700 px-6 py-3 text-sm font-semibold text-stone-300 transition hover:border-stone-500 disabled:opacity-50"
            >
              ← Geri
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff7a4d] disabled:opacity-50"
            >
              {loading ? category.loadingSteps[loadingStep] : `${category.label} Üret`}
            </button>
          </div>
          {loading && <p className="text-center text-xs text-stone-500">{category.estimate}</p>}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
