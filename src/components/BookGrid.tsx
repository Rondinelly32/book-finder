import { Book } from '@/types/book';
import { buildAffiliateLink } from '@/lib/affiliate';
import BookCard from './BookCard';

interface Props {
  books: Book[];
}

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400">
        <p className="text-sm">Nenhum livro encontrado.</p>
        <p className="text-xs mt-1">Tente outros termos ou remova alguns filtros.</p>
      </div>
    );
  }

  return (
    <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
      {books.map(book => (
        <li key={book.id}>
          <BookCard
            book={book}
            affiliateUrl={buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn)}
          />
        </li>
      ))}
    </ol>
  );
}
