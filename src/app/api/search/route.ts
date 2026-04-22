import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/google-books';
import { applyFilters } from '@/lib/filters';
import { Filters } from '@/types/book';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'Missing required param: q' }, { status: 400 });

  const genre = searchParams.get('genre') ?? '';
  const query = genre ? `${q} subject:${genre}` : q;
  const books = await searchBooks(query);

  const filters: Filters = {
    genre,
    pageRange: (searchParams.get('pages') as Filters['pageRange']) ?? 'all',
    origem: (searchParams.get('origem') as Filters['origem']) ?? 'all',
    portugues: searchParams.get('portugues') === 'true',
  };

  const filtered = applyFilters(books, filters);
  return NextResponse.json({ books: filtered, total: filtered.length });
}
