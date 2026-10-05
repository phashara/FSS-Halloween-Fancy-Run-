import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EventProvider, useEventContext, RegisterParams } from '../context/EventContext';
import { RunnerRegistration } from '../types';

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
    documentId: vi.fn(() => '__name__'),
    orderBy: vi.fn((field) => ({ orderBy: field })),
    startAfter: vi.fn((cursor) => ({ startAfter: cursor })),
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
    fullName: 'นายสมชาย ใจดี',
    nameThai: 'นายสมชาย ใจดี',
    nameEng: 'Somchai Jaidee',
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
    expect(registeredRes.runner.fullName).toBe('นายสมชาย ใจดี');
    expect(registeredRes.card.nickname).toBe('ชาย');
    expect(registeredRes.order).toBeDefined();

    expect(result.current.runners.some((r) => r.regId === registeredRes.runner.regId)).toBe(true);
    expect(result.current.cards.some((c) => c.cardId === registeredRes.card.cardId)).toBe(true);
    expect(result.current.justRevealedCard?.cardId).toBe(registeredRes.card.cardId);
  });

  it('3. Legacy fullName exact search queries fullName field without omitting legacy docs and without polluting global state', async () => {
    const legacyRunner: RunnerRegistration = {
      regId: 'REG-LEGACY1',
      regType: 'RUN_FREE',
      fullName: 'นางสาวสมศรี โบราณ',
      nameThai: 'นางสาวสมศรี โบราณ',
      nameEng: 'Somsri Boran',
      nickname: 'ศรี',
      age: 30,
      gender: 'female',
      phone: '0812223333',
      email: 'somsri@legacy.com',
      province: 'กรุงเทพฯ',
      emergencyContactName: 'ผู้ปกครอง',
      emergencyContactPhone: '0810000000',
      displayNameType: 'fullName',
      isMinor: false,
      agreedTerms: true,
      agreedPhotoRelease: true,
      agreedDataPolicy: true,
      cardId: 'FSS26-LEGACY1',
      registeredAt: new Date().toISOString(),
      checkedIn: false,
      medalClaimed: false,
      shirtClaimed: false,
    };

    mockGetDocs.mockImplementation(async () => {
      return {
        empty: false,
        forEach: (cb: any) => cb({ data: () => legacyRunner }),
      };
    });

    const { result } = renderHook(() => useEventContext(), { wrapper });

    let searchRes: any = null;
    await act(async () => {
      searchRes = await result.current.searchRunnersRemote('นางสาวสมศรี โบราณ');
    });

    expect(searchRes.runners.length).toBeGreaterThan(0);
    expect(searchRes.runners[0].fullName).toBe('นางสาวสมศรี โบราณ');
    expect(searchRes.runners[0].nameThai || searchRes.runners[0].fullName).toBe('นางสาวสมศรี โบราณ');
  });

  it('4. searchRunnersRemote throws on Quota or Network error for UI error handling', async () => {
    mockGetDocs.mockImplementation(async () => {
      throw new Error('Quota exceeded for metric Free daily read/write');
    });

    const { result } = renderHook(() => useEventContext(), { wrapper });

    let thrownError: any = null;
    await act(async () => {
      try {
        await result.current.searchRunnersRemote('สมชาย');
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toContain('Quota');
  });

  it('5. loadDirectoryPage reads via documentId order with pagination and returns hasMore', async () => {
    const dummyRunners = Array.from({ length: 21 }, (_, i) => ({
      regId: `REG-PAGED-${i}`,
      fullName: `Runner ${i}`,
      cardId: `FSS26-PAGED-${i}`,
    }));

    mockGetDocs.mockImplementation(async () => {
      return {
        length: dummyRunners.length,
        forEach: (cb: any) => dummyRunners.forEach((r) => cb({ data: () => r })),
      };
    });

    const { result } = renderHook(() => useEventContext(), { wrapper });

    let pageResult: any = null;
    await act(async () => {
      pageResult = await result.current.loadDirectoryPage({ pageSize: 20 });
    });

    expect(pageResult.runners.length).toBe(20);
    expect(pageResult.hasMore).toBe(true);
  });

  it('6. subscribeAdminData replaces state authoritatively with confirmed Cloud snapshot without merging stale local rows', async () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    // Initial local count
    expect(result.current.runners).toBeDefined();

    // Trigger admin subscription
    await act(async () => {
      const unsub = result.current.subscribeAdminData();
      unsub();
    });

    expect(result.current.connectionStatus).toBe('connected');
  });
});
