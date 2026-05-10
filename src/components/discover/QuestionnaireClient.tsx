'use client';

import { useState } from 'react';
import StepBookSearch from './StepBookSearch';
import StepQuestionnaire from './StepQuestionnaire';
import StepLoading from './StepLoading';
import StepResults from './StepResults';
import { Book } from '@/types/book';
import { Mood, Focus, Size, Pace, World } from '@/lib/recommend';

type State = 'book-search' | 'questionnaire' | 'loading' | 'results';

interface RefBook {
  olKey: string;
  title: string;
}

interface QuestionnaireAnswers {
  mood: Mood;
  focus: Focus;
  size: Size;
  pace?: Pace;
  world?: World;
}

export default function QuestionnaireClient() {
  const [state, setState] = useState<State>('book-search');
  const [refBook, setRefBook] = useState<RefBook | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  function handleBookSelect(book: RefBook | null) {
    setRefBook(book);
    setState('questionnaire');
  }

  async function handleQuestionnaireSubmit(answers: QuestionnaireAnswers) {
    setState('loading');

    const sp = new URLSearchParams({
      mood: answers.mood,
      focus: answers.focus,
      size: answers.size,
    });
    if (answers.pace) sp.set('pace', answers.pace);
    if (answers.world) sp.set('world', answers.world);
    if (refBook) sp.set('refBook', refBook.olKey);

    try {
      const res = await fetch(`/api/recommend?${sp}`);
      const data = await res.json();
      setBooks(data.books ?? []);
    } catch {
      setBooks([]);
    }

    setState('results');
  }

  function reset() {
    setRefBook(null);
    setBooks([]);
    setState('book-search');
  }

  return (
    <div className="mt-12">
      {state === 'book-search' && <StepBookSearch onSelect={handleBookSelect} />}
      {state === 'questionnaire' && (
        <StepQuestionnaire hasRefBook={!!refBook} onSubmit={handleQuestionnaireSubmit} />
      )}
      {state === 'loading' && <StepLoading />}
      {state === 'results' && <StepResults books={books} onReset={reset} />}
    </div>
  );
}
