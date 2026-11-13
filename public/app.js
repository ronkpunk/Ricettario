import { firebaseConfig } from './firebase-config.js';

const $app = document.getElementById('app');
const state = { cats: [], recipes: [], q: '', cat: 'all', tocMode: 'num', source: 'locale', servings: {}, ticked: {}, done: {}, wake: null };

/* ---------------- utilità ---------------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const catOf = (id) => state.cats.find((c) => c.id === id) || { name: '', color: '#ffa94d', emoji: '🍽️' };
const byId = (id) => state.recipes.find((r) => r.id === id);

/* ---------------- dati: Firestore con fallback locale ---------------- */
const configured = firebaseConfig && firebaseConfig.projectId && !/^YOUR_/i.test(firebaseConfig.projectId);

async function fromFirestore() {
  const V = '10.14.1';
  const [{ initializeApp }, fs] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
  const [rs, meta] = await Promise.all([fs.getDocs(fs.collection(db, 'recipes')), fs.getDoc(fs.doc(db, 'meta', 'categories'))]);
  const recipes = rs.docs.map((d) => d.data()).sort((a, b) => a.num - b.num);
  if (!recipes.length) throw new Error('collezione vuota');
  return { recipes, categories: meta.exists() ? meta.data().list : null };
}

async function fromLocal() {
  const r = await fetch('data/recipes.json');
  return r.json();
}

