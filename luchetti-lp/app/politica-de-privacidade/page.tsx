import type { Metadata } from 'next';
import { FloatingContact } from '@/components/floating-contact';
import { OwnerNavigation } from '@/components/owner-navigation';
import { RedSwoosh } from '@/components/red-swoosh';
import { SiteFooter } from '@/components/site-footer';
import { SiteMotion } from '@/components/site-motion';
import { ctaUrl, privacy, site } from '@/lib/site-config';
import '../owner-hero.css';
import '../floating-contact.css';
import '../brand.css';
import '../solution-page.css';
import '../legal.css';

const title = `Política de Privacidade e Cookies | ${site.name}`;
const description = `Como a ${site.fullName} trata dados pessoais neste site, de acordo com a LGPD (Lei nº 13.709/2018).`;

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/politica-de-privacidade' },
    openGraph: { type: 'website', locale: 'pt_BR', url: '/politica-de-privacidade', siteName: site.fullName, title, description },
};

const sections = [
    { id: 'quem-somos', label: 'Quem somos' },
    { id: 'resumo', label: 'Resumo' },
    { id: 'dados', label: 'Dados tratados' },
    { id: 'compartilhamento', label: 'Compartilhamento' },
    { id: 'retencao', label: 'Retenção' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'direitos', label: 'Seus direitos' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'contato', label: 'Contato' },
    { id: 'alteracoes', label: 'Alterações' },
];

