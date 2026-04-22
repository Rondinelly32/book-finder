export const CATEGORIES = [
  'suspense',
  'romance',
  'ciencia',
  'fantasia',
  'historia',
  'autoajuda',
  'biografia',
  'ficcao-cientifica',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  'suspense': 'Suspense',
  'romance': 'Romance',
  'ciencia': 'Ciência',
  'fantasia': 'Fantasia',
  'historia': 'História',
  'autoajuda': 'Autoajuda',
  'biografia': 'Biografia',
  'ficcao-cientifica': 'Ficção Científica',
};

/** Maps category slug to Google Books subject query string */
export const CATEGORY_QUERIES: Record<Category, string> = {
  'suspense': 'subject:thriller',
  'romance': 'subject:romance',
  'ciencia': 'subject:science',
  'fantasia': 'subject:fantasy',
  'historia': 'subject:history',
  'autoajuda': 'subject:self-help',
  'biografia': 'subject:biography',
  'ficcao-cientifica': 'subject:science+fiction',
};
