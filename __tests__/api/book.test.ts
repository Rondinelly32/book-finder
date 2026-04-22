/**
 * @jest-environment node
 */
import { GET } from '@/app/api/book/[id]/route';
import { NextRequest } from 'next/server';

const mockBook = {
  id: 'abc123', title: 'Duna', authors: ['Frank Herbert'], description: '',
  categories: ['Science Fiction'], pageCount: 412, language: 'pt',
  publisher: 'Aleph', publishedDate: '2017', thumbnail: '',
  isPortuguese: true, isNational: false,
};

jest.mock('@/lib/google-books', () => ({
  getBook: jest.fn(),
  getSimilarBooks: jest.fn().mockResolvedValue([]),
}));

function makeReq(id: string) {
  return new NextRequest(`http://localhost/api/book/${id}`);
}

describe('GET /api/book/[id]', () => {
  beforeEach(async () => {
    const { getBook } = await import('@/lib/google-books');
    (getBook as jest.Mock).mockResolvedValue(mockBook);
  });

  it('returns book and similar books', async () => {
    const res = await GET(makeReq('abc123'), { params: { id: 'abc123' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.book.title).toBe('Duna');
    expect(body.similar).toEqual([]);
  });

  it('returns 404 when book not found', async () => {
    const { getBook } = await import('@/lib/google-books');
    (getBook as jest.Mock).mockResolvedValueOnce(null);
    const res = await GET(makeReq('bad-id'), { params: { id: 'bad-id' } });
    expect(res.status).toBe(404);
  });
});
