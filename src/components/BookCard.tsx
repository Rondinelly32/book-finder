import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/book';
import { generateSlug } from '@/lib/slug';
import AmazonButton from './AmazonButton';

interface Props {
  book: Book;
  affiliateUrl: string;
}

export default function BookCard({ book, affiliateUrl }: Props) {
  const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);

  return (
    <article className="group flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all duration-200">
      <Link href={`/livro/${book.id}/${slug}`} className="block p-4 pb-3">
        {/* Cover */}
        <div className="relative w-full aspect-[2/3] bg-stone-100 rounded-lg overflow-hidden mb-4">
          {book.thumbnail ? (
            <Image
              src={book.thumbnail}
              alt={`Capa do livro ${book.title}${book.authors[0] ? ` de ${book.authors[0]}` : ''}`}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-stone-300 text-xs text-center px-3">Sem capa</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <h3 className="font-semibold text-[13px] leading-snug text-stone-900 line-clamp-2 mb-1">
          {book.title}
        </h3>
        {book.authors[0] && (
          <p className="text-[12px] text-stone-500 truncate">{book.authors[0]}</p>
        )}
        {book.pageCount > 0 && (
          <p className="text-[11px] text-stone-400 mt-0.5">{book.pageCount} pág.</p>
        )}
      </Link>

      <div className="px-4 pb-4 mt-auto">
        <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
      </div>
    </article>
  );
}
