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
      <div className="mb-6"><SearchBar defaultValue={q} /></div>
      {q && (
        <p className="text-sm text-gray-500 mb-6">
          {loading ? 'Buscando...' : `${filtered.length} resultado(s) para "${q}"`}
        </p>
      )}
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div className="flex-1">
          {loading
            ? <div className="text-center py-16 text-gray-400">Carregando livros...</div>
            : <BookGrid books={filtered} />
          }
        </div>
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Carregando...</div>}>
      <SearchResults />
    </Suspense>
  );
}
