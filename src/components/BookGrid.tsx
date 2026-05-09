import { Book } from '@/types/book';
import { buildAffiliateLink } from '@/lib/affiliate';
import BookCard from './BookCard';

interface Props {
  books: Book[];
}

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Nenhum livro encontrado.</p>
        <p className="text-sm mt-1">Tente outros termos ou remova alguns filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          affiliateUrl={buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn)}
        />
      ))}
    </div>
  );
}
