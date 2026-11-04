"""Smoke test do build (dist/). Uso:
    npx vite preview --port 4180   (em outro terminal)
    python scripts/smoke.py [http://localhost:4180]
Confere: páginas públicas abrem sem erro de JS, sem rolagem lateral no celular,
skip link acessível pelo Tab, imagens com alt e rotas protegidas mandando pro login.
"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4180"
fails = []


def check(cond, msg):
    print(("  ok   " if cond else "  FALHA ") + msg)
    if not cond:
        fails.append(msg)


with sync_playwright() as p:
    b = p.chromium.launch()
    for name, vp in [("desktop", {"width": 1366, "height": 800}), ("celular", {"width": 360, "height": 740})]:
        print(f"[{name}]")
        pg = b.new_page(viewport=vp)
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(BASE + "/", wait_until="networkidle")
        check(pg.locator("h1").count() >= 1, "landing tem <h1>")
        check(not errors, f"landing sem erro de JS {errors[:1]}")
        overflow = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        check(overflow <= 1, f"sem rolagem lateral (excesso {overflow}px)")
        no_alt = pg.evaluate("[...document.images].filter(i => !i.hasAttribute('alt')).length")
        check(no_alt == 0, f"todas as imagens têm alt ({no_alt} sem)")
        pg.keyboard.press("Tab")
        focused = pg.evaluate("document.activeElement && document.activeElement.textContent")
        check("Pular" in (focused or ""), "primeiro Tab cai no 'Pular para o conteúdo'")

        pg.goto(BASE + "/login", wait_until="networkidle")
        check(pg.locator("input[type=password]").count() == 1, "login renderiza o formulário")

        pg.goto(BASE + "/admin", wait_until="networkidle")
        check("/login" in pg.url, f"/admin sem sessão vai pro login ({pg.url})")
        check(not errors, f"nenhum erro de JS no caminho todo {errors[:1]}")
        pg.close()
    b.close()

print("\nRESULTADO:", "OK" if not fails else f"{len(fails)} falha(s)")
sys.exit(1 if fails else 0)
