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
