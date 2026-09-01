// gerar-sitemap.mjs — monta o sitemap.xml a partir das páginas fixas + páginas de cidade.
// Uso:  node _build/gerar-sitemap.mjs   (rode depois de gerar-cidades.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const hoje = new Date().toISOString().slice(0, 10);

const fixas = [
  { loc: "https://phcontainer.com.br/", freq: "monthly", pri: "1.0" },
  { loc: "https://phcontainer.com.br/sobre/", freq: "yearly", pri: "0.6" },
];

let cidades = [];
try {
  cidades = fs.readFileSync(path.join(__dirname, "urls-cidades.txt"), "utf8")
    .split(/\r?\n/).filter(Boolean)
    .map((loc) => ({ loc, freq: "monthly", pri: "0.8" }));
} catch {}

const urls = [...fixas, ...cidades]
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${hoje}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml: ${fixas.length + cidades.length} URLs`);
