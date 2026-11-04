import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Template Code Makers | Climatização',
        short_name: 'Template Code Makers',
        description: 'Template demonstrativo de climatização.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1c397f',
        lang: 'pt-BR',
    };
}
