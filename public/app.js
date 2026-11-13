import { firebaseConfig } from './firebase-config.js';

const $app = document.getElementById('app');
const state = {
  cats: [], recipes: [], q: '', cat: 'all', tocMode: 'num', source: '',
  servings: {}, ticked: {}, done: {}, wake: null, focus: { id: null, i: 0 }, user: null, resetArmed: false,
};

/* ---------------- utilità ---------------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ic = (name) => `<span class="ms" aria-hidden="true">${name}</span>`;
const catOf = (id) => state.cats.find((c) => c.id === id) || { name: '', color: '#ffa94d', emoji: '🍽️' };
const byId = (id) => state.recipes.find((r) => r.id === id);
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage non disponibile */ } };
function snack(msg) {
  document.querySelector('.snack')?.remove();
  const el = Object.assign(document.createElement('div'), { className: 'snack', textContent: msg, role: 'status' });
  document.body.append(el); setTimeout(() => el.remove(), 3200);
}

/* ---------------- tema: automatico (dispositivo) / chiaro / scuro ---------------- */
const THEMES = ['auto', 'light', 'dark'];
const THEME_UI = { auto: ['brightness_auto', 'automatico'], light: ['light_mode', 'chiaro'], dark: ['dark_mode', 'scuro'] };
const getTheme = () => (THEMES.includes(lsGet('ricettario.theme', 'auto')) ? lsGet('ricettario.theme', 'auto') : 'auto');
function applyTheme(t) { const root = document.documentElement; t === 'auto' ? root.removeAttribute('data-theme') : root.setAttribute('data-theme', t); }
if (getTheme() !== 'auto') applyTheme(getTheme()); // senza scelta salvata non tocco nulla: vale il tema del dispositivo (o quello imposto dall'host)
const themeBtn = () => `<button class="icon-btn tonal" id="theme" aria-label="Tema: ${THEME_UI[getTheme()][1]}. Tocca per cambiare" title="Tema: ${THEME_UI[getTheme()][1]}">${ic(THEME_UI[getTheme()][0])}</button>`;
const heroHtml = (kicker, title) => `<header class="hero"><div><div class="kicker">${kicker}</div><h1>${title}</h1></div>${themeBtn()}</header>`;

/* ---------------- dati e salvataggio ---------------- */
async function loadBase() { const r = await fetch('data/recipes.json'); return r.json(); }

const configured = !!(firebaseConfig && firebaseConfig.projectId && !/^YOUR_/i.test(firebaseConfig.projectId));
const LS_KEY = 'ricettario.v2';

// Archivio locale: ricette originali + modifiche salvate nel browser.
const localStore = {
  mode: 'locale', needsLogin: false,
  merge(base) {
    const o = lsGet(LS_KEY, {}), del = new Set(o.deleted || []), mine = o.recipes || {};
    const out = base.filter((r) => !del.has(r.id)).map((r) => mine[r.id] || r);
    for (const r of Object.values(mine)) if (!out.some((x) => x.id === r.id)) out.push(r);
    return out;
  },
  async save(r) { const o = lsGet(LS_KEY, {}); o.recipes = { ...(o.recipes || {}), [r.id]: r }; o.deleted = (o.deleted || []).filter((i) => i !== r.id); lsSet(LS_KEY, o); },
  async remove(id) { const o = lsGet(LS_KEY, {}); if (o.recipes) delete o.recipes[id]; o.deleted = [...new Set([...(o.deleted || []), id])]; lsSet(LS_KEY, o); },
  async reset() { try { localStorage.removeItem(LS_KEY); } catch { /* ignora */ } },
};
let store = localStore;

// Archivio Firestore: lettura pubblica, scrittura dopo accesso con Google (vedi firestore.rules).
async function makeFirestoreStore() {
  const V = '10.14.1', B = `https://www.gstatic.com/firebasejs/${V}`;
  const [{ initializeApp }, fs, au] = await Promise.all([import(`${B}/firebase-app.js`), import(`${B}/firebase-firestore.js`), import(`${B}/firebase-auth.js`)]);
  const app = initializeApp(firebaseConfig);
  const db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
  const auth = au.getAuth(app);
  au.onAuthStateChanged(auth, (u) => { state.user = u; if (!document.body.classList.contains('bare')) route(); });
  const clean = (r) => JSON.parse(JSON.stringify(r));
  return {
    mode: 'Firestore', needsLogin: true,
    async load() {
      const [rs, meta] = await Promise.all([fs.getDocs(fs.collection(db, 'recipes')), fs.getDoc(fs.doc(db, 'meta', 'categories'))]);
      return { recipes: rs.docs.map((d) => d.data()), categories: meta.exists() ? meta.data().list : null };
    },
    async signIn() { await au.signInWithPopup(auth, new au.GoogleAuthProvider()); },
    async signOut() { await au.signOut(auth); },
    async save(r) { await fs.setDoc(fs.doc(db, 'recipes', r.id), clean(r)); },
    async remove(id) { await fs.deleteDoc(fs.doc(db, 'recipes', id)); },
    async importAll(recipes, categories) {
      const b = fs.writeBatch(db);
      recipes.forEach(({ pos, ...r }) => b.set(fs.doc(db, 'recipes', r.id), clean(r)));
      b.set(fs.doc(db, 'meta', 'categories'), { list: categories });
      await b.commit();
    },
  };
}

