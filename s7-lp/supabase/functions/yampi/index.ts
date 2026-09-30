// Edge Function: yampi
//  Ponte entre a loja (/loja) e a API da Yampi. As chaves ficam só aqui no
//  servidor (secrets YAMPI_ALIAS, YAMPI_USER_TOKEN, YAMPI_SECRET_KEY).
//   - action "products": lista produtos ativos (com imagens, SKUs e preços)
//   - action "checkout": recebe o carrinho [{sku_id, quantity}] e cria um
//     link de pagamento da Yampi — o cliente é mandado pro checkout deles,
//     onde calcula o frete pelo CEP e paga (Pix, cartão, boleto).
//  Docs: https://docs.yampi.com.br (catalog/products e checkout/payment-link)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'content-type': 'application/json' } });

const ALIAS = Deno.env.get('YAMPI_ALIAS');
const TOKEN = Deno.env.get('YAMPI_USER_TOKEN');
const SECRET = Deno.env.get('YAMPI_SECRET_KEY');

async function yampi(path: string, init: RequestInit = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`https://api.dooki.com.br/v2/${ALIAS}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'User-Token': TOKEN!,
        'User-Secret-Key': SECRET!,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

// deno-lint-ignore no-explicit-any
const list = (x: any) => (Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : []);
// deno-lint-ignore no-explicit-any
const imgUrl = (img: any) => img?.large?.url ?? img?.medium?.url ?? img?.url ?? null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!ALIAS || !TOKEN || !SECRET) return json({ configured: false, products: [] });

  let body: { action?: string; items?: { sku_id: number; quantity: number }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'json inválido' }, 400);
  }

  if (body.action === 'products') {
    const r = await yampi('/catalog/products?include=images,skus&active=1&limit=50');
    if (!r.ok) return json({ configured: true, error: `Yampi respondeu ${r.status}` }, 502);
    // deno-lint-ignore no-explicit-any
    const products = list(r.body).map((p: any) => {
      // deno-lint-ignore no-explicit-any
      const skus = list(p.skus).map((s: any) => ({
        id: s.id,
        title: s.title ?? s.sku ?? p.name,
        price: Number(s.price_sale ?? s.price ?? 0),
        price_old: Number(s.price_discount ?? 0) > Number(s.price_sale ?? 0) ? Number(s.price_discount) : null,
        in_stock: (s.total_in_stock ?? 1) > 0 || s.allow_sell_without_customization === true,
      }));
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? '',
        image: imgUrl(list(p.images)[0]),
        skus,
      };
    });
    return json({ configured: true, products });
  }

  if (body.action === 'checkout') {
    const items = (body.items ?? []).filter((i) => i.sku_id && i.quantity > 0);
    if (!items.length) return json({ error: 'Carrinho vazio.' }, 400);
    const r = await yampi('/checkout/payment-link', {
      method: 'POST',
      body: JSON.stringify({
        name: `Loja S7 ${new Date().toISOString().slice(0, 16)}`,
        active: true,
        skus: items.map((i) => ({ id: i.sku_id, quantity: i.quantity })),
      }),
    });
    const link = r.body?.link_url ?? r.body?.data?.link_url;
    if (!r.ok || !link) return json({ error: `Não consegui abrir o checkout (Yampi ${r.status}).` }, 502);
    return json({ url: link });
  }

  return json({ error: 'ação inválida' }, 400);
});
