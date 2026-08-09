import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createSignedDownloadUrl } from '@/lib/storage';

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
    .eq('user_id', user.id)
    .single();

  if (!generation) {
    notFound();
  }

  const [packUrl, imageUrl] = await Promise.all([
    createSignedDownloadUrl(generation.pack_path),
    createSignedDownloadUrl(generation.image_path),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div>
        <span className="text-xs font-medium tracking-wide text-emerald-400 uppercase">Hazır</span>
        <h1 className="mt-1 text-2xl font-bold text-neutral-100">{generation.prompt}</h1>
        {generation.content_type === 'structure' && (
          <p className="mt-2 text-sm text-neutral-400">{generation.block_count} blok kullanıldı</p>
        )}
        {generation.pipeline === 'image3d' && (
          <span className="mt-2 inline-block rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
            AI görsel + 3D rekonstrüksiyon (Gaussian Splatting) ile üretildi
          </span>
        )}
      </div>

      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={`${generation.prompt} kavram görseli`}
          className="w-full rounded-md border border-neutral-800"
        />
      )}

      {packUrl && (
        <a
          href={packUrl}
          download
          className="rounded-md bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Data Pack İndir (.zip)
        </a>
      )}

      {(generation.glb_url || generation.splat_url) && (
        <div className="flex gap-3 text-sm">
          {generation.glb_url && (
            <a
              href={generation.glb_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-md border border-neutral-700 px-4 py-2 text-center text-neutral-300 hover:border-neutral-500"
            >
              3D Model (.glb)
            </a>
          )}
          {generation.splat_url && (
            <a
              href={generation.splat_url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-md border border-neutral-700 px-4 py-2 text-center text-neutral-300 hover:border-neutral-500"
            >
              Gaussian Splat (.ply)
            </a>
          )}
        </div>
      )}

      <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
        <h2 className="mb-2 font-semibold text-neutral-100">Nasıl kurulur?</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>İndirdiğin zip&apos;i dünyanın <code>datapacks</code> klasörüne koy (dünya kayıt klasörü içinde).</li>
          <li>Oyunda <code>/reload</code> komutunu çalıştır.</li>
          <li>
            {generation.content_type === 'structure' ? (
              <>
                Yapıyı inşa etmek için <code>/function {generation.function_id}</code> yaz.
              </>
            ) : (
              <>
                İcadını envanterine almak için <code>/function {generation.function_id}</code> yaz.
              </>
            )}
          </li>
        </ol>
      </div>

      <Link href="/generate" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Yeni bir icat üret
      </Link>
    </main>
  );
}