export default function PrivacyPage() {
    const address = `${site.address.street}, ${site.address.district}, ${site.address.city}/${site.address.state}, CEP ${site.address.zip}`;

    return (
        <main id="topo" className="owner-home">
            <SiteMotion />
            <OwnerNavigation contactUrl={ctaUrl} basePath="/" />

            <header id="inicio" className="solution-hero">
                <div className="solution-hero__inner">
                    <nav aria-label="Você está em" className="solution-hero__crumbs">
                        <a href="/">Início</a>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">Privacidade e cookies</span>
                    </nav>
                    <h1>Política de Privacidade e Cookies</h1>
                    <RedSwoosh className="red-swoosh solution-hero__swoosh" />
                    <p>
                        Como a {site.name} trata dados pessoais neste site, de acordo com a Lei Geral de
                        Proteção de Dados (Lei nº 13.709/2018). Atualizada em {privacy.updatedAt}.
                    </p>
                </div>
            </header>

            <div className="legal">
                <nav className="legal__toc" aria-label="Nesta página">
                    <p>Nesta página</p>
                    <ol>
                        {sections.map((section) => (
                            <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
                        ))}
                    </ol>
                </nav>

                <article className="legal__body">
                    <section id="quem-somos">
                        <h2>1. Quem somos</h2>
                        <p>
                            O controlador dos dados pessoais tratados neste site é a <strong>{site.legalName}</strong>,
                            inscrita no CNPJ {site.cnpj}, com sede na {address}.
                        </p>
                    </section>

                    <section id="resumo">
                        <h2>2. Resumo</h2>
                        <ul>
                            <li>Este site <strong>não tem formulários</strong> e não exige cadastro.</li>
                            <li>Não usamos <strong>cookies</strong> de rastreamento, de publicidade ou de estatística.</li>
                            <li>Só recebemos seus dados quando <strong>você</strong> decide falar com a gente por WhatsApp, telefone ou e-mail.</li>
                            <li>Não vendemos nem alugamos dados pessoais.</li>
                        </ul>
                    </section>

                    <section id="dados">
                        <h2>3. Quais dados tratamos e para quê</h2>
                        <h3>Ao navegar pelo site</h3>
                        <p>
                            O serviço que hospeda o site registra automaticamente dados técnicos de acesso, como
                            endereço IP, data e hora, navegador e página visitada. Esses registros servem para entregar
                            as páginas e proteger o site contra abusos e falhas. A base legal é o legítimo interesse
                            (art. 7º, IX, da LGPD) e o cumprimento de obrigação legal de guarda de registros de acesso
                            (art. 15 do Marco Civil da Internet, Lei nº 12.965/2014). Não usamos esses dados para
                            identificar você nem para fins de publicidade.
                        </p>
                        <h3>Ao entrar em contato</h3>
                        <p>
                            Quando você nos procura pelo WhatsApp, telefone ou e-mail, tratamos os dados que você
                            mesmo envia, como nome, telefone, e-mail, empresa e o conteúdo da mensagem (por exemplo,
                            a lista de materiais da obra). Usamos esses dados para responder, preparar o orçamento e,
                            se você fechar negócio, atender o pedido. A base legal é a execução de procedimentos
                            preliminares a um contrato, a seu pedido (art. 7º, V, da LGPD).
                        </p>
                        <p>
                            Os botões de WhatsApp abrem uma mensagem já escrita (por exemplo, &ldquo;gostaria de um
                            orçamento de hidráulica&rdquo;). Nada é enviado até você tocar em enviar, e você pode editar
                            o texto antes.
                        </p>
                        <p>
                            Não coletamos dados pessoais sensíveis e o site não é direcionado a crianças e adolescentes.
                        </p>
                    </section>

                    <section id="compartilhamento">
                        <h2>4. Com quem compartilhamos</h2>
                        <ul>
                            <li>
                                <strong>Hospedagem do site:</strong> Vercel Inc., que pode processar os registros de acesso
                                fora do Brasil. Essa transferência internacional segue as garantias do art. 33 da LGPD.
                            </li>
                            <li>
                                <strong>WhatsApp:</strong> se você escolher falar por lá, a conversa também é tratada pelo
                                WhatsApp (Meta), conforme a política de privacidade dele.
                            </li>
                            <li>
                                <strong>Autoridades:</strong> quando houver obrigação legal ou ordem judicial.
                            </li>
                        </ul>
                    </section>

                    <section id="retencao">
                        <h2>5. Por quanto tempo guardamos</h2>
                        <p>
                            Os dados de contato ficam guardados pelo tempo necessário para responder e acompanhar o
                            orçamento. Se você se tornar cliente, mantemos os dados pelos prazos exigidos pela legislação
                            fiscal, contábil e de defesa do consumidor. Depois disso, eles são eliminados ou anonimizados.
                            Os registros de acesso seguem o prazo legal aplicável.
                        </p>
                    </section>

                    <section id="cookies">
                        <h2>6. Cookies e armazenamento no navegador</h2>
                        <p>
                            Cookies são pequenos arquivos que um site grava no seu navegador. <strong>Este site não usa
                            cookies</strong>: nem próprios, nem de terceiros, nem de estatística ou publicidade.
                        </p>
                        <p>
                            A única informação que guardamos no seu navegador é a lembrança de que você já viu o aviso de
                            privacidade, para não mostrá-lo de novo. Ela fica no armazenamento local do navegador (chave{' '}
                            <code>{privacy.noticeKey}</code>), não identifica você e não é enviada para nós. Você pode
                            apagá-la a qualquer momento limpando os dados do site no seu navegador.
                        </p>
                        <p>
                            Os links para Google Maps, WhatsApp, Instagram, Facebook, LinkedIn e YouTube levam a sites de
                            terceiros, que podem usar cookies próprios conforme as políticas deles.
                        </p>
                        <p>
                            Se um dia passarmos a usar ferramentas de medição ou publicidade, esta política será
                            atualizada e pediremos o seu consentimento antes de ativar qualquer cookie não essencial.
                        </p>
                    </section>

                    <section id="direitos">
                        <h2>7. Seus direitos</h2>
                        <p>Pela LGPD (art. 18), você pode, a qualquer momento e sem custo:</p>
                        <ul>
                            <li>confirmar se tratamos dados seus e acessar esses dados;</li>
                            <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
                            <li>pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desconformidade;</li>
                            <li>pedir a portabilidade dos dados a outro fornecedor;</li>
                            <li>saber com quem compartilhamos seus dados;</li>
                            <li>revogar o consentimento, quando ele for a base do tratamento, e se opor a tratamentos baseados em outras bases legais.</li>
                        </ul>
                        <p>
                            Para exercer qualquer um desses direitos, escreva para{' '}
                            <a href={`mailto:${privacy.email}`}>{privacy.email}</a>. Respondemos nos prazos da LGPD.
                            Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).
                        </p>
                    </section>

                    <section id="seguranca">
                        <h2>8. Segurança</h2>
                        <p>
                            O site funciona apenas com conexão criptografada (HTTPS) e usa configurações de segurança
                            que reduzem riscos como a inserção do site em páginas de terceiros. O acesso aos dados de
                            contato é restrito à equipe que atende os orçamentos.
                        </p>
                    </section>

                    <section id="contato">
                        <h2>9. Fale sobre privacidade</h2>
                        <p>
                            Dúvidas sobre esta política ou sobre seus dados pessoais:{' '}
                            <a href={`mailto:${privacy.email}`}>{privacy.email}</a>, telefone {site.phone} ou no
                            endereço {address}.
                        </p>
                    </section>

                    <section id="alteracoes">
                        <h2>10. Alterações nesta política</h2>
                        <p>
                            Podemos atualizar esta política para refletir mudanças no site ou na legislação. A data da
                            última atualização aparece no topo da página.
                        </p>
                    </section>
                </article>
            </div>

            <SiteFooter basePath="/" />
            <FloatingContact />
        </main>
    );
}
