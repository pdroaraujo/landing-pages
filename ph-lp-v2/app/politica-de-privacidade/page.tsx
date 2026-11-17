import type { Metadata } from 'next';
import { Subpage } from '@/components/subpage';
import { photos, site } from '@/lib/site-config';

export const metadata: Metadata = {
    title: 'Política de Privacidade | PH Container',
    description: 'Como a PH Container coleta, usa e protege os dados pessoais de quem visita o site, conforme a LGPD.',
    alternates: { canonical: '/politica-de-privacidade/' },
    robots: { index: true, follow: true },
};

export default function PrivacidadePage() {
    return (
        <Subpage crumbs={[{ name: 'Política de Privacidade' }]} title="Política de Privacidade" lead="Última atualização: 22 de agosto de 2026" image={photos.patio}>
            <section className="sp-section">
                <div className="sp-wrap sp-prose">
                    <p>
                        A PH Container respeita a sua privacidade e está comprometida em proteger os dados pessoais
                        coletados através deste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
                        13.709/2018 - LGPD).
                    </p>
                    <h2>1. Quais dados coletamos</h2>
                    <ul>
                        <li>Dados de contato que você nos fornece voluntariamente ao entrar em contato via WhatsApp, e-mail ou telefone (nome, número de telefone, e-mail e conteúdo da mensagem);</li>
                        <li>Dados de navegação coletados automaticamente por cookies e ferramentas de análise, como endereço IP, tipo de navegador, páginas visitadas e tempo de permanência no site.</li>
                    </ul>
                    <h2>2. Como usamos seus dados</h2>
                    <ul>
                        <li>Para responder às suas solicitações de orçamento e contato;</li>
                        <li>Para entender como os visitantes usam o site e melhorar sua experiência e nosso conteúdo;</li>
                        <li>Para fins estatísticos, por meio do Google Analytics.</li>
                    </ul>
                    <h2 id="cookies">3. Cookies</h2>
                    <p>
                        Utilizamos cookies para melhorar a experiência de navegação e para análise de tráfego (Google
                        Analytics). Você pode gerenciar ou desativar os cookies diretamente nas configurações do seu
                        navegador, ou recusar o uso de cookies não essenciais no banner exibido ao acessar o site.
                    </p>
                    <h2>4. Compartilhamento de dados</h2>
                    <p>
                        Não vendemos seus dados pessoais. Podemos compartilhar dados com prestadores de serviço que nos
                        auxiliam a operar o site (como o Google Analytics), sempre limitados à finalidade descrita
                        nesta política.
                    </p>
                    <h2>5. Seus direitos</h2>
                    <p>
                        Nos termos da LGPD, você pode solicitar a qualquer momento a confirmação da existência de
                        tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus dados
                        pessoais, entrando em contato pelo e-mail <a href={`mailto:${site.email}`}>{site.email}</a>.
                    </p>
                    <h2>6. Alterações nesta política</h2>
                    <p>Esta política pode ser atualizada periodicamente. Recomendamos revisá-la de tempos em tempos.</p>
                    <h2>7. Contato</h2>
                    <p>
                        Em caso de dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail{' '}
                        <a href={`mailto:${site.email}`}>{site.email}</a> ou pelo telefone {site.phone}.
                    </p>
                </div>
            </section>
        </Subpage>
    );
}
