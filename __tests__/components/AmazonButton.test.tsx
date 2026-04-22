import { render, screen } from '@testing-library/react';
import AmazonButton from '@/components/AmazonButton';

describe('AmazonButton', () => {
  it('renders a link to amazon.com.br with affiliate tag', () => {
    render(
      <AmazonButton
        title="Duna"
        author="Frank Herbert"
        affiliateUrl="https://www.amazon.com.br/s?k=Duna&tag=rondinellyc09-20"
      />
    );
    const link = screen.getByRole('link', { name: /comprar na amazon/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('amazon.com.br'));
    expect(link).toHaveAttribute('href', expect.stringContaining('rondinellyc09-20'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
