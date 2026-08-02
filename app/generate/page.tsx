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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-neutral-100">Yapını Tarif Et</h1>
        <p className="text-sm text-neutral-400">
          Ne inşa etmek istediğini birkaç cümleyle anlat, AI blok blok tasarlayıp sana bir Minecraft
          data pack&apos;i olarak hazırlasın.
        </p>
      </div>
      <GenerateForm />
      <Link href="/history" className="text-sm text-neutral-500 hover:text-neutral-300">
        Geçmiş üretimlerim →
      </Link>
    </main>
  );
}
