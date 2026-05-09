export function buildAffiliateLink(title: string, author: string, isbn?: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ?? '';
  if (isbn) {
    return `https://www.amazon.com.br/dp/${isbn}?tag=${tag}`;
  }
  const k = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com.br/s?k=${k}&tag=${tag}`;
}
