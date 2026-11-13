#!/usr/bin/env python3
"""Genera demo/ricettario-demo.html: versione single-file dell'app (dati incorporati, niente Firebase)
adatta a essere pubblicata come Artifact. Uso: python3 scripts/build-demo.py"""
import json, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
css = (root / 'public/style.css').read_text()
js = (root / 'public/app.js').read_text()
data = json.dumps(json.loads((root / 'public/data/recipes.json').read_text()), ensure_ascii=False, separators=(',', ':'))


def sub(s, old, new, count=1):
    assert old in s, f'pattern non trovato: {old[:60]!r}'
    return s.replace(old, new) if count == 0 else s.replace(old, new, count)


# ---------- CSS: token per tema chiaro/scuro, gutter e safe-area ----------
css = re.sub(r':root \{.*?\n\}\n', '', css, count=1, flags=re.S)
tokens = '''
/* Layout: app a colonna singola mobile-first, schede a bordo spesso con ombra piena. */
:root {
  --bg: #fff7e8; --paper: #ffffff; --ink: #3a2c2a; --muted: #8a766f; --line: #f1e3cc; --on-ink: #ffffff;
  --tomato: #ff6b4a; --sun: #ffcf33; --mint: #2ec4a6; --fixed-ink: #3a2c2a;
  --tip: #e6fbf5; --done: #f4efe4; --press: #fff3d6; --flash: #fff0b8; --blob1: #ffe8a3; --blob2: #ffc9bd;
  --radius: 22px; --tab-h: 64px; --safe-b: env(safe-area-inset-bottom, 0px);
  --gl: max(16px, env(safe-area-inset-left, 0px)); --gr: max(16px, env(safe-area-inset-right, 0px));
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1f1715; --paper: #2d2320; --ink: #f6e9dc; --muted: #b79f95; --line: #46362f; --on-ink: #1f1715;
  --tomato: #ff7d5e; --tip: #1c3a33; --done: #251c19; --press: #3a2c28; --flash: #4b3f1c; --blob1: #3b2f17; --blob2: #3d2420; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #1f1715; --paper: #2d2320; --ink: #f6e9dc; --muted: #b79f95; --line: #46362f; --on-ink: #1f1715;
  --tomato: #ff7d5e; --tip: #1c3a33; --done: #251c19; --press: #3a2c28; --flash: #4b3f1c; --blob1: #3b2f17; --blob2: #3d2420; color-scheme: dark; }
'''
css = tokens + css
css = sub(css, 'body {\n  margin: 0; background: var(--bg);', 'body {\n  margin: 0; background-color: var(--bg);')
css = sub(css, 'radial-gradient(circle at 12% 8%, #ffe8a3 0 90px, transparent 91px)', 'radial-gradient(circle at 12% 8%, var(--blob1) 0 90px, transparent 91px)')
css = sub(css, 'radial-gradient(circle at 96% 3%, #ffc9bd 0 70px, transparent 71px)', 'radial-gradient(circle at 96% 3%, var(--blob2) 0 70px, transparent 71px)')
css = sub(css, '#app { max-width: 720px; margin: 0 auto; padding: 0 16px; }',
          '#app { max-width: 720px; margin: 0 auto; padding-left: var(--gl); padding-right: var(--gr); }\n'
          'body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 30; background: var(--bg); }')
css = sub(css, '.hero { padding: calc(env(safe-area-inset-top, 0px) + 22px) 4px 6px; }', '.hero { padding: 22px 4px 6px; }')
css = sub(css, 'background: linear-gradient(var(--bg) 78%, transparent);\n}', 'background: linear-gradient(var(--bg) 78%, transparent);\n}')
css = sub(css, 'position: sticky; top: 0; z-index: 5; padding: 12px 0 8px; margin: 0 -16px; padding-inline: 16px;',
          'position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; padding: 12px 0 8px;')
