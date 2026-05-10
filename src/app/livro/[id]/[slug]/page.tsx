import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOpenLibraryBook } from '@/lib/open-library';
import { getSimilarBooks } from '@/lib/google-books';
import { buildAffiliateLink } from '@/lib/affiliate';
import AmazonButton from '@/components/AmazonButton';
import SimilarBooks from '@/components/SimilarBooks';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const olKey = params.id.startsWith('ol-') ? params.id.slice(3) : params.id;
  const book = await getOpenLibraryBook(olKey);
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
  const olKey = params.id.startsWith('ol-') ? params.id.slice(3) : params.id;
  const book = await getOpenLibraryBook(olKey);
  if (!book) notFound();

  const similar = await getSimilarBooks(book);
  const affiliateUrl = buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn);

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
    inLanguage: 'pt-BR',
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

      {/* Breadcrumb */}
      <nav aria-label="Navegação estrutural" className="mb-10 text-xs text-stone-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-700 transition-colors">Início</Link>
        <span>/</span>
        <span className="text-stone-600">{book.title}</span>
      </nav>

      {/* Book detail */}
      <div className="flex flex-col sm:flex-row gap-10 lg:gap-16">
        {/* Cover */}
        <div className="shrink-0">
          <div className="relative w-44 sm:w-52 aspect-[2/3] bg-stone-100 rounded-xl overflow-hidden shadow-sm">
            {book.thumbnail ? (
              <Image
                src={book.thumbnail}
                alt={`Capa do livro ${book.title}${book.authors[0] ? ` de ${book.authors[0]}` : ''}`}
                fill
                className="object-cover"
                sizes="220px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
                Sem capa
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-2 text-balance">
            {book.title}
          </h1>

          {book.authors.length > 0 && (
            <p className="text-base text-stone-500 mb-5">{book.authors.join(', ')}</p>
          )}

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {book.pageCount > 0 && (
              <span className="inline-flex items-center text-xs text-stone-500 bg-stone-100 rounded-full px-3 py-1">
                {book.pageCount} páginas
              </span>
            )}
            {book.publishedDate && (
              <span className="inline-flex items-center text-xs text-stone-500 bg-stone-100 rounded-full px-3 py-1">
                {book.publishedDate.slice(0, 4)}
              </span>
            )}
            {book.publisher && (
              <span className="inline-flex items-center text-xs text-stone-500 bg-stone-100 rounded-full px-3 py-1">
                {book.publisher}
              </span>
            )}
            {book.isPortuguese && (
              <span className="inline-flex items-center text-xs text-blue-700 bg-blue-50 rounded-full px-3 py-1">
                Disponível em português
              </span>
            )}
          </div>

          {book.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-8 max-w-prose">
              {book.description}
            </p>
          )}

          <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
        </div>
      </div>

      <SimilarBooks books={similar} />
    </>
  );
}
