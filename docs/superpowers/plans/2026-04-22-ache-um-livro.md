# Ache um Livro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Ache um Livro", a Portuguese-language book discovery site for Brazilian readers with Google Books search, filtering, Amazon Brazil affiliate links, and ISR-powered SEO pages.

**Architecture:** Next.js 14 App Router on Vercel. API Routes proxy Google Books (key stays server-side). Category and book pages use ISR (revalidate 24h) for SEO. No database — ISR is the caching layer.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Jest, React Testing Library, Google Books API, Amazon Associados BR (`rondinellyc09-20`)

---

## File Map

```
bookfinder/
├── src/
│   ├── types/
│   │   └── book.ts                            # Book interface + Filters type
│   ├── lib/
│   │   ├── categories.ts                      # CATEGORIES const + label/query maps
│   │   ├── slug.ts                            # URL-safe Portuguese slug generator
│   │   ├── affiliate.ts                       # Amazon Brazil affiliate URL builder
│   │   ├── filters.ts                         # Client-side filter logic
│   │   └── google-books.ts                    # Google Books API client
│   ├── components/
│   │   ├── AmazonButton.tsx                   # Orange "Comprar na Amazon Brasil" link
│   │   ├── BookCard.tsx                       # Book card: cover, title, author, buy button
│   │   ├── BookGrid.tsx                       # Responsive grid of BookCards
│   │   ├── SearchBar.tsx                      # Controlled search input + submit
│   │   ├── FilterSidebar.tsx                  # Genre/pages/origin/language filters
│   │   └── SimilarBooks.tsx                   # Horizontal scroll row of similar books
│   └── app/
│       ├── layout.tsx                         # Root layout, nav, footer, default metadata
│       ├── page.tsx                           # Homepage: search bar + category pills
│       ├── busca/page.tsx                     # Client-side search results + filters
│       ├── categoria/[genero]/page.tsx        # ISR category landing page
│       ├── livro/[id]/[slug]/page.tsx         # ISR book detail + Schema.org + affiliate
│       ├── sitemap.ts                         # Auto-generated sitemap.xml
│       ├── robots.ts                          # robots.txt
│       └── api/
│           ├── search/route.ts                # GET /api/search?q=&pages=&origem=&portugues=
│           └── book/[id]/route.ts             # GET /api/book/[id]
├── __tests__/
│   ├── lib/
│   │   ├── slug.test.ts
│   │   ├── affiliate.test.ts
│   │   ├── filters.test.ts
│   │   └── google-books.test.ts
│   ├── api/
│   │   ├── search.test.ts
│   │   └── book.test.ts
│   └── components/
│       ├── AmazonButton.test.tsx
│       ├── BookCard.test.tsx
│       ├── SearchBar.test.tsx
│       ├── FilterSidebar.test.tsx
│       └── SimilarBooks.test.tsx
├── .env.local                                 # API keys — gitignored
├── jest.config.ts
└── jest.setup.ts
```

**Note on `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`:** The affiliate tag appears in every affiliate URL the user sees, so it is not a secret. Prefixing it with `NEXT_PUBLIC_` makes it available in both server and client components, avoiding a runtime crash when `BookGrid` renders inside the client-side `/busca` page.

---

## Task 1: Project Setup

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `.env.local`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd /Users/rondi/bookfinder
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Accept all defaults when prompted.

- [ ] **Step 2: Install testing dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 3: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
```

- [ ] **Step 4: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Create `.env.local`**

```
GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
NEXT_PUBLIC_AMAZON_AFFILIATE_TAG=rondinellyc09-20
NEXT_PUBLIC_SITE_URL=https://acheumlivro.com.br
```

- [ ] **Step 6: Ensure `.env.local` is in `.gitignore`**

Open `.gitignore` and verify this line exists (add if missing):
```
.env*.local
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at http://localhost:3000 with default Next.js page. Stop with Ctrl+C.

- [ ] **Step 8: Verify tests run with no failures**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 skipped, 0 total`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 14 project with TypeScript, Tailwind, and Jest"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/types/book.ts`

- [ ] **Step 1: Create `src/types/book.ts`**

```typescript
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  categories: string[];
  pageCount: number;
  language: string;
  publisher: string;
  publishedDate: string;
  thumbnail: string;
  /** true if language === 'pt' */
  isPortuguese: boolean;
  /** true if publisher is a known Brazilian publisher */
  isNational: boolean;
}

export interface Filters {
  genre: string;
  pageRange: 'all' | 'curto' | 'medio' | 'longo';
  origem: 'all' | 'nacional' | 'internacional';
  portugues: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/book.ts
git commit -m "feat: add Book and Filters type definitions"
```

---

## Task 3: Categories Constant

**Files:**
- Create: `src/lib/categories.ts`

- [ ] **Step 1: Create `src/lib/categories.ts`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/categories.ts
git commit -m "feat: add categories constant with display labels and Google Books query map"
```

---

## Task 4: Slug Utility

**Files:**
- Create: `src/lib/slug.ts`
- Create: `__tests__/lib/slug.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/slug.test.ts
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
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/lib/slug.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/slug'`

