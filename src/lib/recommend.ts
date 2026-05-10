import { getWorkSubjects, searchOpenLibrary } from './open-library';
import { Book } from '@/types/book';

export type Mood = 'acao' | 'misterio' | 'leve' | 'reflexivo';
export type Focus = 'protagonista' | 'plot' | 'mundo';
export type Size = 'standalone' | 'serie-curta' | 'saga';
export type Pace = 'fast' | 'slow';
export type World = 'real' | 'historico' | 'fantasia';

export interface RecommendParams {
  refBook?: string; // OL work key (e.g. OL82563W)
  mood: Mood;
  focus: Focus;
  size: Size;
  pace?: Pace;
  world?: World;
}

const MOOD_SUBJECTS: Record<Mood, string[]> = {
  acao: ['Action & Adventure', 'thriller'],
  misterio: ['Detective and mystery stories', 'thriller'],
  leve: ['humor', 'coming-of-age'],
  reflexivo: ['literary fiction', 'psychological fiction'],
};

const FOCUS_SUBJECTS: Record<Focus, string[]> = {
  protagonista: ['adventure fiction'],
  plot: ['suspense fiction', 'thriller'],
  mundo: ['fantasy', 'science fiction'],
};

const WORLD_SUBJECTS: Record<World, string[]> = {
  real: [],
  historico: ['historical fiction'],
  fantasia: ['fantasy', 'science fiction'],
};

// Subjects to exclude when world=real
const FANTASY_SUBJECTS = new Set(['fantasy', 'science fiction', 'magic', 'speculative fiction']);

function buildQuery(subjects: string[]): string {
  const seen = new Set<string>();
  const unique = subjects.filter(s => { if (seen.has(s)) return false; seen.add(s); return true; });
  return unique.map(s => `subject:"${s}"`).join(' ');
}

function filterByPages(books: Book[], size: Size, pace?: Pace): Book[] {
  let maxPages = Infinity;

  if (size === 'standalone') maxPages = Math.min(maxPages, 500);
  if (pace === 'fast') maxPages = Math.min(maxPages, 400);

  if (maxPages === Infinity) return books;
  return books.filter(b => b.pageCount === 0 || b.pageCount <= maxPages);
}

function excludeFantasy(books: Book[], world?: World): Book[] {
  if (world !== 'real') return books;
  return books.filter(b => {
    const cats = (b.categories ?? []).map(c => c.toLowerCase());
    return !cats.some(c => FANTASY_SUBJECTS.has(c));
  });
}

export async function getRecommendations(params: RecommendParams): Promise<Book[]> {
  const { refBook, mood, focus, size, pace, world } = params;

  let subjects: string[] = [
    ...MOOD_SUBJECTS[mood],
    ...FOCUS_SUBJECTS[focus],
  ];

  if (world && world !== 'real') {
    subjects.push(...WORLD_SUBJECTS[world]);
  }

  // Add subjects from reference book
  if (refBook) {
    const refSubjects = await getWorkSubjects(refBook).catch(() => []);
    subjects = [...refSubjects, ...subjects];
  }

  // Deduplicate
  const seenSubjects = new Set<string>();
  subjects = subjects.filter(s => { if (seenSubjects.has(s)) return false; seenSubjects.add(s); return true; });

  // Build and execute query
  const query = buildQuery(subjects.slice(0, 4));
  let books = await searchOpenLibrary(query, 24);

  // Apply filters
  books = filterByPages(books, size, pace);
  books = excludeFantasy(books, world);

  // Exclude the reference book itself
  if (refBook) {
    books = books.filter(b => !b.id.includes(refBook));
  }

  return books.slice(0, 12);
}
