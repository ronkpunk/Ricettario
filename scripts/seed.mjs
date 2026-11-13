// Carica le ricette su Firestore: collezione "recipes" (un documento per ricetta) + "meta/categories".
// Uso:  GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json node scripts/seed.mjs
//   oppure con emulatore:  FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo node scripts/seed.mjs
import { readFileSync } from 'node:fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const { recipes, categories } = JSON.parse(readFileSync(new URL('../public/data/recipes.json', import.meta.url)));
const opts = process.env.FIRESTORE_EMULATOR_HOST ? { projectId: process.env.GCLOUD_PROJECT || 'demo-ricettario' } : { credential: applicationDefault() };
initializeApp(opts);
const db = getFirestore();

const batch = db.batch();
for (const r of recipes) batch.set(db.collection('recipes').doc(r.id), r);
batch.set(db.collection('meta').doc('categories'), { list: categories });
await batch.commit();
console.log(`✔ ${recipes.length} ricette caricate su Firestore`);
