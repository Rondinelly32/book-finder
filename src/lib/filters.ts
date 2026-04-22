import { Book, Filters } from '@/types/book';

export function applyFilters(books: Book[], filters: Filters): Book[] {
  return books.filter(book => {
    if (filters.pageRange === 'curto' && book.pageCount >= 200) return false;
    if (filters.pageRange === 'medio' && (book.pageCount < 200 || book.pageCount > 400)) return false;
    if (filters.pageRange === 'longo' && book.pageCount <= 400) return false;
    if (filters.origem === 'nacional' && !book.isNational) return false;
    if (filters.origem === 'internacional' && book.isNational) return false;
    if (filters.portugues && !book.isPortuguese) return false;
    return true;
  });
}
