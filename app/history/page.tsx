import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">Geçmiş Üretimlerim</h1>
        <Link href="/generate" className="text-sm text-emerald-400 hover:text-emerald-300">
          + Yeni
        </Link>
      </div>

      {(!generations || generations.length === 0) && (
        <p className="text-sm text-neutral-400">Henüz bir icat üretmedin.</p>
      )}

      <ul className="flex flex-col gap-3">
        {generations?.map((g) => (
          <li key={g.id}>
            <Link
              href={`/result/${g.id}`}
              className="block rounded-md border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600"
            >
              <p className="font-medium text-neutral-100">{g.prompt}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {g.block_count} blok · {new Date(g.created_at).toLocaleString('tr-TR')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
