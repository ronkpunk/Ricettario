#!/usr/bin/env python3
"""Genera demo/ricettario-demo.html: versione single-file dell'app (dati incorporati, senza Firebase)
adatta a essere pubblicata come Artifact. Uso: python3 scripts/build-demo.py"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
css = (root / 'public/style.css').read_text()
js = (root / 'public/app.js').read_text()
data = json.dumps(json.loads((root / 'public/data/recipes.json').read_text()), ensure_ascii=False, separators=(',', ':'))


def sub(s, old, new):
    assert s.count(old) == 1, f'pattern non trovato: {old[:70]!r}'
    return s.replace(old, new)


js = sub(js, "import { firebaseConfig } from './firebase-config.js';\n", f"const DATA = {data};\nconst firebaseConfig = null;\n")
js = sub(js, "async function loadBase() { const r = await fetch('data/recipes.json'); return r.json(); }", "async function loadBase() { return DATA; }")
js = sub(js, "  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});\n", '')
js = js.replace('</script>', '<\\/script>')

html = f'''<title>Ricettando</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=block" rel="stylesheet">
<style>
{css}
</style>
<div id="app" aria-live="polite"></div>
<nav id="tabbar" aria-label="Navigazione principale">
  <a href="#ricette"><span class="pillbox"><span class="ms">restaurant_menu</span></span>Ricette</a>
  <a href="#indice"><span class="pillbox"><span class="ms">menu_book</span></span>Indice</a>
  <button type="button" id="random"><span class="pillbox"><span class="ms">casino</span></span>A sorpresa</button>
</nav>
<script>
{js}
</script>
'''
out = root / 'demo/ricettario-demo.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f'{out} ({len(html)//1024} KB)')
