'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type ContentType = 'structure' | 'weapon' | 'tool' | 'item';
export type Platform = 'java' | 'bedrock';

function PixelIcon({ pattern, colorA, colorB }: { pattern: string[]; colorA: string; colorB: string }) {
  const size = pattern.length;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-6" shapeRendering="crispEdges">
      {pattern.flatMap((row, y) =>
        [...row].map((ch, x) => {
          if (ch === '.') return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={ch === 'A' ? colorA : colorB} />;
        }),
      )}
    </svg>
  );
}

const PIXEL_PATTERNS = {
  structure: ['..AAAA..', '.AAAAAA.', 'AAAAAAAA', '.BBBBBB.', '.BBBBBB.', '.BB..BB.', '.BB..BB.', '.BBBBBB.'],
  weapon: ['.......A', '......AA', '.....AA.', '....AA..', '...AAB..', '..BB....', '.BB.....', 'B.......'],
  tool: ['..AA.AA.', '.AAAAAA.', '..AAAA..', '...BB...', '...BB...', '..BB....', '.BB.....', 'B.......'],
  item: ['...A....', '...A....', '..AAA...', '.AAAAA..', 'AAAAAAA.', '.AAAAA..', '..AAA...', '...A....'],
};

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
    icon: <PixelIcon pattern={PIXEL_PATTERNS.structure} colorA="#ff8a63" colorB="#f1653f" />,
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
    icon: <PixelIcon pattern={PIXEL_PATTERNS.weapon} colorA="#7fd6e6" colorB="#4cbacf" />,
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
    icon: <PixelIcon pattern={PIXEL_PATTERNS.tool} colorA="#ff8a63" colorB="#f1653f" />,
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
    icon: <PixelIcon pattern={PIXEL_PATTERNS.item} colorA="#7fd6e6" colorB="#4cbacf" />,
  },
];

const PLATFORMS: { type: Platform; label: string; description: string }[] = [
  { type: 'java', label: 'Java Edition', description: 'Data pack (.zip) — datapacks klasörüne koy, /reload yap.' },
  { type: 'bedrock', label: 'Bedrock Edition', description: 'Add-On (.mcaddon) — açınca otomatik kurulur, dünyada etkinleştir.' },
];

const SLOT_BEVEL = 'shadow-[inset_2px_2px_0_rgba(255,255,255,0.15),inset_-2px_-2px_0_rgba(0,0,0,0.45)]';
const SLOT_BEVEL_SM = 'shadow-[inset_1px_1px_0_rgba(255,255,255,0.12),inset_-1px_-1px_0_rgba(0,0,0,0.4)]';

const ACCENT_CLASSES = {
  ember: {
    badge: 'border-[#f1653f]/45 bg-[#f1653f]/10 text-[#ff8a63]',
    hoverBorder: 'hover:border-[#f1653f]/60',
    arrow: 'group-hover:border-[#f1653f]/70 group-hover:text-[#ff8a63]',
  },
  cyan: {
    badge: 'border-[#4cbacf]/45 bg-[#4cbacf]/10 text-[#7fd6e6]',
    hoverBorder: 'hover:border-[#4cbacf]/60',
    arrow: 'group-hover:border-[#4cbacf]/70 group-hover:text-[#7fd6e6]',
  },
};

const PIXEL_FONT = { fontFamily: 'var(--font-pixelify)' };

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

export interface InitialDraft {
  id: string;
  contentType: ContentType;
  prompt: string;
  behavior: string;
  platform: Platform;
}

