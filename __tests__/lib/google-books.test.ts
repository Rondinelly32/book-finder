import { parseVolume, searchBooks, getBook, getSimilarBooks } from '@/lib/google-books';

const mockVolume = {
  id: 'abc123',
  volumeInfo: {
    title: 'Duna',
    authors: ['Frank Herbert'],
    description: 'Uma história épica.',
    categories: ['Fiction / Science Fiction'],
    pageCount: 412,
    language: 'pt',
    publisher: 'Aleph',
    publishedDate: '2017',
    imageLinks: { thumbnail: 'http://books.google.com/books/content?id=abc123' },
  },
};

describe('parseVolume', () => {
  it('maps volume to Book interface', () => {
    const book = parseVolume(mockVolume);
    expect(book.id).toBe('abc123');
    expect(book.title).toBe('Duna');
    expect(book.authors).toEqual(['Frank Herbert']);
    expect(book.pageCount).toBe(412);
    expect(book.isPortuguese).toBe(true);
  });

  it('upgrades thumbnail from http to https', () => {
    expect(parseVolume(mockVolume).thumbnail).toContain('https://');
  });

  it('sets isNational true for known Brazilian publishers', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, publisher: 'Companhia das Letras' } };
    expect(parseVolume(vol).isNational).toBe(true);
  });

  it('sets isNational false for non-Brazilian publishers', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, publisher: 'Penguin Books' } };
    expect(parseVolume(vol).isNational).toBe(false);
  });

  it('returns empty string for missing thumbnail', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, imageLinks: undefined } };
    expect(parseVolume(vol).thumbnail).toBe('');
  });

  it('returns empty array for missing authors', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, authors: undefined } };
    expect(parseVolume(vol).authors).toEqual([]);
  });
});

describe('searchBooks', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [mockVolume], totalItems: 1 }),
    } as unknown as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls Google Books API with the query', async () => {
    await searchBooks('Duna');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('Duna'), expect.anything());
  });

  it('returns parsed books', async () => {
    const result = await searchBooks('Duna');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Duna');
  });

  it('returns empty array when no items', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ totalItems: 0 }) });
    expect(await searchBooks('xyz')).toEqual([]);
  });
});

describe('getBook', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVolume,
    } as unknown as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  it('fetches a single book by ID', async () => {
    const book = await getBook('abc123');
    expect(book?.id).toBe('abc123');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('abc123'), expect.anything());
  });

  it('returns null when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    expect(await getBook('bad-id')).toBeNull();
  });
});

describe('getSimilarBooks', () => {
  it('returns empty array when book has no categories', async () => {
    const book = parseVolume({ ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, categories: [] } });
    expect(await getSimilarBooks(book)).toEqual([]);
  });
});
