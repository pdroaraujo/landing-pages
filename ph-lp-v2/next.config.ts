import type { NextConfig } from 'next';

// Site 100% estático: `npm run build` gera a pasta `out/`, que sobe inteira
// para a Hostinger (public_html). trailingSlash mantém as URLs atuais
// (/sobre/, /cidades/, /container-em-<cidade>/) — não mudar, o SEO depende delas.
// Cabeçalhos de segurança, HTTPS e redirects ficam no public/.htaccess.
const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
};

export default nextConfig;
