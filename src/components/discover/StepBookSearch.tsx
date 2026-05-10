'use client';

import { useState } from 'react';

interface RefBook {
  olKey: string;
  title: string;
}

interface Props {
  onSelect: (book: RefBook | null) => void;
}

interface SearchResult {
  id: string;
  title: string;
  authors: string[];
}

export default function StepBookSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(q: string) {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      // Use our own API which resolves PT edition titles
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults((data.books ?? []).slice(0, 6));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    search(val);
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold tracking-tight text-stone-900 text-center mb-1">
        Qual foi o último livro que você leu?
      </h2>
      <p className="text-stone-500 text-sm text-center mb-7">
        Opcional — ajuda a personalizar as recomendações
      </p>

      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Título ou autor..."
          className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
          autoFocus
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-1.5 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm divide-y divide-stone-100">
          {results.map(r => {
            // id is "ol-OL12345W" — extract the OL key
            const olKey = r.id.startsWith('ol-') ? r.id.slice(3) : r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ olKey, title: r.title })}
                  className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-900">{r.title}</p>
                  {r.authors[0] && (
                    <p className="text-xs text-stone-400 mt-0.5">{r.authors[0]}</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onSelect(null)}
        className="mt-6 w-full text-sm text-stone-400 hover:text-stone-700 transition-colors py-2"
      >
        Não sei, me ajude a descobrir →
      </button>
    </div>
  );
}
