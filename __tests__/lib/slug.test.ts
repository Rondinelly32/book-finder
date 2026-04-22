import { generateSlug } from '@/lib/slug';

describe('generateSlug', () => {
  it('lowercases and strips accents', () => {
    expect(generateSlug('Ação e Reação')).toBe('acao-e-reacao');
  });

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('O Código Da Vinci')).toBe('o-codigo-da-vinci');
  });

  it('removes special characters', () => {
    expect(generateSlug('Livro: 2ª Edição!')).toBe('livro-2a-edicao');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('  Hello  ')).toBe('hello');
  });

  it('collapses multiple hyphens into one', () => {
    expect(generateSlug('a  --  b')).toBe('a-b');
  });
});
