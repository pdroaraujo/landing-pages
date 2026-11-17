import type { MetadataRoute } from 'next';
import { cidadePath, cidades } from '@/lib/cidades';
import { site } from '@/lib/site-config';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: `${site.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
        { url: `${site.url}/sobre/`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
        { url: `${site.url}/cidades/`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        ...cidades.map((c) => ({
            url: `${site.url}${cidadePath(c)}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ];
}
