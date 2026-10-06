// Strict allowlists: adding a private field to Firestore never makes it public.
const runnerFields = ['regId', 'bibNumber', 'regType', 'nameThai', 'fullName', 'cardId', 'shirtOrderId', 'checkedIn', 'shirtClaimed', 'registeredAt'];
const orderFields = ['orderId', 'cardId', 'customerName', 'size', 'sizes', 'quantity', 'status', 'deliveryMethod', 'totalAmount'];
function pick(data, fields) {
  return Object.fromEntries(fields.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
}
export function publicRunner(data) { return pick(data, runnerFields); }
export function publicOrder(data) { return pick(data, orderFields); }

export function directoryInput(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid input');
  const search = data.search ?? '';
  const cursor = data.cursor ?? '';
  const pageSize = data.pageSize ?? 20;
  if (typeof search !== 'string' || search.length > 160 || (search.trim().length === 1)) throw new Error('Invalid search');
  if (typeof cursor !== 'string' || cursor.length > 160 || /[\/\x00-\x1f]/.test(cursor)) throw new Error('Invalid cursor');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 20) throw new Error('Invalid page size');
  return { search: search.trim(), cursor, pageSize };
}

export function publicCard(data) { return pick(data, ['cardId','speciesId','nickname','fullName','rarity','level','stats','badges','qrPayload','createdAt','unlockedAtLv2','customQuote','customImageUrl']); }
