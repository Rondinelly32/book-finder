# Ache um Livro — Design Spec

**Date:** 2026-04-22
**Project directory:** `/Users/rondi/bookfinder`
**Site name:** Ache um Livro

---

## Overview

A book discovery website for Portuguese-speaking Brazilian readers. Users search for books by genre, page count, origin, and Portuguese availability. Each book page shows similar titles and a direct Amazon Brazil affiliate buy button. The site is built for organic SEO traffic — Google surfaces category and book pages for Brazilian Portuguese search queries.

---

## Target Audience

Brazilian Portuguese-speaking readers looking for their next book. They find the site via Google searches like "melhores livros de suspense" or "livro parecido com Harry Potter". The UI is entirely in Portuguese.

---

## Architecture

**Approach: Next.js with ISR + API Routes** (deployed on Vercel)

```
Browser → Next.js Frontend (Vercel)
              ↓
         Next.js API Routes (server-side)
              ↓
         Google Books API (book data + recommendations)
              ↓
         amazon.com.br affiliate search URL (no Amazon API needed)
```

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes proxy Google Books API — API key stays server-side, never exposed to browser
- **Rendering:** ISR (Incremental Static Regeneration) for category and book pages — pre-built at deploy time, auto-refreshed every 24h
- **Hosting:** Vercel (free tier sufficient for MVP)
- **No database** — ISR serves as the caching layer

---

## Book Data — Google Books API

- **Free.** An API key is optional but recommended — unauthenticated requests are capped at 100/day; a free Google Cloud API key raises this to 1,000/day, sufficient for MVP traffic
- Provides: title, author, description, categories, page count, thumbnail, language, publisher, published date
- **Similar books:** Google Books has no dedicated "related" endpoint. Similar books are fetched by querying the same subject/category as the current book, excluding the current title. This is a best-effort approximation.
- **National vs international:** Google Books has no nationality field. "Nacional" is approximated by checking `language === 'pt'` AND publisher name containing Brazilian publishers (e.g. Companhia das Letras, Record, Intrínseca). This is imperfect and will have false positives.
- **Available in Portuguese:** determined by checking `language === 'pt'` on the Google Books volume

API base URL: `https://www.googleapis.com/books/v1/volumes`

---

## Amazon Affiliate Links

- **Affiliate ID:** `rondinellyc09-20` (stored as `AMAZON_AFFILIATE_TAG` environment variable in Vercel)
- **No Amazon API needed** — links are constructed as Amazon Brazil search URLs:

```
https://www.amazon.com.br/s?k={title}+{author}&tag=rondinellyc09-20
```

- The affiliate tag gives 4–6% commission on book purchases made within 24h of click
- **Amazon requirement:** 3 qualifying sales within the first 180 days to keep the account active

---

## Pages & Routing

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Homepage with search bar + category shortcuts |
| `/busca` | Client-side | Search results page with filters |
| `/categoria/[genero]` | ISR (24h) | Category landing page — SEO target |
| `/livro/[id]/[slug]` | ISR (24h) | Book detail page — SEO target |
| `/sitemap.xml` | Dynamic | Auto-generated sitemap |
| `/robots.txt` | Static | Crawl instructions |

### URL examples
- `/categoria/suspense`
- `/categoria/romance`
- `/categoria/ciencia`
- `/livro/ePub_OL26258W/o-codigo-da-vinci-dan-brown`

---

## Search & Filters

Search is powered by the Google Books API called from a Next.js API route (`/api/search`).

**Filter options:**

| Filter | Values |
|---|---|
| Gênero | suspense, romance, ciência, fantasia, história, autoajuda, ... |
| Número de páginas | Curto (<200), Médio (200–400), Longo (>400) |
| Origem | Nacional 🇧🇷, Internacional |
| Idioma | Disponível em Português |

Filters are applied client-side on the `/busca` page (not indexed by Google). The filter state lives in the URL query string (`/busca?q=suspense&pages=medio&origem=nacional`) for shareability.

---

## Book Detail Page

Each `/livro/[id]/[slug]` page displays:

- Book cover (og:image)
- Title, author, publisher, year
- Page count, genre, origin (national/international)
- Portuguese availability badge
- Description (from Google Books)
- **"Comprar na Amazon Brasil"** button (orange, Amazon-branded) — affiliate link
- **"Livros Parecidos"** row — 4–6 books from Google Books related volumes

---

## SEO Strategy

Every ISR page is fully optimized for Google.com.br:

- **Title tag** (Portuguese): e.g. `Melhores Livros de Suspense para Ler | Ache um Livro`
- **Meta description** (Portuguese): 150-char summary with target keywords
- **og:image:** book cover thumbnail from Google Books
- **Schema.org `Book` markup** on book detail pages (JSON-LD)
- **Canonical URLs** on all pages
- **Sitemap.xml** auto-generated listing all category and book pages
- **robots.txt** allowing all crawlers, disallowing `/busca` (dynamic, not worth indexing)

### Target keywords

| Page type | Example keywords |
|---|---|
| Category pages | "melhores livros de suspense", "livros de romance para ler" |
| Book detail pages | "[título] vale a pena ler", "livros parecidos com [título]" |
| Homepage | "encontrar livro para ler", "indicação de livro", "ache um livro" |

---

## UI Structure

### Homepage (`/`)
- Top nav: logo "Ache um Livro" + Categorias + Mais Lidos links
- Hero: centered search bar with placeholder "Buscar por título, autor ou gênero..."
- Quick category pills below: Suspense, Romance, Ciência, Fantasia, História, Autores Nacionais

### Search Results (`/busca`)
- Left sidebar: filter panel (genre, pages, origin, language)
- Right: book grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card: cover thumbnail, title, author, page count, "Comprar na Amazon" button

### Category Page (`/categoria/[genero]`)
- SEO-optimized H1 and description in Portuguese
- Same book grid as search results
- Pre-rendered with ISR, fully crawlable

### Book Detail (`/livro/[id]/[slug]`)
- Cover + metadata block + buy button
- Description section
- "Livros Parecidos" horizontal scroll row

---

## Environment Variables

| Variable | Value | Where |
|---|---|---|
| `GOOGLE_BOOKS_API_KEY` | (to be created) | Vercel + `.env.local` |
| `AMAZON_AFFILIATE_TAG` | `rondinellyc09-20` | Vercel + `.env.local` |

---

## Out of Scope (MVP)

- User accounts or reading lists
- Book reviews or ratings
- Newsletter or email capture
- Multiple Amazon storefronts (Portugal, international)
- Paid book APIs (ISBNdb, etc.)
- Analytics dashboard

---

## Success Criteria

1. Site renders correctly in Portuguese on mobile and desktop
2. Google Books search returns relevant results with all filters working
3. Every book page has a valid Amazon Brazil affiliate link
4. Category and book pages pass Google's Core Web Vitals
5. Sitemap is submitted to Google Search Console
6. Amazon Associados account reaches 3 qualifying sales within 180 days of launch
