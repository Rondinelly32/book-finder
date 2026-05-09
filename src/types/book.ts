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
  /** ISBN-10 used for direct Amazon product link */
  isbn?: string;
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