css = sub(css, 'padding: 8px 16px 12px; margin: 0 -16px; scrollbar-width: none;', 'padding: 8px 4px 12px; scrollbar-width: none;')
css = sub(css, '.topbar { position: sticky; top: 0; z-index: 6; display: flex; align-items: center; gap: 10px; padding: calc(env(safe-area-inset-top, 0px) + 10px) 0 10px;',
          '.topbar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 6; display: flex; align-items: center; gap: 10px; padding: 10px 0;')
css = sub(css, 'padding: 8px 12px calc(8px + var(--safe-b)); background: #fff;', 'padding: 8px max(12px, env(safe-area-inset-right, 0px)) calc(8px + var(--safe-b)) max(12px, env(safe-area-inset-left, 0px)); background: var(--paper);')
# colori letterali -> token
css = css.replace('background: #fff', 'background: var(--paper)').replace('background: #fff3d6', 'background: var(--press)')
css = css.replace('color-mix(in srgb, var(--c) 22%, #fff)', 'color-mix(in srgb, var(--c) 22%, var(--paper))')
css = css.replace('color-mix(in srgb, var(--c) 35%, #fff)', 'color-mix(in srgb, var(--c) 35%, var(--paper))')
css = css.replace('color-mix(in srgb, var(--c) 30%, #fff)', 'color-mix(in srgb, var(--c) 30%, var(--paper))')
css = css.replace('background: #fff3d6', 'background: var(--press)').replace('background: #fff0b8', 'background: var(--flash)')
css = css.replace('background: #e6fbf5', 'background: var(--tip)').replace('background: #f4efe4', 'background: var(--done)')
css = css.replace('background: var(--ink); color: #fff', 'background: var(--ink); color: var(--on-ink)')
css = css.replace('.chip[aria-pressed="true"] { background: var(--ink); color: #fff; }', '.chip[aria-pressed="true"] { background: var(--ink); color: var(--on-ink); }')
css = css.replace('color: #fff;', 'color: #fff;')  # (check segmentato/spunte restano bianchi su tomato/mint)
css = css.replace('.hero h1 em { font-style: normal;', '.hero h1 em { font-style: normal; color: var(--fixed-ink);')
css = css.replace('.people {\n  display: flex;', '.people {\n  color: var(--fixed-ink); display: flex;')
css = css.replace('.stepper button { width: 42px;', '.stepper button { color: var(--fixed-ink); background: #fff; width: 42px;')
css = css.replace('display: grid; place-items: center; font: 700 1.1rem \'Fredoka\'; background: var(--c); border: 2.5px solid var(--ink); color: var(--ink);',
                  'display: grid; place-items: center; font: 700 1.1rem \'Fredoka\'; background: var(--c); border: 2.5px solid var(--ink); color: var(--fixed-ink);')
css = css.replace('.hd .pill { display: inline-block; background: #fff;', '.hd .pill { display: inline-block; background: var(--paper);')
css = css.replace("border: 3px solid var(--ink); background: var(--paper); font: 700 1.5rem/1 'Fredoka'", "border: 3px solid var(--ink); background: #fff; font: 700 1.5rem/1 'Fredoka'")
css = css.replace('.chip[aria-pressed="true"]', '.chip[aria-pressed="true"]')
css = css.replace('body { background: #fff; }', 'body { background: #fff; }')
css = css.replace('.search input {\n  width: 100%; border: 3px solid var(--ink); border-radius: 999px; background: #fff;', '.search input {\n  width: 100%; border: 3px solid var(--ink); border-radius: 999px; background: var(--paper);')
css = css.replace('padding: 13px 46px 13px 46px; font: 700 1rem \'Nunito\', sans-serif; color: var(--ink);', 'padding: 13px 46px 13px 46px; font: 700 1rem \'Nunito\', sans-serif; color: var(--ink);')
css = css.replace('background: var(--line); font-weight: 800; display: none;', 'background: var(--line); color: var(--ink); font-weight: 800; display: none;')
css = css.replace('.search input::placeholder { color: #b9a59d;', '.search input::placeholder { color: var(--muted);')
css = css.replace('#tabbar a.active { color: var(--tomato); }', '#tabbar a.active { color: var(--tomato); }')
css = css.replace("html { scroll-behavior: smooth; }\n", '')

