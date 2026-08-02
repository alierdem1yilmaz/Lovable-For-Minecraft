'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function GenerateForm() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Bir şeyler ters gitti');
        setLoading(false);
        return;
      }

      router.push(`/result/${data.id}`);
    } catch {
      setError('Bağlantı hatası, tekrar dener misin?');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        required
        minLength={3}
        rows={4}
        placeholder="Örn: küçük taş bir gözetleme kulesi, üstünde ahşap çatı"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? 'Yapı üretiliyor... (~10-20 saniye)' : 'Yapıyı Üret'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
