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
    <section className="mt-14 pt-10 border-t border-stone-200">
      <h2 className="text-base font-semibold text-stone-900 mb-6">Você também pode gostar</h2>
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
        {books.map(book => {
          const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
          return (
            <Link
              key={book.id}
              href={`/livro/${book.id}/${slug}`}
              className="shrink-0 w-28 group"
            >
              <div className="relative w-28 h-40 bg-stone-100 rounded-lg overflow-hidden mb-2">
                {book.thumbnail ? (
                  <Image
                    src={book.thumbnail}
                    alt={`Capa de ${book.title}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="112px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs text-center p-2">
                    Sem capa
                  </div>
                )}
              </div>
              <p className="text-[12px] font-medium text-stone-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                {book.title}
              </p>
              {book.authors[0] && (
                <p className="text-[11px] text-stone-400 mt-0.5 truncate">{book.authors[0]}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
