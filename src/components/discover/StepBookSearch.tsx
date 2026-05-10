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
  key: string;
  title: string;
  author_name?: string[];
}

export default function StepBookSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(q: string) {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=key,title,author_name`
      );
      const data = await res.json();
      setResults(data.docs ?? []);
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
      <h2 className="text-xl font-semibold mb-1 text-center">Qual foi o último livro que você leu?</h2>
      <p className="text-gray-500 text-sm text-center mb-6">
        Opcional — ajuda a afinar as recomendações
      </p>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Digite o título ou autor..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading && <p className="text-xs text-gray-400 mt-2 text-center">Buscando...</p>}

      {results.length > 0 && (
        <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
          {results.map(r => {
            const olKey = r.key.replace('/works/', '');
            return (
              <li key={r.key}>
                <button
                  type="button"
                  onClick={() => onSelect({ olKey, title: r.title })}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-medium">{r.title}</p>
                  {r.author_name?.[0] && (
                    <p className="text-xs text-gray-400">{r.author_name[0]}</p>
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
        className="mt-6 w-full text-sm text-gray-500 hover:text-blue-600 underline underline-offset-2"
      >
        Não sei, me ajude a descobrir
      </button>
    </div>
  );
}
