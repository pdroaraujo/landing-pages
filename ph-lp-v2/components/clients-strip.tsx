import { site } from '@/lib/site-config';

/** Faixa de clientes em loop. A lista é duplicada só para o movimento contínuo; a cópia fica oculta para leitores de tela. */
export function ClientsStrip() {
    return (
        <section className="ph-clients" aria-labelledby="clientes-title">
            <p id="clientes-title" className="ph-clients__title">Empresas que já contrataram a PH</p>
            <div className="ph-clients__viewport">
                <div className="ph-clients__track">
                    {[0, 1].map((copy) => (
                        <ul className="ph-clients__list" key={copy} aria-hidden={copy === 1 || undefined}>
                            {site.clients.map((client) => (
                                <li key={client.name}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={client.logo} alt={copy === 0 ? client.name : ''} height={48} loading="lazy" />
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        </section>
    );
}
