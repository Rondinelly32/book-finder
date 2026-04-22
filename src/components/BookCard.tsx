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
    <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/livro/${book.id}/${slug}`} className="flex-1 p-3">
        <div className="relative w-full aspect-[2/3] bg-gray-100 mb-2 rounded overflow-hidden">
          {book.thumbnail ? (
            <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="200px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Sem capa</div>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{book.authors[0]}</p>
        <p className="text-xs text-gray-400 mt-0.5">{book.pageCount} páginas</p>
      </Link>
      <div className="p-3 pt-0">
        <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
      </div>
    </div>
  );
}
