import { describe, it, expect } from 'vitest';
import { directoryInput, publicRunner } from '../../functions/projection.js';

describe('Directory Search and Projection Validation', () => {
  it('accepts trimmed valid search inputs', () => {
    expect(directoryInput({ search: 'สมชาย' })).toEqual({ search: 'สมชาย', cursor: '', pageSize: 20 });
    expect(directoryInput({ search: '  0812345678  ' })).toEqual({ search: '0812345678', cursor: '', pageSize: 20 });
    expect(directoryInput({ search: 'FSS26-001' })).toEqual({ search: 'FSS26-001', cursor: '', pageSize: 20 });
  });

  it('rejects 1-character search or oversized inputs to prevent quota flooding', () => {
    expect(() => directoryInput({ search: 'x' })).toThrow();
    expect(() => directoryInput({ search: 'ก' })).toThrow();
    expect(() => directoryInput({ search: 'a'.repeat(161) })).toThrow();
  });

  it('properly projects public runner data without exposing private PII', () => {
    const rawRunner = {
      regId: 'REG-001',
      bibNumber: '001',
      regType: 'RUN_AND_SHIRT',
      fullName: 'สมชาย ใจดี',
      nameThai: 'สมชาย ใจดี',
      cardId: 'FSS26-001',
      shirtOrderId: 'ORD-001',
      checkedIn: true,
      registeredAt: '2026-10-06T00:00:00.000Z',
      // Private fields:
      phone: '0812345678',
      email: 'somchai@example.com',
      birthDate: '1995-05-15',
      medicalConditions: 'None',
      emergencyContactPhone: '0899999999',
    };

    const projected = publicRunner(rawRunner);
    expect(projected.regId).toBe('REG-001');
    expect(projected.fullName).toBe('สมชาย ใจดี');
    expect(projected.bibNumber).toBe('001');
    expect((projected as any).phone).toBeUndefined();
    expect((projected as any).email).toBeUndefined();
    expect((projected as any).birthDate).toBeUndefined();
    expect((projected as any).emergencyContactPhone).toBeUndefined();
  });
});
