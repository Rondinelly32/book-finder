export function buildAffiliateLink(title: string, author: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ?? '';
  const k = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com.br/s?k=${k}&tag=${tag}`;
}
