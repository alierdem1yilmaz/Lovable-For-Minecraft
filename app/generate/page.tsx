import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Silkscreen } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';
import { GenerateForm, type InitialDraft } from './GenerateForm';

const pixelify = Silkscreen({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-pixelify',
});

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft: draftId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let initialDraft: InitialDraft | undefined;
  if (draftId) {
    const { data: draft } = await supabase
      .from('drafts')
      .select('id, content_type, prompt, behavior, platform')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single();

    if (draft) {
      initialDraft = {
        id: draft.id,
        contentType: draft.content_type,
        prompt: draft.prompt,
        behavior: draft.behavior ?? '',
        platform: draft.platform,
      };
    }
  }

  return (
    <div className={`${pixelify.variable} relative flex flex-1 flex-col overflow-hidden bg-[#050807] text-stone-100`}>
      <div className="absolute inset-0">
        <Image
          src="/images/generate-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050807]/15 via-[#050807]/70 to-[#050807]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div>
          <h1
            className="mb-2 text-2xl font-bold tracking-wide text-stone-50"
            style={{ fontFamily: 'var(--font-pixelify)' }}
          >
            Ne yapmak istersin?
          </h1>
          <p className="text-sm text-stone-300/90">
            Bir kategori seç, sonra ne istediğini birkaç cümleyle anlat — AI kavramsal bir görsel üretip
            sana kurulabilir bir Minecraft data pack&apos;i hazırlasın.
          </p>
        </div>
        <GenerateForm initialDraft={initialDraft} />
        <div className="flex gap-4">
          <Link href="/history" className="text-sm text-stone-400 hover:text-stone-200">
            Geçmiş üretimlerim →
          </Link>
          <Link href="/drafts" className="text-sm text-stone-400 hover:text-stone-200">
            Taslaklarım →
          </Link>
        </div>
      </main>
    </div>
  );
}
