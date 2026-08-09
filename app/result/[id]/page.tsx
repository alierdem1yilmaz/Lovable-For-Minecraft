import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Silkscreen } from 'next/font/google';
import { createClient } from '@/lib/supabase/server';
import { createSignedDownloadUrl } from '@/lib/storage';

const pixelify = Silkscreen({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-pixelify',
});

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

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div>
          <span className="text-xs font-medium tracking-wide text-emerald-400 uppercase">Hazır</span>
          <h1 className="mt-1 text-2xl font-bold tracking-wide text-stone-50" style={{ fontFamily: 'var(--font-pixelify)' }}>
            {generation.prompt}
          </h1>
          {generation.content_type === 'structure' && (
            <p className="mt-2 text-sm text-stone-300/90">{generation.block_count} blok kullanıldı</p>
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
            className="w-full rounded-none border-2 border-stone-800"
          />
        )}

        {packUrl && (
          <a
            href={packUrl}
            download
            className="rounded-none bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-[inset_2px_2px_0_rgba(255,255,255,0.15),inset_-2px_-2px_0_rgba(0,0,0,0.45)] hover:bg-emerald-500"
          >
            {generation.platform === 'bedrock' ? 'Add-On İndir (.mcaddon)' : 'Data Pack İndir (.zip)'}
          </a>
        )}

        {(generation.glb_url || generation.splat_url) && (
          <div className="flex gap-3 text-sm">
            {generation.glb_url && (
              <a
                href={generation.glb_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-none border-2 border-stone-700 px-4 py-2 text-center text-stone-300 hover:border-stone-500"
              >
                3D Model (.glb)
              </a>
            )}
            {generation.splat_url && (
              <a
                href={generation.splat_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-none border-2 border-stone-700 px-4 py-2 text-center text-stone-300 hover:border-stone-500"
              >
                Gaussian Splat (.ply)
              </a>
            )}
          </div>
        )}

        <div className="rounded-none border-2 border-stone-800 bg-stone-950/80 p-4 text-sm text-stone-300 backdrop-blur-sm">
          <h2 className="mb-2 tracking-wide text-stone-100" style={{ fontFamily: 'var(--font-pixelify)' }}>
            Nasıl kurulur?
          </h2>
          <ol className="list-decimal space-y-1 pl-5">
            {generation.platform === 'bedrock' ? (
              <>
                <li>İndirdiğin <code>.mcaddon</code> dosyasının üzerine çift tıkla — Minecraft otomatik olarak içe aktarır.</li>
                <li>
                  Dünyanı düzenle → <strong>Davranış Paketleri</strong> ve <strong>Kaynak Paketleri</strong> sekmelerinden bu paketi
                  etkinleştir.
                </li>
              </>
            ) : (
              <>
                <li>İndirdiğin zip&apos;i dünyanın <code>datapacks</code> klasörüne koy (dünya kayıt klasörü içinde).</li>
                <li>Oyunda <code>/reload</code> komutunu çalıştır.</li>
              </>
            )}
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

        <Link href="/generate" className="text-sm text-stone-400 hover:text-stone-200">
          ← Yeni bir icat üret
        </Link>
      </main>
    </div>
  );
}
