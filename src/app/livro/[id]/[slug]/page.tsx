import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBook, getSimilarBooks } from '@/lib/google-books';
import { buildAffiliateLink } from '@/lib/affiliate';
import AmazonButton from '@/components/AmazonButton';
import SimilarBooks from '@/components/SimilarBooks';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await getBook(params.id);
  if (!book) return {};
  const desc = book.description.slice(0, 155) || `Saiba mais sobre "${book.title}" de ${book.authors[0]} e compre na Amazon Brasil.`;
  return {
    title: `${book.title} — ${book.authors[0] ?? ''}`,
    description: desc,
    openGraph: {
      title: book.title,
      description: desc,
      images: book.thumbnail ? [{ url: book.thumbnail }] : [],
    },
  };
}

export default async function LivroPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  if (!book) notFound();

  const similar = await getSimilarBooks(book);
  const affiliateUrl = buildAffiliateLink(book.title, book.authors[0] ?? '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.authors[0] ?? '' },
    numberOfPages: book.pageCount,
    publisher: book.publisher,
    datePublished: book.publishedDate,
    description: book.description,
    image: book.thumbnail,
    inLanguage: book.language,
    offers: {
      '@type': 'Offer',
      url: affiliateUrl,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Amazon Brasil' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="shrink-0">
          <div className="relative w-40 h-56 bg-gray-100 rounded overflow-hidden">
            {book.thumbnail ? (
              <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="160px" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Sem capa</div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
          <p className="text-gray-500 mb-1">{book.authors.join(', ')}</p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
            {book.pageCount > 0 && <span>{book.pageCount} páginas</span>}
            {book.publishedDate && <span>· {book.publishedDate.slice(0, 4)}</span>}
            {book.publisher && <span>· {book.publisher}</span>}
            <span>· {book.isNational ? '🇧🇷 Nacional' : '🌍 Internacional'}</span>
            {book.isPortuguese && <span>· ✅ Disponível em Português</span>}
          </div>
          {book.description && (
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">{book.description}</p>
          )}
          <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
        </div>
      </div>
      <SimilarBooks books={similar} />
    </>
  );
}
