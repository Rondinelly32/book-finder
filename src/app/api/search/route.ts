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
  const portugues = searchParams.get('portugues') === 'true';
  const books = await searchBooks(query, 20, portugues ? 'pt' : undefined);

  const validPageRanges: Filters['pageRange'][] = ['all', 'curto', 'medio', 'longo'];
  const validOrigens: Filters['origem'][] = ['all', 'nacional', 'internacional'];
  const rawPageRange = searchParams.get('pages') ?? 'all';
  const rawOrigem = searchParams.get('origem') ?? 'all';

  const filters: Filters = {
    genre,
    pageRange: (validPageRanges as string[]).includes(rawPageRange)
      ? (rawPageRange as Filters['pageRange'])
      : 'all',
    origem: (validOrigens as string[]).includes(rawOrigem)
      ? (rawOrigem as Filters['origem'])
      : 'all',
    portugues,
  };

  const filtered = applyFilters(books, filters);
  return NextResponse.json({ books: filtered, total: filtered.length });
}
