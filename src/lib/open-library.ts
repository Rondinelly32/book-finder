import { Book } from '@/types/book';

const BASE = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org/b/id';

const BRAZILIAN_PUBLISHERS = [
  'companhia das letras', 'record', 'intrínseca', 'intrinseca',
  'rocco', 'sextante', 'darkside', 'suma', 'novo conceito',
  'planeta', 'leya', 'ediouro', 'globo livros', 'aleph',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDoc(doc: any): Book {
  const publisher = (doc.publisher?.[0] ?? '') as string;
  const languages: string[] = doc.language ?? [];
  const language = languages.includes('por') ? 'pt' : (languages[0] ?? '');
  const coverId = doc.cover_i;
  const thumbnail = coverId ? `${COVERS}/${coverId}-M.jpg` : '';
  const isNational = BRAZILIAN_PUBLISHERS.some(p => publisher.toLowerCase().includes(p));
  const olKey = (doc.key as string).replace('/works/', '');

  return {
    id: `ol-${olKey}`,
    title: doc.title ?? 'Sem título',
    authors: doc.author_name ?? [],
    description: '',
    categories: doc.subject ? [doc.subject[0]] : [],
    pageCount: doc.number_of_pages_median ?? 0,
    language,
    publisher,
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
    thumbnail,
    isPortuguese: languages.includes('por'),
    isNational,
  };
}

export async function searchOpenLibrary(query: string, maxResults = 20): Promise<Book[]> {
  const fields = 'key,title,author_name,cover_i,language,publisher,subject,number_of_pages_median,first_publish_year';
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&language=por&limit=${maxResults}&fields=${fields}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { 'User-Agent': 'AcheUmLivro/1.0 (book discovery app)' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.docs ?? []).map(parseDoc);
}

export async function getOpenLibraryBook(olKey: string): Promise<Book | null> {
  const [workRes, editionRes] = await Promise.all([
    fetch(`${BASE}/works/${olKey}.json`, { next: { revalidate: 86400 } }),
    fetch(`${BASE}/works/${olKey}/editions.json?limit=1`, { next: { revalidate: 86400 } }),
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

  let pageCount = 0;
  if (editionRes.ok) {
    const editionData = await editionRes.json();
    pageCount = editionData.entries?.[0]?.number_of_pages ?? 0;
  }

  const description =
    typeof data.description === 'string'
      ? data.description
      : (data.description?.value ?? '');

  const coverId = data.covers?.[0];

  return {
    id: `ol-${olKey}`,
    title: data.title ?? 'Sem título',
    authors: authorName ? [authorName] : [],
    description,
    categories: data.subjects ? [data.subjects[0]] : [],
    pageCount,
    language: 'pt',
    publisher: '',
    publishedDate: data.first_publish_date ?? '',
    thumbnail: coverId ? `${COVERS}/${coverId}-M.jpg` : '',
    isPortuguese: true,
    isNational: false,
  };
}