function finalize(list) {
  state.recipes = [...list].sort((a, b) => (a.num ?? 9999) - (b.num ?? 9999));
  state.recipes.forEach((r, i) => { r.pos = i + 1; });
}

async function loadData() {
  const base = await loadBase();
  state.cats = base.categories;
  state.source = 'ricettario originale';
  if (configured) {
    try {
      const fsStore = await Promise.race([makeFirestoreStore(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
      const data = await Promise.race([fsStore.load(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
      store = fsStore; state.cats = data.categories || base.categories;
      if (!data.recipes.length) { state.needsSeed = true; state.source = 'Firestore (ancora vuoto)'; finalize(base.recipes); return; }
      state.needsSeed = false; state.source = 'Firestore'; finalize(data.recipes); return;
    } catch (e) { console.warn('Firestore non disponibile, uso i dati locali:', e); }
  }
  state.source = 'salvato su questo dispositivo';
  finalize(localStore.merge(base.recipes));
}

/* ---------------- quantità: formattazione e scalatura ---------------- */
const FR = [[0, ''], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
function fmtNum(v) {
  const whole = Math.floor(v + 1e-9), frac = v - whole;
  let best = FR[0], d = 9;
  for (const f of FR) { const x = Math.abs(frac - f[0]); if (x < d) { d = x; best = f; } }
  if (d < 0.05) { const w = best[0] === 1 ? whole + 1 : whole; return best[1] ? (w ? `${w}${best[1]}` : best[1]) : String(w); }
  return String(Math.round(v * 10) / 10).replace('.', ',');
}
const METRIC = new Set(['g', 'kg', 'ml', 'l', 'dl']);
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
const PLURAL = { cucchiaio: 'cucchiai', cucchiaino: 'cucchiaini', tazza: 'tazze', tazzina: 'tazzine', bicchiere: 'bicchieri', bicchierino: 'bicchierini', bustina: 'bustine', busta: 'buste', spicchio: 'spicchi', rotolo: 'rotoli', sacchetto: 'sacchetti', noce: 'noci', sorso: 'sorsi', pezzetto: 'pezzetti', stecca: 'stecche', ciuffo: 'ciuffi' };
const SINGULAR = Object.fromEntries(Object.entries(PLURAL).map(([a, b]) => [b, a]));
const pluralUnit = (u, v) => (v > 1.001 ? PLURAL[u] || u : SINGULAR[u] || u);
function qtyText(i, ratio) {
  if (i.q == null) return '';
  const one = (q) => (i.u && METRIC.has(i.u) ? fmtMetric(q * ratio, i.u) : `${fmtNum(q * ratio)}${i.u ? ' ' + pluralUnit(i.u, q * ratio) : ''}`);
  return i.q2 != null ? `${one(i.q).replace(/ [a-z]+$/i, '')}–${one(i.q2)}` : one(i.q);
}
const LABELS = { persone: ['persona', 'persone'], dose: ['dose', 'dosi'], porzioni: ['porzione', 'porzioni'], pagnotta: ['pagnotta', 'pagnotte'] };
const labelFor = (r, n) => (LABELS[r.servingsLabel] || [r.servingsLabel, r.servingsLabel])[n === 1 ? 0 : 1];

/* ---------------- testo <-> ricetta (editor) ---------------- */
const UNITS = { kg: 'kg', g: 'g', gr: 'g', ml: 'ml', l: 'l', lt: 'l', dl: 'dl', cucchiaio: 'cucchiaio', cucchiai: 'cucchiai', cucchiaino: 'cucchiaino', cucchiaini: 'cucchiaini', tazza: 'tazza', tazze: 'tazze', tazzina: 'tazzina', tazzine: 'tazzine', bicchiere: 'bicchiere', bicchierino: 'bicchierino', bustina: 'bustina', bustine: 'bustine', busta: 'busta', spicchio: 'spicchio', spicchi: 'spicchi', rotolo: 'rotolo', sacchetto: 'sacchetto', noce: 'noce', sorso: 'sorso', pezzetto: 'pezzetto', stecca: 'stecca', ciuffo: 'ciuffo' };
const FRV = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };
const NUM = '(?:\\d+\\s*[½¼¾⅓⅔]|\\d+(?:[.,]\\d+)?|[½¼¾⅓⅔])';
const ING_RE = new RegExp(`^(${NUM})(?:\\s+o\\s+(${NUM}))?\\s+(.*)$`);
const toNum = (t) => { t = t.trim(); const m = t.match(/^(\d+)\s*([½¼¾⅓⅔])$/); if (m) return +m[1] + FRV[m[2]]; return FRV[t] ?? parseFloat(t.replace(',', '.')); };
function parseIngredient(line) {
  let [main, ...noteParts] = line.split('|');
  const note = noteParts.join('|').trim(); main = main.trim();
  const m = main.match(ING_RE);
  if (!m) return { n: main, ...(note ? { note } : {}) };
  let rest = m[3], u = null;
  const w = rest.match(/^([A-Za-zàèéìòù]+)\.?\s+(.*)$/);
  if (w && UNITS[w[1].toLowerCase()]) { u = UNITS[w[1].toLowerCase()]; rest = w[2]; }
  const out = { q: toNum(m[1]) };
  if (m[2]) out.q2 = toNum(m[2]);
  if (u) out.u = u;
  out.n = rest.trim();
  if (note) out.note = note;
  return out;
}
function ingToLine(i) {
  let s = '';
  if (i.q != null) { s += fmtNum(i.q); if (i.q2 != null) s += ` o ${fmtNum(i.q2)}`; s += ' '; if (i.u) s += `${i.u} `; }
  s += i.n; if (i.note) s += `|${i.note}`;
  return s.trim();
}
function groupsToText(groups, kind) {
  return groups.map((g) => `${g.title ? `## ${g.title}\n` : ''}${g.items.map((it) => (kind === 'ing' ? ingToLine(it) : it)).join(kind === 'ing' ? '\n' : '\n\n')}`).join('\n\n');
}
function textToGroups(text, kind) {
  const groups = []; let cur = null, buf = [];
  const flush = () => { if (buf.length && cur) cur.items.push(kind === 'ing' ? parseIngredient(buf[0]) : buf.join(' ')); buf = []; };
  const open = (title) => { flush(); cur = { title, items: [] }; groups.push(cur); };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('## ')) { open(line.slice(3).trim() || null); continue; }
    if (!cur) open(null);
    if (!line) { flush(); continue; }
    if (kind === 'ing') { buf = [line]; flush(); } else buf.push(line);
  }
  flush();
  return groups.filter((g) => g.items.length);
}
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ricetta';

/* ---------------- ricerca ---------------- */
function filtered(all = false) {
  const q = norm(state.q).trim();
  const list = state.recipes.filter((r) => all || state.cat === 'all' || r.cat === state.cat);
  if (!q) return list;
  const words = q.split(/\s+/);
  return list.map((r) => {
    const title = norm(`${r.title} ${r.subtitle || ''}`);
    const ings = norm(r.ingredients.flatMap((g) => g.items.map((i) => i.n)).join(' '));
    const rest = norm(`${catOf(r.cat).name} ${r.steps.flatMap((g) => g.items).join(' ')}`);
    let score = 0;
    for (const w of words) { if (title.includes(w)) score += 10; else if (ings.includes(w)) score += 4; else if (rest.includes(w)) score += 1; else return null; }
    return { r, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.r.pos - b.r.pos).map((x) => x.r);
}

/* ---------------- viste: elenco e indice ---------------- */
const searchBar = () => `<div class="search ${state.q ? 'has-q' : ''}">
  <label>${ic('search')}<input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="Cerca ricetta o ingrediente" value="${esc(state.q)}" aria-label="Cerca">
  <button class="icon-btn clear" type="button" id="clear" aria-label="Cancella ricerca">${ic('close')}</button></label></div>`;
const fab = () => `<a class="fab" href="#nuova">${ic('add')}Nuova ricetta</a>`;
const cardHtml = (r, i) => { const c = catOf(r.cat); return `<a class="card" style="--c:${c.color};animation-delay:${Math.min(i, 12) * 25}ms" href="#r-${r.id}">
  <span class="num">${r.pos}</span><span class="em">${esc(r.emoji)}</span><div><h3>${esc(r.title)}</h3><small>${esc(r.subtitle || c.name)}</small></div></a>`; };
const chipsHtml = () => `<div class="chips" role="group" aria-label="Categorie">${[{ id: 'all', name: 'Tutte' }, ...state.cats].map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">${c.emoji ? c.emoji + ' ' : ''}${esc(c.name)}</button>`).join('')}</div>`;

function footHtml() {
  let extra = '';
  if (store.mode === 'locale') extra = `<br><button class="btn text" id="reset-all">${state.resetArmed ? 'Tocca ancora per confermare' : 'Ripristina il ricettario originale'}</button>`;
  else if (state.needsSeed) extra = `<br><button class="btn tonal" id="seed">${ic('cloud_upload')}Importa le ricette su Firestore</button>`;
  else if (state.user) extra = `<br><button class="btn text" id="signout">Esci (${esc(state.user.email || '')})</button>`;
  return `<p class="foot">${state.recipes.length} ricette · ${esc(state.source)}${extra}</p>`;
}

function viewHome() {
  $app.innerHTML = `${heroHtml('Cucina di famiglia', 'Il Ricettario')}
    ${searchBar()}${chipsHtml()}<div id="results"></div>${footHtml()}${fab()}`;
  renderResults();
}
function renderResults() {
  const el = document.getElementById('results'); if (!el) return;
  const list = filtered();
  if (!list.length) { el.innerHTML = `<div class="empty"><div class="big">🍽️</div><p><b>Nessuna ricetta trovata.</b><br>Prova con un altro ingrediente o aggiungi una nuova ricetta.</p></div>`; return; }
  el.innerHTML = `<div class="count">${list.length} ${list.length === 1 ? 'ricetta' : 'ricette'}</div><div class="grid">${list.map(cardHtml).join('')}</div>`;
}
const tocItem = (r) => { const c = catOf(r.cat); return `<li><a class="list-item" href="#r-${r.id}" style="--c:${c.color}"><span class="n">${r.pos}</span>
  <span class="t">${esc(r.title)}${r.subtitle ? `<small>${esc(r.subtitle)}</small>` : ''}</span><span class="e">${esc(r.emoji)}</span></a></li>`; };
function viewToc() {
  $app.innerHTML = `${heroHtml('Tutte le ricette', 'Indice')}${searchBar()}
    <div class="seg" role="group" aria-label="Ordinamento">${[['num', 'Per numero'], ['cat', 'Per categoria'], ['az', 'A–Z']].map(([k, l]) => `<button data-toc="${k}" aria-pressed="${state.tocMode === k}">${l}</button>`).join('')}</div>
    <div id="results"></div>${fab()}`;
  renderToc();
}
function renderToc() {
  const el = document.getElementById('results'); if (!el) return;
  let list = filtered(true);
  if (!list.length) { el.innerHTML = `<div class="empty"><div class="big">🍽️</div><p><b>Nessuna ricetta trovata.</b></p></div>`; return; }
  const searching = !!state.q.trim();
  if (state.tocMode === 'cat' && !searching) {
    el.innerHTML = state.cats.map((c) => { const rs = list.filter((r) => r.cat === c.id); return rs.length ? `<div class="list-head">${c.emoji} ${esc(c.name).toUpperCase()}</div><ul class="list">${rs.map(tocItem).join('')}</ul>` : ''; }).join('');
  } else {
    if (!searching && state.tocMode === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'it'));
    el.innerHTML = `<ul class="list">${list.map(tocItem).join('')}</ul>`;
  }
}

/* ---------------- viste: ricetta ---------------- */
function ensureState(r) { if (state.servings[r.id] == null) state.servings[r.id] = r.servings; state.ticked[r.id] ||= new Set(); state.done[r.id] ||= new Set(); }
const peopleBlock = () => `<div class="people"><div class="lbl">Per quante persone?<small id="base"></small></div>
  <div class="stepper"><button class="icon-btn" id="minus" aria-label="Meno">${ic('remove')}</button>
  <div class="val" aria-live="polite"><span id="n"></span><small id="lbl"></small></div><button class="icon-btn" id="plus" aria-label="Più">${ic('add')}</button></div></div>
  <button class="btn text" id="reset" hidden>${ic('restart_alt')}Dose originale</button><div id="ings"></div>`;

function viewRecipe(id) {
  const r = byId(id); if (!r) { location.hash = '#ricette'; return; }
  ensureState(r);
  const c = catOf(r.cat), idx = state.recipes.indexOf(r), prev = state.recipes[idx - 1], next = state.recipes[idx + 1];
  const note = [r.note ? esc(r.note) : '', r.link ? `<a href="${esc(r.link.url)}" target="_blank" rel="noopener">▶ ${esc(r.link.label)}</a>` : ''].filter(Boolean);
  $app.innerHTML = `
    <div class="appbar"><a class="icon-btn" href="#ricette" aria-label="Indietro">${ic('arrow_back')}</a><span class="title"></span>
      <button class="icon-btn" id="wake" aria-pressed="false" aria-label="Tieni lo schermo acceso">${ic('lightbulb')}</button>
      <a class="icon-btn" href="#e-${r.id}" aria-label="Modifica ricetta">${ic('edit')}</a></div>
    <section class="hd" style="--c:${c.color}"><span class="big" aria-hidden="true">${esc(r.emoji)}</span>
      <span class="pill">n. ${r.pos} · ${esc(c.name)}</span><h1>${esc(r.title)}</h1>${r.subtitle ? `<div class="sub">${esc(r.subtitle)}</div>` : ''}
      <div class="hd-actions"><a class="btn" href="#f-${r.id}">${ic('play_arrow')}Cucina passo passo</a></div></section>
    ${r.intro ? `<p class="intro">${esc(r.intro)}</p>` : ''}${note.length ? `<div class="note">${note.join(' · ')}</div>` : ''}
    <section class="sec"><h2>${ic('shopping_basket')}Ingredienti</h2>${peopleBlock()}</section>
    <section class="sec"><h2>${ic('skillet')}Procedimento</h2>
      ${r.steps.map((g, gi) => `<div class="step-group">${g.title ? `<h3>${esc(g.title)}</h3>` : ''}<ol class="steps">${g.items.map((s, si) => `<li data-k="${gi}-${si}" class="${state.done[r.id].has(`${gi}-${si}`) ? 'done' : ''}">${esc(s)}</li>`).join('')}</ol></div>`).join('')}
      ${(r.tips || []).map((t) => `<div class="tip"><b>${esc(t.title)}</b><br>${esc(t.text)}</div>`).join('')}</section>
    <nav class="pn">${prev ? `<a href="#r-${prev.id}"><small>Precedente</small>${esc(prev.emoji)} ${esc(prev.title)}</a>` : ''}${next ? `<a href="#r-${next.id}"><small>Successiva</small>${esc(next.emoji)} ${esc(next.title)}</a>` : ''}</nav>`;
  renderIngredients(r); window.scrollTo(0, 0);
}
function renderIngredients(r) {
  const n = state.servings[r.id], ratio = n / r.servings, ticked = state.ticked[r.id];
  document.getElementById('n').textContent = fmtNum(n);
  document.getElementById('lbl').textContent = labelFor(r, n);
  document.getElementById('base').textContent = `${r.servingsGuess ? 'dose originale stimata' : 'dose originale'}: ${r.servings} ${labelFor(r, r.servings)}`;
  document.getElementById('reset').hidden = n === r.servings;
  document.getElementById('minus').disabled = n <= 1;
  document.getElementById('ings').innerHTML = r.ingredients.map((g, gi) => `<div class="ing-group">${g.title ? `<h3>${esc(g.title)}</h3>` : ''}<ul class="ings">${g.items.map((i, ii) => {
    const k = `${gi}-${ii}`, q = qtyText(i, ratio), name = q && i.u && METRIC.has(i.u) && !/^(di|d’|d')\s?/i.test(i.n) ? `di ${i.n}` : i.n;
    return `<li><label><input type="checkbox" data-k="${k}" ${ticked.has(k) ? 'checked' : ''}>${q ? `<span class="q">${esc(q)}</span>` : ''}<span class="txt">${esc(name)}${i.note ? `<small>${esc(i.note)}</small>` : ''}</span></label></li>`;
  }).join('')}</ul></div>`).join('');
}

/* ---------------- modalità focus ---------------- */
const FS_MIN = 14, FS_MAX = 40;
const getFs = () => Math.min(FS_MAX, Math.max(FS_MIN, +lsGet('ricettario.fs', 20) || 20));
function stages(r) {
  const out = [{ kind: 'ing', label: 'Ingredienti' }];
  const total = r.steps.reduce((n, g) => n + g.items.length, 0); let k = 0;
  r.steps.forEach((g) => g.items.forEach((text) => { k += 1; out.push({ kind: 'step', label: `Procedimento ${k}/${total}`, group: g.title, text }); }));
  out.push({ kind: 'end', label: 'Fatto' });
  return out;
}
function viewFocus(id) {
  const r = byId(id); if (!r) { location.hash = '#ricette'; return; }
  ensureState(r);
  if (state.focus.id !== id) state.focus = { id, i: 0 };
  const st = stages(r), s = st[Math.min(state.focus.i, st.length - 1)], i = st.indexOf(s), last = i === st.length - 1;
  const fs = getFs();
  $app.innerHTML = `<div class="focus">
    <div class="focus-bar"><a class="icon-btn" href="#r-${r.id}" aria-label="Esci dalla modalità focus">${ic('close')}</a><div class="t">${esc(r.emoji)} ${esc(r.title)}</div>
      <button class="icon-btn" id="fs-dn" aria-label="Riduci carattere" ${fs <= FS_MIN ? 'disabled' : ''}>${ic('text_decrease')}</button>
      <button class="icon-btn" id="fs-up" aria-label="Ingrandisci carattere" ${fs >= FS_MAX ? 'disabled' : ''}>${ic('text_increase')}</button></div>
    <div class="focus-stage"><div class="lbl"><b>${esc(s.label)}</b><span>${i + 1} / ${st.length}</span></div>${s.group ? `<div class="grp">${esc(s.group)}</div>` : ''}
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${st.length - 1}" aria-valuenow="${i}"><i style="width:${(i / (st.length - 1)) * 100}%"></i></div></div>
    <div class="focus-body" style="font-size:${fs}px">${s.kind === 'ing' ? peopleBlock() : s.kind === 'step' ? `<div class="step-text">${esc(s.text)}</div>` : `<div class="focus-end"><div class="big">🍽️</div><h2>Buon appetito!</h2></div>`}</div>
    <div class="focus-nav"><button class="btn tonal big back" id="f-prev" aria-label="Indietro" ${i === 0 ? 'disabled' : ''}>${ic('arrow_back')}</button>
      <button class="btn big" id="f-next">${last ? 'Chiudi' : i === 0 ? 'Inizia' : 'Avanti'}${ic(last ? 'check' : 'arrow_forward')}</button></div></div>`;
  if (s.kind === 'ing') renderIngredients(r);
}
function focusGo(d) {
  const r = byId(state.focus.id); if (!r) return;
  const n = stages(r).length, j = state.focus.i + d;
  if (j >= n) { location.hash = `#r-${r.id}`; return; }
  if (j < 0) return;
  state.focus.i = j; viewFocus(r.id);
  document.querySelector('.focus-body')?.scrollTo(0, 0);
}
async function setWake(on) {
  try {
    if (on && !state.wake) { state.wake = await navigator.wakeLock.request('screen'); state.wake.addEventListener('release', () => { state.wake = null; document.getElementById('wake')?.classList.remove('on'); document.getElementById('wake')?.setAttribute('aria-pressed', 'false'); }); }
    else if (!on && state.wake) { await state.wake.release(); state.wake = null; }
    document.getElementById('wake')?.setAttribute('aria-pressed', String(!!state.wake));
  } catch { document.getElementById('wake')?.setAttribute('hidden', ''); }
}

/* ---------------- editor ---------------- */
function viewEditor(id) {
  const isNew = id === null, r = isNew ? null : byId(id);
  if (!isNew && !r) { location.hash = '#ricette'; return; }
  const v = r || { title: '', subtitle: '', cat: state.cats[0]?.id, emoji: '🍽️', servings: 4, servingsLabel: 'persone', note: '', ingredients: [], steps: [] };
  const labels = [['persone', 'persone'], ['porzioni', 'porzioni'], ['dose', 'dosi'], ['pagnotta', 'pagnotte']];
  $app.innerHTML = `
    <div class="appbar"><a class="icon-btn" href="${isNew ? '#ricette' : `#r-${r.id}`}" aria-label="Annulla">${ic('close')}</a><span class="title">${isNew ? 'Nuova ricetta' : 'Modifica ricetta'}</span></div>
    <form class="form" id="edit" novalidate>
      <label class="field"><span>Titolo</span><input id="f-title" required value="${esc(v.title)}" autocomplete="off"></label>
      <label class="field"><span>Sottotitolo (facoltativo)</span><input id="f-sub" value="${esc(v.subtitle || '')}" autocomplete="off"></label>
      <div class="row"><label class="field"><span>Categoria</span><select id="f-cat">${state.cats.map((c) => `<option value="${c.id}" ${c.id === v.cat ? 'selected' : ''}>${c.emoji} ${esc(c.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Emoji</span><input id="f-emoji" value="${esc(v.emoji)}" maxlength="4"></label></div>
      <div class="row"><label class="field"><span>Dose originale per</span><input id="f-serv" type="number" min="1" max="99" inputmode="numeric" value="${v.servings}"></label>
        <label class="field"><span>Unità</span><select id="f-label">${labels.map(([k, l]) => `<option value="${k}" ${k === v.servingsLabel ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <label class="field"><span>Nota (facoltativa)</span><input id="f-note" value="${esc(v.note || '')}" autocomplete="off"></label>
      <label class="field"><span>Ingredienti</span><textarea id="f-ings" spellcheck="false">${esc(groupsToText(v.ingredients, 'ing'))}</textarea>
        <small>Uno per riga: <code>250 g farina</code>, <code>2 uova</code>, <code>½ limone</code>, <code>Sale q.b.</code>. Dopo una barra verticale una nota non scalata: <code>25 g lievito|o 7 g secco</code>. Per creare un gruppo scrivi <code>## Titolo</code> su una riga.</small></label>
      <label class="field"><span>Procedimento</span><textarea id="f-steps" spellcheck="true" style="font-family:inherit;font-size:1rem">${esc(groupsToText(v.steps, 'step'))}</textarea>
        <small>Separa i passaggi con una riga vuota. Gruppi con <code>## Titolo</code>.</small></label>
      <div class="err" id="f-err" role="alert"></div>
      <div class="form-actions"><button class="btn" type="submit">${ic('check')}Salva</button><a class="btn outline" href="${isNew ? '#ricette' : `#r-${r.id}`}">Annulla</a>
        ${isNew ? '' : `<button class="btn text" type="button" id="del" style="margin-left:auto;color:var(--error)">${ic('delete')}Elimina</button>`}</div>
      <div class="sheet-confirm" id="del-confirm" hidden><b>Eliminare «${esc(v.title)}»?</b><span>${store.mode === 'locale' ? 'Potrai riavere le ricette originali con «Ripristina il ricettario originale».' : 'L’operazione non si può annullare.'}</span>
        <div class="form-actions"><button class="btn danger" type="button" id="del-yes">Elimina</button><button class="btn outline" type="button" id="del-no">Annulla</button></div></div>
    </form>`;
  window.scrollTo(0, 0);
}
async function ensureLogin() {
  if (!store.needsLogin || state.user) return true;
  try { await store.signIn(); return true; } catch { snack('Accesso non riuscito'); return false; }
}
async function saveEditor(id) {
  const g = (k) => document.getElementById(k).value;
  const err = (m) => { document.getElementById('f-err').textContent = m; };
  const title = g('f-title').trim(), ings = textToGroups(g('f-ings'), 'ing'), steps = textToGroups(g('f-steps'), 'step'), servings = Math.max(1, Math.min(99, parseInt(g('f-serv'), 10) || 0));
  if (!title) return err('Scrivi il titolo della ricetta.');
  if (!ings.length) return err('Aggiungi almeno un ingrediente.');
  if (!steps.length) return err('Aggiungi almeno un passaggio del procedimento.');
  if (!servings) return err('Indica per quante persone è la dose originale.');
  const old = id ? byId(id) : null;
  const rec = {
    ...(old || { tips: [], link: null, intro: null }),
    id: old ? old.id : `${slug(title)}-${Date.now().toString(36)}`,
    num: old ? old.num : Math.max(0, ...state.recipes.map((x) => x.num || 0)) + 1,
    title, subtitle: g('f-sub').trim() || null, cat: g('f-cat'), emoji: g('f-emoji').trim() || '🍽️',
    servings, servingsLabel: g('f-label'), servingsGuess: old && old.servings === servings ? old.servingsGuess : false,
    note: g('f-note').trim() || null, ingredients: ings, steps,
  };
  delete rec.pos;
  if (!(await ensureLogin())) return;
  try { await store.save(rec); } catch (e) { console.warn(e); return err('Salvataggio non riuscito: per modificare devi accedere con l’account autorizzato.'); }
  finalize([...state.recipes.filter((x) => x.id !== rec.id), rec]);
  if (old) delete state.servings[rec.id];
  snack(old ? 'Ricetta salvata' : 'Ricetta aggiunta'); location.hash = `#r-${rec.id}`;
}
async function deleteRecipe(id) {
  if (!(await ensureLogin())) return;
  try { await store.remove(id); } catch (e) { console.warn(e); return snack('Eliminazione non riuscita: serve l’account autorizzato'); }
  finalize(state.recipes.filter((x) => x.id !== id)); snack('Ricetta eliminata'); location.hash = '#ricette';
}

/* ---------------- router ---------------- */
function currentId() { const m = location.hash.match(/^#[rfe]-(.+)$/); return m ? m[1] : null; }
function route() {
  const h = location.hash || '#ricette';
  const bare = /^#(f-|e-|nuova)/.test(h);
  document.body.classList.toggle('bare', bare);
  document.querySelectorAll('#tabbar a').forEach((a) => { const on = (/^#r-/.test(h) ? '#ricette' : h) === a.getAttribute('href'); a.classList.toggle('active', on); });
  if (!h.startsWith('#f-')) setWake(false).catch(() => {});
  if (h.startsWith('#r-')) viewRecipe(h.slice(3));
  else if (h.startsWith('#f-')) { viewFocus(h.slice(3)); setWake(true); }
  else if (h.startsWith('#e-')) viewEditor(h.slice(3));
  else if (h === '#nuova') viewEditor(null);
  else if (h === '#indice') { viewToc(); window.scrollTo(0, 0); }
  else viewHome();
}

/* ---------------- eventi (delegati) ---------------- */
document.addEventListener('input', (e) => {
  if (e.target.id !== 'q') return;
  state.q = e.target.value; e.target.closest('.search').classList.toggle('has-q', !!state.q);
  location.hash === '#indice' ? renderToc() : renderResults();
});
document.addEventListener('submit', (e) => { if (e.target.id === 'edit') { e.preventDefault(); const id = location.hash.startsWith('#e-') ? location.hash.slice(3) : null; saveEditor(id); } });
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, li'); if (!t) return;
  const rid = currentId(), r = rid && byId(rid);
  if (t.id === 'clear') { state.q = ''; const i = document.getElementById('q'); i.value = ''; i.focus(); i.dispatchEvent(new Event('input', { bubbles: true })); }
  else if (t.dataset.cat) { state.cat = t.dataset.cat; document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.cat === state.cat)); renderResults(); }
  else if (t.dataset.toc) { state.tocMode = t.dataset.toc; document.querySelectorAll('[data-toc]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.toc === state.tocMode)); renderToc(); }
  else if (t.id === 'theme') {
    const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length]; lsSet('ricettario.theme', next); applyTheme(next);
    t.outerHTML = themeBtn(); snack(`Tema ${THEME_UI[next][1]}`);
  }
  else if (t.id === 'random') { const pool = state.recipes; if (pool.length) location.hash = `#r-${pool[Math.floor(Math.random() * pool.length)].id}`; }
  else if (t.id === 'reset-all') { if (!state.resetArmed) { state.resetArmed = true; t.textContent = 'Tocca ancora per confermare'; setTimeout(() => { state.resetArmed = false; if (t.isConnected) t.textContent = 'Ripristina il ricettario originale'; }, 4000); } else { state.resetArmed = false; await localStore.reset(); await loadData(); snack('Ricettario originale ripristinato'); route(); } }
  else if (t.id === 'seed') {
    if (!(await ensureLogin())) return;
    try { await store.importAll(state.recipes, state.cats); await loadData(); snack('Ricette importate su Firestore'); route(); }
    catch (err) { console.warn(err); snack('Import non riuscito: accedi con l’email autorizzata nelle regole'); }
  }
  else if (t.id === 'signout') { await store.signOut(); snack('Disconnesso'); }
  else if (r && t.id === 'plus') { state.servings[r.id] = Math.min(99, state.servings[r.id] + 1); renderIngredients(r); }
  else if (r && t.id === 'minus') { state.servings[r.id] = Math.max(1, state.servings[r.id] - 1); renderIngredients(r); }
  else if (r && t.id === 'reset') { state.servings[r.id] = r.servings; renderIngredients(r); }
  else if (t.id === 'wake') { await setWake(!state.wake); }
  else if (t.id === 'f-next') focusGo(1);
  else if (t.id === 'f-prev') focusGo(-1);
  else if (t.id === 'fs-up' || t.id === 'fs-dn') {
    const fs = Math.min(FS_MAX, Math.max(FS_MIN, getFs() + (t.id === 'fs-up' ? 2 : -2))); lsSet('ricettario.fs', fs);
    document.querySelector('.focus-body').style.fontSize = `${fs}px`;
    document.getElementById('fs-up').disabled = fs >= FS_MAX; document.getElementById('fs-dn').disabled = fs <= FS_MIN;
  }
  else if (t.id === 'del') { document.getElementById('del-confirm').hidden = false; document.getElementById('del-confirm').scrollIntoView({ block: 'center' }); }
  else if (t.id === 'del-no') document.getElementById('del-confirm').hidden = true;
  else if (t.id === 'del-yes' && rid) deleteRecipe(rid);
  else if (r && t.matches('.steps li')) { const set = state.done[r.id], k = t.dataset.k; set.has(k) ? set.delete(k) : set.add(k); t.classList.toggle('done', set.has(k)); }
});
document.addEventListener('change', (e) => {
  const rid = currentId(); if (!rid || !e.target.matches('.ings input')) return;
  const set = state.ticked[rid]; if (!set) return;
  e.target.checked ? set.add(e.target.dataset.k) : set.delete(e.target.dataset.k);
});
// Scorrimento a destra/sinistra e tasti freccia in modalità focus
let sx = 0, sy = 0;
document.addEventListener('touchstart', (e) => { if (e.target.closest('.focus-body')) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (!location.hash.startsWith('#f-') || !e.target.closest('.focus-body') || e.target.closest('.people,.ings')) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) focusGo(dx < 0 ? 1 : -1);
});
document.addEventListener('keydown', (e) => { if (location.hash.startsWith('#f-') && !e.target.matches('input,textarea,select')) { if (e.key === 'ArrowRight') focusGo(1); else if (e.key === 'ArrowLeft') focusGo(-1); } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && location.hash.startsWith('#f-')) setWake(true); });
window.addEventListener('hashchange', route);

/* ---------------- avvio ---------------- */
(async () => {
  $app.innerHTML = `<div class="empty" style="padding-top:30vh"><div class="big">🍳</div><p><b>Sto preparando il ricettario…</b></p></div>`;
  try { await loadData(); } catch (e) { $app.innerHTML = `<div class="empty"><div class="big">😕</div><p><b>Impossibile caricare le ricette.</b><br>${esc(e.message)}</p></div>`; return; }
  route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
