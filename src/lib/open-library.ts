import { Book } from '@/types/book';

const BASE = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org/b/id';
const HEADERS = { 'User-Agent': 'ProximoLivro/1.0 (book discovery app)' };

const BRAZILIAN_PUBLISHERS = [
  'companhia das letras', 'record', 'intrínseca', 'intrinseca',
  'rocco', 'sextante', 'darkside', 'suma', 'novo conceito',
  'planeta', 'leya', 'ediouro', 'globo livros', 'aleph',
];

interface PtEdition {
  title?: string;
  coverId?: number;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
}

/**
 * Find a Brazilian (85) or Portuguese (972/989) ISBN from a list.
 * Prefer ISBN-10 over ISBN-13 for Amazon /dp/ links (ASIN = ISBN-10 for books).
 */
function findPtIsbn(isbns: string[]): string | undefined {
  const ptPrefixes10 = ['85', '972', '989'];
  const ptPrefixes13 = ['97885', '97897'];
  return (
    isbns.find(i => i.length === 10 && ptPrefixes10.some(p => i.startsWith(p))) ??
    isbns.find(i => i.length === 13 && ptPrefixes13.some(p => i.startsWith(p)))
  );
}

async function fetchEditionByIsbn(isbn: string): Promise<PtEdition | null> {
  const res = await fetch(`${BASE}/isbn/${isbn}.json`, {
    next: { revalidate: 86400 },
    headers: HEADERS,
  });
  if (!res.ok) return null;
  const e = await res.json();
  // Prefer ISBN-10 for Amazon /dp/ ASIN links
  const isbn10 = e.isbn_10?.[0] ?? (isbn.length === 10 ? isbn : undefined);
  return {
    title: e.title,
    coverId: e.covers?.[0],
    isbn: isbn10 ?? e.isbn_13?.[0],
    pageCount: e.number_of_pages ?? 0,
    publisher: e.publishers?.[0] ?? '',
  };
}

/**
 * Fetch Portuguese edition data for a work.
 * Fast path: use PT/BR ISBN already known from search result.
 * Slow path: paginate editions.json.
 */
