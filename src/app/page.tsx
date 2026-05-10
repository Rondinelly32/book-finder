import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import QuestionnaireClient from '@/components/discover/QuestionnaireClient';

export const metadata: Metadata = {
  title: 'Ache um Livro — Encontre o Livro Perfeito para Você',
  description: 'Terminou um livro e não sabe o que ler agora? Responda um questionário rápido e receba recomendações personalizadas em português para comprar na Amazon Brasil.',
};

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center pt-8 pb-4 max-w-xl mx-auto">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-4">
          Recomendações personalizadas
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 mb-4 text-balance leading-tight">
          Qual livro você vai ler a seguir?
        </h1>
        <p className="text-stone-500 text-[15px] leading-relaxed">
          Informe sua última leitura, responda algumas perguntas e descubra o próximo livro perfeito para você.
        </p>
      </div>

      {/* Interactive questionnaire */}
      <QuestionnaireClient />

      {/* Category grid — indexable by Google */}
      <div className="mt-20 pt-12 border-t border-stone-100">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-6 text-center">
          Explorar por categoria
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="group flex items-center gap-3 border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 rounded-xl px-4 py-3.5 transition-all"
            >
              <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                {CATEGORY_LABELS[cat]}
              </span>
              <svg className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
