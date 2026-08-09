import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Silkscreen } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';

const pixelify = Silkscreen({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-pixelify',
});

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false });

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
        <div className="absolute inset-0 bg-gradient-to-b from-[#050807]/15 via-[#050807]/75 to-[#050807]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide text-stone-50" style={{ fontFamily: 'var(--font-pixelify)' }}>
            Geçmiş Üretimlerim
          </h1>
          <Link href="/generate" className="text-sm text-emerald-400 hover:text-emerald-300">
            + Yeni
          </Link>
        </div>

        {(!generations || generations.length === 0) && (
          <p className="text-sm text-stone-400">Henüz bir icat üretmedin.</p>
        )}

        <ul className="flex flex-col gap-3">
          {generations?.map((g) => (
            <li key={g.id}>
              <Link
                href={`/result/${g.id}`}
                className="block rounded-none border-2 border-stone-800 bg-stone-950/80 p-4 backdrop-blur-sm hover:border-stone-600"
              >
                <p className="font-medium text-stone-100">{g.prompt}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {g.content_type === 'structure' ? `${g.block_count} blok · ` : ''}
                  {new Date(g.created_at).toLocaleString('tr-TR')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
