import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { publicRunner, publicOrder, publicCard, directoryInput } from './projection.js';

initializeApp();
const db = getFirestore('ai-studio-fsshalloweenfanc-3137dab4-29d6-492e-b607-01b4ace7e671');
// No writes, migrations, or triggers: this endpoint returns only public fields.
// Per-instance IP limits and maxInstances constrain abuse; App Check can additionally be enabled after configuration.
const rates = new Map();
function rateLimit(ip) {
  const now = Date.now();
  for (const [key, entry] of rates) if (entry.until <= now) rates.delete(key);
  const entry = rates.get(ip) || { until: now + 60000, count: 0 };
  if (rates.size >= 10000 && !rates.has(ip)) throw new HttpsError('resource-exhausted', 'กรุณาลองใหม่ภายหลัง');
  entry.count++;
  rates.set(ip, entry);
  if (entry.count > 30) throw new HttpsError('resource-exhausted', 'ค้นหาบ่อยเกินไป กรุณารอสักครู่');
}

export const publicDirectory = onCall({
  region: 'asia-southeast1', maxInstances: 2, concurrency: 10, memory: '256MiB', timeoutSeconds: 30,
  serviceAccount: 'fss-public-directory@alpine-insight-1t3g1.iam.gserviceaccount.com',
}, async (request) => {
  let input;
  try { input = directoryInput(request.data); } catch { throw new HttpsError('invalid-argument', 'ข้อมูลค้นหาไม่ถูกต้อง'); }
  rateLimit(request.rawRequest.ip || 'unknown');
  const runners = new Map();
  const orders = new Map();
  let hasMore = false;
  let lastDoc = null;
  if (input.search) {
    const text = input.search.trim();
    const upper = text.toUpperCase();
    const cleanTitles = ['นาย ', 'นาย', 'นางสาว ', 'นางสาว', 'นาง ', 'นาง', 'ด.ช. ', 'ด.ญ. ', 'Mr. ', 'Ms. ', 'Mrs. '];
    let strippedText = text;
    for (const title of cleanTitles) {
      if (strippedText.startsWith(title)) {
        strippedText = strippedText.slice(title.length).trim();
        break;
      }
    }
    const textVariants = Array.from(new Set([
      text,
      strippedText,
      `นาย ${strippedText}`,
      `นาย${strippedText}`,
      `นางสาว ${strippedText}`,
      `นางสาว${strippedText}`,
      `นาง ${strippedText}`,
      `นาง${strippedText}`,
    ].filter(Boolean)));

    const runnerQueries = [];
    const orderQueries = [];

    // Prefix range queries for identifiers
    for (const idKey of ['regId', 'cardId', 'bibNumber']) {
      runnerQueries.push(db.collection('runners').where(idKey, '>=', upper).where(idKey, '<=', upper + '\uf8ff').limit(15));
    }
    orderQueries.push(db.collection('orders').where('orderId', '>=', upper).where('orderId', '<=', upper + '\uf8ff').limit(15));

    // Prefix range queries for names
    for (const variant of textVariants) {
      for (const nameKey of ['fullName', 'nameThai', 'nameEng', 'nickname']) {
        runnerQueries.push(db.collection('runners').where(nameKey, '>=', variant).where(nameKey, '<=', variant + '\uf8ff').limit(15));
      }
      orderQueries.push(db.collection('orders').where('customerName', '>=', variant).where('customerName', '<=', variant + '\uf8ff').limit(15));
    }

    const phone = text.replace(/\D/g, '');
    if (phone.length >= 6 && phone.length <= 15) {
      runnerQueries.push(db.collection('runners').where('phone', '>=', phone).where('phone', '<=', phone + '\uf8ff').limit(15));
      orderQueries.push(db.collection('orders').where('phone', '>=', phone).where('phone', '<=', phone + '\uf8ff').limit(15));
    }
    const [runnerSnaps, orderSnaps] = await Promise.all([Promise.all(runnerQueries.map((q) => q.get())), Promise.all(orderQueries.map((q) => q.get()))]);
    for (const snap of runnerSnaps) for (const document of snap.docs) runners.set(document.id, document.data());
    for (const snap of orderSnaps) for (const document of snap.docs) orders.set(document.id, document.data());
  } else {
    let q = db.collection('runners').orderBy(FieldPath.documentId()).limit(input.pageSize + 1);
    if (input.cursor) q = q.startAfter(input.cursor);
    const snap = await q.get();
    hasMore = snap.docs.length > input.pageSize;
    const docs = snap.docs.slice(0, input.pageSize);
    for (const document of docs) runners.set(document.id, document.data());
    lastDoc = docs.at(-1)?.id || null;
  }
  // Limit hydration even when several exact-match queries overlap.
  const selectedRunners = [...runners.values()].slice(0, 20);
  const orderIds = [...new Set(selectedRunners.map((r) => r.shirtOrderId).filter((id) => typeof id === 'string' && id.length <= 160 && !id.includes('/')))].slice(0, 20);
  await Promise.all(orderIds.map(async (id) => { if (!orders.has(id)) { const snap = await db.collection('orders').doc(id).get(); if (snap.exists) orders.set(id, snap.data()); } }));
  const cardIds = [...new Set(selectedRunners.map((r) => r.cardId).filter((id) => typeof id === 'string' && id.length <= 160 && !id.includes('/')))].slice(0, 20);
  const cards = await Promise.all(cardIds.map(async (id) => { const snap = await db.collection('cards').doc(id).get(); return snap.exists ? publicCard(snap.data()) : null; }));
  return { runners: selectedRunners.map(publicRunner), cards: cards.filter(Boolean), orders: [...orders.values()].slice(0, 20).map(publicOrder), hasMore, lastDoc };
});
