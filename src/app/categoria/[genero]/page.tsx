import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { searchOpenLibrary } from '@/lib/open-library';
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

  const books = await searchOpenLibrary(CATEGORY_QUERIES[genero], 20);
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
