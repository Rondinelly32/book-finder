import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import NavSearch from '@/components/NavSearch';
import JsonLd from '@/components/JsonLd';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br';

const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Ache um Livro',
      url: SITE,
      description: 'Descubra o próximo livro que você vai amar. Recomendações personalizadas em português com compra na Amazon Brasil.',
      inLanguage: 'pt-BR',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/busca?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Ache um Livro',
      url: SITE,
      description: 'Site brasileiro de descoberta e recomendação de livros em português, com compra via Amazon Brasil.',
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Ache um Livro — Encontre o Livro Perfeito para Você',
    template: '%s | Ache um Livro',
  },
  description: 'Descubra o próximo livro que você vai amar. Recomendações personalizadas em português com compra na Amazon Brasil.',
  openGraph: { siteName: 'Ache um Livro', locale: 'pt_BR', type: 'website' },
};

const NAV_LINKS = [
  { href: '/', label: 'Descobrir' },
  { href: '/categoria/suspense', label: 'Suspense' },
  { href: '/categoria/romance', label: 'Romance' },
  { href: '/categoria/historia', label: 'História' },
  { href: '/categoria/fantasia', label: 'Fantasia' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <JsonLd data={SITE_JSON_LD} />

        {/* Nav */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-200">
          <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-semibold text-[15px] tracking-tight text-stone-900 group-hover:text-blue-600 transition-colors">
                Ache um Livro
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 text-[13px] text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right: search */}
            <div className="ml-auto">
              <NavSearch />
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-stone-200 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <p className="font-medium text-stone-500">Ache um Livro</p>
            <p>Participante do Programa de Afiliados da Amazon Brasil. Os preços são definidos pela Amazon.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