async function fetchPtEdition(workKey: string, isbns: string[] = []): Promise<PtEdition | null> {
  const ptIsbn = findPtIsbn(isbns);
  if (ptIsbn) {
    const result = await fetchEditionByIsbn(ptIsbn).catch(() => null);
    if (result) return result;
  }

  // Fallback: scan first 50 editions
  const key = workKey.replace('/works/', '');
  const res = await fetch(`${BASE}/works/${key}/editions.json?limit=50`, {
    next: { revalidate: 3600 },
    headers: HEADERS,
  });
  if (!res.ok) return null;
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pt = (data.entries ?? []).find((e: any) =>
    (e.languages ?? []).some((l: { key: string }) => l.key === '/languages/por')
  );
  if (!pt) return null;
  const isbn10 = pt.isbn_10?.[0];
  const isbn13 = pt.isbn_13?.[0];
  return {
    title: pt.title,
    coverId: pt.covers?.[0],
    isbn: isbn10 ?? isbn13,
    pageCount: pt.number_of_pages ?? 0,
    publisher: pt.publishers?.[0] ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDoc(doc: any, pt: PtEdition | null): Book {
  const publisher = pt?.publisher || (doc.publisher?.[0] ?? '');
  const languages: string[] = doc.language ?? [];
  const language = languages.includes('por') ? 'pt' : (languages[0] ?? '');
  const coverId = pt?.coverId ?? doc.cover_i;
  const thumbnail = coverId ? `${COVERS}/${coverId}-M.jpg` : '';
  const isNational = BRAZILIAN_PUBLISHERS.some(p => publisher.toLowerCase().includes(p));
  const olKey = (doc.key as string).replace('/works/', '');

  return {
    id: `ol-${olKey}`,
    title: pt?.title ?? doc.title ?? 'Sem título',
    authors: doc.author_name ?? [],
    description: '',
    categories: doc.subject ? [doc.subject[0]] : [],
    pageCount: pt?.pageCount ?? doc.number_of_pages_median ?? 0,
    language,
    publisher,
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
    thumbnail,
    isbn: pt?.isbn,
    isPortuguese: languages.includes('por'),
    isNational,
  };
}

export async function searchOpenLibrary(query: string, maxResults = 20): Promise<Book[]> {
  const fields = 'key,title,author_name,cover_i,language,publisher,subject,number_of_pages_median,first_publish_year,isbn';
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&language=por&limit=${maxResults}&fields=${fields}`;
  const res = await fetch(url, { next: { revalidate: 3600 }, headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const docs: unknown[] = data.docs ?? [];

  // Resolve PT edition for each work in parallel using ISBNs already in the response
  const ptEditions = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docs.map((doc: any) => fetchPtEdition(doc.key, doc.isbn ?? []).catch(() => null))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return docs.map((doc: any, i) => parseDoc(doc, ptEditions[i]));
}

const GENERIC_SUBJECTS = new Set([
  'fiction', 'general', 'literature', 'american literature', 'english literature',
  'large type books', 'new york times bestseller', 'accessible book',
  'internet archive wishlist', 'in library', 'overdrive', 'protected daisy',
  'fictitious character', 'open library staff picks',
]);

export async function getWorkSubjects(olKey: string): Promise<string[]> {
  const res = await fetch(`${BASE}/works/${olKey}.json`, {
    next: { revalidate: 86400 },
    headers: HEADERS,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.subjects ?? []) as string[])
    .filter(s => !GENERIC_SUBJECTS.has(s.toLowerCase()) && !s.startsWith('nyt:') && s.length < 50)
    .slice(0, 5);
}

export async function getOpenLibraryBook(olKey: string): Promise<Book | null> {
  // Fetch work data and ISBNs for this work in parallel
  const [workRes, isbnRes] = await Promise.all([
    fetch(`${BASE}/works/${olKey}.json`, { next: { revalidate: 86400 }, headers: HEADERS }),
    fetch(`${BASE}/search.json?q=key:/works/${olKey}&fields=isbn&limit=1`, {
      next: { revalidate: 86400 },
      headers: HEADERS,
    }),
  ]);
  if (!workRes.ok) return null;
  const data = await workRes.json();

  const isbns: string[] = isbnRes.ok
    ? ((await isbnRes.json()).docs?.[0]?.isbn ?? [])
    : [];

  const [authorData, ptEdition] = await Promise.all([
    (async () => {
      const authorKey = data.authors?.[0]?.author?.key;
      if (!authorKey) return null;
      const r = await fetch(`${BASE}${authorKey}.json`, { next: { revalidate: 86400 }, headers: HEADERS });
      return r.ok ? r.json() : null;
    })(),
    fetchPtEdition(`/works/${olKey}`, isbns),
  ]);

  const description =
    typeof data.description === 'string'
      ? data.description
      : (data.description?.value ?? '');

  const coverId = ptEdition?.coverId ?? data.covers?.[0];
  const publisher = ptEdition?.publisher ?? '';
  const isNational = BRAZILIAN_PUBLISHERS.some(p => publisher.toLowerCase().includes(p));

  return {
    id: `ol-${olKey}`,
    title: ptEdition?.title ?? data.title ?? 'Sem título',
    authors: authorData?.name ? [authorData.name] : [],
    description,
    categories: data.subjects ? [data.subjects[0]] : [],
    pageCount: ptEdition?.pageCount ?? 0,
    language: 'pt',
    publisher,
    publishedDate: data.first_publish_date ?? '',
    thumbnail: coverId ? `${COVERS}/${coverId}-M.jpg` : '',
    isbn: ptEdition?.isbn,
    isPortuguese: true,
    isNational,
  };
}
