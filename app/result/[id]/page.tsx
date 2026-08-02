import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function publicStorageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/generations/${path}`;
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: generation } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (!generation) {
    notFound();
  }

  const packUrl = publicStorageUrl(generation.pack_path);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div>
        <span className="text-xs font-medium tracking-wide text-emerald-400 uppercase">Hazır</span>
        <h1 className="mt-1 text-2xl font-bold text-neutral-100">{generation.prompt}</h1>
        <p className="mt-2 text-sm text-neutral-400">{generation.block_count} blok kullanıldı</p>
      </div>

      <a
        href={packUrl}
        download
        className="rounded-md bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Data Pack İndir (.zip)
      </a>

      <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
        <h2 className="mb-2 font-semibold text-neutral-100">Nasıl kurulur?</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>İndirdiğin zip&apos;i dünyanın <code>datapacks</code> klasörüne koy (dünya kayıt klasörü içinde).</li>
          <li>Oyunda <code>/reload</code> komutunu çalıştır.</li>
          <li>
            Yapıyı inşa etmek için <code>/function {generation.function_id}</code> yaz.
          </li>
        </ol>
      </div>

      <Link href="/generate" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Yeni bir yapı üret
      </Link>
    </main>
  );
}
