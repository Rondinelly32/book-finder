'use client';

import { useState } from 'react';
import { Mood, Focus, Size, Pace, World } from '@/lib/recommend';

interface Answers {
  mood?: Mood;
  focus?: Focus;
  size?: Size;
  pace?: Pace;
  world?: World;
}

interface Props {
  hasRefBook: boolean;
  onSubmit: (answers: Required<Pick<Answers, 'mood' | 'focus' | 'size'>> & Pick<Answers, 'pace' | 'world'>) => void;
}

type Step = 'mood' | 'focus' | 'size' | 'pace' | 'world';

const STEPS_WITH_REF: Step[] = ['mood', 'focus', 'size'];
const STEPS_WITHOUT_REF: Step[] = ['mood', 'focus', 'size', 'pace', 'world'];

function Option({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border border-gray-200 rounded-xl px-5 py-3.5 text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
    >
      {label}
    </button>
  );
}

export default function StepQuestionnaire({ hasRefBook, onSubmit }: Props) {
  const steps = hasRefBook ? STEPS_WITH_REF : STEPS_WITHOUT_REF;
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  function answer(key: keyof Answers, value: string) {
    const next = { ...answers, [key]: value } as Answers;
    setAnswers(next);
    if (stepIdx + 1 < steps.length) {
      setStepIdx(stepIdx + 1);
    } else {
      onSubmit({
        mood: next.mood!,
        focus: next.focus!,
        size: next.size!,
        pace: next.pace,
        world: next.world,
      });
    }
  }

  const step = steps[stepIdx];

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex justify-center gap-1 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 ${i <= stepIdx ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {step === 'mood' && (
        <>
          <h2 className="text-lg font-semibold mb-5 text-center">Que clima você quer agora?</h2>
          <div className="flex flex-col gap-3">
            <Option label="Ação e adrenalina" onClick={() => answer('mood', 'acao')} />
            <Option label="Mistério e investigação" onClick={() => answer('mood', 'misterio')} />
            <Option label="Leve e divertido" onClick={() => answer('mood', 'leve')} />
            <Option label="Reflexivo e denso" onClick={() => answer('mood', 'reflexivo')} />
          </div>
        </>
      )}

      {step === 'focus' && (
        <>
          <h2 className="text-lg font-semibold mb-5 text-center">O que te prende mais?</h2>
          <div className="flex flex-col gap-3">
            <Option label="O protagonista" onClick={() => answer('focus', 'protagonista')} />
            <Option label="O plot e as reviravoltas" onClick={() => answer('focus', 'plot')} />
            <Option label="O mundo e a ambientação" onClick={() => answer('focus', 'mundo')} />
          </div>
        </>
      )}

      {step === 'size' && (
        <>
          <h2 className="text-lg font-semibold mb-5 text-center">Preferência de tamanho?</h2>
          <div className="flex flex-col gap-3">
            <Option label="Livro único" onClick={() => answer('size', 'standalone')} />
            <Option label="Série curta (2–4 livros)" onClick={() => answer('size', 'serie-curta')} />
            <Option label="Saga longa" onClick={() => answer('size', 'saga')} />
          </div>
        </>
      )}

      {step === 'pace' && (
        <>
          <h2 className="text-lg font-semibold mb-5 text-center">Qual o seu ritmo?</h2>
          <div className="flex flex-col gap-3">
            <Option label="Rápido — não consigo parar" onClick={() => answer('pace', 'fast')} />
            <Option label="Pausado — gosto de profundidade" onClick={() => answer('pace', 'slow')} />
          </div>
        </>
      )}

      {step === 'world' && (
        <>
          <h2 className="text-lg font-semibold mb-5 text-center">Que tipo de mundo?</h2>
          <div className="flex flex-col gap-3">
            <Option label="Mundo real contemporâneo" onClick={() => answer('world', 'real')} />
            <Option label="Histórico" onClick={() => answer('world', 'historico')} />
            <Option label="Fantasia ou ficção científica" onClick={() => answer('world', 'fantasia')} />
          </div>
        </>
      )}
    </div>
  );
}
