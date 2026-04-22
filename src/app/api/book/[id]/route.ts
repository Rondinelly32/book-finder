import { NextRequest, NextResponse } from 'next/server';
import { getBook, getSimilarBooks } from '@/lib/google-books';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const book = await getBook(params.id);
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  const similar = await getSimilarBooks(book);
  return NextResponse.json({ book, similar });
}
