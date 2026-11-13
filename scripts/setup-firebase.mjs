// Configura e pubblica il Ricettario su Firebase (Hosting + Firestore).
// Prerequisiti: Node 18+, un progetto Firebase vuoto, `npx firebase login` già fatto.
// Uso:  npm run setup -- <project-id>
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const project = process.argv[2];
if (!project) { console.error('Uso: npm run setup -- <project-id>'); process.exit(1); }

const fb = (args, { json = false, allowFail = false } = {}) => {
  const r = spawnSync('npx', ['firebase', ...args, '--project', project, ...(json ? ['--json'] : [])], { encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.status !== 0 && !allowFail) { console.error(r.stdout, r.stderr); throw new Error(`firebase ${args.join(' ')} non riuscito`); }
  if (!json) return r;
  try { return JSON.parse(r.stdout); } catch { return { raw: r.stdout }; }
};

/** Cerca ricorsivamente l'oggetto di configurazione web (quello con apiKey) in una risposta del CLI. */
export function findSdkConfig(x) {
  if (!x) return null;
  if (typeof x === 'string') {
    const m = x.match(/\{[^{}]*apiKey[^{}]*\}/s);
    if (m) {
      const o = {};
      for (const [, k, v] of m[0].matchAll(/["']?(\w+)["']?\s*:\s*["']([^"']*)["']/g)) o[k] = v;
      if (o.apiKey && o.projectId) return o;
    }
    try { return findSdkConfig(JSON.parse(x)); } catch { return null; }
  }
  if (typeof x === 'object') {
    if (x.apiKey && x.projectId) return x;
    for (const v of Object.values(x)) { const f = findSdkConfig(v); if (f) return f; }
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('setup-firebase.mjs')) {
  console.log(`▶ Progetto: ${project}`);
  writeFileSync('.firebaserc', JSON.stringify({ projects: { default: project } }, null, 2) + '\n');

  console.log('▶ Creo il database Firestore (se non esiste già)…');
  fb(['firestore:databases:create', '(default)', '--location', 'eur3'], { allowFail: true });

  console.log('▶ Cerco/creo l’app web…');
  const list = fb(['apps:list', 'WEB'], { json: true, allowFail: true });
  let appId = (list.result || []).find((a) => a.platform === 'WEB' || a.appId)?.appId;
  if (!appId) appId = fb(['apps:create', 'WEB', 'Ricettario'], { json: true }).result?.appId;
  if (!appId) throw new Error('Impossibile ottenere l’appId: crea un’app web dalla Console Firebase e rilancia.');

  console.log('▶ Scrivo public/firebase-config.js…');
  const cfg = findSdkConfig(fb(['apps:sdkconfig', 'WEB', appId], { json: true }));
  if (!cfg) throw new Error('Configurazione web non trovata: copiala dalla Console in public/firebase-config.js.');
  const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId: aid } = cfg;
  writeFileSync('public/firebase-config.js', `// Generato da scripts/setup-firebase.mjs\nexport const firebaseConfig = ${JSON.stringify({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId: aid }, null, 2)};\n`);

  console.log('▶ Pubblico regole Firestore e Hosting…');
  const d = fb(['deploy', '--only', 'firestore,hosting']);
  process.stdout.write(d.stdout);
  console.log(`
✔ Fatto! L'app è su https://${project}.web.app

Ultimi due passaggi (una tantum, dalla Console Firebase):
 1. Build → Authentication → Inizia → Metodo di accesso → abilita "Google".
 2. Apri l'app, in fondo alla home tocca «Importa le ricette su Firestore» e accedi con l'email autorizzata.`);
}
