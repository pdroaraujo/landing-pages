// Gera o cardápio estático (HTML no próprio arquivo, bom p/ Google e IA) a partir de cardapio.json.
// Uso: node _build/gerar.mjs  — reescreve o trecho entre <!-- menu:... --> em index.html e cardapio.html
// e o JSON-LD do cardápio. Rode sempre que mudar preço/item em cardapio.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { categorias, itens } = JSON.parse(fs.readFileSync(path.join(root, '_build/cardapio.json'), 'utf8'));
const SITE = 'https://blessed-coffee-matcha.vercel.app';
const STEP = 8; // itens por filtro na página inicial

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const catName = Object.fromEntries(categorias.map(c => [c.id, c.nome]));

const item = (it, attrs = '') => {
  const th = it.img
    ? `<div class="th"><img src="assets/img/thumb/${it.img}.webp" alt="${esc(it.nome)}" width="200" height="200" loading="lazy" decoding="async"></div>`
    : `<div class="th mono"><img src="assets/img/logo_light.svg" alt="" width="78" height="38" loading="lazy" decoding="async"></div>`;
  return `<article class="mi"${attrs}>${th}<div><div class="top"><h3>${esc(it.nome)}</h3><span class="dots"></span><span class="pr">${esc(it.preco)}</span></div><p>${esc(it.desc)}</p><span class="cat">${esc(catName[it.cat])}</span></div></article>`;
};

// página inicial: filtros + os primeiros STEP itens de cada filtro (o resto fica no /cardapio)
const perCat = {};
const homeItems = itens.map((it, i) => {
  perCat[it.cat] = (perCat[it.cat] || 0) + 1;
  const all = i < STEP, inCat = perCat[it.cat] <= STEP;
  if (!all && !inCat) return '';
  return '      ' + item(it, ` data-c="${it.cat}"${all ? ' data-all' : ''}${inCat ? ' data-top' : ''}${all ? '' : ' hidden'}`);
}).filter(Boolean);
const count = c => (c === 'all' ? itens.length : itens.filter(i => i.cat === c).length);
const filters = [['all', 'Todos'], ...categorias.map(c => [c.id, c.nome])]
  .map(([k, v]) => `<button type="button" data-f="${k}" data-n="${count(k)}" aria-pressed="${k === 'all'}">${esc(v)}</button>`).join('');
const home = `<!-- menu:start -->
      <div class="filters" id="filters" role="group" aria-label="Filtrar cardápio">${filters}</div>
      <div class="menu-list" id="menuList">
${homeItems.join('\n')}
      </div>
      <!-- menu:end -->`;

// página do cardápio: abas + todas as seções
const tabs = categorias.map(c => `<a href="#${c.id}" data-k="${c.id}">${esc(c.nome)}</a>`).join('');
const secs = categorias.map(c => {
  const its = itens.filter(i => i.cat === c.id);
  return `    <section class="cat-sec" id="${c.id}">
      <header><h2>${esc(c.nome)}</h2><span>${its.length} itens</span></header>${c.descricao ? `\n      <p class="desc">${esc(c.descricao)}</p>` : ''}
      <div class="menu-list">
${its.map(i => '        ' + item(i)).join('\n')}
      </div>
    </section>`;
}).join('\n');
const card = `<!-- menu:start -->
  <div class="tabs-bar">
    <div class="tabs-bg"></div>
    <div class="wrap"><nav class="filters" id="tabs" aria-label="Categorias do cardápio">${tabs}</nav></div>
  </div>
  <div class="wrap" id="sections">
${secs}
  </div>
  <!-- menu:end -->`;

// JSON-LD Menu (schema.org) — preço numérico = primeiro valor em R$ do texto
const price = p => { const m = p.match(/R\$\s*(\d+(?:,\d+)?)/); return m ? m[1].replace(',', '.') : null; };
const menuLd = {
  '@context': 'https://schema.org', '@type': 'Menu', name: 'Cardápio Blessed Coffee & Matcha', url: `${SITE}/cardapio`,
  inLanguage: 'pt-BR',
  hasMenuSection: categorias.map(c => ({
    '@type': 'MenuSection', name: c.nome,
    hasMenuItem: itens.filter(i => i.cat === c.id).map(i => ({
      '@type': 'MenuItem', name: i.nome, description: i.desc,
      ...(price(i.preco) ? { offers: { '@type': 'Offer', price: price(i.preco), priceCurrency: 'BRL' } } : {}),
    })),
  })),
};
const ld = `<!-- menu-ld:start --><script type="application/ld+json">${JSON.stringify(menuLd)}</script><!-- menu-ld:end -->`;

const swap = (file, re, html) => {
  const p = path.join(root, file), t = fs.readFileSync(p, 'utf8');
  if (!re.test(t)) throw new Error(`marcador não encontrado em ${file}`);
  fs.writeFileSync(p, t.replace(re, () => html));
};
swap('index.html', /<!-- menu:start -->[\s\S]*?<!-- menu:end -->/, home);
swap('cardapio.html', /<!-- menu:start -->[\s\S]*?<!-- menu:end -->/, card);
swap('cardapio.html', /<!-- menu-ld:start -->[\s\S]*?<!-- menu-ld:end -->/, ld);
console.log(`ok: ${itens.length} itens, ${categorias.length} categorias`);
