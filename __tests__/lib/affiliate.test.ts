import { buildAffiliateLink } from '@/lib/affiliate';

describe('buildAffiliateLink', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, NEXT_PUBLIC_AMAZON_AFFILIATE_TAG: 'rondinellyc09-20' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('builds a valid amazon.com.br search URL', () => {
    const url = buildAffiliateLink('Duna', 'Frank Herbert');
    expect(url).toContain('amazon.com.br/s');
    expect(url).toContain('tag=rondinellyc09-20');
  });

  it('includes title and author in query param k', () => {
    const url = buildAffiliateLink('Duna', 'Frank Herbert');
    const parsed = new URL(url);
    const k = parsed.searchParams.get('k') ?? '';
    expect(k).toContain('Duna');
    expect(k).toContain('Frank Herbert');
  });

  it('URL-encodes the query', () => {
    const url = buildAffiliateLink('O Código Da Vinci', 'Dan Brown');
    expect(() => new URL(url)).not.toThrow();
  });
});
