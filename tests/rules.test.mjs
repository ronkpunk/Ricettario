// Test delle regole Firestore sull'emulatore.  Uso:  npm run test:rules
import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, setLogLevel, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';

setLogLevel('error');
let env;
const BOOT = 'ronkpunk@gmail.com';
const user = (uid, email = `${uid}@example.com`, extra = {}) => env.authenticatedContext(uid, { email, email_verified: true, ...extra }).firestore();
const anon = () => env.authenticatedContext('anon1', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const profile = (role, status = 'active') => ({ email: 'x@example.com', displayName: 'X', photoURL: null, role, status, createdAt: new Date(), lastLoginAt: new Date() });

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-ricettario', firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 } });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'recipes/r1'), { title: 'Torta', num: 1 });
    await setDoc(doc(db, 'users/ed'), profile('editor'));
    await setDoc(doc(db, 'users/adm'), profile('admin'));
    await setDoc(doc(db, 'users/usr'), profile('user'));
    await setDoc(doc(db, 'users/off'), profile('editor', 'disabled'));
    await setDoc(doc(db, 'suggestions/s1'), { recipeId: 'r1', proposed: { title: 'Torta 2' }, comment: '', authorUid: 'usr', authorName: 'U', status: 'pending', createdAt: new Date() });
  });
});

const sug = (uid, extra = {}) => ({ recipeId: 'r1', proposed: { title: 'Nuovo' }, comment: 'perché', authorUid: uid, authorName: 'N', status: 'pending', createdAt: serverTimestamp(), ...extra });

test('lettura ricette pubblica (anche senza login)', async () => {
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'recipes/r1')));
});
test('anonimo e utente standard non scrivono ricette', async () => {
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'recipes/r1'), { title: 'x' }));
  await assertFails(setDoc(doc(anon(), 'recipes/r1'), { title: 'x' }));
  await assertFails(setDoc(doc(user('usr'), 'recipes/r1'), { title: 'x' }));
});
test('editor e admin scrivono ed eliminano ricette', async () => {
  await assertSucceeds(setDoc(doc(user('ed'), 'recipes/r2'), { title: 'Nuova' }));
  await assertSucceeds(updateDoc(doc(user('ed'), 'recipes/r1'), { title: 'Mod' }));
  await assertSucceeds(deleteDoc(doc(user('adm'), 'recipes/r1')));
});
test('editor disabilitato non scrive', async () => {
  await assertFails(setDoc(doc(user('off'), 'recipes/r2'), { title: 'x' }));
});
test('admin di emergenza scrive anche senza documento utente', async () => {
  await assertSucceeds(setDoc(doc(user('boss', BOOT), 'recipes/r2'), { title: 'x' }));
  await assertFails(setDoc(doc(user('fake', BOOT, { email_verified: false }), 'recipes/r3'), { title: 'x' }));
  await assertFails(setDoc(doc(user('fake2', 'altro@example.com'), 'recipes/r3'), { title: 'x' }));
});

