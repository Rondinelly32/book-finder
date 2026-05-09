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

export async function searchBooks(query: string, maxResults = 20, langRestrict?: string): Promise<Book[]> {
  const lang = langRestrict ? `&langRestrict=${langRestrict}` : '';
  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books${lang}${key()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(parseVolume);
}

export async function getBook(id: string): Promise<Book | null> {
  const url = `${BASE}/volumes/${id}?printType=books${key()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return parseVolume(await res.json());
}

function normalizeSubject(category: string): string {
  // Google Books categories look like "Fiction / Science Fiction" — take the last segment
  const parts = category.split('/').map(s => s.trim());
  return parts[parts.length - 1];
}

export async function getSimilarBooks(book: Book, maxResults = 6): Promise<Book[]> {
  const rawSubject = book.categories[0];
  if (!rawSubject) return [];
  const subject = normalizeSubject(rawSubject);
  const q = `subject:${subject}`;
  const url = `${BASE}/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}&printType=books${key()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(parseVolume).filter((b: Book) => b.id !== book.id);
}