- [ ] **Step 3: Implement `src/lib/slug.ts`**

```typescript
export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/lib/slug.test.ts
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug.ts __tests__/lib/slug.test.ts
git commit -m "feat: add Portuguese slug generator with tests"
```

---

## Task 5: Affiliate Link Builder

**Files:**
- Create: `src/lib/affiliate.ts`
- Create: `__tests__/lib/affiliate.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/affiliate.test.ts
import { buildAffiliateLink } from '@/lib/affiliate';

describe('buildAffiliateLink', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, NEXT_PUBLIC_AMAZON_AFFILIATE_TAG: 'rondinellyc09-20' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('builds a valid amazon.com.br search URL', () => {
    const url = buildAffiliateLink('Duna', 'Frank Herbert');
    expect(url).toContain('amazon.com.br/s');
    expect(url).toContain('tag=rondinellyc09-20');
  });

  it('includes title and author in query param k', () => {
    const url = buildAffiliateLink('Duna', 'Frank Herbert');
    const parsed = new URL(url);
    const k = parsed.searchParams.get('k') ?? '';
    expect(k).toContain('Duna');
    expect(k).toContain('Frank Herbert');
  });

  it('URL-encodes the query', () => {
    const url = buildAffiliateLink('O Código Da Vinci', 'Dan Brown');
    expect(() => new URL(url)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/lib/affiliate.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/affiliate'`

- [ ] **Step 3: Implement `src/lib/affiliate.ts`**

```typescript
export function buildAffiliateLink(title: string, author: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ?? '';
  const k = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com.br/s?k=${k}&tag=${tag}`;
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/lib/affiliate.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/affiliate.ts __tests__/lib/affiliate.test.ts
git commit -m "feat: add Amazon Brazil affiliate link builder with tests"
```

---

## Task 6: Filter Logic

**Files:**
- Create: `src/lib/filters.ts`
- Create: `__tests__/lib/filters.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/filters.test.ts
import { applyFilters } from '@/lib/filters';
import { Book, Filters } from '@/types/book';

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: '1', title: 'Test', authors: ['Author'], description: '',
  categories: ['Fiction'], pageCount: 300, language: 'pt',
  publisher: 'Publisher', publishedDate: '2020', thumbnail: '',
  isPortuguese: true, isNational: false, ...overrides,
});

const none: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

describe('applyFilters', () => {
  it('returns all books when no filters applied', () => {
    expect(applyFilters([makeBook(), makeBook({ id: '2' })], none)).toHaveLength(2);
  });

  it('filters curto books (pageCount < 200)', () => {
    const books = [makeBook({ pageCount: 150 }), makeBook({ pageCount: 300 })];
    const result = applyFilters(books, { ...none, pageRange: 'curto' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(150);
  });

  it('filters medio books (200–400 pages)', () => {
    const books = [makeBook({ pageCount: 150 }), makeBook({ pageCount: 300 }), makeBook({ pageCount: 500 })];
    const result = applyFilters(books, { ...none, pageRange: 'medio' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(300);
  });

  it('filters longo books (pageCount > 400)', () => {
    const books = [makeBook({ pageCount: 300 }), makeBook({ pageCount: 500 })];
    const result = applyFilters(books, { ...none, pageRange: 'longo' });
    expect(result).toHaveLength(1);
    expect(result[0].pageCount).toBe(500);
  });

  it('filters nacional books', () => {
    const books = [makeBook({ isNational: true }), makeBook({ isNational: false })];
    expect(applyFilters(books, { ...none, origem: 'nacional' })).toHaveLength(1);
  });

  it('filters internacional books', () => {
    const books = [makeBook({ isNational: true }), makeBook({ isNational: false })];
    expect(applyFilters(books, { ...none, origem: 'internacional' })).toHaveLength(1);
  });

  it('filters books available in Portuguese', () => {
    const books = [makeBook({ isPortuguese: true }), makeBook({ isPortuguese: false })];
    const result = applyFilters(books, { ...none, portugues: true });
    expect(result).toHaveLength(1);
    expect(result[0].isPortuguese).toBe(true);
  });

  it('applies multiple filters together', () => {
    const books = [
      makeBook({ pageCount: 150, isNational: true, isPortuguese: true }),
      makeBook({ pageCount: 150, isNational: false, isPortuguese: true }),
      makeBook({ pageCount: 300, isNational: true, isPortuguese: true }),
    ];
    const result = applyFilters(books, { ...none, pageRange: 'curto', origem: 'nacional', portugues: true });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/lib/filters.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/filters'`

- [ ] **Step 3: Implement `src/lib/filters.ts`**

```typescript
import { Book, Filters } from '@/types/book';

export function applyFilters(books: Book[], filters: Filters): Book[] {
  return books.filter(book => {
    if (filters.pageRange === 'curto' && book.pageCount >= 200) return false;
    if (filters.pageRange === 'medio' && (book.pageCount < 200 || book.pageCount > 400)) return false;
    if (filters.pageRange === 'longo' && book.pageCount <= 400) return false;
    if (filters.origem === 'nacional' && !book.isNational) return false;
    if (filters.origem === 'internacional' && book.isNational) return false;
    if (filters.portugues && !book.isPortuguese) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/lib/filters.test.ts
```

Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/filters.ts __tests__/lib/filters.test.ts
git commit -m "feat: add book filter logic with tests"
```

---

## Task 7: Google Books API Client

**Files:**
- Create: `src/lib/google-books.ts`
- Create: `__tests__/lib/google-books.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/lib/google-books.test.ts
import { parseVolume, searchBooks, getBook, getSimilarBooks } from '@/lib/google-books';

const mockVolume = {
  id: 'abc123',
  volumeInfo: {
    title: 'Duna',
    authors: ['Frank Herbert'],
    description: 'Uma história épica.',
    categories: ['Fiction / Science Fiction'],
    pageCount: 412,
    language: 'pt',
    publisher: 'Aleph',
    publishedDate: '2017',
    imageLinks: { thumbnail: 'http://books.google.com/books/content?id=abc123' },
  },
};

describe('parseVolume', () => {
  it('maps volume to Book interface', () => {
    const book = parseVolume(mockVolume);
    expect(book.id).toBe('abc123');
    expect(book.title).toBe('Duna');
    expect(book.authors).toEqual(['Frank Herbert']);
    expect(book.pageCount).toBe(412);
    expect(book.isPortuguese).toBe(true);
  });

  it('upgrades thumbnail from http to https', () => {
    expect(parseVolume(mockVolume).thumbnail).toContain('https://');
  });

  it('sets isNational true for known Brazilian publishers', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, publisher: 'Companhia das Letras' } };
    expect(parseVolume(vol).isNational).toBe(true);
  });

  it('sets isNational false for non-Brazilian publishers', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, publisher: 'Penguin Books' } };
    expect(parseVolume(vol).isNational).toBe(false);
  });

  it('returns empty string for missing thumbnail', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, imageLinks: undefined } };
    expect(parseVolume(vol).thumbnail).toBe('');
  });

  it('returns empty array for missing authors', () => {
    const vol = { ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, authors: undefined } };
    expect(parseVolume(vol).authors).toEqual([]);
  });
});

