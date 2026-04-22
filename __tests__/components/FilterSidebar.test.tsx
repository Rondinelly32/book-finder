import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterSidebar from '@/components/FilterSidebar';
import { Filters } from '@/types/book';

const defaultFilters: Filters = { genre: '', pageRange: 'all', origem: 'all', portugues: false };

describe('FilterSidebar', () => {
  it('renders all filter sections', () => {
    render(<FilterSidebar filters={defaultFilters} onChange={jest.fn()} />);
    expect(screen.getByText(/páginas/i)).toBeInTheDocument();
    expect(screen.getByText(/origem/i)).toBeInTheDocument();
    expect(screen.getByText(/idioma/i)).toBeInTheDocument();
  });

  it('calls onChange with curto when short radio selected', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/curto/i));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pageRange: 'curto' }));
  });

  it('calls onChange with nacional when nacional radio selected', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/nacional/i));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ origem: 'nacional' }));
  });

  it('calls onChange with portugues true when checkbox toggled', async () => {
    const onChange = jest.fn();
    render(<FilterSidebar filters={defaultFilters} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ portugues: true }));
  });
});
