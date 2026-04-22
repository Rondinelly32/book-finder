import { applyFilters } from '@/lib/filters';
import { Book, Filters } from '@/types/book';

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: '1', title: 'Test', authors: ['Author'], description: '',
  categories: ['Fiction'], pageCount: 300, language: 'pt',
  publisher: 'Publisher', publishedDate: '2020', thumbnail: '',
  isPortuguese: true, isNational: false, ...overrides,
});

const none: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

describe('applyFilters', () => {
  it('returns all books when no filters applied', () => {
    expect(applyFilters([makeBook(), makeBook({ id: '2' })], none)).toHaveLength(2);
  });

  it('filters curto books (pageCount < 200)', () => {
    const books = [makeBook({ pageCount: 150 }), makeBook({ pageCount: 300 })];
    const result = applyFilters(books, { ...none, pageRange: 'curto' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(150);
  });

  it('filters medio books (200–400 pages)', () => {
    const books = [makeBook({ pageCount: 150 }), makeBook({ pageCount: 300 }), makeBook({ pageCount: 500 })];
    const result = applyFilters(books, { ...none, pageRange: 'medio' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(300);
  });

  it('filters longo books (pageCount > 400)', () => {
    const books = [makeBook({ pageCount: 300 }), makeBook({ pageCount: 500 })];
    const result = applyFilters(books, { ...none, pageRange: 'longo' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(500);
  });

  it('filters nacional books', () => {
    const books = [makeBook({ isNational: true }), makeBook({ isNational: false })];
    expect(applyFilters(books, { ...none, origem: 'nacional' })).toHaveLength(1);
  });

  it('filters internacional books', () => {
    const books = [makeBook({ isNational: true }), makeBook({ isNational: false })];
    expect(applyFilters(books, { ...none, origem: 'internacional' })).toHaveLength(1);
  });

  it('filters books available in Portuguese', () => {
    const books = [makeBook({ isPortuguese: true }), makeBook({ isPortuguese: false })];
    const result = applyFilters(books, { ...none, portugues: true });
    expect(result).toHaveLength(1);
    expect(result[0].isPortuguese).toBe(true);
  });

  it('applies multiple filters together', () => {
    const books = [
      makeBook({ pageCount: 150, isNational: true, isPortuguese: true }),
      makeBook({ pageCount: 150, isNational: false, isPortuguese: true }),
      makeBook({ pageCount: 300, isNational: true, isPortuguese: true }),
    ];
    const result = applyFilters(books, { ...none, pageRange: 'curto', origem: 'nacional', portugues: true });
    expect(result).toHaveLength(1);
  });
});
