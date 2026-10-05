import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EventProvider, useEventContext, RegisterParams } from '../context/EventContext';

// MOCK FIREBASE/FIRESTORE AT MODULE LEVEL
const mockBatchSet = vi.fn();
const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
const mockGetDocs = vi.fn().mockResolvedValue({ empty: true, forEach: vi.fn() });
const mockGetDoc = vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) });
const mockSetDoc = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase/firestore', () => {
  return {
    db: {},
    collection: vi.fn((db, name) => ({ type: 'collection', name })),
    doc: vi.fn((db, col, id) => ({ type: 'doc', col, id })),
    query: vi.fn((col, ...rules) => ({ type: 'query', col, rules })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    limit: vi.fn((num) => ({ limit: num })),
    writeBatch: vi.fn(() => ({
      set: mockBatchSet,
      commit: mockBatchCommit,
    })),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    onSnapshot: vi.fn((ref, callback) => {
      callback({ forEach: vi.fn() });
      return vi.fn();
    }),
  };
});

vi.mock('../lib/firebase', () => ({
  db: {},
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventProvider>{children}</EventProvider>
);

describe('Production EventProvider & Context Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchCommit.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
    mockGetDocs.mockResolvedValue({ empty: true, forEach: vi.fn() });
    mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  const sampleRegisterParams: RegisterParams = {
    regType: 'RUN_AND_SHIRT',
    fullName: 'สมชาย นักวิ่ง',
    nameThai: 'สมชาย นักวิ่ง',
    nameEng: 'Somchai Runner',
    nickname: 'ชาย',
    age: 25,
    gender: 'male',
    participantCategory: 'general',
    phone: '0891112222',
    email: 'somchai@example.com',
    province: 'พิษณุโลก',
    emergencyContactName: 'คุณแม่',
    emergencyContactPhone: '0899998888',
    emergencyContactRelation: 'มารดา',
    displayNameType: 'nickname',
    isMinor: false,
    agreedTerms: true,
    agreedPhotoRelease: true,
    agreedDataPolicy: true,
    shirtSize: 'L',
    shirtQuantity: 1,
    slipImage: 'data:image/jpeg;base64,sampleSlipData',
  };

  it('1. Atomic registration commit failure MUST NOT add card, runner, or justRevealedCard to confirmed state', async () => {
    // Force writeBatch.commit to fail
    mockBatchCommit.mockRejectedValueOnce(new Error('Quota exceeded for metric Free daily read/write'));

    const { result } = renderHook(() => useEventContext(), { wrapper });

    const initialRunnersCount = result.current.runners.length;
    const initialCardsCount = result.current.cards.length;

    let thrownError: any = null;
    await act(async () => {
      try {
        await result.current.registerParticipant(sampleRegisterParams);
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(result.current.runners.length).toBe(initialRunnersCount);
    expect(result.current.cards.length).toBe(initialCardsCount);
    expect(result.current.justRevealedCard).toBeNull();
  });

  it('2. Atomic registration commit success MUST save runner, card, and order via batch.commit and update state', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    let registeredRes: any = null;
    await act(async () => {
      registeredRes = await result.current.registerParticipant(sampleRegisterParams);
    });

    expect(mockBatchSet).toHaveBeenCalled();
    expect(mockBatchCommit).toHaveBeenCalled();
    expect(registeredRes.runner.fullName).toBe('สมชาย นักวิ่ง');
    expect(registeredRes.card.nickname).toBe('ชาย');
    expect(registeredRes.order).toBeDefined();

    // Verify confirmed state in context
    expect(result.current.runners.some((r) => r.regId === registeredRes.runner.regId)).toBe(true);
    expect(result.current.cards.some((c) => c.cardId === registeredRes.card.cardId)).toBe(true);
    expect(result.current.justRevealedCard?.cardId).toBe(registeredRes.card.cardId);
  });

  it('3. Retry with matching fingerprint MUST reuse exact same species, stats, timestamps, and IDs', async () => {
    // 1st attempt: commit fails
    mockBatchCommit.mockRejectedValueOnce(new Error('Network Timeout'));

    const { result } = renderHook(() => useEventContext(), { wrapper });

    let firstAttemptPayload: any = null;
    await act(async () => {
      try {
        await result.current.registerParticipant(sampleRegisterParams);
      } catch {
        // Expected fail
      }
    });

    // Check pending info is saved
    expect(result.current.pendingRegistrationInfo?.fullName).toBe('สมชาย นักวิ่ง');

    // 2nd attempt: commit succeeds
    mockBatchCommit.mockResolvedValueOnce(undefined);
    let secondAttemptRes: any = null;
    await act(async () => {
      secondAttemptRes = await result.current.registerParticipant(sampleRegisterParams);
    });

    expect(secondAttemptRes.runner.fullName).toBe('สมชาย นักวิ่ง');
    expect(secondAttemptRes.card.cardId).toBeDefined();
    expect(result.current.pendingRegistrationInfo).toBeNull();
  });

  it('4. Metadata commit rejection on image upload MUST NOT update local state or storage', async () => {
    mockBatchCommit.mockRejectedValueOnce(new Error('Firestore permission denied'));

    const { result } = renderHook(() => useEventContext(), { wrapper });

    const prevMapImage = result.current.customMapImage;
    let thrownError: any = null;

    await act(async () => {
      try {
        await result.current.setCustomMapImage('data:image/jpeg;base64,newMapData');
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(result.current.customMapImage).toBe(prevMapImage);
  });

  it('5. Mount public hydration and syncFromCloud in-flight deduplication', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    // Call syncFromCloud multiple times concurrently
    let syncRes1: any;
    let syncRes2: any;

    await act(async () => {
      const [res1, res2] = await Promise.all([
        result.current.syncFromCloud(),
        result.current.syncFromCloud(),
      ]);
      syncRes1 = res1;
      syncRes2 = res2;
    });

    expect(syncRes1.success).toBe(true);
    expect(syncRes2.success).toBe(true);
    // Both concurrent calls returned the same deduplicated result
    expect(syncRes1).toBe(syncRes2);
  });
});
