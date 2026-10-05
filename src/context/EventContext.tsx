import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { SiteContentSection, AdminUser } from '../types/cms';
import { idbGet, idbSet, idbRemove } from '../lib/idbStorage';
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { GHOST_SPECIES_LIST, THAI_GHOSTS, OFFICIAL_12_GHOST_IDS } from '../data/ghosts';
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

interface RegisterParams {
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

interface EventContextType {
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

  // Firebase status
  isFirebaseConnected: boolean;

  // Actions
  registerParticipant: (params: RegisterParams) => { runner: RunnerRegistration; card: GhostCard };
  orderShirt: (params: {
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
  }) => ShirtOrder;
  approveShirtPayment: (orderId: string, officerName?: string) => void;
  rejectShirtPayment: (orderId: string, reason?: string) => void;
  markShirtClaimed: (orderId: string) => void;
  refundShirtOrder: (orderId: string) => void;

  checkInRunner: (cardOrRegId: string, officerName: string) => {
    success: boolean;
    message: string;
    runner?: RunnerRegistration;
    card?: GhostCard;
  };
  claimMedal: (regId: string) => void;
  updateCardCustomImage: (cardId: string, imageUrl: string | null) => void;
  // 12 Thai Ghost Collection
  ghostSpeciesList: GhostSpecies[];
  updateGhostSpecies: (species: GhostSpecies) => Promise<void>;
  resetGhostSpecies: (speciesId: GhostSpeciesId) => Promise<void>;
  resetToDefaults: () => void;
  clearSystemCache: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEYS = {
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
};

// Safe localStorage wrapper to prevent QuotaExceededError or SecurityError from crashing React
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`LocalStorage write skipped for ${key}:`, err);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge all legacy large base64 images from browser localStorage to keep it under 10KB
  try {
    const keysToPurge = [
      'fss2026_demo_purged_v2',
      STORAGE_KEYS.SHIRT_IMAGE,
      STORAGE_KEYS.MEDAL_IMAGE,
      STORAGE_KEYS.MAP_IMAGE,
      STORAGE_KEYS.GHOST_SPECIES,
    ];
    keysToPurge.forEach((k) => safeLocalStorage.removeItem(k));

    // Remove any fss_ghost_img_* from localStorage as well (now in IndexedDB)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fss_ghost_img_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Storage cleanup notice:', e);
  }

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
          if (parsed.shirt_page) {
            parsed.shirt_page.accountNo = '088-254-7704';
            parsed.shirt_page.accountName = 'นางสาวพริมรตา ใจเฉียง';
            parsed.shirt_page.bankName = 'พร้อมเพย์ (PromptPay)';
            parsed.shirt_page.promptPay = '088-254-7704 (พร้อมเพย์)';
          }
          return { ...DEFAULT_SITE_CONTENT, ...parsed };
        }
      }
      return DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  });

  // Official custom shirt image
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

  // Ghost Species Dictionary (Strictly 12 Official Thai Ghosts with Deep Defaults)
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

  // Load persisted assets (12 ghosts, shirt, medal, map) from IndexedDB (huge capacity, no quota crash)
  useEffect(() => {
    const loadAllIDBAssets = async () => {
      try {
        const [shirtImg, medalImg, mapImg] = await Promise.all([
          idbGet<string>('system_asset_shirt'),
          idbGet<string>('system_asset_medal'),
          idbGet<string>('system_asset_map'),
        ]);
        if (shirtImg) setCustomShirtImageState(shirtImg);
        if (medalImg) setCustomMedalImageState(medalImg);
        if (mapImg) setCustomMapImageState(mapImg);

        for (const id of OFFICIAL_12_GHOST_IDS) {
          const ghostImg = await idbGet<string>(`ghost_img_${id}`);
          if (ghostImg) {
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
      } catch (err) {
        console.warn('IDB asset load error:', err);
      }
    };
    loadAllIDBAssets();
  }, []);

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Sync to localStorage safely
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

  // Firebase Realtime Listener
  useEffect(() => {
    try {
      const unsubContent = onSnapshot(collection(db, 'site_content'), (snap) => {
        if (!snap.empty) {
          const remoteContent: Record<string, SiteContentSection> = {};
          snap.forEach((docSnap) => {
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
          });
          setSiteContent((prev) => ({ ...DEFAULT_SITE_CONTENT, ...prev, ...remoteContent }));
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.warn('Firebase site_content listener notice:', err);
      });

      const unsubAssets = onSnapshot(collection(db, 'system_assets'), (snap) => {
        if (!snap.empty) {
          snap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            if (docSnap.id === 'shirt' && data.imageUrl) {
              setCustomShirtImageState(data.imageUrl);
              safeLocalStorage.setItem(STORAGE_KEYS.SHIRT_IMAGE, data.imageUrl);
            } else if (docSnap.id === 'medal' && data.imageUrl) {
              setCustomMedalImageState(data.imageUrl);
              safeLocalStorage.setItem(STORAGE_KEYS.MEDAL_IMAGE, data.imageUrl);
            } else if (docSnap.id === 'map' && data.imageUrl) {
              setCustomMapImageState(data.imageUrl);
              safeLocalStorage.setItem(STORAGE_KEYS.MAP_IMAGE, data.imageUrl);
            }
          });
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.warn('Firebase system_assets listener notice:', err);
      });

      const unsubGhosts = onSnapshot(collection(db, 'ghost_species'), (snap) => {
        if (!snap.empty) {
          const remoteGhosts: Record<GhostSpeciesId, GhostSpecies> = {} as any;
          snap.forEach((docSnap) => {
            const sid = docSnap.id as GhostSpeciesId;
            if (OFFICIAL_12_GHOST_IDS.includes(sid)) {
              const data = docSnap.data() as GhostSpecies;
              remoteGhosts[sid] = data;
              if (data.customImageUrl) {
                idbSet(`ghost_img_${sid}`, data.customImageUrl);
                safeLocalStorage.setItem(`fss_ghost_img_${sid}`, data.customImageUrl);
              }
            }
          });
          setGhostSpeciesMap((prev) => {
            const merged = { ...prev, ...remoteGhosts };
            const cleaned: Record<string, GhostSpecies> = {};
            OFFICIAL_12_GHOST_IDS.forEach((id) => {
              const base = THAI_GHOSTS[id];
              const custom = merged[id];
              const perGhostImg = safeLocalStorage.getItem(`fss_ghost_img_${id}`);
              if (base) {
                cleaned[id] = {
                  ...base,
                  ...(custom && typeof custom === 'object' ? custom : {}),
                  name: custom?.name || base.name,
                  title: custom?.title || base.title,
                  tagline: custom?.tagline || base.tagline,
                  element: custom?.element || base.element,
                  customImageUrl: custom?.customImageUrl || perGhostImg || base.customImageUrl || undefined,
                  baseStats: {
                    ...base.baseStats,
                    ...(custom?.baseStats || {}),
                  },
                };
              }
            });
            return cleaned as Record<GhostSpeciesId, GhostSpecies>;
          });
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.warn('Firebase ghost_species listener notice:', err);
      });

      const unsubRunners = onSnapshot(collection(db, 'runners'), (snap) => {
        if (!snap.empty) {
          const remoteRunners: RunnerRegistration[] = [];
          snap.forEach((docSnap) => {
            remoteRunners.push(docSnap.data() as RunnerRegistration);
          });
          setRunners((prev) => {
            const map = new Map<string, RunnerRegistration>();
            INITIAL_RUNNERS.forEach((r) => map.set(r.regId, r));
            (prev || []).forEach((r) => map.set(r.regId, r));
            remoteRunners.forEach((r) => map.set(r.regId, r));
            return Array.from(map.values());
          });
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.warn('Firebase runners listener notice:', err);
      });

      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        if (!snap.empty) {
          const remoteOrders: ShirtOrder[] = [];
          snap.forEach((docSnap) => {
            remoteOrders.push(docSnap.data() as ShirtOrder);
          });
          setOrders((prev) => {
            const map = new Map<string, ShirtOrder>();
            INITIAL_SHIRT_ORDERS.forEach((o) => map.set(o.orderId, o));
            (prev || []).forEach((o) => map.set(o.orderId, o));
            remoteOrders.forEach((o) => map.set(o.orderId, o));
            return Array.from(map.values());
          });
          setIsFirebaseConnected(true);
        }
      }, (err) => {
        console.warn('Firebase orders listener notice:', err);
      });

      return () => {
        unsubContent();
        unsubAssets();
        unsubGhosts();
        unsubRunners();
        unsubOrders();
      };
    } catch (err) {
      console.warn('Firebase subscription notice:', err);
    }
  }, []);

  const loginAdmin = (usernameInput: string, passwordInput: string): boolean => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (
      (trimmedUser === 'phasharak' && trimmedPass === '07011985') ||
      (trimmedUser === 'admin' && trimmedPass === 'fss2026')
    ) {
      const userObj: AdminUser = {
        username: trimmedUser,
        role: 'SUPER_ADMIN',
        isLoggedIn: true,
        loginTimestamp: new Date().toISOString(),
      };
      setAdminUser(userObj);
      setActiveOfficerRole('SUPER_ADMIN');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsLiveEditMode(false);
  };

  const updateSiteContent = async (section: SiteContentSection) => {
    setSiteContent((prev) => ({
      ...prev,
      [section.sectionKey]: section,
    }));

    try {
      const docRef = doc(db, 'site_content', section.sectionKey);
      await setDoc(docRef, section, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firestore update notice:', err);
    }
  };

  const resetSiteContentSection = async (sectionKey: string) => {
    const defaultSec = DEFAULT_SITE_CONTENT[sectionKey];
    if (defaultSec) {
      await updateSiteContent(defaultSec);
    }
  };

  const setCustomShirtImage = async (imgUrl: string | null) => {
    setCustomShirtImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_shirt', imgUrl);
    } else {
      await idbRemove('system_asset_shirt');
    }

    try {
      const payload = {
        sectionKey: 'asset_shirt',
        category: 'system_asset',
        imageUrl: imgUrl || null,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUser?.username || 'admin',
      };
      await setDoc(doc(db, 'site_content', 'asset_shirt'), payload, { merge: true });
      await setDoc(doc(db, 'system_assets', 'shirt'), payload, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firestore shirt image save notice:', err);
    }
  };

  const setCustomMedalImage = async (imgUrl: string | null) => {
    setCustomMedalImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_medal', imgUrl);
    } else {
      await idbRemove('system_asset_medal');
    }

    try {
      const payload = {
        sectionKey: 'asset_medal',
        category: 'system_asset',
        imageUrl: imgUrl || null,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUser?.username || 'admin',
      };
      await setDoc(doc(db, 'site_content', 'asset_medal'), payload, { merge: true });
      await setDoc(doc(db, 'system_assets', 'medal'), payload, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firestore medal image save notice:', err);
    }
  };

  const setCustomMapImage = async (imgUrl: string | null) => {
    setCustomMapImageState(imgUrl);
    if (imgUrl) {
      await idbSet('system_asset_map', imgUrl);
    } else {
      await idbRemove('system_asset_map');
    }

    try {
      const payload = {
        sectionKey: 'asset_map',
        category: 'system_asset',
        imageUrl: imgUrl || null,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUser?.username || 'admin',
      };
      await setDoc(doc(db, 'site_content', 'asset_map'), payload, { merge: true });
      await setDoc(doc(db, 'system_assets', 'map'), payload, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firestore map image save notice:', err);
    }
  };

  const updateCardCustomImage = async (cardId: string, imageUrl: string | null) => {
    setCards((prev) =>
      prev.map((c) =>
        c.cardId === cardId ? { ...c, customImageUrl: imageUrl || undefined } : c
      )
    );
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
    setGhostSpeciesMap((prev) => ({
      ...prev,
      [species.id]: species,
    }));

    if (species.customImageUrl) {
      // Store full high-res image safely in IndexedDB (500MB+ quota)
      await idbSet(`ghost_img_${species.id}`, species.customImageUrl);
      safeLocalStorage.setItem(`fss_ghost_img_${species.id}`, species.customImageUrl);
    } else {
      await idbRemove(`ghost_img_${species.id}`);
      safeLocalStorage.removeItem(`fss_ghost_img_${species.id}`);
    }

    // Save lightweight metadata to STORAGE_KEYS.GHOST_SPECIES
    try {
      const lightweightMap: Record<string, any> = {};
      OFFICIAL_12_GHOST_IDS.forEach((id) => {
        const item = id === species.id ? species : ghostSpeciesMap[id];
        if (item) {
          lightweightMap[id] = {
            ...item,
            // Keep lightweight, image is in IndexedDB & per-ghost key
            customImageUrl: item.customImageUrl && item.customImageUrl.startsWith('http') ? item.customImageUrl : undefined,
          };
        }
      });
      safeLocalStorage.setItem(STORAGE_KEYS.GHOST_SPECIES, JSON.stringify(lightweightMap));
    } catch (err) {
      console.warn('LocalStorage save ghost species notice:', err);
    }

    // Persist to Cloud Firestore
    try {
      const docRef = doc(db, 'ghost_species', species.id);
      await setDoc(docRef, species, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firestore update ghost species notice:', err);
    }
  };

  const resetGhostSpecies = async (speciesId: GhostSpeciesId) => {
    await idbRemove(`ghost_img_${speciesId}`);
    safeLocalStorage.removeItem(`fss_ghost_img_${speciesId}`);
    const original = THAI_GHOSTS[speciesId];
    if (original) {
      await updateGhostSpecies({ ...original, customImageUrl: undefined });
    }
  };

  const currentCard = cards.find((c) => c.cardId === currentCardId) || null;
  const currentRunner = runners.find((r) => r.cardId === currentCardId) || null;

  // Level & Badges calculation helper
  const recomputeCardLevel = (card: GhostCard, allOrders: ShirtOrder[], allRunners: RunnerRegistration[]): GhostCard => {
    const hasPaidShirt = allOrders.some(
      (o) => o.cardId === card.cardId && (o.status === 'paid' || o.status === 'claimed')
    );
    const runner = allRunners.find((r) => r.cardId === card.cardId);
    const isCheckedIn = runner?.checkedIn;

    const newBadges: Array<'SHIRT_OWNER' | 'CHECKED_IN' | 'FINISHER' | 'COMPLETE_COLLECTION'> = [];
    if (hasPaidShirt) newBadges.push('SHIRT_OWNER');
    if (isCheckedIn) {
      newBadges.push('CHECKED_IN');
      newBadges.push('FINISHER');
    }
    if (hasPaidShirt && isCheckedIn) {
      newBadges.push('COMPLETE_COLLECTION');
    }

    let newLevel: CardLevel = 1;
    if (hasPaidShirt || isCheckedIn) {
      newLevel = 2;
    }

    const baseSpecies = THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret;
    const baseStats = baseSpecies.baseStats || { speed: 85, spookiness: 85, latentPower: 85, stealth: 85, hauntingAura: 85 };
    const stats: GhostCardStats = { ...baseStats, ...(card.stats || {}) };

    if (hasPaidShirt) {
      stats.speed = Math.min(100, Math.max(stats.speed, (baseStats.speed ?? 85) + 6));
      stats.latentPower = Math.min(100, Math.max(stats.latentPower, (baseStats.latentPower ?? 85) + 6));
    }
    if (isCheckedIn) {
      stats.spookiness = Math.min(100, Math.max(stats.spookiness, (baseStats.spookiness ?? 85) + 7));
      stats.hauntingAura = Math.min(100, Math.max(stats.hauntingAura, (baseStats.hauntingAura ?? 85) + 7));
    }

    return {
      ...card,
      level: newLevel,
      badges: newBadges,
      stats,
      unlockedAtLv2: newLevel >= 2 ? card.unlockedAtLv2 || new Date().toISOString() : undefined,
    };
  };

  const registerParticipant = (params: RegisterParams) => {
    // 1. Calculate Ghost Species from Quiz Answers
    const speciesScore: Record<GhostSpeciesId, number> = {
      krasue: 0,
      krahang: 0,
      pop: 0,
      tani: 0,
      maenak: 0,
      kuman: 0,
      pret: 0,
      kongkoi: 0,
      headless: 0,
      nangram: 0,
      phiphong: 0,
      phi_am: 0,
    };

    const accumulatedStatBoost: GhostCardStats = {
      spookiness: 0,
      speed: 0,
      latentPower: 0,
      stealth: 0,
      hauntingAura: 0,
    };

    const ALL_SPECIES: GhostSpeciesId[] = OFFICIAL_12_GHOST_IDS;

    // True random assignment across all 12 Thai ghosts!
    const randomIndex = Math.floor(Math.random() * ALL_SPECIES.length);
    const chosenSpeciesId: GhostSpeciesId = ALL_SPECIES[randomIndex];

    // Stat boosts (+1 to +5)
    accumulatedStatBoost.speed = Math.floor(Math.random() * 5) + 1;
    accumulatedStatBoost.spookiness = Math.floor(Math.random() * 5) + 1;
    accumulatedStatBoost.latentPower = Math.floor(Math.random() * 5) + 1;
    accumulatedStatBoost.stealth = Math.floor(Math.random() * 5) + 1;
    accumulatedStatBoost.hauntingAura = Math.floor(Math.random() * 5) + 1;

    // 2. Rarity lottery (Common 55%, Rare 30%, Epic 12%, Legendary 3%)
    const roll = Math.random() * 100;
    let rarity: Rarity = 'Common';
    if (roll < 3) rarity = 'Legendary';
    else if (roll < 15) rarity = 'Epic';
    else if (roll < 45) rarity = 'Rare';
    else rarity = 'Common';

    // 3. Generate Card ID (FSS26-xxxxx)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const cardId = `FSS26-0${randomNum}`;
    const regId = `REG-${Math.floor(2000 + Math.random() * 8000)}`;
    const bibNumber = params.regType !== 'SHIRT_ONLY' ? `BIB-${Math.floor(100 + Math.random() * 900)}` : undefined;

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

    const newCard: GhostCard = {
      cardId,
      speciesId: chosenSpeciesId,
      nickname: params.nickname || params.fullName,
      fullName: params.fullName,
      rarity,
      level: 1,
      stats: initialStats,
      badges: [],
      qrPayload: `${cardId}-RUNNER-${params.nickname.slice(0, 3).toUpperCase()}-${rarity.toUpperCase()}`,
      createdAt: new Date().toISOString(),
      customQuote: baseSpecies.tagline,
      customImageUrl: ghostSpeciesMap[chosenSpeciesId]?.customImageUrl || undefined,
    };

    let shirtOrderId: string | undefined;
    if (params.regType === 'RUN_AND_SHIRT' || params.regType === 'SHIRT_ONLY') {
      const ordNum = Math.floor(1000 + Math.random() * 9000);
      shirtOrderId = `ORD-${ordNum}`;
      const qty = params.shirtQuantity || 1;
      const normalizedSizes = params.shirtSizes && params.shirtSizes.length > 0
        ? params.shirtSizes
        : [params.shirtSize || 'L'];
      const newOrder: ShirtOrder = {
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
        paymentTimestamp: params.slipImage ? new Date().toISOString() : undefined,
      };
      setOrders((prev) => [newOrder, ...prev]);
    }

    const newRunner: RunnerRegistration = {
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
      registeredAt: new Date().toISOString(),
      checkedIn: false,
      medalClaimed: false,
      shirtClaimed: false,
    };

    setCards((prev) => [newCard, ...prev]);
    setRunners((prev) => [newRunner, ...prev]);
    setCurrentCardId(cardId);
    setJustRevealedCard(newCard);

    // Persist to Firestore in background
    try {
      setDoc(doc(db, 'runners', newRunner.regId), newRunner).catch((err) =>
        console.warn('Firestore runner persist notice:', err)
      );
      setDoc(doc(db, 'cards', newCard.cardId), newCard).catch((err) =>
        console.warn('Firestore card persist notice:', err)
      );
    } catch (err) {
      console.warn('Firestore persist error:', err);
    }

    return { runner: newRunner, card: newCard };
  };

  const orderShirt = (params: {
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
  }) => {
    const ordNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${ordNum}`;
    const qty = Math.max(1, params.quantity || 1);
    const normalizedSizes = params.sizes && params.sizes.length > 0
      ? params.sizes.slice(0, qty)
      : Array(qty).fill(params.size || 'L');
    const primarySize = normalizedSizes[0] || 'L';

    const newOrder: ShirtOrder = {
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
      paymentTimestamp: params.slipImage ? new Date().toISOString() : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    setRunners((prev) =>
      prev.map((r) => (r.cardId === params.cardId ? { ...r, shirtOrderId: orderId } : r))
    );

    // Persist order to Firestore in background
    try {
      setDoc(doc(db, 'orders', newOrder.orderId), newOrder).catch((err) =>
        console.warn('Firestore order persist notice:', err)
      );
    } catch (err) {
      console.warn('Firestore order persist error:', err);
    }

    return newOrder;
  };

  const approveShirtPayment = (orderId: string, officerName: string = 'เจ้าหน้าที่การเงิน') => {
    let targetCardId = '';
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        return {
          ...o,
          status: 'paid' as const,
          verifiedAt: new Date().toISOString(),
          verifiedBy: officerName,
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, runners) : c
        )
      );
    }
  };

  const rejectShirtPayment = (orderId: string, reason?: string) => {
    let targetCardId = '';
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        return {
          ...o,
          status: 'rejected' as const,
          notes: reason || 'สลิปไม่ถูกต้องหรือไม่พบยอดโอน',
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, runners) : c
        )
      );
    }
  };

  const markShirtClaimed = (orderId: string) => {
    let targetCardId = '';
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        return {
          ...o,
          status: 'claimed' as const,
          claimedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (targetCardId) {
      setRunners((prev) =>
        prev.map((r) => (r.cardId === targetCardId ? { ...r, shirtClaimed: true } : r))
      );
    }
  };

  const refundShirtOrder = (orderId: string) => {
    let targetCardId = '';
    const updatedOrders = orders.map((o) => {
      if (o.orderId === orderId) {
        targetCardId = o.cardId;
        return {
          ...o,
          status: 'refunded' as const,
        };
      }
      return o;
    });
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

  const checkInRunner = (cardOrRegId: string, officerName: string) => {
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

    const updatedRunners = runners.map((r) => (r.regId === runner.regId ? updatedRunner : r));
    setRunners(updatedRunners);

    // Recompute card level if checked in
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

  const resetToDefaults = () => {
    setCards([]);
    setRunners([]);
    setOrders([]);
    setCurrentCardId(null);
    safeLocalStorage.removeItem(STORAGE_KEYS.CARDS);
    safeLocalStorage.removeItem(STORAGE_KEYS.RUNNERS);
    safeLocalStorage.removeItem(STORAGE_KEYS.ORDERS);
    safeLocalStorage.removeItem(STORAGE_KEYS.CURRENT_CARD_ID);
  };

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
        isFirebaseConnected,
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
