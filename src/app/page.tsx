import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import QuestionnaireClient from '@/components/discover/QuestionnaireClient';

export const metadata: Metadata = {
  title: 'Ache um Livro — Encontre o Livro Perfeito para Você',
  description: 'Terminou um livro e não sabe o que ler agora? Responda um questionário rápido e receba recomendações personalizadas em português para comprar na Amazon Brasil.',
};

const EMOJIS: Record<string, string> = {
  suspense: '🔪', romance: '💕', ciencia: '🔬', fantasia: '🧙',
  historia: '📜', autoajuda: '✨', biografia: '👤', 'ficcao-cientifica': '🚀',
};

export default function HomePage() {
  return (
    <div>
      {/* Hero — indexable by Google */}
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-2">Qual livro você vai ler a seguir?</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Termine um livro e não sabe o que ler agora? Informe sua última leitura, responda algumas perguntas e receba recomendações personalizadas em português.
        </p>
      </div>

      {/* Interactive questionnaire — client component */}
      <QuestionnaireClient />

      {/* Category links — indexable by Google */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-4 text-center">Explorar por categoria</p>
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
