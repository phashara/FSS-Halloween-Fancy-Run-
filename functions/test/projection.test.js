import test from 'node:test';
import assert from 'node:assert/strict';
import { publicRunner, publicOrder, directoryInput } from '../projection.js';

test('private applicant fields and newly added fields cannot enter public response', () => {
  const output = publicRunner({ regId: 'DEMO', fullName: 'ทดสอบ ระบบ', phone: '000', email: 'test@example.invalid', medicalConditions: 'private', birthDate: 'private', emergencyContactPhone: 'private', studentId: 'private', ownerUid: 'private', futureSecret: 'private' });
  assert.deepEqual(output, { regId: 'DEMO', fullName: 'ทดสอบ ระบบ' });
});
test('slip, address, phone and email never enter public orders', () => {
  assert.deepEqual(publicOrder({ orderId: 'DEMO', status: 'paid', slipImage: 'private', shippingAddress: 'private', phone: 'private', email: 'private', verifiedBy: 'private' }), { orderId: 'DEMO', status: 'paid' });
});
test('paging and input are bounded', () => {
  assert.deepEqual(directoryInput({}), { search: '', cursor: '', pageSize: 20 });
  for (const bad of [{pageSize: 10000}, {pageSize: 0}, {cursor: 'runners/id'}, {search: 'x'.repeat(161)}, {search: 'x'}, {search: []}, null]) assert.throws(() => directoryInput(bad));
});
