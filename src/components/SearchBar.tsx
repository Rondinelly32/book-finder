'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Buscar por título, autor ou gênero...',
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-xl mx-auto">
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
      >
        Buscar
      </button>
    </form>
  );
}
