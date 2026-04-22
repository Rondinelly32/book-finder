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
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition-colors text-sm"
      >
        Buscar
      </button>
    </form>
  );
}
