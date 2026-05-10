import { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://proximolivro.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/busca' },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
