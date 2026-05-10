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

function Option({ label, sublabel, onClick }: { label: string; sublabel?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 rounded-xl px-5 py-4 text-sm transition-all group"
    >
      <span className="font-medium text-stone-900 group-hover:text-stone-900">{label}</span>
      {sublabel && <span className="block text-xs text-stone-400 mt-0.5">{sublabel}</span>}
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
      onSubmit({ mood: next.mood!, focus: next.focus!, size: next.size!, pace: next.pace, world: next.world });
    }
  }

  const step = steps[stepIdx];

  return (
    <div className="max-w-sm mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= stepIdx ? 'bg-stone-900' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center mb-5 uppercase tracking-widest">
        {stepIdx + 1} / {steps.length}
      </p>

      {step === 'mood' && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6 text-center">
            Que clima você quer agora?
          </h2>
          <div className="flex flex-col gap-2">
            <Option label="Ação e adrenalina" sublabel="Thriller, aventura, ritmo acelerado" onClick={() => answer('mood', 'acao')} />
            <Option label="Mistério e investigação" sublabel="Policial, suspense, enigmas" onClick={() => answer('mood', 'misterio')} />
            <Option label="Leve e divertido" sublabel="Humor, coming-of-age, feel-good" onClick={() => answer('mood', 'leve')} />
            <Option label="Reflexivo e denso" sublabel="Literário, psicológico, filosófico" onClick={() => answer('mood', 'reflexivo')} />
          </div>
        </>
      )}

      {step === 'focus' && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6 text-center">
            O que te prende mais?
          </h2>
          <div className="flex flex-col gap-2">
            <Option label="O protagonista" sublabel="Personagem forte, jornada pessoal" onClick={() => answer('focus', 'protagonista')} />
            <Option label="O plot e as reviravoltas" sublabel="Surpresas, tension, imprevisível" onClick={() => answer('focus', 'plot')} />
            <Option label="O mundo e a ambientação" sublabel="Worldbuilding, imersão, universo rico" onClick={() => answer('focus', 'mundo')} />
          </div>
        </>
      )}

      {step === 'size' && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6 text-center">
            Preferência de tamanho?
          </h2>
          <div className="flex flex-col gap-2">
            <Option label="Livro único" sublabel="Completo, sem compromisso de série" onClick={() => answer('size', 'standalone')} />
            <Option label="Série curta" sublabel="2 a 4 livros" onClick={() => answer('size', 'serie-curta')} />
            <Option label="Saga longa" sublabel="5+ livros, mundo expandido" onClick={() => answer('size', 'saga')} />
          </div>
        </>
      )}

      {step === 'pace' && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6 text-center">
            Qual o seu ritmo de leitura?
          </h2>
          <div className="flex flex-col gap-2">
            <Option label="Rápido" sublabel="Livros que não consigo largar" onClick={() => answer('pace', 'fast')} />
            <Option label="Pausado" sublabel="Gosto de aprofundar e refletir" onClick={() => answer('pace', 'slow')} />
          </div>
        </>
      )}

      {step === 'world' && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6 text-center">
            Que tipo de mundo?
          </h2>
          <div className="flex flex-col gap-2">
            <Option label="Mundo real contemporâneo" onClick={() => answer('world', 'real')} />
            <Option label="Histórico" sublabel="Épocas passadas, fatos reais" onClick={() => answer('world', 'historico')} />
            <Option label="Fantasia ou ficção científica" sublabel="Mundos imaginários, futuro, magia" onClick={() => answer('world', 'fantasia')} />
          </div>
        </>
      )}
    </div>
  );
}
