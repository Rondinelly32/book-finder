import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { searchOpenLibrary } from '@/lib/open-library';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_QUERIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_INTROS,
  CATEGORY_FAQS,
  CATEGORY_RELATED,
  Category,
} from '@/lib/categories';
import { buildAffiliateLink } from '@/lib/affiliate';
import { generateSlug } from '@/lib/slug';
import AmazonButton from '@/components/AmazonButton';
import JsonLd from '@/components/JsonLd';

export const revalidate = 86400;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br';

export async function generateStaticParams() {
  return CATEGORIES.map(genero => ({ genero }));
}

export async function generateMetadata({ params }: { params: { genero: string } }): Promise<Metadata> {
  const genero = params.genero as Category;
  const label = CATEGORY_LABELS[genero];
  if (!label) return {};

  const description = CATEGORY_DESCRIPTIONS[genero];
  const canonical = `${SITE}/categoria/${genero}`;

  return {
    title: `Melhores Livros de ${label} em Português — Ache um Livro`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: `Melhores Livros de ${label} em Português`,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Ache um Livro',
      locale: 'pt_BR',
    },
  };
}

export default async function CategoriaPage({ params }: { params: { genero: string } }) {
  const genero = params.genero as Category;
  if (!CATEGORIES.includes(genero)) notFound();

  const label = CATEGORY_LABELS[genero];
  const books = await searchOpenLibrary(CATEGORY_QUERIES[genero], 20);
  const intro = CATEGORY_INTROS[genero];
  const faqs = CATEGORY_FAQS[genero];
  const related = CATEGORY_RELATED[genero];
  const canonical = `${SITE}/categoria/${genero}`;
  const year = new Date().getFullYear();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'Ache um Livro',
        url: SITE,
        description: 'Encontre o próximo livro que você vai amar. Recomendações em português com compra na Amazon Brasil.',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/busca?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Ache um Livro',
        url: SITE,
        description: 'Site brasileiro de descoberta de livros com recomendações personalizadas e compra via Amazon Brasil.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: SITE },
          { '@type': 'ListItem', position: 2, name: `Livros de ${label}`, item: canonical },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Melhores Livros de ${label} em Português ${year}`,
        description: CATEGORY_DESCRIPTIONS[genero],
        url: canonical,
        numberOfItems: books.length,
        itemListElement: books.map((book, i) => {
          const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
          const bookUrl = `${SITE}/livro/${book.id}/${slug}`;
          return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Book',
              '@id': bookUrl,
              name: book.title,
              url: bookUrl,
              image: book.thumbnail || undefined,
              author: book.authors[0]
                ? { '@type': 'Person', name: book.authors[0] }
                : undefined,
              inLanguage: 'pt-BR',
              genre: label,
              numberOfPages: book.pageCount > 0 ? book.pageCount : undefined,
              publisher: book.publisher
                ? { '@type': 'Organization', name: book.publisher }
                : undefined,
              offers: {
                '@type': 'Offer',
                url: buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn),
                priceCurrency: 'BRL',
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Amazon Brasil' },
              },
            },
          };
        }),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <Link href="/" itemProp="item" className="hover:text-blue-600 transition-colors">
              <span itemProp="name">Início</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <span itemProp="name" aria-current="page" className="text-gray-700 font-medium">
              Livros de {label}
            </span>
            <meta itemProp="position" content="2" />
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-3">
          Melhores Livros de {label} em Português ({year})
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">{intro}</p>
      </header>

      {/* Book list — server-rendered, semantic ol */}
      <section aria-label={`Lista de livros de ${label}`}>
        <h2 className="text-lg font-semibold mb-5">
          Livros de {label} disponíveis em português
        </h2>

        {books.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">Nenhum livro encontrado.</p>
        ) : (
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {books.map(book => {
              const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
              const affiliateUrl = buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn);
              const altText = `Capa do livro ${book.title}${book.authors[0] ? ` de ${book.authors[0]}` : ''}`;

              return (
                <li key={book.id}>
                  <article
                    className="flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full"
                    itemScope
                    itemType="https://schema.org/Book"
                  >
                    <Link href={`/livro/${book.id}/${slug}`} className="flex-1 p-3" itemProp="url">
                      <div className="relative w-full aspect-[2/3] bg-gray-100 mb-2 rounded overflow-hidden">
                        {book.thumbnail ? (
                          <Image
                            src={book.thumbnail}
                            alt={altText}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                            loading="lazy"
                            itemProp="image"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            Sem capa
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2" itemProp="name">
                        {book.title}
                      </h3>
                      {book.authors[0] && (
                        <p
                          className="text-xs text-gray-500 mt-0.5"
                          itemProp="author"
                          itemScope
                          itemType="https://schema.org/Person"
                        >
                          <span itemProp="name">{book.authors[0]}</span>
                        </p>
                      )}
                      {book.pageCount > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5" itemProp="numberOfPages">
                          {book.pageCount} páginas
                        </p>
                      )}
                      <meta itemProp="inLanguage" content="pt-BR" />
                      <meta itemProp="genre" content={label} />
                    </Link>
                    <div className="p-3 pt-0">
                      <AmazonButton
                        title={book.title}
                        author={book.authors[0] ?? ''}
                        affiliateUrl={affiliateUrl}
                      />
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* FAQ */}
      <section aria-label="Perguntas frequentes" className="mt-14">
        <h2 className="text-lg font-semibold mb-6">
          Perguntas frequentes sobre livros de {label}
        </h2>
        <dl className="space-y-6">
          {faqs.map(faq => (
            <div key={faq.q}>
              <dt className="font-medium text-sm text-gray-900 mb-1">{faq.q}</dt>
              <dd className="text-sm text-gray-600 leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related categories */}
      <nav aria-label="Categorias relacionadas" className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Categorias relacionadas
        </h2>
        <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
          {related.map(cat => (
            <li key={cat}>
              <Link
                href={`/categoria/${cat}`}
                className="border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
