// Genera public/data/recipes.json (usato come fallback offline e dallo script di seed Firestore).
import { writeFileSync, mkdirSync } from 'node:fs';
import { RECIPES, CATEGORIES } from './recipes.src.mjs';

const FR = { '½': 0.5, '¼': 0.25, '¾': 0.75 };
const UNITS = {
  kg: 'kg', g: 'g', gr: 'g', ml: 'ml', l: 'l', lt: 'l', dl: 'dl',
  cucchiaio: 'cucchiaio', cucchiai: 'cucchiai', cucchiaino: 'cucchiaino', cucchiaini: 'cucchiaini',
  tazza: 'tazza', tazze: 'tazze', tazzina: 'tazzina', tazzine: 'tazzine',
  bicchiere: 'bicchiere', bicchierino: 'bicchierino', bustina: 'bustina', bustine: 'bustine', busta: 'busta',
  spicchio: 'spicchio', spicchi: 'spicchi', rotolo: 'rotolo', sacchetto: 'sacchetto',
  noce: 'noce', sorso: 'sorso', pezzetto: 'pezzetto', stecca: 'stecca', ciuffo: 'ciuffo',
};
const METRIC = new Set(['g', 'kg', 'ml', 'l', 'dl']);
const num = (t) => {
  t = t.trim();
  const m = t.match(/^(\d+)\s*([½¼¾])$/);
  if (m) return +m[1] + FR[m[2]];
  if (FR[t]) return FR[t];
  return parseFloat(t.replace(',', '.'));
};

export function parseIngredient(line) {
  let [main, note] = line.split('|');
  main = main.trim();
  const m = main.match(/^((?:\d+\s*[½¼¾])|(?:\d+(?:[.,]\d+)?)|[½¼¾])(?:\s+o\s+((?:\d+\s*[½¼¾])|(?:\d+(?:[.,]\d+)?)|[½¼¾]))?\s+(.*)$/);
  if (!m) return { n: main, ...(note ? { note } : {}) };
  let rest = m[3];
  let u = null;
  const w = rest.match(/^([A-Za-zàèéìòù]+)\.?\s+(.*)$/);
  if (w && UNITS[w[1].toLowerCase()]) { u = UNITS[w[1].toLowerCase()]; rest = w[2]; }
  const out = { q: num(m[1]) };
  if (m[2]) out.q2 = num(m[2]);
  if (u) out.u = u;
  out.n = rest;
  if (u && METRIC.has(u) && !/^(di|d’)\s?/i.test(rest)) out.di = true; // "250 g DI farina"
  if (note) out.note = note;
  return out;
}

const recipes = RECIPES.map((r) => ({
  id: `${String(r.num).padStart(2, '0')}-${r.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  num: r.num, title: r.title, subtitle: r.subtitle || null, cat: r.cat, emoji: r.emoji,
  servings: r.servings, servingsLabel: r.label || 'persone', servingsGuess: !!r.guess,
  intro: r.intro || null, note: r.note || null, link: r.link || null, tips: r.tips || [],
  ingredients: r.ingredients.map((g) => ({ title: g.title, items: g.items.map(parseIngredient) })),
  steps: r.steps.map((g) => ({ title: g.title, items: g.items })),
}));

mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/recipes.json', JSON.stringify({ categories: CATEGORIES, recipes }, null, 1));
console.log(`${recipes.length} ricette scritte in public/data/recipes.json`);
