"""Smoke + regressão do build (dist/). Uso:
    npx vite preview --port 4180   (em outro terminal)
    python scripts/smoke.py [http://localhost:4180]
Confere (code-testing / code-responsive / code-accessibility):
  - páginas públicas abrem sem erro de JS e sem rolagem lateral em 6 larguras
  - imagens com alt, skip link no primeiro Tab, menu com foco preso/Esc/foco de volta
  - CTAs de WhatsApp com mensagem contextual
  - /admin sem sessão vai pro login; rota inexistente mostra 404; placa sem backend mostra erro
O painel logado precisa do Supabase ativo e não é coberto aqui.
"""
import json
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4180"
WIDTHS = [320, 375, 768, 1024, 1440, 1920]
fails = []


def check(cond, msg):
    print(("  ok    " if cond else "  FALHA ") + msg)
    if not cond:
        fails.append(msg)


def overflow(pg):
    return pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")


with sync_playwright() as p:
    b = p.chromium.launch()

    print("[responsivo: sem rolagem lateral]")
    for w in WIDTHS:
        pg = b.new_page(viewport={"width": w, "height": 800})
        for path in ["/", "/login"]:
            pg.goto(BASE + path, wait_until="networkidle")
            o = overflow(pg)
            check(o <= 1, f"{path} @ {w}px (excesso {o}px)")
        pg.close()

    print("[landing: conteúdo, a11y e CTAs]")
    pg = b.new_page(viewport={"width": 375, "height": 740})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(BASE + "/", wait_until="networkidle")
    check(pg.locator("h1").count() >= 1, "tem <h1>")
    no_alt = pg.evaluate("[...document.images].filter(i => !i.hasAttribute('alt')).length")
    check(no_alt == 0, f"imagens com alt ({no_alt} sem)")
    unnamed = pg.evaluate("""[...document.querySelectorAll('button, a[href]')].filter(el => {
        const n = (el.getAttribute('aria-label') || el.textContent || '').trim();
        const img = el.querySelector('img[alt]:not([alt=""])');
        return !n && !img && el.offsetParent !== null;
    }).length""")
    check(unnamed == 0, f"botões/links visíveis com nome acessível ({unnamed} sem)")
    wa = pg.eval_on_selector_all("a[href*='wa.me']", "els => els.map(e => decodeURIComponent(e.href))")
    check(len(wa) >= 2 and all("Vim pelo site" in h for h in wa), f"WhatsApp com mensagem contextual ({len(wa)} links)")
    pg.keyboard.press("Tab")
    check("Pular" in (pg.evaluate("document.activeElement.textContent") or ""), "1º Tab = 'Pular para o conteúdo'")

    menu_btn = pg.locator("button[aria-label='Abrir menu']")
    menu_btn.focus()
    pg.keyboard.press("Enter")
    pg.wait_for_selector("[role=dialog]")
    inside = pg.evaluate("!!document.activeElement.closest('[role=dialog]')")
    check(inside, "menu abre com foco dentro do diálogo")
    for _ in range(30):
        pg.keyboard.press("Tab")
    check(pg.evaluate("!!document.activeElement.closest('[role=dialog]')"), "Tab fica preso no menu")
    pg.keyboard.press("Escape")
    check(pg.locator("[role=dialog]").count() == 0, "Esc fecha o menu")
    check(pg.evaluate("document.activeElement.getAttribute('aria-label')") == "Abrir menu", "foco volta ao botão do menu")
    check(not errors, f"sem erro de JS {errors[:1]}")
    pg.close()

    print("[rotas]")
    pg = b.new_page(viewport={"width": 375, "height": 740})
    pg.goto(BASE + "/login", wait_until="networkidle")
    check(pg.locator("input[type=password][autocomplete=current-password]").count() == 1, "login: senha com autocomplete")
    check(pg.locator("input[aria-label='E-mail']").count() == 1, "login: e-mail com rótulo")
    pg.goto(BASE + "/admin", wait_until="networkidle")
    check("/login" in pg.url, "/admin sem sessão -> /login")
    pg.goto(BASE + "/rota-que-nao-existe", wait_until="networkidle")
    body = pg.inner_text("body")
    check("404" in body or "não encontrad" in body.lower() or pg.url.rstrip('/') == BASE, f"rota inexistente tratada ({pg.url})")
    pg.goto(BASE + "/r/codigo-de-teste", wait_until="domcontentloaded")
    try:
        pg.wait_for_function("document.body.innerText.match(/não encontrada|Falha|inválido/i)", timeout=25000)
        check(True, "placa sem backend mostra mensagem de erro (sem spinner infinito)")
    except Exception:
        check(False, "placa sem backend mostra mensagem de erro (sem spinner infinito)")
    pg.close()

    print("[segurança: destino da placa]")
    # prova local isolada: simula a function `tap` devolvendo destinos maliciosos/legítimos
    for dest, should_block in [("javascript:alert(document.domain)", True), ("data:text/html,<script>alert(1)</script>", True), ("https://example.com/ok", False)]:
        pg = b.new_page()
        dialogs = []
        pg.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
        pg.route("**/functions/v1/tap", lambda r, _req, d=dest: r.fulfill(status=200, content_type="application/json", body=json.dumps({"destination": d, "link_type": "other"})))
        pg.route("https://example.com/**", lambda r, _req: r.fulfill(status=200, body="destino ok"))
        pg.goto(BASE + "/r/teste", wait_until="domcontentloaded")
        pg.wait_for_timeout(2500)
        if should_block:
            check(not dialogs and "não é válido" in pg.inner_text("body"), f"bloqueia {dest[:28]}...")
        else:
            check("example.com" in pg.url, "segue destino https legítimo")
        pg.close()
    b.close()

print("\nRESULTADO:", "OK" if not fails else f"{len(fails)} falha(s)")
sys.exit(1 if fails else 0)
