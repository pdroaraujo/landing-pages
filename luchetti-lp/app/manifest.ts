import type { MetadataRoute } from 'next';
import { site } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: site.fullName,
        short_name: site.name,
        description: `Hidráulica e impermeabilização em ${site.city} desde ${site.since}.`,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0b6b2d',
        lang: 'pt-BR',
    };
}
