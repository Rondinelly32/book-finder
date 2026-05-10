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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {books.length > 0 ? 'Livros recomendados para você' : 'Nenhum livro encontrado'}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-blue-600 hover:underline"
        >
          Recomeçar
        </button>
      </div>
      {books.length > 0 ? (
        <BookGrid books={books} />
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">
          Tente outras respostas para encontrar livros.
        </p>
      )}
    </div>
  );
}
