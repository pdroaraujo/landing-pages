import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PH Container | Locação de Containers e Munck',
        short_name: 'PH Container',
        description: 'Locação de containers e caminhão Munck no Vale do Paraíba desde 1995.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2b2b94',
        lang: 'pt-BR',
        icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
    };
}
