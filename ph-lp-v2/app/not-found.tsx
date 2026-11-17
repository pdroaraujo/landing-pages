import type { Metadata } from 'next';
import { Subpage } from '@/components/subpage';
import { photos } from '@/lib/site-config';

export const metadata: Metadata = {
    title: 'Página não encontrada | PH Container',
    robots: { index: false, follow: true },
};

export default function NotFound() {
    return (
        <Subpage
            crumbs={[{ name: 'Página não encontrada' }]}
            chip="Erro 404"
            title="Essa página saiu do pátio."
            lead="A página que você procura não existe, foi removida ou o endereço está incorreto."
            image={photos.patio}
            secondaryAction={{ label: 'Voltar para o início', href: '/' }}
        >
            <section className="sp-section">
                <div className="sp-wrap sp-prose">
                    <p>
                        Procurando container na sua cidade? Veja as <a href="/cidades/">cidades atendidas</a> ou volte
                        para a <a href="/">página inicial</a>.
                    </p>
                </div>
            </section>
        </Subpage>
    );
}
