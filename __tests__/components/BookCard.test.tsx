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
