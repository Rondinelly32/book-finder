import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/book';
import { generateSlug } from '@/lib/slug';

interface Props {
  books: Book[];
}

export default function SimilarBooks({ books }: Props) {
  if (books.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Livros Parecidos</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {books.map(book => {
          const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
          return (
            <Link key={book.id} href={`/livro/${book.id}/${slug}`} className="shrink-0 w-28 group">
              <div className="relative w-28 h-40 bg-gray-100 rounded overflow-hidden mb-1">
                {book.thumbnail ? (
                  <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-1">Sem capa</div>
                )}
              </div>
              <p className="text-xs font-medium line-clamp-2 group-hover:text-blue-600">{book.title}</p>
              <p className="text-xs text-gray-400">{book.authors[0]}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
