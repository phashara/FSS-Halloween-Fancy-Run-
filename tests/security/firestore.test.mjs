import test, { before, after, beforeEach } from 'node:test';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// Tests can only address a local demo project, never a production endpoint.
const host = process.env.FIRESTORE_EMULATOR_HOST;
if (host !== '127.0.0.1:8080') throw new Error('Refusing to run without the isolated localhost emulator');
let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-fss-security', firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') } });
});
after(async () => { await env?.cleanup(); });
const owner = () => env.authenticatedContext('owner').firestore();
const outsider = () => env.authenticatedContext('outsider').firestore();
const anonymous = () => env.unauthenticatedContext().firestore();
const admin = (overrides = {}) => env.authenticatedContext('admin', { email: 'phasharak@gmail.com', email_verified: true, firebase: { sign_in_provider: 'google.com' }, ...overrides }).firestore();
const runner = (id = 'R-NEW') => ({ownerUid: 'owner', regId: id, regType: 'RUN_FREE', fullName: 'ทดสอบ ระบบ', phone: '0000000000', age: 25, agreedTerms: true, agreedDataPolicy: true, checkedIn: false, medalClaimed: false, shirtClaimed: false, cardId: 'C-NEW'});
const order = (id = 'O-NEW') => ({ownerUid: 'owner', orderId: id, cardId: 'C-NEW', customerName: 'ทดสอบ ระบบ', phone: '0000000000', quantity: 1, unitPrice: 300, totalAmount: 300, status: 'unpaid'});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'runners', 'R-OLD'), { regId: 'R-OLD', fullName: 'Legacy Synthetic', phone: '0000000000', medicalConditions: 'synthetic private value' });
    await setDoc(doc(context.firestore(), 'runners', 'R-OWN'), runner('R-OWN'));
    await setDoc(doc(context.firestore(), 'orders', 'O-OWN'), order('O-OWN'));
    await setDoc(doc(context.firestore(), 'cards', 'C-OWN'), {ownerUid: 'owner', cardId: 'C-OWN', level: 1, fullName: 'Synthetic', badges: []});
    await setDoc(doc(context.firestore(), 'site_content', 'hero'), {text: 'Public Synthetic'});
  });
});

test('public and other users cannot read private records or lists', async () => {
  for (const db of [anonymous(), outsider()]) {
    await assertFails(getDoc(doc(db, 'runners', 'R-OLD')));
    await assertFails(getDoc(doc(db, 'runners', 'R-OWN')));
    await assertFails(getDoc(doc(db, 'orders', 'O-OWN')));
    await assertFails(getDocs(collection(db, 'runners')));
    await assertFails(getDocs(collection(db, 'orders')));
  }
});
test('existing legacy data remains available to the approved verified Google admin', async () => {
  await assertSucceeds(getDoc(doc(admin(), 'runners', 'R-OLD')));
  await assertSucceeds(getDocs(collection(admin(), 'runners')));
  await assertSucceeds(updateDoc(doc(admin(), 'orders', 'O-OWN'), {status: 'paid', verifiedBy: 'Synthetic Admin'}));
});
test('wrong account, unverified email, or password sign-in cannot become admin', async () => {
  for (const claims of [{email: 'other@example.invalid'}, {email_verified: false}, {firebase: {sign_in_provider: 'password'}}]) {
    await assertFails(getDoc(doc(admin(claims), 'runners', 'R-OLD')));
    await assertFails(updateDoc(doc(admin(claims), 'orders', 'O-OWN'), {status: 'paid'}));
  }
});
test('owner can read own records but cannot approve payment, check in, delete, or edit others', async () => {
  const db = owner();
  await assertSucceeds(getDoc(doc(db, 'runners', 'R-OWN')));
  await assertFails(updateDoc(doc(db, 'runners', 'R-OWN'), {checkedIn: true}));
  await assertFails(updateDoc(doc(db, 'runners', 'R-OWN'), {medalClaimed: true}));
  await assertFails(updateDoc(doc(db, 'orders', 'O-OWN'), {status: 'paid'}));
  await assertFails(deleteDoc(doc(db, 'runners', 'R-OWN')));
  await assertFails(updateDoc(doc(db, 'runners', 'R-OLD'), {ownerUid: 'owner'}));
  await assertFails(updateDoc(doc(db, 'cards', 'C-OWN'), {level: 2}));
});
test('valid registration batch and exact retry succeed without modifying old records', async () => {
  const db = owner();
  const submit = async () => {
    const batch = writeBatch(db);
    batch.set(doc(db, 'runners', 'R-NEW'), runner(), {merge: true});
    batch.set(doc(db, 'orders', 'O-NEW'), order(), {merge: true});
    batch.set(doc(db, 'cards', 'C-NEW'), {ownerUid: 'owner', cardId: 'C-NEW', fullName: 'Synthetic', level: 1, badges: []}, {merge: true});
    await batch.commit();
  };
  await assertSucceeds(submit());
  await assertSucceeds(submit());
});
test('spoofed ownership, paid registration, and extra privileged fields are rejected', async () => {
  await assertFails(setDoc(doc(owner(), 'runners', 'R-NEW'), {...runner(), ownerUid: 'outsider'}));
  await assertFails(setDoc(doc(owner(), 'runners', 'R-NEW'), {...runner(), checkedInBy: 'fake'}));
  await assertFails(setDoc(doc(owner(), 'orders', 'O-NEW'), {...order(), status: 'paid'}));
  await assertFails(setDoc(doc(owner(), 'orders', 'O-NEW'), {...order(), totalAmount: 1}));
  await assertFails(setDoc(doc(anonymous(), 'runners', 'R-NEW'), runner()));
});
test('public CMS is readable but only admin can change it', async () => {
  await assertSucceeds(getDoc(doc(anonymous(), 'site_content', 'hero')));
  await assertFails(updateDoc(doc(outsider(), 'site_content', 'hero'), {text: 'unauthorized'}));
  await assertSucceeds(updateDoc(doc(admin(), 'site_content', 'hero'), {text: 'admin update'}));
});
