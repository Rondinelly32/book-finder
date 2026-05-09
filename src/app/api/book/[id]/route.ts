import { NextRequest, NextResponse } from 'next/server';
import { getBook, getSimilarBooks } from '@/lib/google-books';
import { getOpenLibraryBook } from '@/lib/open-library';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (params.id.startsWith('ol-')) {
    const olKey = params.id.slice(3);
    const book = await getOpenLibraryBook(olKey);
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    return NextResponse.json({ book, similar: [] });
  }

  const book = await getBook(params.id);
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  const similar = await getSimilarBooks(book);
  return NextResponse.json({ book, similar });
}
