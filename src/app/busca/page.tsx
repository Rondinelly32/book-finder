'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Book, Filters } from '@/types/book';
import { applyFilters } from '@/lib/filters';
import SearchBar from '@/components/SearchBar';
import BookGrid from '@/components/BookGrid';
import FilterSidebar from '@/components/FilterSidebar';

const DEFAULT_FILTERS: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => setBooks(data.books ?? []))
      .finally(() => setLoading(false));
  }, [q]);

  const filtered = applyFilters(books, filters);

  return (
    <div>
      <div className="mb-8">
        <SearchBar defaultValue={q} />
      </div>

      {q && (
        <p className="text-xs text-stone-400 mb-8 text-center">
          {loading
            ? 'Buscando...'
            : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${q}"`}
        </p>
      )}

      {!q && (
        <div className="text-center py-24 text-stone-400">
          <p className="text-sm">Digite algo para buscar livros.</p>
        </div>
      )}

      {q && (
        <div className="flex gap-10">
          <FilterSidebar filters={filters} onChange={setFilters} />
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-stone-100 rounded-xl aspect-[2/3] animate-pulse" />
                ))}
              </div>
            ) : (
              <BookGrid books={filtered} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 text-stone-400 text-sm">Carregando...</div>
    }>
      <SearchResults />
    </Suspense>
  );
}