async function loadData() {
  let data = null;
  if (configured) {
    try {
      data = await Promise.race([fromFirestore(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
      state.source = 'Firestore';
    } catch (e) { console.warn('Firestore non disponibile, uso i dati locali:', e); }
  }
  const local = await fromLocal().catch(() => null);
  if (!data) { data = local; state.source = 'dati locali'; }
  state.recipes = data.recipes;
  state.cats = data.categories || (local && local.categories) || [];
}

/* ---------------- quantità scalabili ---------------- */
const FR = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
function fmtNum(v) {
  const whole = Math.floor(v + 1e-9), frac = v - whole;
  let best = FR[0], d = 9;
  for (const f of FR) { const x = Math.abs(frac - f[0]); if (x < d) { d = x; best = f; } }
  if (d < 0.05) {
    const w = best[0] === 1 ? whole + 1 : whole;
    return best[1] ? (w ? `${w}${best[1]}` : best[1]) : String(w);
  }
  return String(Math.round(v * 10) / 10).replace('.', ',');
}
function fmtMetric(v, u) {
  if (u === 'g' && v >= 1000) { u = 'kg'; v /= 1000; } else if (u === 'kg' && v < 1) { u = 'g'; v *= 1000; }
  else if (u === 'ml' && v >= 1000) { u = 'l'; v /= 1000; } else if (u === 'l' && v < 1) { u = 'ml'; v *= 1000; }
  let s;
  if (u === 'kg' || u === 'l') s = String(Math.round(v * 100) / 100).replace('.', ',');
  else if (v >= 100) s = String(Math.round(v / 5) * 5);
  else if (v >= 10) s = String(Math.round(v));
  else s = String(Math.round(v * 10) / 10).replace('.', ',');
  return `${s} ${u}`;
}
function qtyText(i, ratio) {
  if (i.q == null) return '';
  const one = (q) => (i.u && ['g', 'kg', 'ml', 'l', 'dl'].includes(i.u) ? fmtMetric(q * ratio, i.u) : `${fmtNum(q * ratio)}${i.u ? ' ' + i.u : ''}`);
  return i.q2 != null ? `${one(i.q).replace(/ [a-z]+$/i, '')}–${one(i.q2)}` : one(i.q);
}
const LABELS = { persone: ['persona', 'persone'], dose: ['dose', 'dosi'], porzioni: ['porzione', 'porzioni'], pagnotta: ['pagnotta', 'pagnotte'] };
const labelFor = (r, n) => (LABELS[r.servingsLabel] || [r.servingsLabel, r.servingsLabel])[n === 1 ? 0 : 1];

/* ---------------- ricerca ---------------- */
function filtered() {
  const q = norm(state.q).trim();
  let list = state.recipes.filter((r) => state.cat === 'all' || r.cat === state.cat);
  if (!q) return list;
  const words = q.split(/\s+/);
  return list
    .map((r) => {
      const title = norm(`${r.title} ${r.subtitle || ''}`);
      const ings = norm(r.ingredients.flatMap((g) => g.items.map((i) => i.n)).join(' '));
      const rest = norm(`${catOf(r.cat).name} ${r.steps.flatMap((g) => g.items).join(' ')}`);
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 10; else if (ings.includes(w)) score += 4; else if (rest.includes(w)) score += 1; else return null;
      }
      return { r, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.r.num - b.r.num)
    .map((x) => x.r);
}

/* ---------------- viste ---------------- */
function searchBar() {
  return `<div class="search ${state.q ? 'has-q' : ''}">
    <label><span class="ico">🔎</span>
      <input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="Cerca una ricetta o un ingrediente…" value="${esc(state.q)}" aria-label="Cerca">
      <button class="clear" type="button" id="clear" aria-label="Cancella ricerca">✕</button></label></div>`;
}
function cardHtml(r, i) {
  const c = catOf(r.cat);
  return `<a class="card" style="--c:${c.color};animation-delay:${Math.min(i, 12) * 25}ms" href="#/ricetta/${r.id}">
    <span class="num">${r.num}</span><span class="em">${r.emoji}</span>
    <div><h3>${esc(r.title)}</h3><small>${esc(r.subtitle || c.name)}</small></div></a>`;
}
function chipsHtml() {
  const all = [{ id: 'all', name: 'Tutte', emoji: '✨' }, ...state.cats];
  return `<div class="chips" role="group" aria-label="Categorie">${all.map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">${c.emoji} ${esc(c.name)}</button>`).join('')}</div>`;
}

function viewHome() {
  $app.innerHTML = `
    <header class="hero"><div class="kicker">Cucina di famiglia</div><h1>Il <em>Ricettario</em></h1></header>
    ${searchBar()}${chipsHtml()}<div id="results"></div>
    <p class="foot">${state.recipes.length} ricette · ${esc(state.source)}</p>`;
  renderResults();
}
function renderResults() {
  const el = document.getElementById('results'); if (!el) return;
  const list = filtered();
  if (!list.length) { el.innerHTML = `<div class="empty"><div class="big">🍽️</div><p><b>Nessuna ricetta trovata.</b><br>Prova con un altro ingrediente!</p></div>`; return; }
  el.innerHTML = `<div class="count">${list.length} ${list.length === 1 ? 'ricetta' : 'ricette'}</div><div class="grid">${list.map(cardHtml).join('')}</div>`;
}

function tocItem(r) {
  const c = catOf(r.cat);
  return `<li><a href="#/ricetta/${r.id}" style="--c:${c.color}"><span class="n">${r.num}</span>
    <span class="t">${esc(r.title)}${r.subtitle ? `<small>${esc(r.subtitle)}</small>` : ''}</span><span class="e">${r.emoji}</span></a></li>`;
}
function viewToc() {
  $app.innerHTML = `
    <header class="hero"><div class="kicker">Tutte le ricette</div><h1>L’<em>Indice</em></h1></header>
    ${searchBar()}
    <div class="seg" role="group" aria-label="Ordinamento"><button data-toc="num" aria-pressed="${state.tocMode === 'num'}">Per numero</button><button data-toc="cat" aria-pressed="${state.tocMode === 'cat'}">Per categoria</button><button data-toc="az" aria-pressed="${state.tocMode === 'az'}">A–Z</button></div>
    <div id="results"></div>`;
  renderToc();
}
function renderToc() {
  const el = document.getElementById('results'); if (!el) return;
  const savedCat = state.cat; state.cat = 'all';
  let list = filtered(); state.cat = savedCat;
  if (!list.length) { el.innerHTML = `<div class="empty"><div class="big">🍽️</div><p><b>Nessuna ricetta trovata.</b></p></div>`; return; }
  const searching = !!state.q.trim();
  if (state.tocMode === 'cat' && !searching) {
    el.innerHTML = state.cats.map((c) => {
      const rs = list.filter((r) => r.cat === c.id); if (!rs.length) return '';
      return `<div class="toc-head">${c.emoji} ${esc(c.name)}</div><ul class="toc">${rs.map(tocItem).join('')}</ul>`;
    }).join('');
  } else {
    if (!searching) list = [...list].sort(state.tocMode === 'az' ? (a, b) => a.title.localeCompare(b.title, 'it') : (a, b) => a.num - b.num);
    el.innerHTML = `<ul class="toc">${list.map(tocItem).join('')}</ul>`;
  }
}

function viewRecipe(id) {
  const r = byId(id);
  if (!r) { location.hash = '#/'; return; }
  const c = catOf(r.cat);
  const idx = state.recipes.indexOf(r);
  const prev = state.recipes[idx - 1], next = state.recipes[idx + 1];
  if (state.servings[r.id] == null) state.servings[r.id] = r.servings;
  state.ticked[r.id] ||= new Set(); state.done[r.id] ||= new Set();
  const note = [r.note, r.link ? `<a href="${esc(r.link.url)}" target="_blank" rel="noopener">▶ ${esc(r.link.label)}</a>` : ''].filter(Boolean);

  $app.innerHTML = `
    <div class="topbar">
      <a class="round" href="#/" aria-label="Indietro">←</a><span class="sp"></span>
      <button class="round" id="wake" aria-pressed="false" title="Tieni lo schermo acceso">💡</button>
      <button class="round" id="share" title="Condividi">📤</button>
    </div>
    <section class="hd" style="--c:${c.color}">
      <span class="big" aria-hidden="true">${r.emoji}</span>
      <span class="pill">n. ${r.num} · ${esc(c.name)}</span>
      <h1>${esc(r.title)}</h1>${r.subtitle ? `<div class="sub">${esc(r.subtitle)}</div>` : ''}
    </section>
    ${r.intro ? `<p class="intro">${esc(r.intro)}</p>` : ''}
    ${note.length ? `<div class="note">${note.map((n) => (n.startsWith('<a') ? n : esc(n))).join(' · ')}</div>` : ''}

    <section class="sec">
      <h2><span class="badge">🧺</span>Ingredienti</h2>
      <div class="people">
        <div class="lbl">Per quante persone?<small id="base"></small></div>
        <div class="stepper"><button id="minus" aria-label="Meno">−</button>
          <div class="val" aria-live="polite"><span id="n"></span><small id="lbl"></small></div>
          <button id="plus" aria-label="Più">+</button></div>
      </div>
      <button class="reset" id="reset" hidden>↺ Torna alla dose originale</button>
      <div id="ings"></div>
    </section>

    <section class="sec">
      <h2><span class="badge">👩‍🍳</span>Procedimento</h2>
      ${r.steps.map((g, gi) => `<div class="step-group">${g.title ? `<h3>${esc(g.title)}</h3>` : ''}<ol class="steps" style="--c:${c.color}">
        ${g.items.map((s, si) => `<li data-k="${gi}-${si}" class="${state.done[r.id].has(`${gi}-${si}`) ? 'done' : ''}">${esc(s)}</li>`).join('')}</ol></div>`).join('')}
      ${(r.tips || []).map((t) => `<div class="tip"><b>${esc(t.title)}</b><br>${esc(t.text)}</div>`).join('')}
    </section>

    <nav class="pn">${prev ? `<a href="#/ricetta/${prev.id}"><small>← Precedente</small>${prev.emoji} ${esc(prev.title)}</a>` : ''}${next ? `<a href="#/ricetta/${next.id}"><small>Successiva →</small>${next.emoji} ${esc(next.title)}</a>` : ''}</nav>`;

  renderIngredients(r);
  window.scrollTo(0, 0);
}

function renderIngredients(r) {
  const n = state.servings[r.id], ratio = n / r.servings, ticked = state.ticked[r.id];
  document.getElementById('n').textContent = fmtNum(n);
  document.getElementById('lbl').textContent = labelFor(r, n);
  document.getElementById('base').textContent = `${r.servingsGuess ? 'dose originale stimata' : 'dose originale'}: ${r.servings} ${labelFor(r, r.servings)}`;
  document.getElementById('reset').hidden = n === r.servings;
  document.getElementById('minus').disabled = n <= 1;
  document.getElementById('ings').innerHTML = r.ingredients.map((g, gi) => `<div class="ing-group">${g.title ? `<h3>${esc(g.title)}</h3>` : ''}<ul class="ings">
    ${g.items.map((i, ii) => {
      const k = `${gi}-${ii}`, q = qtyText(i, ratio);
      const name = i.di && q ? `di ${i.n}` : i.n;
      return `<li><label><input type="checkbox" data-k="${k}" ${ticked.has(k) ? 'checked' : ''}>
        ${q ? `<span class="q">${esc(q)}</span>` : ''}<span class="txt">${esc(name)}${i.note ? `<small>${esc(i.note)}</small>` : ''}</span></label></li>`;
    }).join('')}</ul></div>`).join('');
}

/* ---------------- router ---------------- */
function route() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/ricetta\/(.+)$/);
  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('active', (m ? '#/' : h) === a.getAttribute('href')));
  if (m) { state.q = state.q; viewRecipe(decodeURIComponent(m[1])); }
  else if (h === '#/indice') { viewToc(); window.scrollTo(0, 0); }
  else { viewHome(); }
}

/* ---------------- eventi (delegati) ---------------- */
document.addEventListener('input', (e) => {
  if (e.target.id !== 'q') return;
  state.q = e.target.value;
  e.target.closest('.search').classList.toggle('has-q', !!state.q);
  location.hash === '#/indice' ? renderToc() : renderResults();
});
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, li');
  if (!t) return;
  const rid = location.hash.startsWith('#/ricetta/') ? decodeURIComponent(location.hash.slice(10)) : null;
  const r = rid && byId(rid);

  if (t.id === 'clear') { state.q = ''; const i = document.getElementById('q'); i.value = ''; i.focus(); i.dispatchEvent(new Event('input', { bubbles: true })); }
  else if (t.dataset.cat) { state.cat = t.dataset.cat; document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.cat === state.cat)); renderResults(); }
  else if (t.dataset.toc) { state.tocMode = t.dataset.toc; document.querySelectorAll('[data-toc]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.toc === state.tocMode)); renderToc(); }
  else if (t.id === 'random') { const pool = state.recipes; location.hash = `#/ricetta/${pool[Math.floor(Math.random() * pool.length)].id}`; }
  else if (r && t.id === 'plus') { state.servings[r.id] = Math.min(99, state.servings[r.id] + 1); renderIngredients(r); }
  else if (r && t.id === 'minus') { state.servings[r.id] = Math.max(1, state.servings[r.id] - 1); renderIngredients(r); }
  else if (r && t.id === 'reset') { state.servings[r.id] = r.servings; renderIngredients(r); }
  else if (r && t.id === 'share') {
    const data = { title: r.title, text: `${r.emoji} ${r.title} — dal Ricettario`, url: location.href };
    try { navigator.share ? await navigator.share(data) : await navigator.clipboard.writeText(location.href); } catch { /* annullato */ }
  } else if (r && t.id === 'wake') {
    try {
      if (state.wake) { await state.wake.release(); state.wake = null; } else { state.wake = await navigator.wakeLock.request('screen'); state.wake.addEventListener('release', () => { state.wake = null; t.classList.remove('on'); }); }
      t.classList.toggle('on', !!state.wake);
    } catch { t.hidden = true; }
  } else if (r && t.matches('.steps li')) {
    const set = state.done[r.id], k = t.dataset.k;
    set.has(k) ? set.delete(k) : set.add(k); t.classList.toggle('done', set.has(k));
  }
});
document.addEventListener('change', (e) => {
  const rid = location.hash.startsWith('#/ricetta/') ? decodeURIComponent(location.hash.slice(10)) : null;
  if (!rid || !e.target.matches('.ings input')) return;
  const set = state.ticked[rid], k = e.target.dataset.k;
  e.target.checked ? set.add(k) : set.delete(k);
});
document.addEventListener('visibilitychange', async () => { if (state.wake === null && document.getElementById('wake')?.classList.contains('on') && document.visibilityState === 'visible') { try { state.wake = await navigator.wakeLock.request('screen'); } catch {} } });
window.addEventListener('hashchange', route);

/* ---------------- avvio ---------------- */
(async () => {
  $app.innerHTML = `<div class="empty" style="padding-top:30vh"><div class="big">🍳</div><p><b>Sto preparando il ricettario…</b></p></div>`;
  try { await loadData(); } catch (e) { $app.innerHTML = `<div class="empty"><div class="big">😕</div><p><b>Impossibile caricare le ricette.</b><br>${esc(e.message)}</p></div>`; return; }
  route();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
