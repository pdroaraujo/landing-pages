import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Nfc, ArrowRight, ArrowUpRight, Truck, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { brl } from '../../lib/format';

// Loja da S7 — página separada (ainda não linkada no site). Produtos e checkout
// vêm da Yampi via Edge Function "yampi" (as chaves ficam só no servidor).
// Sem a Yampi configurada, mostra um catálogo de exemplo pra ver o layout.

type Sku = { id: number; title: string; price: number; price_old: number | null; in_stock: boolean };
type Product = { id: number; name: string; slug: string; description: string; image: string | null; skus: Sku[] };
type CartItem = { sku_id: number; product: string; sku: string; price: number; quantity: number };

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yampi`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const WHATS = 'https://wa.me/5513936283974?text=' + encodeURIComponent('Olá! Vim pela loja da S7 e quero tirar uma dúvida.');
const CART_KEY = 's7-loja-carrinho';

const DEMO: Product[] = [
  { id: 1, name: 'Placa de Avaliação Google', slug: 'placa-avaliacao', description: 'Cliente encosta o celular e cai direto na tela de avaliar sua empresa.', image: null, skus: [{ id: 101, title: 'Unidade', price: 0, price_old: null, in_stock: true }] },
  { id: 2, name: 'Kit Mesas (4 placas)', slug: 'kit-mesas', description: 'Quatro placas com o mesmo link — ideal pra restaurantes e bares.', image: null, skus: [{ id: 201, title: 'Kit com 4', price: 0, price_old: null, in_stock: true }] },
  { id: 3, name: 'Display de Balcão', slug: 'display-balcao', description: 'Acrílico de pé pro caixa, com NFC e QR Code.', image: null, skus: [{ id: 301, title: 'Unidade', price: 0, price_old: null, in_stock: true }] },
  { id: 4, name: 'Placa Instagram / WhatsApp', slug: 'placa-social', description: 'Leva pro seu perfil ou abre conversa com mensagem pronta.', image: null, skus: [{ id: 401, title: 'Unidade', price: 0, price_old: null, in_stock: true }] },
  { id: 5, name: 'Placa Cardápio Digital', slug: 'placa-cardapio', description: 'Abre o cardápio no celular do cliente, sem app.', image: null, skus: [{ id: 501, title: 'Unidade', price: 0, price_old: null, in_stock: true }] },
  { id: 6, name: 'Placa Wi-Fi', slug: 'placa-wifi', description: 'Conecta o cliente no Wi-Fi da loja sem digitar senha.', image: null, skus: [{ id: 601, title: 'Unidade', price: 0, price_old: null, in_stock: true }] },
];

const readCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
};

async function callYampi<T>(body: object): Promise<T> {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white md:text-sm"
    >
      <span className="absolute inset-0 z-0 -translate-x-[105%] bg-[#fe0000] transition-transform duration-500 ease-out group-hover:translate-x-0" />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

export default function Loja() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Loja | Agência S7';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    callYampi<{ configured?: boolean; products?: Product[]; error?: string }>({ action: 'products' })
      .then((r) => {
        if (r.configured && r.products?.length) {
          setProducts(r.products);
        } else {
          setDemo(true);
          setProducts(DEMO);
        }
      })
      .catch(() => {
        setDemo(true);
        setProducts(DEMO);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* navegação privada: carrinho só em memória */
    }
  }, [cart]);

  const count = cart.reduce((a, i) => a + i.quantity, 0);
  const total = useMemo(() => cart.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);

  const add = (p: Product, s: Sku) => {
    setCart((c) => {
      const found = c.find((i) => i.sku_id === s.id);
      if (found) return c.map((i) => (i.sku_id === s.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...c, { sku_id: s.id, product: p.name, sku: s.title, price: s.price, quantity: 1 }];
    });
    setOpen(true);
  };
  const setQty = (skuId: number, q: number) =>
    setCart((c) => (q <= 0 ? c.filter((i) => i.sku_id !== skuId) : c.map((i) => (i.sku_id === skuId ? { ...i, quantity: q } : i))));

  const checkout = async () => {
    if (demo) {
      setErr('Catálogo de exemplo: conecte a Yampi (chaves no servidor) pra finalizar compras de verdade.');
      return;
    }
    setCheckingOut(true);
    setErr(null);
    try {
      const r = await callYampi<{ url?: string; error?: string }>({
        action: 'checkout',
        items: cart.map((i) => ({ sku_id: i.sku_id, quantity: i.quantity })),
      });
      if (!r.url) throw new Error(r.error ?? 'Não consegui abrir o checkout.');
      window.location.href = r.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não consegui abrir o checkout.');
      setCheckingOut(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f0f0f] font-sans text-[#f4f4f5] selection:bg-[#fe0000] selection:text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] z-0 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[#fe0000] opacity-[0.3] blur-[180px]" />

      {/* HEADER — igual ao do site */}
      <header className="fixed left-0 top-0 z-50 w-full bg-[#0f0f0f]/85 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="S7" width="500" height="500" className="h-14 w-auto md:h-16" />
            <span className="hidden text-[11px] font-bold uppercase tracking-widest text-white/50 sm:inline">Loja</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">
              <CtaLink href={WHATS}>Fale conosco</CtaLink>
            </span>
            <button
              onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10 md:h-12 md:w-12"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#fe0000] px-1 text-[10px] font-bold">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 md:pt-44">
        {/* HERO */}
        <section className="mx-auto mb-24 max-w-[1400px] px-6 md:mb-32 md:px-12">
          <h1 className="max-w-[1200px] text-[14vw] font-bold uppercase leading-[0.9] tracking-tighter sm:text-[11vw] md:text-5xl lg:text-[7vw]">
            Placas que <br /> trazem <span className="text-[#fe0000]">avaliação.</span>
          </h1>
          <div className="mt-12 grid items-end gap-10 md:mt-16 md:grid-cols-2">
            <div className="flex items-center gap-4 text-sm font-medium uppercase tracking-widest text-white/50">
              <div className="h-[1px] w-12 bg-white/20" />
              <p>
                S7 Card · NFC + QR Code
                <br />
                <span className="text-[#fe0000]">Encostou, avaliou.</span>
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href="#produtos"
                className="group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full border border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-widest sm:w-auto sm:justify-center"
              >
                <span className="absolute inset-0 z-0 -translate-x-[105%] bg-[#fe0000] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                <span className="relative z-10">Ver produtos</span>
                <ArrowRight size={18} className="relative z-10" />
              </a>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="mx-auto mb-24 max-w-[1400px] px-6 md:px-12">
          <div className="grid border-y border-white/10 sm:grid-cols-3">
            {[
              { icon: Zap, t: 'Sem app', d: 'Funciona em qualquer celular com NFC ou câmera.' },
              { icon: Truck, t: 'Envio pra todo o Brasil', d: 'Frete calculado pelo CEP no checkout.' },
              { icon: ShieldCheck, t: 'Pagamento seguro', d: 'Pix, cartão e boleto pelo checkout Yampi.' },
            ].map((b, i) => (
              <div key={b.t} className={`flex gap-4 px-2 py-8 sm:px-6 ${i > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}>
                <b.icon size={20} className="mt-0.5 shrink-0 text-[#fe0000]" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest">{b.t}</p>
                  <p className="mt-1 text-sm text-white/50">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUTOS */}
        <section id="produtos" className="mx-auto mb-32 max-w-[1400px] px-6 md:mb-48 md:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-16">
            <div>
              <span className="mb-4 block text-xs uppercase tracking-widest text-white/50">(Produtos)</span>
              <h2 className="text-4xl font-bold uppercase tracking-tighter md:text-6xl">Loja S7 Card</h2>
            </div>
            {demo && (
              <span className="rounded-full bg-amber-500/15 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Catálogo de exemplo · Yampi não conectada
              </span>
            )}
          </div>

          {!products ? (
            <div className="grid place-items-center py-24 text-white/40">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const sku = p.skus.find((s) => s.in_stock) ?? p.skus[0];
                return (
                  <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1a0505] via-[#120909] to-[#0c0c0c]">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center">
                          <span className="grid h-24 w-24 place-items-center rounded-3xl border border-white/10 bg-[#fe0000]/10 text-[#fe0000] transition-transform duration-700 group-hover:scale-110">
                            <Nfc size={40} />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-bold tracking-tight">{p.name}</h3>
                      <p className="mt-2 flex-1 text-sm text-white/50">{p.description.replace(/<[^>]+>/g, '').slice(0, 140)}</p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <div>
                          {sku?.price_old && <p className="text-xs text-white/35 line-through">{brl(sku.price_old)}</p>}
                          <p className="text-xl font-bold tracking-tight">{demo ? 'Sob consulta' : brl(sku?.price ?? 0)}</p>
                        </div>
                        <button
                          onClick={() => sku && add(p, sku)}
                          disabled={!sku?.in_stock}
                          className="inline-flex items-center gap-2 rounded-full bg-[#fe0000] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#d40000] disabled:opacity-40"
                        >
                          <Plus size={14} /> {sku?.in_stock ? 'Adicionar' : 'Esgotado'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER — igual ao do site */}
      <footer className="relative z-10 border-t border-white/10 pb-8 pt-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <span className="mb-6 block text-xs uppercase tracking-widest text-white/50">(EMAIL)</span>
              <a href="mailto:contato.agencias7@outlook.com" className="group relative w-fit text-sm font-bold uppercase text-white">
                contato.agencias7@outlook.com
                <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-[#fe0000] transition-all duration-300 group-hover:w-full" />
              </a>
            </div>
            <div className="md:text-center">
              <span className="mb-6 block text-xs uppercase tracking-widest text-white/50">(LINKS)</span>
              <div className="flex flex-col gap-4 text-sm font-bold uppercase md:items-center">
                <a href="/" className="group relative w-fit text-white">
                  Site da S7
                  <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-[#fe0000] transition-all duration-300 group-hover:w-full" />
                </a>
                <a href="#produtos" className="group relative w-fit text-white">
                  Produtos
                  <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-[#fe0000] transition-all duration-300 group-hover:w-full" />
                </a>
              </div>
            </div>
            <div className="md:text-right">
              <span className="mb-6 block text-xs uppercase tracking-widest text-white/50">(REDES SOCIAIS)</span>
              <div className="flex flex-col gap-4 text-sm font-bold uppercase md:items-end">
                <a href="https://instagram.com/s7.sites" target="_blank" rel="noreferrer" className="group relative flex w-fit items-center gap-1 text-white">
                  Instagram <ArrowUpRight size={16} />
                  <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-[#fe0000] transition-all duration-300 group-hover:w-full" />
                </a>
                <a href="/politica-de-privacidade.html" className="group relative w-fit text-white">
                  Política de Privacidade
                  <span className="absolute bottom-[-4px] left-0 h-[2px] w-0 bg-[#fe0000] transition-all duration-300 group-hover:w-full" />
                </a>
              </div>
            </div>
          </div>
          <p className="border-t border-white/10 pt-8 text-xs uppercase tracking-widest text-white/50">@ 2026 AGÊNCIA S7. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </footer>

      {/* CARRINHO */}
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0c0c0c] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Carrinho</h2>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-white/40">Seu carrinho está vazio.</p>
            ) : (
              <ul className="flex-1 divide-y divide-white/10 overflow-y-auto border-y border-white/10">
                {cart.map((i) => (
                  <li key={i.sku_id} className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{i.product}</p>
                      <p className="text-xs text-white/40">
                        {i.sku}
                        {!demo && ` · ${brl(i.price)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(i.sku_id, i.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/15" aria-label="Menos">
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{i.quantity}</span>
                      <button onClick={() => setQty(i.sku_id, i.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/15" aria-label="Mais">
                        <Plus size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-6">
              {!demo && (
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/50">Subtotal</span>
                  <span className="text-xl font-bold">{brl(total)}</span>
                </div>
              )}
              <p className="mb-5 text-xs text-white/35">Frete e forma de pagamento são escolhidos no checkout seguro da Yampi.</p>
              {err && <p className="mb-4 text-xs text-[#ff5a5a]">{err}</p>}
              <button
                onClick={checkout}
                disabled={!cart.length || checkingOut}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#fe0000] py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#d40000] disabled:opacity-40"
              >
                {checkingOut ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                {checkingOut ? 'Abrindo checkout...' : 'Finalizar compra'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
