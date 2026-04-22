'use client';

import { Filters } from '@/types/book';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <aside className="w-44 shrink-0 space-y-6 text-sm">
      <div>
        <h3 className="font-semibold mb-2 uppercase text-xs tracking-wide text-gray-500">Páginas</h3>
        {([['all', 'Todos'], ['curto', 'Curto (<200)'], ['medio', 'Médio (200–400)'], ['longo', 'Longo (>400)']] as const).map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 mb-1 cursor-pointer">
            <input type="radio" name="pageRange" value={val} checked={filters.pageRange === val} onChange={() => update({ pageRange: val })} />
            {label}
          </label>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2 uppercase text-xs tracking-wide text-gray-500">Origem</h3>
        {([['all', 'Todos'], ['nacional', 'Nacional 🇧🇷'], ['internacional', 'Estrangeiro 🌍']] as const).map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 mb-1 cursor-pointer">
            <input type="radio" name="origem" value={val} checked={filters.origem === val} onChange={() => update({ origem: val })} />
            {label}
          </label>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2 uppercase text-xs tracking-wide text-gray-500">Idioma</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.portugues} onChange={e => update({ portugues: e.target.checked })} />
          Disponível em Português
        </label>
      </div>
    </aside>
  );
}