export function GenerateForm({ initialType, initialDraft }: { initialType?: ContentType; initialDraft?: InitialDraft }) {
  const [contentType, setContentType] = useState<ContentType>(initialDraft?.contentType ?? initialType ?? 'structure');
  const category = CATEGORIES.find((c) => c.type === contentType) ?? CATEGORIES[0];
  const wizardSteps = stepsFor(category);

  const [step, setStep] = useState<WizardStep>(initialDraft || initialType ? 'look' : 'pick');
  const [prompt, setPrompt] = useState(initialDraft?.prompt ?? '');
  const [behavior, setBehavior] = useState(initialDraft?.behavior ?? '');
  const [platform, setPlatform] = useState<Platform>(initialDraft?.platform ?? 'java');
  const [draftId, setDraftId] = useState<string | null>(initialDraft?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const router = useRouter();
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasUnsavedContent = step !== 'pick' && prompt.trim().length > 0;

  function handleBackArrow() {
    if (hasUnsavedContent) {
      setShowLeaveConfirm(true);
    } else {
      router.back();
    }
  }

  async function saveDraftAndLeave() {
    setSavingDraft(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId ?? undefined,
          prompt,
          contentType,
          behavior: category.hasBehavior ? behavior : undefined,
          platform,
        }),
      });
      if (!res.ok) {
        setSavingDraft(false);
        return;
      }
      const data = await res.json();
      setDraftId(data.id);
    } catch {
      setSavingDraft(false);
      return;
    }
    router.back();
  }

  function discardAndLeave() {
    router.back();
  }

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
        body: JSON.stringify({
          prompt,
          contentType,
          behavior: category.hasBehavior ? behavior : undefined,
          platform,
          draftId: draftId ?? undefined,
        }),
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

  const backArrowButton = (
    <button
      type="button"
      onClick={handleBackArrow}
      aria-label="Geri dön"
      className={`fixed top-6 left-6 z-20 flex size-10 items-center justify-center rounded-none border-2 border-stone-700 bg-stone-950/80 text-stone-300 backdrop-blur-sm transition hover:border-stone-500 hover:text-stone-100 ${SLOT_BEVEL_SM}`}
    >
      ←
    </button>
  );

  const leaveConfirmModal = showLeaveConfirm && (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-6">
      <div className={`w-full max-w-sm rounded-none border-2 border-stone-700 bg-stone-950 p-5 ${SLOT_BEVEL}`}>
        <h3 className="font-bold tracking-wide text-stone-100" style={PIXEL_FONT}>
          Çıkmadan önce...
        </h3>
        <p className="mt-2 text-sm text-stone-400">
          Girdiğin bilgiler henüz üretilmedi. Taslak olarak kaydetmek ister misin?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={saveDraftAndLeave}
            disabled={savingDraft}
            className={`rounded-none bg-[#f1653f] px-4 py-2.5 text-sm font-semibold text-white ${SLOT_BEVEL_SM} transition hover:bg-[#ff7a4d] disabled:opacity-50`}
          >
            {savingDraft ? 'Kaydediliyor...' : 'Taslak Olarak Kaydet'}
          </button>
          <button
            type="button"
            onClick={discardAndLeave}
            disabled={savingDraft}
            className="rounded-none border-2 border-stone-700 px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:border-stone-500 disabled:opacity-50"
          >
            Kaydetme, Çık
          </button>
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(false)}
            disabled={savingDraft}
            className="px-4 py-2 text-sm text-stone-500 transition hover:text-stone-300 disabled:opacity-50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'pick') {
    return (
      <>
        {backArrowButton}
        {leaveConfirmModal}
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
                className={`group flex flex-col gap-4 rounded-none border-2 border-stone-800 bg-stone-950/80 p-5 text-left backdrop-blur-sm transition ${accent.hoverBorder} hover:bg-stone-900/90`}
              >
                <span className={`flex size-11 items-center justify-center rounded-none border-2 ${SLOT_BEVEL} ${accent.badge}`}>
                  {c.icon}
                </span>
                <div>
                  <h3 className="font-bold tracking-wide text-stone-100" style={PIXEL_FONT}>
                    {c.label}
                  </h3>
                  <p className="mt-1 text-sm text-stone-400">{c.cardDescription}</p>
                </div>
                <span
                  className={`ml-auto flex size-8 items-center justify-center rounded-none border-2 border-stone-700 text-stone-400 ${SLOT_BEVEL_SM} transition ${accent.arrow}`}
                >
                  →
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const progressSteps = wizardSteps.filter((s): s is Exclude<WizardStep, 'pick'> => s !== 'pick');
  const currentProgressIndex = progressSteps.indexOf(step as Exclude<WizardStep, 'pick'>);

  return (
    <>
      {backArrowButton}
      {leaveConfirmModal}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setStep('pick')}
          className="self-start text-sm text-stone-500 transition hover:text-stone-300"
        >
          ← Kategori değiştir
        </button>

      <div className="flex items-center gap-2 text-stone-100">
        <span
          className={`flex size-8 items-center justify-center rounded-none border-2 ${SLOT_BEVEL_SM} ${ACCENT_CLASSES[category.accent].badge}`}
        >
          {category.icon}
        </span>
        <h2 className="font-bold tracking-wide" style={PIXEL_FONT}>
          {category.label}
        </h2>
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
            className="rounded-none border-2 border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500"
          />
          <button
            type="button"
            disabled={prompt.trim().length < 3}
            onClick={goToNextStep}
            className={`rounded-none bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white ${SLOT_BEVEL} transition hover:bg-[#ff7a4d] disabled:opacity-50`}
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
            className="rounded-none border-2 border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              className={`rounded-none border-2 border-stone-700 px-6 py-3 text-sm font-semibold text-stone-300 ${SLOT_BEVEL_SM} transition hover:border-stone-500`}
            >
              ← Geri
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className={`flex-1 rounded-none bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white ${SLOT_BEVEL} transition hover:bg-[#ff7a4d]`}
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
                className={`rounded-none border-2 p-4 text-left transition ${
                  platform === p.type
                    ? `border-[#f1653f]/70 bg-[#f1653f]/10 ${SLOT_BEVEL_SM}`
                    : 'border-stone-800 bg-stone-950/70 hover:border-stone-600'
                }`}
              >
                <h3 className="font-bold tracking-wide text-stone-100" style={PIXEL_FONT}>
                  {p.label}
                </h3>
                <p className="mt-1 text-xs text-stone-400">{p.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={loading}
              className={`rounded-none border-2 border-stone-700 px-6 py-3 text-sm font-semibold text-stone-300 ${SLOT_BEVEL_SM} transition hover:border-stone-500 disabled:opacity-50`}
            >
              ← Geri
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-none bg-[#f1653f] px-6 py-3 text-sm font-semibold text-white ${SLOT_BEVEL} transition hover:bg-[#ff7a4d] disabled:opacity-50`}
            >
              {loading ? category.loadingSteps[loadingStep] : `${category.label} Üret`}
            </button>
          </div>
          {loading && <p className="text-center text-xs text-stone-500">{category.estimate}</p>}
        </div>
      )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </>
  );
}
