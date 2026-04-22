import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('SearchBar', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders input and submit button', () => {
    render(<SearchBar />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('navigates to /busca with query on submit', async () => {
    render(<SearchBar />);
    await userEvent.type(screen.getByRole('textbox'), 'Duna');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(mockPush).toHaveBeenCalledWith('/busca?q=Duna');
  });

  it('pre-fills with defaultValue', () => {
    render(<SearchBar defaultValue="suspense" />);
    expect(screen.getByRole('textbox')).toHaveValue('suspense');
  });

  it('does not navigate on empty submit', async () => {
    render(<SearchBar />);
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
