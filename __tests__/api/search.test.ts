/**
 * @jest-environment node
 */
import { GET } from '@/app/api/search/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/google-books', () => ({
  searchBooks: jest.fn().mockResolvedValue([{
    id: '1', title: 'Duna', authors: ['Frank Herbert'], description: '',
    categories: ['Science Fiction'], pageCount: 412, language: 'pt',
    publisher: 'Aleph', publishedDate: '2017', thumbnail: '',
    isPortuguese: true, isNational: false,
  }]),
}));

jest.mock('@/lib/filters', () => ({
  applyFilters: jest.fn((books: unknown[]) => books),
}));

function makeReq(params: Record<string, string>) {
  const url = new URL('http://localhost/api/search');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/search', () => {
  it('returns 400 when q param is missing', async () => {
    const res = await GET(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns books for valid query', async () => {
    const res = await GET(makeReq({ q: 'Duna' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.books).toHaveLength(1);
    expect(body.books[0].title).toBe('Duna');
  });

  it('includes total count in response', async () => {
    const res = await GET(makeReq({ q: 'Duna' }));
    const body = await res.json();
    expect(body.total).toBe(1);
  });
});
