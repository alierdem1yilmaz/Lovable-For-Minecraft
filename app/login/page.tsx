'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-2 text-2xl font-bold">Giriş Yap</h1>
      <p className="mb-6 text-sm text-neutral-400">
        E-postana bir giriş linki gönderelim, şifre gerekmiyor.
      </p>

      {status === 'sent' ? (
        <p className="rounded-md bg-emerald-950 p-4 text-sm text-emerald-300">
          Giriş linkini <strong>{email}</strong> adresine gönderdik. Gelen kutunu kontrol et.
        </p>
      ) : (
        <form onSubmit={handleSignIn} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {status === 'loading' ? 'Gönderiliyor...' : 'Giriş Linki Gönder'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-red-400">Bir şeyler ters gitti, tekrar dene.</p>
          )}
        </form>
      )}
    </main>
  );
}
