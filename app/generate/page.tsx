import { redirect } from 'next/navigation';
import Link from 'next/link';
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
    <div className="flex flex-1 flex-col bg-[#050807] text-stone-100">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-stone-100">Ne yapmak istersin?</h1>
          <p className="text-sm text-stone-400">
            Bir kategori seç, sonra ne istediğini birkaç cümleyle anlat — AI kavramsal bir görsel üretip
            sana kurulabilir bir Minecraft data pack&apos;i hazırlasın.
          </p>
        </div>
        <GenerateForm />
        <Link href="/history" className="text-sm text-stone-500 hover:text-stone-300">
          Geçmiş üretimlerim →
        </Link>
      </main>
    </div>
  );
}
