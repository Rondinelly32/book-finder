'use client';

import { Book } from '@/types/book';
import BookGrid from '@/components/BookGrid';

interface Props {
  books: Book[];
  onReset: () => void;
}

export default function StepResults({ books, onReset }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            {books.length > 0 ? 'Recomendados para você' : 'Nenhum resultado'}
          </h2>
          {books.length > 0 && (
            <p className="text-xs text-stone-400 mt-0.5">{books.length} livros encontrados</p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-stone-400 hover:text-stone-700 transition-colors border border-stone-200 rounded-lg px-3 py-1.5"
        >
          Recomeçar
        </button>
      </div>

      {books.length > 0 ? (
        <BookGrid books={books} />
      ) : (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm mb-4">Tente outras combinações de respostas.</p>
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg px-4 py-2 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