test('registrazione: crea solo il proprio documento come user attivo', async () => {
  await assertSucceeds(setDoc(doc(user('nuovo'), 'users/nuovo'), { email: 'n@example.com', displayName: 'N', photoURL: null, role: 'user', status: 'active', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() }));
  await assertFails(setDoc(doc(user('n2'), 'users/n2'), { email: 'n@example.com', displayName: 'N', photoURL: null, role: 'admin', status: 'active', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() }));
  await assertFails(setDoc(doc(user('n3'), 'users/n3'), { email: 'n@example.com', displayName: 'N', photoURL: null, role: 'editor', status: 'active', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() }));
  await assertFails(setDoc(doc(user('n4'), 'users/altro'), { email: 'n@example.com', displayName: 'N', photoURL: null, role: 'user', status: 'active', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() }));
  await assertFails(setDoc(doc(anon(), 'users/anon1'), { email: '', displayName: '', photoURL: null, role: 'user', status: 'active', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() }));
});
test('un utente non può promuoversi né riattivarsi', async () => {
  await assertFails(updateDoc(doc(user('usr'), 'users/usr'), { role: 'admin' }));
  await assertFails(updateDoc(doc(user('ed'), 'users/ed'), { role: 'admin' }));
  await assertFails(updateDoc(doc(user('off'), 'users/off'), { status: 'active' }));
  await assertSucceeds(updateDoc(doc(user('usr'), 'users/usr'), { displayName: 'Nuovo nome', lastLoginAt: serverTimestamp() }));
});
test('admin cambia ruolo, disabilita ed elimina utenti; editor no', async () => {
  await assertSucceeds(updateDoc(doc(user('adm'), 'users/usr'), { role: 'editor' }));
  await assertSucceeds(updateDoc(doc(user('adm'), 'users/usr'), { status: 'disabled' }));
  await assertSucceeds(deleteDoc(doc(user('adm'), 'users/usr')));
  await assertFails(updateDoc(doc(user('ed'), 'users/usr'), { role: 'editor' }));
  await assertFails(deleteDoc(doc(user('ed'), 'users/usr')));
});
test('lista utenti: solo admin', async () => {
  await assertSucceeds(getDocs(collection(user('adm'), 'users')));
  await assertFails(getDocs(collection(user('ed'), 'users')));
  await assertFails(getDocs(collection(user('usr'), 'users')));
  await assertFails(getDoc(doc(user('usr'), 'users/adm')));
  await assertSucceeds(getDoc(doc(user('usr'), 'users/usr')));
});

test('suggerimenti: solo utenti registrati attivi', async () => {
  await assertSucceeds(setDoc(doc(user('usr'), 'suggestions/n1'), sug('usr')));
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'suggestions/n2'), sug('x')));
  await assertFails(setDoc(doc(anon(), 'suggestions/n3'), sug('anon1')));
  await assertFails(setDoc(doc(user('off'), 'suggestions/n4'), sug('off')));
  await assertFails(setDoc(doc(user('senza-profilo'), 'suggestions/n5'), sug('senza-profilo')));
  await assertFails(setDoc(doc(user('usr'), 'suggestions/n6'), sug('altro')));                 // autore falso
  await assertFails(setDoc(doc(user('usr'), 'suggestions/n7'), sug('usr', { status: 'approved' })));
  await assertFails(setDoc(doc(user('usr'), 'suggestions/n8'), sug('usr', { comment: 'x'.repeat(501) })));
  await assertFails(setDoc(doc(user('usr'), 'suggestions/n9'), sug('usr', { extra: 1 })));
});
test('suggerimenti: lettura (propri o tutti per editor/admin)', async () => {
  await assertSucceeds(getDoc(doc(user('usr'), 'suggestions/s1')));
  await assertSucceeds(getDocs(query(collection(user('usr'), 'suggestions'), where('authorUid', '==', 'usr'))));
  await assertFails(getDocs(collection(user('usr'), 'suggestions')));
  await assertFails(getDoc(doc(user('altro-utente'), 'suggestions/s1')));
  await assertSucceeds(getDocs(collection(user('ed'), 'suggestions')));
  await assertSucceeds(getDocs(collection(user('adm'), 'suggestions')));
});
test('suggerimenti: revisione solo editor/admin e solo sui campi di revisione', async () => {
  const rev = { status: 'approved', reviewedBy: 'ed', reviewedAt: serverTimestamp(), reviewNote: 'ok' };
  await assertSucceeds(updateDoc(doc(user('ed'), 'suggestions/s1'), rev));
  await assertFails(updateDoc(doc(user('usr'), 'suggestions/s1'), rev));
  await assertFails(updateDoc(doc(user('ed'), 'suggestions/s1'), { proposed: { title: 'Manomesso' } }));
  await assertSucceeds(deleteDoc(doc(user('adm'), 'suggestions/s1')));
  await assertFails(deleteDoc(doc(user('usr'), 'suggestions/s1')));
});
