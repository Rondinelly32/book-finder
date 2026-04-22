import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br'),
  title: {
    default: 'Ache um Livro — Encontre o Livro Perfeito para Você',
    template: '%s | Ache um Livro',
  },
  description: 'Descubra o próximo livro que você vai amar. Busque por gênero, número de páginas, autores nacionais e muito mais.',
  openGraph: { siteName: 'Ache um Livro', locale: 'pt_BR', type: 'website' },
};

const NAV_LINKS = [
  { href: '/categoria/suspense', label: 'Suspense' },
  { href: '/categoria/romance', label: 'Romance' },
  { href: '/categoria/ciencia', label: 'Ciência' },
  { href: '/categoria/fantasia', label: 'Fantasia' },
  { href: '/categoria/historia', label: 'História' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        <header className="border-b border-gray-200 px-4 py-3">
          <nav className="max-w-5xl mx-auto flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-blue-700 shrink-0">📚 Ache um Livro</Link>
            <div className="flex gap-4 text-sm text-gray-600 overflow-x-auto">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="hover:text-blue-600 transition-colors whitespace-nowrap">{l.label}</Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 px-4 py-6 mt-12 text-center text-xs text-gray-400">
          <p>Ache um Livro — Participante do Programa de Afiliados da Amazon Brasil.</p>
          <p className="mt-1">Os preços e disponibilidade são definidos pela Amazon e podem mudar sem aviso.</p>
        </footer>
      </body>
    </html>
  );
}
