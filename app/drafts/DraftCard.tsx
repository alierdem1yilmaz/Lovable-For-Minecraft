'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  structure: 'Yapı',
  weapon: 'Silah',
  tool: 'Alet',
  item: 'Eşya',
};

export interface DraftSummary {
  id: string;
  content_type: string;
  prompt: string;
  created_at: string;
}

export function DraftCard({ draft }: { draft: DraftSummary }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/drafts?id=${draft.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-none border-2 border-stone-800 bg-stone-950/80 p-4 backdrop-blur-sm">
      <a href={`/generate?draft=${draft.id}`} className="min-w-0 flex-1 hover:opacity-80">
        <p className="text-xs font-bold tracking-wide text-[#ff8a63]">{CONTENT_TYPE_LABELS[draft.content_type] ?? draft.content_type}</p>
        <p className="mt-0.5 truncate font-medium text-stone-100">{draft.prompt}</p>
        <p className="mt-1 text-xs text-stone-500">{new Date(draft.created_at).toLocaleString('tr-TR')}</p>
      </a>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded-none border-2 border-stone-700 px-3 py-2 text-xs font-semibold text-stone-400 transition hover:border-red-800 hover:text-red-400 disabled:opacity-50"
      >
        {deleting ? '...' : 'Sil'}
      </button>
    </li>
  );
}
