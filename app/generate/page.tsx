import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { GenerateForm } from './GenerateForm';

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#050807] text-stone-100">
      <div className="absolute inset-0">
        <Image
          src="/images/generate-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_35%] opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050807]/70 via-[#050807]/80 to-[#050807]" />
        <div className="absolute inset-0 bg-[#050807]/40" />
      </div>

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-stone-50">Ne yapmak istersin?</h1>
          <p className="text-sm text-stone-300/90">
            Bir kategori seç, sonra ne istediğini birkaç cümleyle anlat — AI kavramsal bir görsel üretip
            sana kurulabilir bir Minecraft data pack&apos;i hazırlasın.
          </p>
        </div>
        <GenerateForm />
        <Link href="/history" className="text-sm text-stone-400 hover:text-stone-200">
          Geçmiş üretimlerim →
        </Link>
      </main>
    </div>
  );
}
