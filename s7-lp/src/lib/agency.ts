// Todo login criado pelo painel (vendedor, cliente...) usa o domínio da agência.
export const AGENCY_DOMAIN = 'agencias7.com.br';

/** limpa o que foi digitado pra virar a parte antes do @ (sem acento/espaço) */
export const emailUser = (v: string) =>
  v
    .split('@')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

