import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  setDoc,
  startAfter,
  writeBatch,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { SiteContentSection, AdminUser } from '../types/cms';
import { idbGet, idbSet, idbRemove } from '../lib/idbStorage';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { THAI_GHOSTS, OFFICIAL_12_GHOST_IDS } from '../data/ghosts';
import {
  INITIAL_CARDS,
  INITIAL_RUNNERS,
  INITIAL_SHIRT_ORDERS,
} from '../data/initialData';
import {
  CardLevel,
  GhostCard,
  GhostCardStats,
  GhostSpecies,
  GhostSpeciesId,
  OfficerRole,
  ParticipantCategory,
  ParticipantGender,
  QuizAnswer,
  Rarity,
  RegistrationType,
  RunnerRegistration,
  ShirtOrder,
  ShirtSize,
  StudentYear,
} from '../types';
import {
  generateCardId,
  generateRegId,
  generateOrderId,
  generateBibNumber,
} from '../lib/idGenerator';

export type ConnectionStatus = 'unknown' | 'connected' | 'offline' | 'quota_exhausted' | 'error';

export interface RegisterParams {
  regType: RegistrationType;
  fullName: string;
  nameThai?: string;
  nameEng?: string;
  nickname: string;
  age: number;
  birthDate?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  gender: ParticipantGender;
  participantCategory?: ParticipantCategory;
  studentYear?: StudentYear;
  studentId?: string;
  facultyGroup?: string;
  faculty?: string;
  staffDepartmentGroup?: string;
  staffDepartment?: string;
  phone: string;
  email: string;
  province: string;
  organization?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string;
  infoSource?: string;
  interestedInShirt?: 'yes' | 'no';
  hasAttendedBefore?: 'yes' | 'no';
  costumeStyle?: 'sportswear' | 'ghost' | 'other';
  costumeStyleNote?: string;
  medicalConditions?: string;
  teamName?: string;
  displayNameType: 'fullName' | 'nickname' | 'teamName' | 'anonymous';
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  agreedTerms: boolean;
  agreedPhotoRelease: boolean;
  agreedDataPolicy: boolean;
  shirtSize?: ShirtSize;
  shirtSizes?: ShirtSize[];
  shirtQuantity?: number;
  deliveryMethod?: 'pickup_event' | 'shipping';
  shippingAddress?: string;
  slipImage?: string;
  quizAnswers?: QuizAnswer[];
}

export interface RegisterOptions {
  idempotencyKey?: string;
  existingCardId?: string;
  existingRegId?: string;
  existingOrderId?: string;
  existingBibNumber?: string;
}

export interface OrderShirtParams {
  cardId: string;
  customerName: string;
  phone: string;
  email: string;
  size?: ShirtSize;
  sizes?: ShirtSize[];
  quantity: number;
  deliveryMethod?: 'pickup_event' | 'shipping';
  shippingAddress?: string;
  slipImage?: string;
}

export interface OrderShirtOptions {
  idempotencyKey?: string;
  existingOrderId?: string;
}

export interface PendingRegistrationPayload {
  fingerprint: string;
  runner: RunnerRegistration;
  card: GhostCard;
  order?: ShirtOrder;
  savedAt: string;
}

export interface PendingOrderPayload {
  fingerprint: string;
  order: ShirtOrder;
  savedAt: string;
}

export interface LoadDirectoryPageOptions {
  pageSize?: number;
  lastDoc?: any;
}

export interface DirectoryPageResult {
  runners: RunnerRegistration[];
  cards: GhostCard[];
  orders: ShirtOrder[];
  hasMore: boolean;
  lastDoc: any;
}

export interface SearchResultPayload {
  runners: RunnerRegistration[];
  cards: GhostCard[];
  orders: ShirtOrder[];
}

export interface EventContextType {
  cards: GhostCard[];
  runners: RunnerRegistration[];
  orders: ShirtOrder[];
  currentCardId: string | null;
  setCurrentCardId: (id: string | null) => void;
  currentCard: GhostCard | null;
  currentRunner: RunnerRegistration | null;
  justRevealedCard: GhostCard | null;
  setJustRevealedCard: (card: GhostCard | null) => void;
  activeOfficerRole: OfficerRole;
  setActiveOfficerRole: (role: OfficerRole) => void;

  // Admin Authentication (phasharak / 07011985)
  adminUser: AdminUser | null;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;

  // Official Shirt & Medal Images
  customShirtImage: string | null;
  setCustomShirtImage: (imgUrl: string | null) => Promise<void>;
  customMedalImage: string | null;
  setCustomMedalImage: (imgUrl: string | null) => Promise<void>;
  customMapImage: string | null;
  setCustomMapImage: (imgUrl: string | null) => Promise<void>;

  // Live CMS Text Editing
  isLiveEditMode: boolean;
  setIsLiveEditMode: (val: boolean) => void;
  siteContent: Record<string, SiteContentSection>;
  updateSiteContent: (section: SiteContentSection) => Promise<void>;
  resetSiteContentSection: (sectionKey: string) => Promise<void>;

  // Firebase status & Cloud Sync with Quota Backoff
  connectionStatus: ConnectionStatus;
  isFirebaseConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  quotaErrorMessage: string | null;
  pendingRegistrationInfo: { fullName: string; phone: string; regId: string } | null;
  syncFromCloud: (options?: { forceAdminSync?: boolean }) => Promise<{ success: boolean; message: string; count: number }>;
  subscribeAdminData: () => () => void;
  loadCardById: (cardId: string) => Promise<GhostCard | null>;
  loadDirectoryPage: (options?: LoadDirectoryPageOptions) => Promise<DirectoryPageResult>;
  searchRunnersRemote: (queryStr: string) => Promise<SearchResultPayload>;
  exportLocalBackup: () => { success: boolean; filename: string };

  // Actions
  registerParticipant: (
    params: RegisterParams,
    options?: RegisterOptions
  ) => Promise<{ runner: RunnerRegistration; card: GhostCard; order?: ShirtOrder }>;
  orderShirt: (
    params: OrderShirtParams,
    options?: OrderShirtOptions
  ) => Promise<ShirtOrder>;
  approveShirtPayment: (orderId: string, officerName?: string) => Promise<void>;
  rejectShirtPayment: (orderId: string, reason?: string) => Promise<void>;
  markShirtClaimed: (orderId: string) => Promise<void>;
  refundShirtOrder: (orderId: string) => Promise<void>;

  checkInRunner: (cardOrRegId: string, officerName: string) => Promise<{
    success: boolean;
    message: string;
    runner?: RunnerRegistration;
    card?: GhostCard;
  }>;
  claimMedal: (regId: string) => void;
  updateCardCustomImage: (cardId: string, imageUrl: string | null) => Promise<void>;
  // 12 Thai Ghost Collection
  ghostSpeciesList: GhostSpecies[];
  updateGhostSpecies: (species: GhostSpecies) => Promise<void>;
  resetGhostSpecies: (speciesId: GhostSpeciesId) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearSystemCache: () => Promise<void>;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const STORAGE_KEYS = {
  CARDS: 'fss2026_cards',
  RUNNERS: 'fss2026_runners',
  ORDERS: 'fss2026_orders',
  CURRENT_CARD_ID: 'fss2026_active_card_id',
  OFFICER_ROLE: 'fss2026_officer_role',
  ADMIN_SESSION: 'fss2026_admin_session',
  LIVE_EDIT: 'fss2026_live_edit_mode',
  SITE_CONTENT: 'fss2026_site_content',
  SHIRT_IMAGE: 'fss_custom_shirt_image',
  MEDAL_IMAGE: 'fss_custom_medal_image',
  MAP_IMAGE: 'fss_custom_map_image',
  GHOST_SPECIES: 'fss2026_ghost_species',
  PENDING_REGISTRATION: 'fss_pending_registration',
  PENDING_ORDER: 'fss_pending_order',
};

// In-memory fallback map for test/SSR environments
const memoryStorageMap = new Map<string, string>();

// Safe localStorage wrapper
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorageMap.get(key) || null;
    } catch {
      return memoryStorageMap.get(key) || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      memoryStorageMap.set(key, value);
    } catch {
      memoryStorageMap.set(key, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      memoryStorageMap.delete(key);
    } catch {
      memoryStorageMap.delete(key);
    }
  },
};

