import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Ache um Livro — Encontre o Livro Perfeito para Você',
  description: 'Busque livros por gênero, número de páginas e autores nacionais. Compre na Amazon Brasil com um clique.',
};

const EMOJIS: Record<string, string> = {
  suspense: '🔪', romance: '💕', ciencia: '🔬', fantasia: '🧙',
  historia: '📜', autoajuda: '✨', biografia: '👤', 'ficcao-cientifica': '🚀',
};

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-2">Qual livro você vai ler hoje?</h1>
      <p className="text-gray-500 mb-8 text-sm">Busque por título, autor ou gênero e encontre sua próxima leitura</p>
      <SearchBar />
      <div className="mt-10">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Explorar por categoria</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {EMOJIS[cat]} {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
