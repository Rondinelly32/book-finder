# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build (run before deploying to catch errors)
npm run lint      # ESLint
npm test          # Run all Jest tests
npx jest __tests__/lib/filters.test.ts   # Run a single test file
```

Deploy to production:
```bash
git add <files> && git commit -m "..." && git push book-finder main && vercel --prod
```

The git remote is named `book-finder` (not `origin`).

## Architecture

**Ache um Livro** — Portuguese-only book discovery site for Brazilian readers, monetized via Amazon Brasil affiliate links (`rondinellyc09-20`). All UI is in Portuguese.

### Data flow

All book data comes from **Open Library** (`openlibrary.org`), searched with `language=por` so results are Portuguese editions only. Google Books is still present in the codebase (`src/lib/google-books.ts`) but is only used for `getSimilarBooks` on the book detail page.

For each search result (work-level from Open Library), the app fetches the Portuguese *edition* in parallel to get the Portuguese title, cover, ISBN, and page count — since work titles are canonical (English). This is cached with `revalidate: 3600`.

```
Browser
  → /busca page (client-side, not indexed)
  → GET /api/search?q=...&genre=...&pages=...&origem=...
  → searchOpenLibrary() → OL search.json?language=por
                        → fetchPtEdition() × N (parallel, cached)
  → applyFilters() (server-side)
  → JSON response

/livro/[id]/[slug] (ISR, 24h)
  → getOpenLibraryBook(olKey)  [work.json + editions.json + author.json]
  → getSimilarBooks() [Google Books, by subject]
  → buildAffiliateLink() → amazon.com.br/dp/{isbn}?tag=... (falls back to /s?k=...)
```

### Key files

| File | Purpose |
|---|---|
| `src/lib/open-library.ts` | All Open Library fetching: `searchOpenLibrary`, `getOpenLibraryBook`, `fetchPtEdition` |
| `src/lib/google-books.ts` | `getSimilarBooks` (still Google Books), `parseVolume` |
| `src/lib/affiliate.ts` | `buildAffiliateLink(title, author, isbn?)` — uses `/dp/{isbn}` when ISBN available |
| `src/lib/filters.ts` | `applyFilters()` — pure function, filters by pageRange/origem/portugues |
| `src/lib/categories.ts` | Category slugs, labels, and Open Library subject query strings |
| `src/types/book.ts` | `Book` interface and `Filters` interface |
| `src/app/api/search/route.ts` | Search API route |
| `src/app/api/book/[id]/route.ts` | Book detail API route — routes `ol-*` IDs to Open Library |

### Book IDs

Open Library book IDs are prefixed with `ol-` (e.g. `ol-OL82563W`). The book detail route and page both check `params.id.startsWith('ol-')` to determine which data source to use.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG` | Amazon affiliate tag (`rondinellyc09-20`) |
| `GOOGLE_BOOKS_API_KEY` | Optional — only used for `getSimilarBooks` |

### Rendering strategy

- `/busca` — client-side only, not indexed by Google
- `/categoria/[genero]` — ISR 24h, SEO target
- `/livro/[id]/[slug]` — ISR 24h, SEO target with Schema.org `Book` JSON-LD
- `/sitemap.xml`, `/robots.txt` — static, disallows `/busca`

### Allowed image domains

`next.config.mjs` allows `books.google.com` and `covers.openlibrary.org`.
