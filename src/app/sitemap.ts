import { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://proximolivro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...CATEGORIES.map(cat => ({
      url: `${SITE}/categoria/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
