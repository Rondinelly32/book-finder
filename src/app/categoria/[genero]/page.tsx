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
  CATEGORY_THEMES,
  CATEGORY_HERO_COLOR,
  Category,
} from '@/lib/categories';
import { buildAffiliateLink } from '@/lib/affiliate';
import { generateSlug } from '@/lib/slug';
import AmazonButton from '@/components/AmazonButton';
import JsonLd from '@/components/JsonLd';

export const revalidate = 86400;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://proximolivro.com.br';

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
    title: `Melhores Livros de ${label} em Português — próximolivro`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: `Melhores Livros de ${label} em Português`,
      description,
      url: canonical,
      type: 'website',
      siteName: 'próximolivro',
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
  const themes = CATEGORY_THEMES[genero];
  const heroColor = CATEGORY_HERO_COLOR[genero];
  const canonical = `${SITE}/categoria/${genero}`;
  const year = new Date().getFullYear();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
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
              author: book.authors[0] ? { '@type': 'Person', name: book.authors[0] } : undefined,
              inLanguage: 'pt-BR',
              genre: label,
              numberOfPages: book.pageCount > 0 ? book.pageCount : undefined,
              publisher: book.publisher ? { '@type': 'Organization', name: book.publisher } : undefined,
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

  // Cover collage images for hero (first 6 books with covers)
  const coverBooks = books.filter(b => b.thumbnail).slice(0, 6);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav aria-label="Navegação estrutural" className="mb-8 text-xs text-stone-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-700 transition-colors">Início</Link>
        <span>/</span>
        <span className="text-stone-600 font-medium">{label}</span>
      </nav>

      {/* ── Hero ── */}
      <header className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 mb-14 items-start">
        {/* Left */}
        <div className="py-4">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: heroColor.label }}
          >
            Categoria
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-stone-900 mb-5 text-balance leading-[1.05]">
            {label}
          </h1>
          <p className="text-stone-500 text-[15px] leading-relaxed max-w-sm mb-8">
            {intro.split('. ').slice(0, 2).join('. ')}.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="#livros"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Explorar livros
            </a>
            <a
              href="#temas"
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Ver temas
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right: cover collage */}
        <div
          className="relative h-64 lg:h-80 rounded-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${heroColor.from}, ${heroColor.to})` }}
        >
          {/* Book cover collage */}
          {coverBooks.length >= 3 && (
            <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-80">
              {coverBooks.slice(0, 6).map(book => (
                <div key={book.id} className="relative overflow-hidden">
                  <Image
                    src={book.thumbnail!}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="140px"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${heroColor.from}60, ${heroColor.to}90)` }} />
          {/* Stats card */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm px-4 py-3 text-right">
            <p className="text-[11px] text-stone-400 mb-0.5">Livros encontrados</p>
            <p className="text-2xl font-bold text-stone-900 leading-none">{books.length}</p>
            <p className="text-[10px] text-stone-400 mt-1">títulos encontrados</p>
          </div>
        </div>
      </header>

      {/* ── Explorar por tema ── */}
      <section id="temas" className="mb-14" aria-label="Temas desta categoria">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-stone-900">Explorar por tema</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <Link
              key={theme}
              href={`/busca?q=${encodeURIComponent(`${label} ${theme}`)}`}
              className="flex items-center gap-2 border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 rounded-lg px-4 py-2.5 text-sm text-stone-700 transition-colors"
            >
              <span className="text-stone-400">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </span>
              {theme}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Livros ── */}
      <section id="livros" aria-label={`Lista de livros de ${label}`} className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-stone-900">
            Livros de {label}
          </h2>
          <span className="text-xs text-stone-400">{books.length} títulos</span>
        </div>

        {books.length === 0 ? (
          <p className="text-stone-400 text-sm py-12 text-center">Nenhum livro encontrado.</p>
        ) : (
          <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 list-none p-0 m-0">
            {books.map(book => {
              const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
              const affiliateUrl = buildAffiliateLink(book.title, book.authors[0] ?? '', book.isbn);

              return (
                <li key={book.id}>
                  <article
                    className="group flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all duration-200 h-full"
                    itemScope
                    itemType="https://schema.org/Book"
                  >
                    <Link href={`/livro/${book.id}/${slug}`} className="block p-3 pb-2 flex-1" itemProp="url">
                      <div className="relative w-full aspect-[2/3] bg-stone-100 rounded-lg overflow-hidden mb-3">
                        {book.thumbnail ? (
                          <Image
                            src={book.thumbnail}
                            alt={`Capa de ${book.title}${book.authors[0] ? ` de ${book.authors[0]}` : ''}`}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                            loading="lazy"
                            itemProp="image"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs">
                            Sem capa
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-[13px] leading-snug text-stone-900 line-clamp-2 mb-0.5" itemProp="name">
                        {book.title}
                      </h3>
                      {book.authors[0] && (
                        <p className="text-[12px] text-stone-500 truncate" itemProp="author">
                          {book.authors[0]}
                        </p>
                      )}
                      {book.pageCount > 0 && (
                        <p className="text-[11px] text-stone-400 mt-0.5">{book.pageCount} pág.</p>
                      )}
                      <meta itemProp="inLanguage" content="pt-BR" />
                      <meta itemProp="genre" content={label} />
                    </Link>
                    <div className="px-3 pb-3 mt-auto">
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

      {/* ── About ── */}
      <section className="mb-14 bg-white border border-stone-200 rounded-2xl p-8">
        <h2 className="text-base font-semibold text-stone-900 mb-4">Sobre livros de {label}</h2>
        <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">{intro}</p>
      </section>

      {/* ── FAQ ── */}
      <section aria-label="Perguntas frequentes" className="mb-14">
        <h2 className="text-base font-semibold text-stone-900 mb-6">
          Perguntas frequentes
        </h2>
        <dl className="divide-y divide-stone-100">
          {faqs.map(faq => (
            <div key={faq.q} className="py-5">
              <dt className="text-sm font-medium text-stone-900 mb-2">{faq.q}</dt>
              <dd className="text-sm text-stone-500 leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Related ── */}
      <nav aria-label="Categorias relacionadas" className="pt-8 border-t border-stone-100">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
          Categorias relacionadas
        </p>
        <div className="flex flex-wrap gap-2">
          {related.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="border border-stone-200 rounded-full px-4 py-1.5 text-sm text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
