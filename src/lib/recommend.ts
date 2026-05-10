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

  // Primary subjects from answers — always reliable
  const moodSubjects = MOOD_SUBJECTS[mood];
  const focusSubject = FOCUS_SUBJECTS[focus][0];
  const worldSubjects = world && world !== 'real' ? WORLD_SUBJECTS[world] : [];

  // Get 1 genre-level subject from reference book to add flavor
  let refSubject: string | undefined;
  if (refBook) {
    const refSubjects = await getWorkSubjects(refBook).catch(() => []);
    refSubject = refSubjects[0];
  }

  // Build a 2-subject query: mood primary + either refBook subject or focus subject
  // Keeping it to 2 subjects avoids AND logic being too restrictive
  const secondSubject = refSubject ?? focusSubject;
  const primaryQuery = buildQuery([moodSubjects[0], secondSubject].filter(Boolean) as string[]);

  let books = await searchOpenLibrary(primaryQuery, 24);

  // Fallback: if too few results, search with just the primary mood subject
  if (books.length < 6) {
    const fallbackQuery = buildQuery([
      ...(worldSubjects.length ? [worldSubjects[0]] : [moodSubjects[0]]),
    ]);
    const fallback = await searchOpenLibrary(fallbackQuery, 24);
    // Merge, deduplicate by id
    const ids = new Set(books.map(b => b.id));
    books = [...books, ...fallback.filter(b => !ids.has(b.id))];
  }

  // Apply filters
  books = filterByPages(books, size, pace);
  books = excludeFantasy(books, world);

  // Exclude the reference book itself
  if (refBook) {
    books = books.filter(b => !b.id.includes(refBook));
  }

  return books.slice(0, 12);
}
