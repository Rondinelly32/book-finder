'use client';

import { Filters } from '@/types/book';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <aside className="w-40 shrink-0 space-y-7">
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Páginas</h3>
        <div className="space-y-2">
          {([['all', 'Todos'], ['curto', 'Até 200'], ['medio', '200–400'], ['longo', 'Mais de 400']] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="pageRange"
                value={val}
                checked={filters.pageRange === val}
                onChange={() => update({ pageRange: val })}
                className="accent-stone-900"
              />
              <span className={`text-xs transition-colors ${filters.pageRange === val ? 'text-stone-900 font-medium' : 'text-stone-500 group-hover:text-stone-700'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">Origem</h3>
        <div className="space-y-2">
          {([['all', 'Todos'], ['nacional', 'Nacional'], ['internacional', 'Estrangeiro']] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="origem"
                value={val}
                checked={filters.origem === val}
                onChange={() => update({ origem: val })}
                className="accent-stone-900"
              />
              <span className={`text-xs transition-colors ${filters.origem === val ? 'text-stone-900 font-medium' : 'text-stone-500 group-hover:text-stone-700'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
