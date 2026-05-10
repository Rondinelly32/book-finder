'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NavSearch() {
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        ref.current?.focus();
      }
      if (e.key === 'Escape') ref.current?.blur();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden sm:block">
      <div className="flex items-center gap-2 border border-stone-200 bg-white rounded-lg px-3 py-1.5 text-sm text-stone-500 cursor-text hover:border-stone-300 transition-colors w-56">
        <svg className="w-3.5 h-3.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar livros..."
          className="flex-1 bg-transparent outline-none placeholder-stone-400 text-stone-700 text-[13px] min-w-0"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-stone-300 font-mono">
          <span>⌘</span><span>K</span>
        </kbd>
      </div>
    </form>
  );
}
