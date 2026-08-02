import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-950 text-neutral-100">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <span className="rounded-full border border-emerald-800 bg-emerald-950 px-4 py-1 text-xs font-medium tracking-wide text-emerald-300 uppercase">
          Minecraft Java Edition için
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Yapını yaz, <span className="text-emerald-400">saniyeler içinde</span> Minecraft&apos;a getir
        </h1>

        <p className="max-w-xl text-lg text-neutral-400">
          Aklındaki yapıyı birkaç cümleyle anlat — yapay zeka bir kavram görseli çizsin ve
          Minecraft dünyana direkt kurabileceğin, gerçekten çalışan bir data pack üretsin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/generate"
            className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Yapı Üretmeye Başla
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 hover:border-neutral-500"
          >
            Giriş Yap
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Metinden Yapıya"
            desc="'Küçük taş bir gözetleme kulesi' gibi bir açıklama yaz, AI blok blok yerleşimi tasarlasın."
          />
          <FeatureCard
            title="Kavram Görseli"
            desc="Yapı üretilmeden önce nasıl görüneceğine dair bir önizleme görseli oluşturulur."
          />
          <FeatureCard
            title="Kullanılabilir Çıktı"
            desc="İndirdiğin data pack'i dünyana koy, /reload yap, /function ile yapıyı anında inşa et."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 text-left">
      <h3 className="mb-2 font-semibold text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-400">{desc}</p>
    </div>
  );
}