describe('searchBooks', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [mockVolume], totalItems: 1 }),
    } as unknown as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls Google Books API with the query', async () => {
    await searchBooks('Duna');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('Duna'), expect.anything());
  });

  it('returns parsed books', async () => {
    const result = await searchBooks('Duna');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Duna');
  });

  it('returns empty array when no items', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ totalItems: 0 }) });
    expect(await searchBooks('xyz')).toEqual([]);
  });
});

describe('getBook', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVolume,
    } as unknown as Response);
  });

  afterEach(() => jest.restoreAllMocks());

  it('fetches a single book by ID', async () => {
    const book = await getBook('abc123');
    expect(book?.id).toBe('abc123');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('abc123'), expect.anything());
  });

  it('returns null when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    expect(await getBook('bad-id')).toBeNull();
  });
});

describe('getSimilarBooks', () => {
  it('returns empty array when book has no categories', async () => {
    const book = parseVolume({ ...mockVolume, volumeInfo: { ...mockVolume.volumeInfo, categories: [] } });
    expect(await getSimilarBooks(book)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/lib/google-books.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/google-books'`

- [ ] **Step 3: Implement `src/lib/google-books.ts`**

```typescript
import { Book } from '@/types/book';

const BASE = 'https://www.googleapis.com/books/v1';

const BRAZILIAN_PUBLISHERS = [
  'companhia das letras', 'record', 'intrínseca', 'intrinseca',
  'rocco', 'sextante', 'darkside', 'suma', 'novo conceito',
  'planeta', 'leya', 'ediouro', 'globo livros', 'aleph',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseVolume(volume: any): Book {
  const info = volume.volumeInfo ?? {};
  const publisher = (info.publisher ?? '') as string;
  const language = (info.language ?? '') as string;
  const thumbnail = (info.imageLinks?.thumbnail ?? '').replace('http://', 'https://');
  const isNational = BRAZILIAN_PUBLISHERS.some(p => publisher.toLowerCase().includes(p));

  return {
    id: volume.id as string,
    title: info.title ?? 'Sem título',
    authors: info.authors ?? [],
    description: info.description ?? '',
    categories: info.categories ?? [],
    pageCount: info.pageCount ?? 0,
    language,
    publisher,
    publishedDate: info.publishedDate ?? '',
    thumbnail,
    isPortuguese: language === 'pt',
    isNational,
  };
}

function key(): string {
  const k = process.env.GOOGLE_BOOKS_API_KEY;
  return k ? `&key=${k}` : '';
}

export async function searchBooks(query: string, maxResults = 20): Promise<Book[]> {
  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books${key()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(parseVolume);
}

export async function getBook(id: string): Promise<Book | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${BASE}/volumes/${id}${apiKey ? `?key=${apiKey}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return parseVolume(await res.json());
}

export async function getSimilarBooks(book: Book, maxResults = 6): Promise<Book[]> {
  const subject = book.categories[0];
  if (!subject) return [];
  const q = `subject:${subject}`;
  const url = `${BASE}/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}&printType=books${key()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(parseVolume).filter((b: Book) => b.id !== book.id);
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/lib/google-books.test.ts
```

Expected: PASS — all tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/google-books.ts __tests__/lib/google-books.test.ts
git commit -m "feat: add Google Books API client with parseVolume, search, getBook, getSimilarBooks"
```

---

## Task 8: API Route — /api/search

**Files:**
- Create: `src/app/api/search/route.ts`
- Create: `__tests__/api/search.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/api/search.test.ts
import { GET } from '@/app/api/search/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/google-books', () => ({
  searchBooks: jest.fn().mockResolvedValue([{
    id: '1', title: 'Duna', authors: ['Frank Herbert'], description: '',
    categories: ['Science Fiction'], pageCount: 412, language: 'pt',
    publisher: 'Aleph', publishedDate: '2017', thumbnail: '',
    isPortuguese: true, isNational: false,
  }]),
}));

jest.mock('@/lib/filters', () => ({
  applyFilters: jest.fn((books: unknown[]) => books),
}));

function makeReq(params: Record<string, string>) {
  const url = new URL('http://localhost/api/search');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/search', () => {
  it('returns 400 when q param is missing', async () => {
    const res = await GET(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns books for valid query', async () => {
    const res = await GET(makeReq({ q: 'Duna' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.books).toHaveLength(1);
    expect(body.books[0].title).toBe('Duna');
  });

  it('includes total count in response', async () => {
    const res = await GET(makeReq({ q: 'Duna' }));
    const body = await res.json();
    expect(body.total).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/api/search.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/search/route'`

- [ ] **Step 3: Implement `src/app/api/search/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/google-books';
import { applyFilters } from '@/lib/filters';
import { Filters } from '@/types/book';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q');
  if (!q) return NextResponse.json({ error: 'Missing required param: q' }, { status: 400 });

  const genre = searchParams.get('genre') ?? '';
  const query = genre ? `${q} subject:${genre}` : q;
  const books = await searchBooks(query);

  const filters: Filters = {
    genre,
    pageRange: (searchParams.get('pages') as Filters['pageRange']) ?? 'all',
    origem: (searchParams.get('origem') as Filters['origem']) ?? 'all',
    portugues: searchParams.get('portugues') === 'true',
  };

  const filtered = applyFilters(books, filters);
  return NextResponse.json({ books: filtered, total: filtered.length });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/api/search.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/app/api/search/route.ts __tests__/api/search.test.ts
git commit -m "feat: add /api/search route with filter support"
```

---

## Task 9: API Route — /api/book/[id]

**Files:**
- Create: `src/app/api/book/[id]/route.ts`
- Create: `__tests__/api/book.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/api/book.test.ts
import { GET } from '@/app/api/book/[id]/route';
import { NextRequest } from 'next/server';

const mockBook = {
  id: 'abc123', title: 'Duna', authors: ['Frank Herbert'], description: '',
  categories: ['Science Fiction'], pageCount: 412, language: 'pt',
  publisher: 'Aleph', publishedDate: '2017', thumbnail: '',
  isPortuguese: true, isNational: false,
};

jest.mock('@/lib/google-books', () => ({
  getBook: jest.fn().mockResolvedValue(mockBook),
  getSimilarBooks: jest.fn().mockResolvedValue([]),
}));

function makeReq(id: string) {
  return new NextRequest(`http://localhost/api/book/${id}`);
}

describe('GET /api/book/[id]', () => {
  it('returns book and similar books', async () => {
    const res = await GET(makeReq('abc123'), { params: { id: 'abc123' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.book.title).toBe('Duna');
    expect(body.similar).toEqual([]);
  });

  it('returns 404 when book not found', async () => {
    const { getBook } = await import('@/lib/google-books');
    (getBook as jest.Mock).mockResolvedValueOnce(null);
    const res = await GET(makeReq('bad-id'), { params: { id: 'bad-id' } });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/api/book.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/book/[id]/route'`

- [ ] **Step 3: Implement `src/app/api/book/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getBook, getSimilarBooks } from '@/lib/google-books';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const book = await getBook(params.id);
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  const similar = await getSimilarBooks(book);
  return NextResponse.json({ book, similar });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/api/book.test.ts
```

Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/app/api/book/[id]/route.ts __tests__/api/book.test.ts
git commit -m "feat: add /api/book/[id] route returning book + similar books"
```

---

## Task 10: AmazonButton Component

**Files:**
- Create: `src/components/AmazonButton.tsx`
- Create: `__tests__/components/AmazonButton.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/AmazonButton.test.tsx
import { render, screen } from '@testing-library/react';
import AmazonButton from '@/components/AmazonButton';

describe('AmazonButton', () => {
  it('renders a link to amazon.com.br with affiliate tag', () => {
    render(
      <AmazonButton
        title="Duna"
        author="Frank Herbert"
        affiliateUrl="https://www.amazon.com.br/s?k=Duna&tag=rondinellyc09-20"
      />
    );
    const link = screen.getByRole('link', { name: /comprar na amazon/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('amazon.com.br'));
    expect(link).toHaveAttribute('href', expect.stringContaining('rondinellyc09-20'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/components/AmazonButton.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/AmazonButton'`

- [ ] **Step 3: Implement `src/components/AmazonButton.tsx`**

```typescript
interface Props {
  title: string;
  author: string;
  affiliateUrl: string;
}

export default function AmazonButton({ affiliateUrl }: Props) {
  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e68900] text-black font-semibold px-4 py-2 rounded-md transition-colors text-sm"
    >
      🛒 Comprar na Amazon Brasil
    </a>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/components/AmazonButton.test.tsx
```

Expected: PASS — 1 test

- [ ] **Step 5: Commit**

```bash
git add src/components/AmazonButton.tsx __tests__/components/AmazonButton.test.tsx
git commit -m "feat: add AmazonButton affiliate link component"
```

---

## Task 11: BookCard Component

**Files:**
- Create: `src/components/BookCard.tsx`
- Create: `__tests__/components/BookCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/BookCard.test.tsx
import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';
import { Book } from '@/types/book';

const mockBook: Book = {
  id: '1', title: 'Duna', authors: ['Frank Herbert'], description: '',
  categories: ['Science Fiction'], pageCount: 412, language: 'pt',
  publisher: 'Aleph', publishedDate: '2017', thumbnail: '',
  isPortuguese: true, isNational: false,
};

describe('BookCard', () => {
  it('renders title and author', () => {
    render(<BookCard book={mockBook} affiliateUrl="https://amazon.com.br/s?k=Duna&tag=test" />);
    expect(screen.getByText('Duna')).toBeInTheDocument();
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument();
  });

  it('renders page count', () => {
    render(<BookCard book={mockBook} affiliateUrl="https://amazon.com.br/s?k=Duna&tag=test" />);
    expect(screen.getByText(/412/)).toBeInTheDocument();
  });

  it('links to the book detail page', () => {
    render(<BookCard book={mockBook} affiliateUrl="https://amazon.com.br/s?k=Duna&tag=test" />);
    const link = screen.getByRole('link', { name: /duna/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('/livro/1'));
  });

  it('renders the Amazon buy button', () => {
    render(<BookCard book={mockBook} affiliateUrl="https://amazon.com.br/s?k=Duna&tag=test" />);
    expect(screen.getByRole('link', { name: /comprar na amazon/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/components/BookCard.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/BookCard'`

- [ ] **Step 3: Implement `src/components/BookCard.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/book';
import { generateSlug } from '@/lib/slug';
import AmazonButton from './AmazonButton';

interface Props {
  book: Book;
  affiliateUrl: string;
}

export default function BookCard({ book, affiliateUrl }: Props) {
  const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/livro/${book.id}/${slug}`} className="flex-1 p-3">
        <div className="relative w-full aspect-[2/3] bg-gray-100 mb-2 rounded overflow-hidden">
          {book.thumbnail ? (
            <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="200px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Sem capa</div>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{book.authors[0]}</p>
        <p className="text-xs text-gray-400 mt-0.5">{book.pageCount} páginas</p>
      </Link>
      <div className="p-3 pt-0">
        <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/components/BookCard.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/BookCard.tsx __tests__/components/BookCard.test.tsx
git commit -m "feat: add BookCard component with cover, metadata, and buy button"
```

---

## Task 12: BookGrid Component

**Files:**
- Create: `src/components/BookGrid.tsx`

- [ ] **Step 1: Implement `src/components/BookGrid.tsx`**

```typescript
import { Book } from '@/types/book';
import { buildAffiliateLink } from '@/lib/affiliate';
import BookCard from './BookCard';

interface Props {
  books: Book[];
}

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">Nenhum livro encontrado.</p>
        <p className="text-sm mt-1">Tente outros termos ou remova alguns filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          affiliateUrl={buildAffiliateLink(book.title, book.authors[0] ?? '')}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BookGrid.tsx
git commit -m "feat: add BookGrid responsive grid component"
```

---

## Task 13: SearchBar Component

**Files:**
- Create: `src/components/SearchBar.tsx`
- Create: `__tests__/components/SearchBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/SearchBar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('SearchBar', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders input and submit button', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('navigates to /busca with query on submit', async () => {
    render(<SearchBar />);
    await userEvent.type(screen.getByRole('textbox'), 'Duna');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(mockPush).toHaveBeenCalledWith('/busca?q=Duna');
  });

  it('pre-fills with defaultValue', () => {
    render(<SearchBar defaultValue="suspense" />);
    expect(screen.getByRole('textbox')).toHaveValue('suspense');
  });

  it('does not navigate on empty submit', async () => {
    render(<SearchBar />);
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/components/SearchBar.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/SearchBar'`

- [ ] **Step 3: Implement `src/components/SearchBar.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Buscar por título, autor ou gênero...',
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition-colors text-sm"
      >
        Buscar
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/components/SearchBar.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchBar.tsx __tests__/components/SearchBar.test.tsx
git commit -m "feat: add SearchBar component with router navigation"
```

---

## Task 14: FilterSidebar Component

**Files:**
- Create: `src/components/FilterSidebar.tsx`
- Create: `__tests__/components/FilterSidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/FilterSidebar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterSidebar from '@/components/FilterSidebar';
import { Filters } from '@/types/book';

const defaultFilters: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

describe('FilterSidebar', () => {
  it('renders all filter sections', () => {
    render(<FilterSidebar filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getByText(/páginas/i)).toBeInTheDocument();
    expect(screen.getByText(/origem/i)).toBeInTheDocument();
    expect(screen.getByText(/idioma/i)).toBeInTheDocument();
  });

  it('calls onChange with curto when short radio selected', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/curto/i));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pageRange: 'curto' }));
  });

  it('calls onChange with nacional when nacional radio selected', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/nacional/i));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ origem: 'nacional' }));
  });

  it('calls onChange with portugues true when checkbox toggled', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ portugues: true }));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/components/FilterSidebar.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/FilterSidebar'`

- [ ] **Step 3: Implement `src/components/FilterSidebar.tsx`**

```typescript
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
        {([['all', 'Todos'], ['nacional', '🇧🇷 Nacional'], ['internacional', '🌍 Internacional']] as const).map(([val, label]) => (
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
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/components/FilterSidebar.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterSidebar.tsx __tests__/components/FilterSidebar.test.tsx
git commit -m "feat: add FilterSidebar with page range, origin, and language filters"
```

---

## Task 15: SimilarBooks Component

**Files:**
- Create: `src/components/SimilarBooks.tsx`
- Create: `__tests__/components/SimilarBooks.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// __tests__/components/SimilarBooks.test.tsx
import { render, screen } from '@testing-library/react';
import SimilarBooks from '@/components/SimilarBooks';
import { Book } from '@/types/book';

const makeBook = (id: string, title: string): Book => ({
  id, title, authors: ['Author'], description: '', categories: ['Fiction'],
  pageCount: 300, language: 'pt', publisher: 'Pub', publishedDate: '2020',
  thumbnail: '', isPortuguese: true, isNational: false,
});

describe('SimilarBooks', () => {
  it('renders section heading when books provided', () => {
    render(<SimilarBooks books={[makeBook('1', 'Livro A')]} />);
    expect(screen.getByText(/livros parecidos/i)).toBeInTheDocument();
  });

  it('renders a title for each book', () => {
    render(<SimilarBooks books={[makeBook('1', 'Livro A'), makeBook('2', 'Livro B')]} />);
    expect(screen.getByText('Livro A')).toBeInTheDocument();
    expect(screen.getByText('Livro B')).toBeInTheDocument();
  });

  it('renders nothing when books array is empty', () => {
    const { container } = render(<SimilarBooks books={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/components/SimilarBooks.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/SimilarBooks'`

- [ ] **Step 3: Implement `src/components/SimilarBooks.tsx`**

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types/book';
import { generateSlug } from '@/lib/slug';

interface Props {
  books: Book[];
}

export default function SimilarBooks({ books }: Props) {
  if (books.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Livros Parecidos</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {books.map(book => {
          const slug = generateSlug(`${book.title} ${book.authors[0] ?? ''}`);
          return (
            <Link key={book.id} href={`/livro/${book.id}/${slug}`} className="shrink-0 w-28 group">
              <div className="relative w-28 h-40 bg-gray-100 rounded overflow-hidden mb-1">
                {book.thumbnail ? (
                  <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-1">Sem capa</div>
                )}
              </div>
              <p className="text-xs font-medium line-clamp-2 group-hover:text-blue-600">{book.title}</p>
              <p className="text-xs text-gray-400">{book.authors[0]}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- __tests__/components/SimilarBooks.test.tsx
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/SimilarBooks.tsx __tests__/components/SimilarBooks.test.tsx
git commit -m "feat: add SimilarBooks horizontal scroll component"
```

---

## Task 16: Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br'),
  title: {
    default: 'Ache um Livro — Encontre o Livro Perfeito para Você',
    template: '%s | Ache um Livro',
  },
  description: 'Descubra o próximo livro que você vai amar. Busque por gênero, número de páginas, autores nacionais e muito mais.',
  openGraph: { siteName: 'Ache um Livro', locale: 'pt_BR', type: 'website' },
};

const NAV_LINKS = [
  { href: '/categoria/suspense', label: 'Suspense' },
  { href: '/categoria/romance', label: 'Romance' },
  { href: '/categoria/ciencia', label: 'Ciência' },
  { href: '/categoria/fantasia', label: 'Fantasia' },
  { href: '/categoria/historia', label: 'História' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900`}>
        <header className="border-b border-gray-200 px-4 py-3">
          <nav className="max-w-5xl mx-auto flex items-center gap-6">
            <Link href="/" className="font-bold text-lg text-blue-700 shrink-0">📚 Ache um Livro</Link>
            <div className="flex gap-4 text-sm text-gray-600 overflow-x-auto">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="hover:text-blue-600 transition-colors whitespace-nowrap">{l.label}</Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 px-4 py-6 mt-12 text-center text-xs text-gray-400">
          <p>Ache um Livro — Participante do Programa de Afiliados da Amazon Brasil.</p>
          <p className="mt-1">Os preços e disponibilidade são definidos pela Amazon e podem mudar sem aviso.</p>
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add root layout with nav, footer, and default SEO metadata"
```

---

## Task 17: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Ache um Livro — Encontre o Livro Perfeito para Você',
  description: 'Busque livros por gênero, número de páginas e autores nacionais. Compre na Amazon Brasil com um clique.',
};

const EMOJIS: Record<string, string> = {
  suspense: '🔪', romance: '💕', ciencia: '🔬', fantasia: '🧙',
  historia: '📜', autoajuda: '✨', biografia: '👤', 'ficcao-cientifica': '🚀',
};

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-2">Qual livro você vai ler hoje?</h1>
      <p className="text-gray-500 mb-8 text-sm">Busque por título, autor ou gênero e encontre sua próxima leitura</p>
      <SearchBar />
      <div className="mt-10">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Explorar por categoria</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/categoria/${cat}`}
              className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {EMOJIS[cat]} {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000 — expected: centered search bar with category pills below.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with search bar and category pill navigation"
```

---

## Task 18: Search Results Page

**Files:**
- Create: `src/app/busca/page.tsx`

- [ ] **Step 1: Create `src/app/busca/page.tsx`**

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Book, Filters } from '@/types/book';
import { applyFilters } from '@/lib/filters';
import SearchBar from '@/components/SearchBar';
import BookGrid from '@/components/BookGrid';
import FilterSidebar from '@/components/FilterSidebar';

const DEFAULT_FILTERS: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => setBooks(data.books ?? []))
      .finally(() => setLoading(false));
  }, [q]);

  const filtered = applyFilters(books, filters);

  return (
    <div>
      <div className="mb-6"><SearchBar defaultValue={q} /></div>
      {q && (
        <p className="text-sm text-gray-500 mb-6">
          {loading ? 'Buscando...' : `${filtered.length} resultado(s) para "${q}"`}
        </p>
      )}
      <div className="flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div className="flex-1">
          {loading
            ? <div className="text-center py-16 text-gray-400">Carregando livros...</div>
            : <BookGrid books={filtered} />
          }
        </div>
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Carregando...</div>}>
      <SearchResults />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to http://localhost:3000/busca?q=suspense — expected: sidebar filters on left, book grid on right.

- [ ] **Step 3: Commit**

```bash
git add src/app/busca/page.tsx
git commit -m "feat: add client-side search results page with filters"
```

---

## Task 19: Category Landing Page (ISR + SEO)

**Files:**
- Create: `src/app/categoria/[genero]/page.tsx`

- [ ] **Step 1: Create `src/app/categoria/[genero]/page.tsx`**

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { searchBooks } from '@/lib/google-books';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_QUERIES, Category } from '@/lib/categories';
import BookGrid from '@/components/BookGrid';
import SearchBar from '@/components/SearchBar';

export const revalidate = 86400;

export async function generateStaticParams() {
  return CATEGORIES.map(genero => ({ genero }));
}

export async function generateMetadata({ params }: { params: { genero: string } }): Promise<Metadata> {
  const label = CATEGORY_LABELS[params.genero as Category];
  if (!label) return {};
  return {
    title: `Melhores Livros de ${label} para Ler`,
    description: `Encontre os melhores livros de ${label} e compre na Amazon Brasil. Filtre por número de páginas, autores nacionais e livros disponíveis em português.`,
    openGraph: {
      title: `Melhores Livros de ${label} | Ache um Livro`,
      description: `Os melhores livros de ${label} com links diretos para compra na Amazon Brasil.`,
    },
  };
}

export default async function CategoriaPage({ params }: { params: { genero: string } }) {
  const genero = params.genero as Category;
  if (!CATEGORIES.includes(genero)) notFound();

  const books = await searchBooks(CATEGORY_QUERIES[genero], 20);
  const label = CATEGORY_LABELS[genero];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Livros de {label}</h1>
        <p className="text-gray-500 text-sm">Explore os melhores títulos de {label} e compre na Amazon Brasil.</p>
      </div>
      <div className="mb-6">
        <SearchBar placeholder={`Buscar em ${label}...`} />
      </div>
      <BookGrid books={books} />
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/categoria/suspense — expected: "Livros de Suspense" H1 and book grid.

- [ ] **Step 3: Commit**

```bash
git add src/app/categoria/[genero]/page.tsx
git commit -m "feat: add ISR category landing pages with SEO metadata"
```

---

## Task 20: Book Detail Page (ISR + SEO + Schema.org)

**Files:**
- Create: `src/app/livro/[id]/[slug]/page.tsx`

- [ ] **Step 1: Create `src/app/livro/[id]/[slug]/page.tsx`**

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBook, getSimilarBooks } from '@/lib/google-books';
import { buildAffiliateLink } from '@/lib/affiliate';
import AmazonButton from '@/components/AmazonButton';
import SimilarBooks from '@/components/SimilarBooks';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await getBook(params.id);
  if (!book) return {};
  const desc = book.description.slice(0, 155) || `Saiba mais sobre "${book.title}" de ${book.authors[0]} e compre na Amazon Brasil.`;
  return {
    title: `${book.title} — ${book.authors[0] ?? ''}`,
    description: desc,
    openGraph: {
      title: book.title,
      description: desc,
      images: book.thumbnail ? [{ url: book.thumbnail }] : [],
    },
  };
}

export default async function LivroPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  if (!book) notFound();

  const similar = await getSimilarBooks(book);
  const affiliateUrl = buildAffiliateLink(book.title, book.authors[0] ?? '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.authors[0] ?? '' },
    numberOfPages: book.pageCount,
    publisher: book.publisher,
    datePublished: book.publishedDate,
    description: book.description,
    image: book.thumbnail,
    inLanguage: book.language,
    offers: {
      '@type': 'Offer',
      url: affiliateUrl,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Amazon Brasil' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="shrink-0">
          <div className="relative w-40 h-56 bg-gray-100 rounded overflow-hidden">
            {book.thumbnail ? (
              <Image src={book.thumbnail} alt={book.title} fill className="object-cover" sizes="160px" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Sem capa</div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
          <p className="text-gray-500 mb-1">{book.authors.join(', ')}</p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4">
            {book.pageCount > 0 && <span>{book.pageCount} páginas</span>}
            {book.publishedDate && <span>· {book.publishedDate.slice(0, 4)}</span>}
            {book.publisher && <span>· {book.publisher}</span>}
            <span>· {book.isNational ? '🇧🇷 Nacional' : '🌍 Internacional'}</span>
            {book.isPortuguese && <span>· ✅ Disponível em Português</span>}
          </div>
          {book.description && (
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">{book.description}</p>
          )}
          <AmazonButton title={book.title} author={book.authors[0] ?? ''} affiliateUrl={affiliateUrl} />
        </div>
      </div>
      <SimilarBooks books={similar} />
    </>
  );
}
```

- [ ] **Step 2: Allow Google Books image domain in `next.config.ts`**

Open `next.config.ts` and add:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'books.google.com' },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Search for a book, click on it — expected: cover image, metadata, orange buy button, and similar books row.

- [ ] **Step 4: Commit**

```bash
git add src/app/livro/[id]/[slug]/page.tsx next.config.ts
git commit -m "feat: add ISR book detail page with Schema.org markup and affiliate buy button"
```

---

## Task 21: Sitemap + robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...CATEGORIES.map(cat => ({
      url: `${SITE}/categoria/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```typescript
import { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acheumlivro.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/busca' },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open http://localhost:3000/sitemap.xml — expected: XML listing homepage + all category URLs.
Open http://localhost:3000/robots.txt — expected: `Disallow: /busca` and sitemap URL.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add auto-generated sitemap.xml and robots.txt"
```

---

## Task 22: Full Test Suite + Production Build

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all test suites pass with no failures.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: build succeeds. Static pages generated for all `/categoria/[genero]` routes. No TypeScript errors.

- [ ] **Step 3: Fix any build errors**

If TypeScript errors appear, fix each one before proceeding. Common issues:
- Missing `as const` on route param types
- `any` type not suppressed with eslint comment
- Image `sizes` prop warnings

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors and type warnings"
```

---

## Task 23: Vercel Deployment

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 2: Deploy**

```bash
vercel
```

Follow prompts: link to your Vercel account, set project name to `acheumlivro`, accept defaults.

- [ ] **Step 3: Set environment variables**

```bash
vercel env add GOOGLE_BOOKS_API_KEY production
# paste your Google Cloud API key when prompted

vercel env add NEXT_PUBLIC_AMAZON_AFFILIATE_TAG production
# value: rondinellyc09-20

vercel env add NEXT_PUBLIC_SITE_URL production
# value: https://acheumlivro.vercel.app (or your custom domain)
```

To get a Google Books API key:
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "Books API"
4. Create an API key under Credentials

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 5: Verify production**

Open the Vercel URL and check:
- `/` — homepage loads with search bar
- `/categoria/suspense` — category page loads with real books from Google Books
- `/sitemap.xml` — sitemap is accessible with correct domain

- [ ] **Step 6: Submit sitemap to Google Search Console**

1. Go to https://search.google.com/search-console
2. Add your domain as a property
3. Verify ownership (Vercel makes this easy via DNS TXT record)
4. Submit `https://your-domain/sitemap.xml` under Sitemaps