# ---------- JS: dati incorporati, routing con hash semplici, niente Firebase / service worker ----------
js = js.replace("import { firebaseConfig } from './firebase-config.js';\n", f"const DATA = {data};\n")
js = sub(js, "const configured = firebaseConfig && firebaseConfig.projectId && !/^YOUR_/i.test(firebaseConfig.projectId);\n", '')
js = re.sub(r"async function fromFirestore\(\) \{.*?\n\}\n\nasync function fromLocal\(\) \{.*?\n\}\n\nasync function loadData\(\) \{.*?\n\}\n",
            "async function loadData() {\n  state.source = 'demo con dati incorporati';\n  state.recipes = DATA.recipes;\n  state.cats = DATA.categories;\n}\n", js, count=1, flags=re.S)
js = js.replace("href=\"#/ricetta/${r.id}\"", "href=\"#r-${r.id}\"").replace("href=\"#/ricetta/${prev.id}\"", "href=\"#r-${prev.id}\"").replace("href=\"#/ricetta/${next.id}\"", "href=\"#r-${next.id}\"")
js = js.replace('href="#/" aria-label="Indietro"', 'href="#ricette" aria-label="Indietro"')
js = js.replace("location.hash = '#/';", "location.hash = '#ricette';")
js = js.replace("location.hash = `#/ricetta/${pool[Math.floor(Math.random() * pool.length)].id}`", "location.hash = `#r-${pool[Math.floor(Math.random() * pool.length)].id}`")
js = js.replace("location.hash === '#/indice'", "location.hash === '#indice'")
js = sub(js, "const h = location.hash || '#/';\n  const m = h.match(/^#\\/ricetta\\/(.+)$/);\n  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('active', (m ? '#/' : h) === a.getAttribute('href')));\n  if (m) { state.q = state.q; viewRecipe(decodeURIComponent(m[1])); }\n  else if (h === '#/indice')",
        "const h = location.hash || '#ricette';\n  const m = h.match(/^#r-(.+)$/);\n  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('active', (m ? '#ricette' : h) === a.getAttribute('href')));\n  if (m) { viewRecipe(m[1]); }\n  else if (h === '#indice')")
js = js.replace("location.hash.startsWith('#/ricetta/') ? decodeURIComponent(location.hash.slice(10)) : null", "location.hash.startsWith('#r-') ? location.hash.slice(3) : null")
# niente condivisione (API bloccata nel frame) e niente service worker
js = re.sub(r"\n      <button class=\"round\" id=\"share\"[^\n]*", '', js)
js = re.sub(r"  else if \(r && t\.id === 'share'\) \{.*?\n  \} else if \(r && t\.id === 'wake'\)", "  else if (r && t.id === 'wake')", js, count=1, flags=re.S)
js = sub(js, "  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});\n", '')
assert '#/' not in js, 'restano route con #/'
assert 'firebase' not in js.lower().replace('firestore', ''), 'riferimenti firebase residui'

html = f'''<title>Il Ricettario</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
{css}
</style>
<div id="app" aria-live="polite"></div>
<nav id="tabbar" aria-label="Navigazione principale">
  <a href="#ricette" data-tab="home"><span>🍳</span>Ricette</a>
  <a href="#indice" data-tab="indice"><span>📖</span>Indice</a>
  <button type="button" id="random"><span>🎲</span>A sorpresa</button>
</nav>
<script>
{js.replace('</script>', '<\\/script>')}
</script>
'''
out = root / 'demo/ricettario-demo.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f'{out} ({len(html)//1024} KB)')
