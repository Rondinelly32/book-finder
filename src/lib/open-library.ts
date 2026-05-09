import { Book } from '@/types/book';

const BASE = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org/b/id';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPtEdition(workKey: string): Promise<PtEdition | null> {
  const key = workKey.replace('/works/', '');
  const res = await fetch(`${BASE}/works/${key}/editions.json?limit=50`, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'AcheUmLivro/1.0 (book discovery app)' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pt = (data.entries ?? []).find((e: any) =>
    (e.languages ?? []).some((l: { key: string }) => l.key === '/languages/por')
  );
  if (!pt) return null;
  return {
    title: pt.title,
    coverId: pt.covers?.[0],
    isbn: pt.isbn_10?.[0] ?? pt.isbn_13?.[0],
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

  const isbns: string[] = doc.isbn ?? [];
  const isbn = pt?.isbn ?? isbns.find(i => i.length === 10) ?? isbns.find(i => i.length === 13);

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
    isbn,
    isPortuguese: languages.includes('por'),
    isNational,
  };
}

export async function searchOpenLibrary(query: string, maxResults = 20): Promise<Book[]> {
  const fields = 'key,title,author_name,cover_i,language,publisher,subject,number_of_pages_median,first_publish_year,isbn';
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&language=por&limit=${maxResults}&fields=${fields}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'AcheUmLivro/1.0 (book discovery app)' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const docs: unknown[] = data.docs ?? [];

  // Fetch Portuguese edition titles in parallel (cached, so only expensive on first hit)
  const ptEditions = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    docs.map((doc: any) => fetchPtEdition(doc.key).catch(() => null))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return docs.map((doc: any, i) => parseDoc(doc, ptEditions[i]));
}

export async function getOpenLibraryBook(olKey: string): Promise<Book | null> {
  const [workRes, ptEdition] = await Promise.all([
    fetch(`${BASE}/works/${olKey}.json`, { next: { revalidate: 86400 } }),
    fetchPtEdition(`/works/${olKey}`),
  ]);
  if (!workRes.ok) return null;
  const data = await workRes.json();

  const authorKey = data.authors?.[0]?.author?.key;
  let authorName = '';
  if (authorKey) {
    const authorRes = await fetch(`${BASE}${authorKey}.json`, { next: { revalidate: 86400 } });
    if (authorRes.ok) {
      const authorData = await authorRes.json();
      authorName = authorData.name ?? '';
    }
  }

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
    authors: authorName ? [authorName] : [],
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