// Helper to deeply remove undefined fields before saving to Cloud Firestore
export function cleanForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

// Check if error is a Firestore quota exhaustion
export function isQuotaExhaustedError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as any)?.code;
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('Quota exceeded') ||
    msg.includes('quota') ||
    msg.includes('Free daily read')
  );
}

// Compute level helper
function recomputeCardLevel(
  card: GhostCard,
  ordersList: ShirtOrder[],
  runnersList: RunnerRegistration[]
): GhostCard {
  const runner = runnersList.find((r) => r.cardId === card.cardId);
  const order = ordersList.find((o) => o.cardId === card.cardId);
  const isPaid = order && (order.status === 'paid' || order.status === 'claimed');
  const isCheckedIn = runner && runner.checkedIn;

  const newLevel: CardLevel = isPaid || isCheckedIn ? 2 : 1;
  const badges = [...card.badges];
  if (isPaid && !badges.includes('SHIRT_OWNER')) badges.push('SHIRT_OWNER');
  if (isCheckedIn && !badges.includes('CHECKED_IN')) badges.push('CHECKED_IN');

  return {
    ...card,
    level: newLevel,
    badges,
  };
}

// Create clean fingerprint from registration params
export function createRegistrationFingerprint(params: RegisterParams): string {
  return `${params.fullName.trim()}_${params.phone.trim()}_${params.regType}`.toLowerCase();
}

