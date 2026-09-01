// Classificação de site + heurística + parecer via Gemini.

export type WebsiteStatus = 'none' | 'own' | 'instagram' | 'linktree' | 'unknown';

export type Analysis = {
  status: WebsiteStatus;
  finalUrl: string | null;
  score: number; // 0-10 — maior = mais vale a pena um upgrade
  verdict: string;
  checks: Record<string, boolean>;
};

const LINK_HUBS = ['linktr.ee', 'linktree', 'lnk.bio', 'beacons.ai', 'bio.link', 'campsite.bio', 'linkr.bio', 'many.link', 'about.me'];
const SOCIAL = ['instagram.com', 'facebook.com', 'fb.com', 'wa.me', 'api.whatsapp.com', 'linktr', 'youtube.com', 'tiktok.com'];

function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Classificação instantânea pela URL — sem requisição de rede. */
export function classifyUrl(website: string | null): Analysis {
  if (!website) {
    return { status: 'none', finalUrl: null, score: 10, verdict: 'Sem site — lead quente para criação.', checks: {} };
  }
  const h0 = host(website);
  if (LINK_HUBS.some((x) => h0.includes(x)))
    return { status: 'linktree', finalUrl: website, score: 9, verdict: 'Usa página de links (Linktree). Precisa de site próprio.', checks: {} };
  if (h0.includes('instagram.com') || h0.includes('facebook.com'))
    return { status: 'instagram', finalUrl: website, score: 9, verdict: 'Link aponta só para rede social. Precisa de site próprio.', checks: {} };
  return { status: 'own', finalUrl: website, score: 5, verdict: 'Site próprio — análise pendente.', checks: {} };
}

export async function classifyWebsite(website: string | null, useAI = true): Promise<Analysis> {
  const quick = classifyUrl(website);
  if (quick.status !== 'own') return quick;
  const site = quick.finalUrl as string;

  // tenta buscar o site
  let html = '';
  let finalUrl = site;
  let elapsed = 0;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);
    const t0 = Date.now();
    const res = await fetch(site, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 AgenciaS7Bot' } });
    elapsed = Date.now() - t0;
    clearTimeout(to);
    finalUrl = res.url || site;
    html = (await res.text()).slice(0, 60000);
  } catch {
    return { status: 'unknown', finalUrl: site, score: 6, verdict: 'Site não respondeu — verificar manualmente (pode estar fora do ar).', checks: { online: false } };
  }

  const hf = host(finalUrl);
  if (LINK_HUBS.some((x) => hf.includes(x)))
    return { status: 'linktree', finalUrl, score: 9, verdict: 'Redireciona para página de links. Precisa de site próprio.', checks: {} };
  if (SOCIAL.some((x) => hf.includes(x)) && !hf.includes('youtube'))
    return { status: 'instagram', finalUrl, score: 9, verdict: 'Redireciona para rede social. Precisa de site próprio.', checks: {} };

  const lower = html.toLowerCase();
  const checks = {
    online: true,
    https: finalUrl.startsWith('https://'),
    mobileViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasTitle: /<title[^>]*>[^<]{3,}<\/title>/i.test(html),
    hasMetaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i.test(html),
    staleCopyright: /(?:©|&copy;|copyright)\s*(?:20(?:0\d|1\d|2[0-3]))/i.test(html) && !new RegExp(`20${String(new Date().getFullYear()).slice(2)}`).test(html),
    fast: elapsed < 3500,
    hasSchema: lower.includes('application/ld+json'),
    hasAnalytics: lower.includes('gtag(') || lower.includes('googletagmanager') || lower.includes('gtm-'),
  };

  let score = 2;
  if (!checks.https) score += 2;
  if (!checks.mobileViewport) score += 2.5;
  if (!checks.hasTitle) score += 1;
  if (!checks.hasMetaDescription) score += 1;
  if (checks.staleCopyright) score += 1.5;
  if (!checks.fast) score += 1;
  if (!checks.hasSchema) score += 0.5;
  if (!checks.hasAnalytics) score += 0.5;
  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

  const gem = useAI ? await geminiVerdict(finalUrl, checks, textSnippet(html), score) : null;

  return {
    status: 'own',
    finalUrl,
    score: gem?.score ?? score,
    verdict: gem?.verdict ?? heuristicVerdict(score, checks),
    checks,
  };
}

function textSnippet(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

function heuristicVerdict(score: number, c: Record<string, boolean>) {
  const probs: string[] = [];
  if (!c.mobileViewport) probs.push('não é responsivo');
  if (!c.https) probs.push('sem HTTPS');
  if (c.staleCopyright) probs.push('conteúdo desatualizado');
  if (!c.fast) probs.push('carregamento lento');
  if (!c.hasMetaDescription) probs.push('SEO básico ausente');
  if (score >= 6) return `Vale abordar: ${probs.join(', ') || 'site fraco'}.`;
  if (score >= 3.5) return `Talvez: ${probs.join(', ') || 'melhorias pontuais possíveis'}.`;
  return 'Site já é bom — prioridade baixa para upgrade.';
}

async function geminiVerdict(
  url: string,
  checks: Record<string, boolean>,
  snippet: string,
  fallbackScore: number,
): Promise<{ score: number; verdict: string } | null> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return null;
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-lite-latest';
  const prompt = `Você é consultor da Agência S7 (criação de sites e SEO). Avalie se vale a pena oferecer um site novo/upgrade para esta empresa.
URL: ${url}
Checagens técnicas: ${JSON.stringify(checks)}
Trecho do site: "${snippet}"

Responda SOMENTE um JSON: {"score": number 0-10 (10 = urgente trocar, 0 = já é ótimo), "verdict": "frase curta em português, máx 18 palavras, direta para o vendedor"}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingLevel: 'low' },
    },
  });

  // 2 tentativas — o flash às vezes devolve 503 (alta demanda)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal, body },
      );
      clearTimeout(to);
      if (res.status === 503 || res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      if (!res.ok) return null;
      const j = await res.json();
      const txt = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
      if (!txt) return null;
      const parsed = JSON.parse(txt);
      const score = Number(parsed.score);
      return {
        score: Number.isFinite(score) ? Math.max(0, Math.min(10, score)) : fallbackScore,
        verdict: String(parsed.verdict ?? '').slice(0, 160) || heuristicVerdict(fallbackScore, checks),
      };
    } catch {
      return null;
    }
  }
  return null;
}