export function createOrderFingerprint(params: OrderShirtParams): string {
  return `${params.cardId.trim()}_${params.customerName.trim()}_${params.phone.trim()}_${params.quantity}`.toLowerCase();
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<GhostCard[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.CARDS);
      const parsedCards = saved ? JSON.parse(saved) : INITIAL_CARDS;
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        return parsedCards.map((c) => ({
          ...c,
          level: (c && typeof c.level === 'number' && c.level > 2 ? 2 : (c?.level || 1)) as CardLevel,
        }));
      }
      return INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [runners, setRunners] = useState<RunnerRegistration[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.RUNNERS);
      const parsed = saved ? JSON.parse(saved) : INITIAL_RUNNERS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RUNNERS;
    } catch {
      return INITIAL_RUNNERS;
    }
  });

  const [orders, setOrders] = useState<ShirtOrder[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.ORDERS);
      const parsed = saved ? JSON.parse(saved) : INITIAL_SHIRT_ORDERS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SHIRT_ORDERS;
    } catch {
      return INITIAL_SHIRT_ORDERS;
    }
  });

  const [currentCardId, setCurrentCardId] = useState<string | null>(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.CURRENT_CARD_ID) || null;
    } catch {
      return null;
    }
  });

  const [justRevealedCard, setJustRevealedCard] = useState<GhostCard | null>(null);

  const [activeOfficerRole, setActiveOfficerRole] = useState<OfficerRole>(() => {
    try {
      return (safeLocalStorage.getItem(STORAGE_KEYS.OFFICER_ROLE) as OfficerRole) || 'SUPER_ADMIN';
    } catch {
      return 'SUPER_ADMIN';
    }
  });

  // Admin Auth session
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Live Edit CMS mode
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.LIVE_EDIT) === 'true';
    } catch {
      return false;
    }
  });

  // CMS Content
  const [siteContent, setSiteContent] = useState<Record<string, SiteContentSection>>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SITE_CONTENT, ...parsed };
        }
      }
      return DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  });

  // Official custom assets
  const [customShirtImage, setCustomShirtImageState] = useState<string | null>(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.SHIRT_IMAGE) || null;
    } catch {
      return null;
    }
  });

  const [customMedalImage, setCustomMedalImageState] = useState<string | null>(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.MEDAL_IMAGE) || null;
    } catch {
      return null;
    }
  });

  const [customMapImage, setCustomMapImageState] = useState<string | null>(() => {
    try {
      return safeLocalStorage.getItem(STORAGE_KEYS.MAP_IMAGE) || null;
    } catch {
      return null;
    }
  });

  // Ghost Species Dictionary
  const [ghostSpeciesMap, setGhostSpeciesMap] = useState<Record<GhostSpeciesId, GhostSpecies>>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.GHOST_SPECIES);
      const parsed = saved ? JSON.parse(saved) : {};
      const cleaned: Record<string, GhostSpecies> = {};
      OFFICIAL_12_GHOST_IDS.forEach((id) => {
        const base = THAI_GHOSTS[id];
        const p = parsed && typeof parsed === 'object' ? parsed[id] : null;
        const perGhostImg = safeLocalStorage.getItem(`fss_ghost_img_${id}`);
        if (base) {
          cleaned[id] = {
            ...base,
            ...(p && typeof p === 'object' ? p : {}),
            name: p?.name || base.name,
            title: p?.title || base.title,
            tagline: p?.tagline || base.tagline,
            element: p?.element || base.element,
            customImageUrl: perGhostImg || p?.customImageUrl || base.customImageUrl || undefined,
            baseStats: {
              ...base.baseStats,
              ...(p?.baseStats || {}),
            },
          };
        }
      });
      return cleaned as Record<GhostSpeciesId, GhostSpecies>;
    } catch (err) {
      console.warn('LocalStorage ghost species load error:', err);
    }
    return THAI_GHOSTS;
  });

  // Connection status & Quota Circuit Breaker
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [quotaErrorMessage, setQuotaErrorMessage] = useState<string | null>(null);
  const quotaCooldownUntilRef = useRef<number>(0);

  // In-flight sync deduplication ref & Cloud Hydration timestamp
  const inFlightSyncPromiseRef = useRef<Promise<{ success: boolean; message: string; count: number }> | null>(null);
  const cloudHydratedAtRef = useRef<number>(0);
  const cardFetchTimestampRef = useRef<Map<string, number>>(new Map());

  // Pending Registration Info for UI display
  const [pendingRegistrationInfo, setPendingRegistrationInfo] = useState<{
    fullName: string;
    phone: string;
    regId: string;
  } | null>(() => {
    try {
      const raw = safeLocalStorage.getItem(STORAGE_KEYS.PENDING_REGISTRATION);
      if (raw) {
        const p = JSON.parse(raw) as PendingRegistrationPayload;
        if (p?.runner) {
          return {
            fullName: p.runner.fullName,
            phone: p.runner.phone,
            regId: p.runner.regId,
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Sync to localStorage
  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.RUNNERS, JSON.stringify(runners));
  }, [runners]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentCardId) {
      safeLocalStorage.setItem(STORAGE_KEYS.CURRENT_CARD_ID, currentCardId);
    } else {
      safeLocalStorage.removeItem(STORAGE_KEYS.CURRENT_CARD_ID);
    }
  }, [currentCardId]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.OFFICER_ROLE, activeOfficerRole);
  }, [activeOfficerRole]);

  useEffect(() => {
    if (adminUser) {
      safeLocalStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
    } else {
      safeLocalStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  }, [adminUser]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.LIVE_EDIT, String(isLiveEditMode));
  }, [isLiveEditMode]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(siteContent));
  }, [siteContent]);

  // Handle Quota backoff helper
  const handleQuotaBreaker = useCallback((error: unknown) => {
    if (isQuotaExhaustedError(error)) {
      quotaCooldownUntilRef.current = Date.now() + 5 * 60 * 1000; // 5 minute backoff
      setConnectionStatus('quota_exhausted');
      setQuotaErrorMessage(
        'โควตาการอ่านฐานข้อมูลรายวัน (Free daily read quota) เต็มแล้ว ระบบกำลังใช้โหมดสำรองในเครื่อง'
      );
      return true;
    }
    return false;
  }, []);

  // Controlled Cloud Sync with in-flight deduplication & quota protection
  const syncFromCloud = useCallback(
    async (options?: { forceAdminSync?: boolean }): Promise<{
      success: boolean;
      message: string;
      count: number;
    }> => {
      // In-flight deduplication: return existing promise if already running
      if (inFlightSyncPromiseRef.current) {
        return inFlightSyncPromiseRef.current;
      }

      if (Date.now() < quotaCooldownUntilRef.current) {
        return {
          success: false,
          message: 'โควตาการอ่านฐานข้อมูลรายวัน (Free daily read units) เต็มอยู่ในขณะนี้ กรุณารอโควตารีเซ็ต หรือใช้งานข้อมูลที่บันทึกไว้ในเครื่อง',
          count: 0,
        };
      }

      setIsSyncing(true);

      const performSync = async (): Promise<{ success: boolean; message: string; count: number }> => {
        let count = 0;
        try {
          const promises: Promise<any>[] = [
            getDocs(collection(db, 'site_content')),
            getDocs(collection(db, 'system_assets')),
            getDocs(collection(db, 'ghost_species')),
          ];

          // STRICT ADMIN CHECK: only fetch runners/orders/cards if adminUser is actually authenticated!
          const isAdminAuthenticated = Boolean(adminUser?.isLoggedIn);
          if (options?.forceAdminSync && isAdminAuthenticated) {
            promises.push(
              getDocs(collection(db, 'runners')),
              getDocs(collection(db, 'orders')),
              getDocs(collection(db, 'cards'))
            );
          }

          const results = await Promise.all(promises);
          const [contentSnap, assetsSnap, ghostsSnap, runnersSnap, ordersSnap, cardsSnap] = results;

          cloudHydratedAtRef.current = Date.now();

          // 1. Process Assets
          if (assetsSnap && !assetsSnap.empty) {
            assetsSnap.forEach((docSnap: any) => {
              const data = docSnap.data() as any;
              if (docSnap.id === 'shirt') {
                if (data.imageUrl) {
                  setCustomShirtImageState(data.imageUrl);
                  idbSet('system_asset_shirt', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomShirtImageState(null);
                  idbRemove('system_asset_shirt');
                }
                count++;
              } else if (docSnap.id === 'medal') {
                if (data.imageUrl) {
                  setCustomMedalImageState(data.imageUrl);
                  idbSet('system_asset_medal', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomMedalImageState(null);
                  idbRemove('system_asset_medal');
                }
                count++;
              } else if (docSnap.id === 'map') {
                if (data.imageUrl) {
                  setCustomMapImageState(data.imageUrl);
                  idbSet('system_asset_map', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomMapImageState(null);
                  idbRemove('system_asset_map');
                }
                count++;
              }
            });
          }

          // 2. Process Site Content (CMS + legacy asset sections)
          if (contentSnap && !contentSnap.empty) {
            const remoteContent: Record<string, SiteContentSection> = {};
            contentSnap.forEach((docSnap: any) => {
              const data = docSnap.data() as any;
              if (docSnap.id === 'asset_shirt' || data.sectionKey === 'asset_shirt') {
                if (data.imageUrl) {
                  setCustomShirtImageState(data.imageUrl);
                  idbSet('system_asset_shirt', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomShirtImageState(null);
                  idbRemove('system_asset_shirt');
                }
              } else if (docSnap.id === 'asset_medal' || data.sectionKey === 'asset_medal') {
                if (data.imageUrl) {
                  setCustomMedalImageState(data.imageUrl);
                  idbSet('system_asset_medal', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomMedalImageState(null);
                  idbRemove('system_asset_medal');
                }
              } else if (docSnap.id === 'asset_map' || data.sectionKey === 'asset_map') {
                if (data.imageUrl) {
                  setCustomMapImageState(data.imageUrl);
                  idbSet('system_asset_map', data.imageUrl);
                } else if (data.imageUrl === null) {
                  setCustomMapImageState(null);
                  idbRemove('system_asset_map');
                }
              } else {
                remoteContent[docSnap.id] = data as SiteContentSection;
              }
              count++;
            });
            setSiteContent((prev) => ({ ...DEFAULT_SITE_CONTENT, ...prev, ...remoteContent }));
          }

          // 3. Process Ghost Species
          if (ghostsSnap && !ghostsSnap.empty) {
            const remoteGhosts: Record<string, Partial<GhostSpecies>> = {};
            ghostsSnap.forEach((docSnap: any) => {
              const sid = docSnap.id as GhostSpeciesId;
              if (OFFICIAL_12_GHOST_IDS.includes(sid)) {
                const data = docSnap.data() as GhostSpecies;
                remoteGhosts[sid] = data;
                if (data.customImageUrl) {
                  idbSet(`ghost_img_${sid}`, data.customImageUrl);
                } else if (data.customImageUrl === null) {
                  idbRemove(`ghost_img_${sid}`);
                }
                count++;
              }
            });

            setGhostSpeciesMap((prev) => {
              const cleaned: Record<string, GhostSpecies> = {};
              OFFICIAL_12_GHOST_IDS.forEach((id) => {
                const base = THAI_GHOSTS[id];
                const custom = remoteGhosts[id] || prev[id];
                if (base) {
                  cleaned[id] = {
                    ...base,
                    ...(custom && typeof custom === 'object' ? custom : {}),
                    name: custom?.name || base.name,
                    title: custom?.title || base.title,
                    tagline: custom?.tagline || base.tagline,
                    element: custom?.element || base.element,
                    customImageUrl:
                      custom?.customImageUrl !== undefined
                        ? (custom.customImageUrl || undefined)
                        : (prev[id]?.customImageUrl || base.customImageUrl || undefined),
                    baseStats: {
                      ...base.baseStats,
                      ...(custom?.baseStats || {}),
                    },
                  };
                }
              });
              return cleaned as Record<GhostSpeciesId, GhostSpecies>;
            });
          }

          // 4. Process Runners / Orders / Cards with AUTHORITATIVE REPLACEMENT (no stale row pollution)
          if (runnersSnap) {
            const remoteRunners: RunnerRegistration[] = [];
            runnersSnap.forEach((docSnap: any) => {
              remoteRunners.push(docSnap.data() as RunnerRegistration);
              count++;
            });
            setRunners(remoteRunners);
          }

          if (ordersSnap) {
            const remoteOrders: ShirtOrder[] = [];
            ordersSnap.forEach((docSnap: any) => {
              remoteOrders.push(docSnap.data() as ShirtOrder);
              count++;
            });
            setOrders(remoteOrders);
          }

          if (cardsSnap) {
            const remoteCards: GhostCard[] = [];
            cardsSnap.forEach((docSnap: any) => {
              remoteCards.push(docSnap.data() as GhostCard);
              count++;
            });
            setCards(remoteCards);
          }

          setConnectionStatus('connected');
          setLastSyncedAt(new Date());
          return { success: true, message: `ซิงค์ข้อมูล Cloud สำเร็จเรียบร้อย (${count} รายการ)`, count };
        } catch (err: any) {
          if (handleQuotaBreaker(err)) {
            return {
              success: false,
              message: 'โควตาการอ่าน Cloud รายวันเต็มอยู่ในขณะนี้ กรุณารอโควตารีเซ็ต หรือใช้งานข้อมูลที่บันทึกไว้ในเครื่อง',
              count: 0,
            };
          }
          setConnectionStatus('error');
          return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Cloud: ' + (err?.message || 'การเชื่อมต่อขัดข้อง'),
            count: 0,
          };
        } finally {
          setIsSyncing(false);
          inFlightSyncPromiseRef.current = null;
        }
      };

      const syncPromise = performSync();
      inFlightSyncPromiseRef.current = syncPromise;
      return syncPromise;
    },
    [adminUser, handleQuotaBreaker]
  );

  // Load IDB assets on mount without overwriting fresher Cloud sync
  useEffect(() => {
    const loadAllIDBAssets = async () => {
      try {
        const [shirtImg, medalImg, mapImg] = await Promise.all([
          idbGet<string>('system_asset_shirt'),
          idbGet<string>('system_asset_medal'),
          idbGet<string>('system_asset_map'),
        ]);

        if (cloudHydratedAtRef.current === 0) {
          if (shirtImg) setCustomShirtImageState(shirtImg);
          if (medalImg) setCustomMedalImageState(medalImg);
          if (mapImg) setCustomMapImageState(mapImg);

          for (const id of OFFICIAL_12_GHOST_IDS) {
            const ghostImg = await idbGet<string>(`ghost_img_${id}`);
            if (ghostImg && cloudHydratedAtRef.current === 0) {
              setGhostSpeciesMap((prev) => {
                if (prev[id]?.customImageUrl === ghostImg) return prev;
                return {
                  ...prev,
                  [id]: {
                    ...prev[id],
                    customImageUrl: ghostImg,
                  },
                };
              });
            }
          }
        }
      } catch (err) {
        console.warn('IDB asset load notice:', err);
      }
    };
    loadAllIDBAssets();
  }, []);

  // Mount Public Hydration
  useEffect(() => {
    syncFromCloud();
  }, [syncFromCloud]);

  // Load single card on-demand and refresh from Cloud
  const loadCardById = useCallback(async (cardId: string): Promise<GhostCard | null> => {
    if (!cardId) return null;
    const existing = cards.find((c) => c.cardId === cardId);
    const lastFetched = cardFetchTimestampRef.current.get(cardId) || 0;

    if (existing && Date.now() - lastFetched < 45000) {
      return existing;
    }

    if (Date.now() < quotaCooldownUntilRef.current) {
      return existing || null;
    }

    try {
      cardFetchTimestampRef.current.set(cardId, Date.now());
      const snap = await getDoc(doc(db, 'cards', cardId));
      if (snap.exists()) {
        const remoteCard = snap.data() as GhostCard;
        setCards((prev) => {
          const map = new Map<string, GhostCard>();
          (prev || []).forEach((c) => map.set(c.cardId, c));
          map.set(remoteCard.cardId, remoteCard);
          return Array.from(map.values());
        });
        setConnectionStatus('connected');
        return remoteCard;
      }
      return existing || null;
    } catch (err) {
      handleQuotaBreaker(err);
      return existing || null;
    }
  }, [cards, handleQuotaBreaker]);

  // Automatically load currentCardId when set
  useEffect(() => {
    if (currentCardId) {
      loadCardById(currentCardId);
    }
  }, [currentCardId, loadCardById]);

  // Cloud-backed Paginated Directory Loader (reads orderBy documentId with limit & startAfter cursor)
  const loadDirectoryPage = useCallback(
    async (options?: LoadDirectoryPageOptions): Promise<DirectoryPageResult> => {
      const pageSize = options?.pageSize || 20;
      if (Date.now() < quotaCooldownUntilRef.current) {
        const err = new Error('โควตาการอ่าน Cloud รายวันเต็มอยู่ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
        (err as any).code = 'resource-exhausted';
        throw err;
      }

      try {
        const runnersRef = collection(db, 'runners');
        const queryConstraints: any[] = [orderBy(documentId()), limit(pageSize + 1)];
        if (options?.lastDoc) {
          queryConstraints.push(startAfter(options.lastDoc));
        }

        const runnerSnap = await getDocs(query(runnersRef, ...queryConstraints));
        const fetchedRunners: RunnerRegistration[] = [];
        const rawDocs: any[] = [];

        runnerSnap.forEach((d) => {
          fetchedRunners.push(d.data() as RunnerRegistration);
          rawDocs.push(d);
        });

        const hasMore = fetchedRunners.length > pageSize;
        const pageRunners = hasMore ? fetchedRunners.slice(0, pageSize) : fetchedRunners;
        const newLastDoc = rawDocs[pageRunners.length - 1] || null;

        // Hydrate associated cards and orders for this page
        const fetchedCardsMap = new Map<string, GhostCard>();
        const fetchedOrdersMap = new Map<string, ShirtOrder>();

        const cardIdsToFetch = Array.from(
          new Set(pageRunners.map((r) => r.cardId).filter(Boolean))
        );
        const orderIdsToFetch = Array.from(
          new Set(pageRunners.map((r) => r.shirtOrderId).filter(Boolean))
        );

        for (const cid of cardIdsToFetch) {
          try {
            const cSnap = await getDoc(doc(db, 'cards', cid));
            if (cSnap.exists()) {
              fetchedCardsMap.set(cid, cSnap.data() as GhostCard);
            }
          } catch (err) {
            handleQuotaBreaker(err);
            throw err;
          }
        }

        for (const oid of orderIdsToFetch) {
          if (oid) {
            try {
              const oSnap = await getDoc(doc(db, 'orders', oid));
              if (oSnap.exists()) {
                fetchedOrdersMap.set(oid, oSnap.data() as ShirtOrder);
              }
            } catch (err) {
              handleQuotaBreaker(err);
              throw err;
            }
          }
        }

        setConnectionStatus('connected');

        return {
          runners: pageRunners,
          cards: Array.from(fetchedCardsMap.values()),
          orders: Array.from(fetchedOrdersMap.values()),
          hasMore,
          lastDoc: newLastDoc,
        };
      } catch (err: any) {
        handleQuotaBreaker(err);
        throw err;
      }
    },
    [handleQuotaBreaker]
  );

  // Targeted remote search for Directory & Home (returns separate result payload without polluting global state)
  const searchRunnersRemote = useCallback(
    async (queryStr: string): Promise<SearchResultPayload> => {
      const rawStr = queryStr.trim();
      const upperStr = rawStr.toUpperCase();
      if (!rawStr) return { runners: [], cards: [], orders: [] };

      if (Date.now() < quotaCooldownUntilRef.current) {
        const err = new Error('โควตาการค้นหา Cloud รายวันเต็มอยู่ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
        (err as any).code = 'resource-exhausted';
        throw err;
      }

      const fetchedRunnersMap = new Map<string, RunnerRegistration>();
      const fetchedCardsMap = new Map<string, GhostCard>();
      const fetchedOrdersMap = new Map<string, ShirtOrder>();

      try {
        const runnersRef = collection(db, 'runners');
        const ordersRef = collection(db, 'orders');

        // Exact match queries across runner name fields, IDs, and phone
        const runnerQueries: any[] = [
          query(runnersRef, where('regId', '==', upperStr), limit(10)),
          query(runnersRef, where('cardId', '==', upperStr), limit(10)),
          query(runnersRef, where('bibNumber', '==', upperStr), limit(10)),
          query(runnersRef, where('fullName', '==', rawStr), limit(10)),
          query(runnersRef, where('nameThai', '==', rawStr), limit(10)),
          query(runnersRef, where('nameEng', '==', rawStr), limit(10)),
          query(runnersRef, where('nickname', '==', rawStr), limit(10)),
        ];

        const cleanPhone = rawStr.replace(/\D/g, '');
        if (cleanPhone.length >= 8) {
          runnerQueries.push(query(runnersRef, where('phone', '==', cleanPhone), limit(10)));
        }

        // Direct orders query (supporting ORD-... exact or phone/name)
        const orderQueries: any[] = [
          query(ordersRef, where('orderId', '==', upperStr), limit(10)),
          query(ordersRef, where('customerName', '==', rawStr), limit(10)),
        ];
        if (cleanPhone.length >= 8) {
          orderQueries.push(query(ordersRef, where('phone', '==', cleanPhone), limit(10)));
        }

        const runnerSnaps = await Promise.all(runnerQueries.map((q) => getDocs(q)));
        const orderSnaps = await Promise.all(orderQueries.map((q) => getDocs(q)));

        runnerSnaps.forEach((snap) => {
          if (snap && !snap.empty) {
            snap.forEach((docSnap) => {
              const data = docSnap.data() as RunnerRegistration;
              if (data && data.regId) {
                fetchedRunnersMap.set(data.regId, data);
              }
            });
          }
        });

        orderSnaps.forEach((snap) => {
          if (snap && !snap.empty) {
            snap.forEach((docSnap) => {
              const data = docSnap.data() as ShirtOrder;
              if (data && data.orderId) {
                fetchedOrdersMap.set(data.orderId, data);
              }
            });
          }
        });

        const fetchedRunners = Array.from(fetchedRunnersMap.values());

        // Hydrate associated cards and orders for runners
        const cardIdsToFetch = Array.from(
          new Set(fetchedRunners.map((r) => r.cardId).filter(Boolean))
        );
        const orderIdsToFetch = Array.from(
          new Set(fetchedRunners.map((r) => r.shirtOrderId).filter(Boolean))
        );

        for (const cid of cardIdsToFetch) {
          try {
            const cSnap = await getDoc(doc(db, 'cards', cid));
            if (cSnap.exists()) {
              fetchedCardsMap.set(cid, cSnap.data() as GhostCard);
            }
          } catch (err) {
            handleQuotaBreaker(err);
            throw err;
          }
        }

        for (const oid of orderIdsToFetch) {
          if (oid && !fetchedOrdersMap.has(oid)) {
            try {
              const oSnap = await getDoc(doc(db, 'orders', oid));
              if (oSnap.exists()) {
                fetchedOrdersMap.set(oid, oSnap.data() as ShirtOrder);
              }
            } catch (err) {
              handleQuotaBreaker(err);
              throw err;
            }
          }
        }

        setConnectionStatus('connected');

        return {
          runners: fetchedRunners,
          cards: Array.from(fetchedCardsMap.values()),
          orders: Array.from(fetchedOrdersMap.values()),
        };
      } catch (err: any) {
        handleQuotaBreaker(err);
        throw err;
      }
    },
    [handleQuotaBreaker]
  );

  // Admin Dashboard on-demand subscription: AUTHORITATIVE REPLACEMENT (no stale row pollution)
  const subscribeAdminData = useCallback(() => {
    if (Date.now() < quotaCooldownUntilRef.current) {
      console.warn('Admin subscription paused due to quota cooldown.');
      return () => {};
    }

    let unsubRunners = () => {};
    let unsubOrders = () => {};
    let unsubCards = () => {};

    try {
      unsubRunners = onSnapshot(
        collection(db, 'runners'),
        (snap) => {
          const remoteRunners: RunnerRegistration[] = [];
          snap.forEach((docSnap) => {
            remoteRunners.push(docSnap.data() as RunnerRegistration);
          });
          setRunners(remoteRunners); // Authoritative replacement
          setConnectionStatus('connected');
        },
        (err) => {
          handleQuotaBreaker(err);
          console.warn('Admin runners listener notice:', err);
        }
      );

      unsubOrders = onSnapshot(
        collection(db, 'orders'),
        (snap) => {
          const remoteOrders: ShirtOrder[] = [];
          snap.forEach((docSnap) => {
            remoteOrders.push(docSnap.data() as ShirtOrder);
          });
          setOrders(remoteOrders); // Authoritative replacement
          setConnectionStatus('connected');
        },
        (err) => {
          handleQuotaBreaker(err);
          console.warn('Admin orders listener notice:', err);
        }
      );

      unsubCards = onSnapshot(
        collection(db, 'cards'),
        (snap) => {
          const remoteCards: GhostCard[] = [];
          snap.forEach((docSnap) => {
            remoteCards.push(docSnap.data() as GhostCard);
          });
          setCards(remoteCards); // Authoritative replacement
          setConnectionStatus('connected');
        },
        (err) => {
          handleQuotaBreaker(err);
          console.warn('Admin cards listener notice:', err);
        }
      );
    } catch (err) {
      handleQuotaBreaker(err);
    }

    return () => {
      unsubRunners();
      unsubOrders();
      unsubCards();
    };
  }, [handleQuotaBreaker]);

  // Export Local Backup without triggering Cloud requests
  const exportLocalBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      runners,
      cards,
      orders,
      siteContent,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `FSS2026_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, filename };
  };

  const loginAdmin = (usernameInput: string, passwordInput: string): boolean => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();
    if (trimmedUser === 'phasharak' && trimmedPass === '07011985') {
      const user: AdminUser = {
        username: 'phasharak',
        role: 'SUPER_ADMIN',
        isLoggedIn: true,
        loginTimestamp: new Date().toISOString(),
      };
      setAdminUser(user);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    safeLocalStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  };

  const updateSiteContent = async (section: SiteContentSection) => {
    try {
      const docRef = doc(db, 'site_content', section.sectionKey);
      await setDoc(docRef, cleanForFirestore(section), { merge: true });
      setConnectionStatus('connected');
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('ไม่สามารถบันทึกข้อมูลเนื้อหาไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
    }

    setSiteContent((prev) => ({
      ...prev,
      [section.sectionKey]: section,
    }));
  };

  const resetSiteContentSection = async (sectionKey: string) => {
    const defaultSec = DEFAULT_SITE_CONTENT[sectionKey];
    if (defaultSec) {
      await updateSiteContent(defaultSec);
    }
  };

  const validateImageUrl = (url: string | null): void => {
    if (!url) return;
    if (url.startsWith('blob:')) {
      throw new Error('ไม่อนุญาตให้ใช้ blob: URL ชั่วคราว กรุณาใช้ไฟล์รูปภาพจริงหรือ HTTPS URL ถาวร');
    }
    if (url.startsWith('data:') && url.length > 850000) {
      throw new Error('ขนาดรูปภาพใหญ่เกินกว่าข้อกำหนดของฐานข้อมูล (เกิน 800KB)');
    }
  };

  const setCustomShirtImage = async (imgUrl: string | null) => {
    validateImageUrl(imgUrl);

    const payload = {
      sectionKey: 'asset_shirt',
      category: 'system_asset',
      imageUrl: imgUrl || null,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.username || 'admin',
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'site_content', 'asset_shirt'), cleanForFirestore(payload), { merge: true });
      batch.set(doc(db, 'system_assets', 'shirt'), cleanForFirestore(payload), { merge: true });
      await batch.commit();
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('บันทึกรูปภาพเสื้อไปยัง Cloud ล้มเหลว: ' + ((err as Error)?.message || ''));
    }

    setCustomShirtImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_shirt', imgUrl);
      safeLocalStorage.setItem(STORAGE_KEYS.SHIRT_IMAGE, imgUrl);
    } else {
      await idbRemove('system_asset_shirt');
      safeLocalStorage.removeItem(STORAGE_KEYS.SHIRT_IMAGE);
    }
    setConnectionStatus('connected');
  };

  const setCustomMedalImage = async (imgUrl: string | null) => {
    validateImageUrl(imgUrl);

    const payload = {
      sectionKey: 'asset_medal',
      category: 'system_asset',
      imageUrl: imgUrl || null,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.username || 'admin',
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'site_content', 'asset_medal'), cleanForFirestore(payload), { merge: true });
      batch.set(doc(db, 'system_assets', 'medal'), cleanForFirestore(payload), { merge: true });
      await batch.commit();
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('บันทึกรูปภาพเหรียญรางวัลไปยัง Cloud ล้มเหลว: ' + ((err as Error)?.message || ''));
    }

    setCustomMedalImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_medal', imgUrl);
      safeLocalStorage.setItem(STORAGE_KEYS.MEDAL_IMAGE, imgUrl);
    } else {
      await idbRemove('system_asset_medal');
      safeLocalStorage.removeItem(STORAGE_KEYS.MEDAL_IMAGE);
    }
    setConnectionStatus('connected');
  };

  const setCustomMapImage = async (imgUrl: string | null) => {
    validateImageUrl(imgUrl);

    const payload = {
      sectionKey: 'asset_map',
      category: 'system_asset',
      imageUrl: imgUrl || null,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.username || 'admin',
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'site_content', 'asset_map'), cleanForFirestore(payload), { merge: true });
      batch.set(doc(db, 'system_assets', 'map'), cleanForFirestore(payload), { merge: true });
      await batch.commit();
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('บันทึกรูปภาพแผนที่เส้นทางไปยัง Cloud ล้มเหลว: ' + ((err as Error)?.message || ''));
    }

    setCustomMapImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_map', imgUrl);
      safeLocalStorage.setItem(STORAGE_KEYS.MAP_IMAGE, imgUrl);
    } else {
      await idbRemove('system_asset_map');
      safeLocalStorage.removeItem(STORAGE_KEYS.MAP_IMAGE);
    }
    setConnectionStatus('connected');
  };

  const updateCardCustomImage = async (cardId: string, imageUrl: string | null) => {
    validateImageUrl(imageUrl);

    try {
      await setDoc(doc(db, 'cards', cardId), cleanForFirestore({ customImageUrl: imageUrl || null }), { merge: true });
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('บันทึกรูปภาพการ์ดไปยัง Cloud ล้มเหลว: ' + ((err as Error)?.message || ''));
    }

    setCards((prev) =>
      prev.map((c) =>
        c.cardId === cardId ? { ...c, customImageUrl: imageUrl || undefined } : c
      )
    );
    setConnectionStatus('connected');
  };

  const ghostSpeciesList: GhostSpecies[] = OFFICIAL_12_GHOST_IDS.map((id) => {
    const base = THAI_GHOSTS[id];
    const custom = ghostSpeciesMap?.[id];
    if (!base) return null as any;
    return {
      ...base,
      ...(custom || {}),
      name: custom?.name || base.name,
      title: custom?.title || base.title,
      tagline: custom?.tagline || base.tagline,
      element: custom?.element || base.element,
      description: custom?.description || base.description,
      lore: custom?.lore || base.lore,
      customImageUrl: custom?.customImageUrl || base.customImageUrl || undefined,
      baseStats: {
        ...base.baseStats,
        ...(custom?.baseStats || {}),
      },
    };
  }).filter(Boolean);

  const updateGhostSpecies = async (species: GhostSpecies) => {
    validateImageUrl(species.customImageUrl || null);

    try {
      const docRef = doc(db, 'ghost_species', species.id);
      await setDoc(docRef, cleanForFirestore(species), { merge: true });
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('บันทึกข้อมูลผีไปยัง Cloud ล้มเหลว: ' + ((err as Error)?.message || ''));
    }

    setGhostSpeciesMap((prev) => ({
      ...prev,
      [species.id]: species,
    }));

    if (species.customImageUrl) {
      await idbSet(`ghost_img_${species.id}`, species.customImageUrl);
      safeLocalStorage.setItem(`fss_ghost_img_${species.id}`, species.customImageUrl);
    } else {
      await idbRemove(`ghost_img_${species.id}`);
      safeLocalStorage.removeItem(`fss_ghost_img_${species.id}`);
    }

    setConnectionStatus('connected');
  };

  const resetGhostSpecies = async (speciesId: GhostSpeciesId) => {
    const base = THAI_GHOSTS[speciesId];
    if (base) {
      await updateGhostSpecies(base);
    }
  };

  const registerParticipant = async (
    params: RegisterParams,
    options?: RegisterOptions
  ): Promise<{ runner: RunnerRegistration; card: GhostCard; order?: ShirtOrder }> => {
    const fingerprint = createRegistrationFingerprint(params);
    const rawPending = safeLocalStorage.getItem(STORAGE_KEYS.PENDING_REGISTRATION);
    let pendingData: PendingRegistrationPayload | null = null;
    if (rawPending) {
      try {
        const parsed = JSON.parse(rawPending) as PendingRegistrationPayload;
        if (parsed && parsed.fingerprint === fingerprint) {
          pendingData = parsed;
        }
      } catch {
        // ignore
      }
    }

    let newCard: GhostCard;
    let newRunner: RunnerRegistration;
    let createdOrder: ShirtOrder | undefined;

    if (pendingData) {
      newCard = pendingData.card;
      newRunner = pendingData.runner;
      createdOrder = pendingData.order;
    } else {
      const ALL_SPECIES: GhostSpeciesId[] = OFFICIAL_12_GHOST_IDS;
      const randomIndex = Math.floor(Math.random() * ALL_SPECIES.length);
      const chosenSpeciesId: GhostSpeciesId = ALL_SPECIES[randomIndex];

      const accumulatedStatBoost: GhostCardStats = {
        speed: Math.floor(Math.random() * 5) + 1,
        spookiness: Math.floor(Math.random() * 5) + 1,
        latentPower: Math.floor(Math.random() * 5) + 1,
        stealth: Math.floor(Math.random() * 5) + 1,
        hauntingAura: Math.floor(Math.random() * 5) + 1,
      };

      const roll = Math.random() * 100;
      let rarity: Rarity = 'Common';
      if (roll < 3) rarity = 'Legendary';
      else if (roll < 15) rarity = 'Epic';
      else if (roll < 45) rarity = 'Rare';
      else rarity = 'Common';

      const cardId = options?.existingCardId || generateCardId();
      const regId = options?.existingRegId || generateRegId();
      const bibNumber =
        params.regType !== 'SHIRT_ONLY'
          ? options?.existingBibNumber || generateBibNumber()
          : undefined;

      const baseSpecies = THAI_GHOSTS[chosenSpeciesId] || THAI_GHOSTS.pret;
      const baseStats = baseSpecies.baseStats || { speed: 85, spookiness: 85, latentPower: 85, stealth: 85, hauntingAura: 85 };
      const rarityBonus = rarity === 'Legendary' ? 8 : rarity === 'Epic' ? 5 : rarity === 'Rare' ? 3 : 0;

      const initialStats: GhostCardStats = {
        spookiness: Math.min(100, (baseStats.spookiness ?? 85) + (accumulatedStatBoost.spookiness % 8) + rarityBonus),
        speed: Math.min(100, (baseStats.speed ?? 85) + (accumulatedStatBoost.speed % 8) + rarityBonus),
        latentPower: Math.min(100, (baseStats.latentPower ?? 85) + (accumulatedStatBoost.latentPower % 8) + rarityBonus),
        stealth: Math.min(100, (baseStats.stealth ?? 85) + (accumulatedStatBoost.stealth % 8) + rarityBonus),
        hauntingAura: Math.min(100, (baseStats.hauntingAura ?? 85) + (accumulatedStatBoost.hauntingAura % 8) + rarityBonus),
      };

      const nowTimestamp = new Date().toISOString();

      newCard = {
        cardId,
        speciesId: chosenSpeciesId,
        nickname: params.nickname || params.fullName,
        fullName: params.fullName,
        rarity,
        level: 1,
        stats: initialStats,
        badges: [],
        qrPayload: `${cardId}-RUNNER-${params.nickname.slice(0, 3).toUpperCase()}-${rarity.toUpperCase()}`,
        createdAt: nowTimestamp,
        customQuote: baseSpecies.tagline,
        customImageUrl: ghostSpeciesMap[chosenSpeciesId]?.customImageUrl || undefined,
      };

      let shirtOrderId: string | undefined;
      if (params.regType === 'RUN_AND_SHIRT' || params.regType === 'SHIRT_ONLY') {
        shirtOrderId = options?.existingOrderId || generateOrderId();
        const qty = params.shirtQuantity || 1;
        const normalizedSizes =
          params.shirtSizes && params.shirtSizes.length > 0
            ? params.shirtSizes
            : [params.shirtSize || 'L'];
        createdOrder = {
          orderId: shirtOrderId,
          cardId,
          customerName: params.fullName,
          phone: params.phone,
          email: params.email,
          size: normalizedSizes[0] || 'L',
          sizes: normalizedSizes,
          quantity: qty,
          unitPrice: 300,
          totalAmount: 300 * qty,
          deliveryMethod: 'pickup_event',
          shippingAddress: undefined,
          status: params.slipImage ? 'pending_verification' : 'unpaid',
          slipImage: params.slipImage,
          paymentTimestamp: params.slipImage ? nowTimestamp : undefined,
        };
      }

      newRunner = {
        regId,
        bibNumber,
        regType: params.regType,
        nameThai: params.nameThai || params.fullName,
        nameEng: params.nameEng || '',
        fullName: params.nameThai || params.fullName,
        nickname: params.nickname,
        age: params.age,
        gender: params.gender,
        birthDate: params.birthDate,
        birthDay: params.birthDay,
        birthMonth: params.birthMonth,
        birthYear: params.birthYear,
        participantCategory: params.participantCategory || 'general',
        studentYear: params.studentYear,
        studentId: params.studentId,
        facultyGroup: params.facultyGroup,
        faculty: params.faculty,
        staffDepartmentGroup: params.staffDepartmentGroup,
        staffDepartment: params.staffDepartment,
        phone: params.phone,
        email: params.email,
        province: params.province,
        organization: params.organization || params.faculty || params.staffDepartment,
        emergencyContactName: params.emergencyContactName,
        emergencyContactPhone: params.emergencyContactPhone,
        emergencyContactRelation: params.emergencyContactRelation,
        infoSource: params.infoSource,
        interestedInShirt: params.interestedInShirt,
        hasAttendedBefore: params.hasAttendedBefore || 'no',
        costumeStyle: params.costumeStyle || 'sportswear',
        costumeStyleNote: params.costumeStyleNote,
        medicalConditions: params.medicalConditions,
        teamName: params.teamName,
        displayNameType: params.displayNameType,
        isMinor: params.isMinor,
        guardianName: params.guardianName,
        guardianPhone: params.guardianPhone,
        agreedTerms: params.agreedTerms,
        agreedPhotoRelease: params.agreedPhotoRelease,
        agreedDataPolicy: params.agreedDataPolicy,
        cardId,
        shirtOrderId,
        registeredAt: nowTimestamp,
        checkedIn: false,
        medalClaimed: false,
        shirtClaimed: false,
      };

      safeLocalStorage.setItem(
        STORAGE_KEYS.PENDING_REGISTRATION,
        JSON.stringify({
          fingerprint,
          runner: newRunner,
          card: newCard,
          order: createdOrder,
          savedAt: nowTimestamp,
        })
      );
      setPendingRegistrationInfo({
        fullName: newRunner.fullName,
        phone: newRunner.phone,
        regId: newRunner.regId,
      });
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'runners', newRunner.regId), cleanForFirestore(newRunner), { merge: true });
      batch.set(doc(db, 'cards', newCard.cardId), cleanForFirestore(newCard), { merge: true });
      if (createdOrder) {
        batch.set(doc(db, 'orders', createdOrder.orderId), cleanForFirestore(createdOrder), { merge: true });
      }

      await batch.commit();
      setConnectionStatus('connected');
    } catch (err) {
      handleQuotaBreaker(err);
      console.error('Registration atomic commit failed:', err);
      if (isQuotaExhaustedError(err)) {
        throw new Error('โควตาการบันทึกฐานข้อมูลรายวันเต็มอยู่ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง');
      }
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อบันทึกข้อมูล กรุณาตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
    }

    safeLocalStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);
    setPendingRegistrationInfo(null);

    setCards((prev) => {
      const map = new Map<string, GhostCard>();
      (prev || []).forEach((c) => map.set(c.cardId, c));
      map.set(newCard.cardId, newCard);
      return Array.from(map.values());
    });

    setRunners((prev) => {
      const map = new Map<string, RunnerRegistration>();
      (prev || []).forEach((r) => map.set(r.regId, r));
      map.set(newRunner.regId, newRunner);
      return Array.from(map.values());
    });

    if (createdOrder) {
      setOrders((prev) => {
        const map = new Map<string, ShirtOrder>();
        (prev || []).forEach((o) => map.set(o.orderId, o));
        map.set(createdOrder!.orderId, createdOrder!);
        return Array.from(map.values());
      });
    }

    setCurrentCardId(newCard.cardId);
    setJustRevealedCard(newCard);

    return { runner: newRunner, card: newCard, order: createdOrder };
  };

  const orderShirt = async (
    params: OrderShirtParams,
    options?: OrderShirtOptions
  ): Promise<ShirtOrder> => {
    const fingerprint = createOrderFingerprint(params);
    const rawPending = safeLocalStorage.getItem(STORAGE_KEYS.PENDING_ORDER);
    let pendingOrderData: PendingOrderPayload | null = null;
    if (rawPending) {
      try {
        const parsed = JSON.parse(rawPending) as PendingOrderPayload;
        if (parsed && parsed.fingerprint === fingerprint) {
          pendingOrderData = parsed;
        }
      } catch {
        // ignore
      }
    }

    let newOrder: ShirtOrder;
    if (pendingOrderData) {
      newOrder = pendingOrderData.order;
    } else {
      const orderId = options?.existingOrderId || generateOrderId();
      const qty = Math.max(1, params.quantity || 1);
      const normalizedSizes =
        params.sizes && params.sizes.length > 0
          ? params.sizes.slice(0, qty)
          : Array(qty).fill(params.size || 'L');
      const primarySize = normalizedSizes[0] || 'L';
      const nowTimestamp = new Date().toISOString();

      newOrder = {
        orderId,
        cardId: params.cardId,
        customerName: params.customerName,
        phone: params.phone,
        email: params.email,
        size: primarySize,
        sizes: normalizedSizes,
        quantity: qty,
        unitPrice: 300,
        totalAmount: 300 * qty,
        deliveryMethod: 'pickup_event',
        shippingAddress: undefined,
        status: params.slipImage ? 'pending_verification' : 'unpaid',
        slipImage: params.slipImage,
        paymentTimestamp: params.slipImage ? nowTimestamp : undefined,
      };

      safeLocalStorage.setItem(
        STORAGE_KEYS.PENDING_ORDER,
        JSON.stringify({
          fingerprint,
          order: newOrder,
          savedAt: nowTimestamp,
        })
      );
    }

    const targetRunner = runners.find((r) => r.cardId === params.cardId);

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'orders', newOrder.orderId), cleanForFirestore(newOrder), { merge: true });
      if (targetRunner) {
        batch.set(
          doc(db, 'runners', targetRunner.regId),
          cleanForFirestore({ ...targetRunner, shirtOrderId: newOrder.orderId }),
          { merge: true }
        );
      }
      await batch.commit();
      setConnectionStatus('connected');
    } catch (err) {
      handleQuotaBreaker(err);
      console.error('Order shirt commit failed:', err);
      if (isQuotaExhaustedError(err)) {
        throw new Error('โควตาการบันทึกฐานข้อมูลเต็มชั่วคราว กรุณาลองใหม่อีกครั้ง');
      }
      throw new Error('ไม่สามารถบันทึกคำสั่งซื้อไปยัง Cloud ได้ กรุณาลองใหม่อีกครั้ง');
    }

    safeLocalStorage.removeItem(STORAGE_KEYS.PENDING_ORDER);

    setOrders((prev) => {
      const map = new Map<string, ShirtOrder>();
      (prev || []).forEach((o) => map.set(o.orderId, o));
      map.set(newOrder.orderId, newOrder);
      return Array.from(map.values());
    });

    if (targetRunner) {
      setRunners((prev) =>
        prev.map((r) => (r.cardId === params.cardId ? { ...r, shirtOrderId: newOrder.orderId } : r))
      );
    }

    return newOrder;
  };

  const approveShirtPayment = async (orderId: string, officerName: string = 'เจ้าหน้าที่การเงิน') => {
    let targetCardId = '';
    let updatedTargetOrder: ShirtOrder | undefined;
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        updatedTargetOrder = {
          ...o,
          status: 'paid' as const,
          verifiedAt: new Date().toISOString(),
          verifiedBy: officerName,
        };
        return updatedTargetOrder;
      }
      return o;
    });

    if (updatedTargetOrder) {
      try {
        await setDoc(doc(db, 'orders', orderId), cleanForFirestore(updatedTargetOrder), { merge: true });
      } catch (err) {
        handleQuotaBreaker(err);
        throw new Error('ไม่สามารถอัปเดตสถานะไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
      }
    }

    setOrders(updatedOrders);
    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, runners) : c
        )
      );
    }
  };

  const rejectShirtPayment = async (orderId: string, reason?: string) => {
    let targetCardId = '';
    let updatedTargetOrder: ShirtOrder | undefined;
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        updatedTargetOrder = {
          ...o,
          status: 'rejected' as const,
          notes: reason || 'สลิปไม่ถูกต้องหรือไม่พบยอดโอน',
        };
        return updatedTargetOrder;
      }
      return o;
    });

    if (updatedTargetOrder) {
      try {
        await setDoc(doc(db, 'orders', orderId), cleanForFirestore(updatedTargetOrder), { merge: true });
      } catch (err) {
        handleQuotaBreaker(err);
        throw new Error('ไม่สามารถอัปเดตสถานะไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
      }
    }

    setOrders(updatedOrders);
    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, runners) : c
        )
      );
    }
  };

  const markShirtClaimed = async (orderId: string) => {
    let targetCardId = '';
    let updatedTargetOrder: ShirtOrder | undefined;
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        updatedTargetOrder = {
          ...o,
          status: 'claimed' as const,
          claimedAt: new Date().toISOString(),
        };
        return updatedTargetOrder;
      }
      return o;
    });

    if (updatedTargetOrder) {
      try {
        await setDoc(doc(db, 'orders', orderId), cleanForFirestore(updatedTargetOrder), { merge: true });
      } catch (err) {
        handleQuotaBreaker(err);
        throw new Error('ไม่สามารถอัปเดตสถานะไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
      }
    }

    setOrders(updatedOrders);
    if (targetCardId) {
      setRunners((prev) =>
        prev.map((r) => {
          if (r.cardId === targetCardId) {
            const updatedR = { ...r, shirtClaimed: true };
            setDoc(doc(db, 'runners', r.regId), cleanForFirestore(updatedR), { merge: true }).catch(console.warn);
            return updatedR;
          }
          return r;
        })
      );
    }
  };

  const refundShirtOrder = async (orderId: string) => {
    let targetCardId = '';
    let updatedTargetOrder: ShirtOrder | undefined;
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        updatedTargetOrder = {
          ...o,
          status: 'refunded' as const,
        };
        return updatedTargetOrder;
      }
      return o;
    });

    if (updatedTargetOrder) {
      try {
        await setDoc(doc(db, 'orders', orderId), cleanForFirestore(updatedTargetOrder), { merge: true });
      } catch (err) {
        handleQuotaBreaker(err);
        throw new Error('ไม่สามารถอัปเดตสถานะไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
      }
    }

    setOrders(updatedOrders);
    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, runners) : c
        )
      );
      setRunners((prev) =>
        prev.map((r) => (r.cardId === targetCardId ? { ...r, shirtClaimed: false } : r))
      );
    }
  };

  const checkInRunner = async (cardOrRegId: string, officerName: string) => {
    const trimmed = cardOrRegId.trim().toUpperCase();
    const runner = runners.find(
      (r) =>
        r.cardId.toUpperCase() === trimmed ||
        r.regId.toUpperCase() === trimmed ||
        (r.bibNumber && r.bibNumber.toUpperCase() === trimmed) ||
        r.phone.replace(/[^0-9]/g, '') === trimmed.replace(/[^0-9]/g, '')
    );

    if (!runner) {
      return { success: false, message: 'ไม่พบข้อมูลผู้สมัครหรือหมายเลขนี้ในระบบ' };
    }

    if (runner.regType === 'SHIRT_ONLY') {
      return {
        success: false,
        message: 'ผู้สมัครประเภท "ซื้อเสื้ออย่างเดียว" ไม่มีสิทธิ์เช็กอินวิ่ง (สามารถรับเสื้อได้ที่จุดรับของที่ระลึก)',
        runner,
        card: cards.find((c) => c.cardId === runner.cardId),
      };
    }

    if (runner.checkedIn) {
      return {
        success: false,
        message: `ผู้สมัครนี้เช็กอินไปแล้วเมื่อ ${new Date(runner.checkedInAt || '').toLocaleTimeString('th-TH')} โดย ${runner.checkedInBy || 'เจ้าหน้าที่'}`,
        runner,
        card: cards.find((c) => c.cardId === runner.cardId),
      };
    }

    const updatedRunner: RunnerRegistration = {
      ...runner,
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: officerName,
    };

    try {
      await setDoc(doc(db, 'runners', updatedRunner.regId), cleanForFirestore(updatedRunner), { merge: true });
    } catch (err) {
      handleQuotaBreaker(err);
      throw new Error('ไม่สามารถบันทึกการเช็กอินไปยัง Cloud ได้: ' + ((err as Error)?.message || ''));
    }

    const updatedRunners = runners.map((r) => (r.regId === runner.regId ? updatedRunner : r));
    setRunners(updatedRunners);

    setCards((prev) =>
      prev.map((c) =>
        c.cardId === runner.cardId ? recomputeCardLevel(c, orders, updatedRunners) : c
      )
    );

    const card = cards.find((c) => c.cardId === runner.cardId);

    return {
      success: true,
      message: `เช็กอินสำเร็จ! ยินดีต้อนรับ ${runner.nickname || runner.fullName} (${runner.bibNumber || runner.regId})`,
      runner: updatedRunner,
      card,
    };
  };

  const claimMedal = (regId: string) => {
    setRunners((prev) =>
      prev.map((r) => (r.regId === regId ? { ...r, medalClaimed: true } : r))
    );
  };

  const clearSystemCache = async () => {
    try {
      localStorage.clear();
      for (const id of OFFICIAL_12_GHOST_IDS) {
        await idbRemove(`ghost_img_${id}`);
      }
      await idbRemove('system_asset_shirt');
      await idbRemove('system_asset_medal');
      await idbRemove('system_asset_map');
      window.location.reload();
    } catch (e) {
      console.warn('Clear cache notice:', e);
      window.location.reload();
    }
  };

  const resetToDefaults = async () => {
    exportLocalBackup();
    setCards([]);
    setRunners([]);
    setOrders([]);
    setCurrentCardId(null);
    setJustRevealedCard(null);
    safeLocalStorage.removeItem(STORAGE_KEYS.CARDS);
    safeLocalStorage.removeItem(STORAGE_KEYS.RUNNERS);
    safeLocalStorage.removeItem(STORAGE_KEYS.ORDERS);
    safeLocalStorage.removeItem(STORAGE_KEYS.CURRENT_CARD_ID);
    safeLocalStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);
    safeLocalStorage.removeItem(STORAGE_KEYS.PENDING_ORDER);
  };

  const currentCard = cards.find((c) => c.cardId === currentCardId) || cards[0] || null;
  const currentRunner = currentCard
    ? runners.find((r) => r.cardId === currentCard.cardId) || null
    : null;

  return (
    <EventContext.Provider
      value={{
        cards,
        runners,
        orders,
        currentCardId,
        setCurrentCardId,
        currentCard,
        currentRunner,
        justRevealedCard,
        setJustRevealedCard,
        activeOfficerRole,
        setActiveOfficerRole,
        adminUser,
        loginAdmin,
        logoutAdmin,
        isLiveEditMode,
        setIsLiveEditMode,
        siteContent,
        updateSiteContent,
        resetSiteContentSection,
        customShirtImage,
        setCustomShirtImage,
        customMedalImage,
        setCustomMedalImage,
        customMapImage,
        setCustomMapImage,
        connectionStatus,
        isFirebaseConnected: connectionStatus === 'connected',
        isSyncing,
        lastSyncedAt,
        quotaErrorMessage,
        pendingRegistrationInfo,
        syncFromCloud,
        subscribeAdminData,
        loadCardById,
        loadDirectoryPage,
        searchRunnersRemote,
        exportLocalBackup,
        registerParticipant,
        orderShirt,
        approveShirtPayment,
        rejectShirtPayment,
        markShirtClaimed,
        refundShirtOrder,
        checkInRunner,
        claimMedal,
        updateCardCustomImage,
        ghostSpeciesList,
        updateGhostSpecies,
        resetGhostSpecies,
        resetToDefaults,
        clearSystemCache,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
