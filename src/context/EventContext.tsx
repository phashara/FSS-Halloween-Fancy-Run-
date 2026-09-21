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
import { DEFAULT_SITE_CONTENT } from '../data/defaultSiteContent';
import { GHOST_SPECIES_LIST, THAI_GHOSTS } from '../data/ghosts';
import {
  INITIAL_CARDS,
  INITIAL_RUNNERS,
  INITIAL_SHIRT_ORDERS,
  INITIAL_STORIES,
} from '../data/initialData';
import { GHOST_QUIZ_QUESTIONS } from '../data/quiz';
import {
  CardLevel,
  GhostCard,
  GhostCardStats,
  GhostSpeciesId,
  HorrorStory,
  HorrorStoryCategory,
  OfficerRole,
  QuizAnswer,
  Rarity,
  RegistrationType,
  RunnerRegistration,
  ShirtOrder,
  ShirtSize,
  StoryReactions,
} from '../types';

interface RegisterParams {
  regType: RegistrationType;
  fullName: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female' | 'nonbinary' | 'unspecified';
  phone: string;
  email: string;
  province: string;
  organization?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
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
  shirtQuantity?: number;
  deliveryMethod?: 'pickup_event' | 'shipping';
  shippingAddress?: string;
  slipImage?: string;
  quizAnswers: QuizAnswer[];
}

interface EventContextType {
  cards: GhostCard[];
  runners: RunnerRegistration[];
  orders: ShirtOrder[];
  stories: HorrorStory[];
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
    size: ShirtSize;
    quantity: number;
    deliveryMethod: 'pickup_event' | 'shipping';
    shippingAddress?: string;
    slipImage?: string;
  }) => ShirtOrder;
  approveShirtPayment: (orderId: string, officerName?: string) => void;
  rejectShirtPayment: (orderId: string, reason?: string) => void;
  markShirtClaimed: (orderId: string) => void;
  refundShirtOrder: (orderId: string) => void;

  submitHorrorStory: (params: {
    cardId: string;
    authorNickname: string;
    isAnonymous: boolean;
    title: string;
    content: string;
    category: HorrorStoryCategory;
    spookinessRating: number;
    location: string;
  }) => HorrorStory;
  approveHorrorStory: (storyId: string, officerName?: string) => void;
  rejectHorrorStory: (storyId: string) => void;
  toggleFeatureStory: (storyId: string) => void;
  reactToStory: (storyId: string, reaction: keyof StoryReactions) => void;

  checkInRunner: (cardOrRegId: string, officerName: string) => {
    success: boolean;
    message: string;
    runner?: RunnerRegistration;
    card?: GhostCard;
  };
  claimMedal: (regId: string) => void;
  resetToDefaults: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CARDS: 'fss2026_cards',
  RUNNERS: 'fss2026_runners',
  ORDERS: 'fss2026_orders',
  STORIES: 'fss2026_stories',
  CURRENT_CARD_ID: 'fss2026_active_card_id',
  OFFICER_ROLE: 'fss2026_officer_role',
  ADMIN_SESSION: 'fss2026_admin_session',
  LIVE_EDIT: 'fss2026_live_edit_mode',
  SITE_CONTENT: 'fss2026_site_content',
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cards, setCards] = useState<GhostCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [runners, setRunners] = useState<RunnerRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RUNNERS);
      return saved ? JSON.parse(saved) : INITIAL_RUNNERS;
    } catch {
      return INITIAL_RUNNERS;
    }
  });

  const [orders, setOrders] = useState<ShirtOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_SHIRT_ORDERS;
    } catch {
      return INITIAL_SHIRT_ORDERS;
    }
  });

  const [stories, setStories] = useState<HorrorStory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORIES);
      return saved ? JSON.parse(saved) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  const [currentCardId, setCurrentCardId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_CARD_ID);
      return saved || 'FSS26-00872'; // default to active user
    } catch {
      return 'FSS26-00872';
    }
  });

  const [activeOfficerRole, setActiveOfficerRole] = useState<OfficerRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICER_ROLE);
      return (saved as OfficerRole) || 'SUPER_ADMIN';
    } catch {
      return 'SUPER_ADMIN';
    }
  });

  const [justRevealedCard, setJustRevealedCard] = useState<GhostCard | null>(null);

  // Admin Session (phasharak / 07011985)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Live CMS Edit Mode
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIVE_EDIT);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Site Content for Live Editing
  const [siteContent, setSiteContent] = useState<Record<string, SiteContentSection>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
      return saved ? JSON.parse(saved) : DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Sync with Firebase Firestore on mount
  useEffect(() => {
    let unsubscribeContent: (() => void) | undefined;
    try {
      // 1. Listen to site_content collection
      const contentCol = collection(db, 'site_content');
      unsubscribeContent = onSnapshot(
        contentCol,
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const remoteContent: Record<string, SiteContentSection> = { ...DEFAULT_SITE_CONTENT };
            snapshot.forEach((d) => {
              const data = d.data() as SiteContentSection;
              if (data && data.sectionKey) {
                remoteContent[data.sectionKey] = data;
              }
            });
            setSiteContent(remoteContent);
            localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(remoteContent));
          }
        },
        (error) => {
          console.warn('Firestore site_content listener notice:', error.message);
        }
      );
    } catch (e) {
      console.warn('Firebase init error:', e);
    }

    return () => {
      if (unsubscribeContent) unsubscribeContent();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      localStorage.setItem(STORAGE_KEYS.RUNNERS, JSON.stringify(runners));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      if (currentCardId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CARD_ID, currentCardId);
      }
      localStorage.setItem(STORAGE_KEYS.OFFICER_ROLE, activeOfficerRole);
      localStorage.setItem(STORAGE_KEYS.LIVE_EDIT, String(isLiveEditMode));
      if (adminUser) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [cards, runners, orders, stories, currentCardId, activeOfficerRole, isLiveEditMode, adminUser]);

  // Admin authentication
  const loginAdmin = (username: string, pass: string): boolean => {
    if (username.toLowerCase() === 'phasharak' && pass === '07011985') {
      const user: AdminUser = {
        username: 'phasharak',
        displayName: 'พชรกร (Super Admin)',
        role: 'SUPER_ADMIN',
        isLoggedIn: true,
        loginAt: new Date().toISOString(),
      };
      setAdminUser(user);
      setActiveOfficerRole('SUPER_ADMIN');
      setIsLiveEditMode(true); // Automatically enable live edit mode for convenience
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsLiveEditMode(false);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  };

  // CMS Content Update
  const updateSiteContent = async (section: SiteContentSection) => {
    const updated: SiteContentSection = {
      ...section,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.username || 'admin',
    };

    setSiteContent((prev) => {
      const next = { ...prev, [section.sectionKey]: updated };
      localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(next));
      return next;
    });

    try {
      // Save to Firebase Firestore
      const docRef = doc(db, 'site_content', section.sectionKey);
      await setDoc(docRef, updated, { merge: true });
      setIsFirebaseConnected(true);
    } catch (err) {
      console.error('Failed to sync site content to Firestore:', err);
    }
  };

  const resetSiteContentSection = async (sectionKey: string) => {
    const defaultData = DEFAULT_SITE_CONTENT[sectionKey];
    if (defaultData) {
      await updateSiteContent(defaultData);
    }
  };

  const currentCard = cards.find((c) => c.cardId === currentCardId) || null;
  const currentRunner = runners.find((r) => r.cardId === currentCardId) || null;

  // Level & Badges calculation helper
  const recomputeCardLevel = (card: GhostCard, allOrders: ShirtOrder[], allStories: HorrorStory[]): GhostCard => {
    const hasPaidShirt = allOrders.some(
      (o) => o.cardId === card.cardId && (o.status === 'paid' || o.status === 'claimed')
    );
    const hasApprovedStory = allStories.some(
      (s) => s.cardId === card.cardId && s.status === 'approved'
    );

    const newBadges: Array<'SHIRT_OWNER' | 'STORYTELLER' | 'COMPLETE_COLLECTION'> = [];
    if (hasPaidShirt) newBadges.push('SHIRT_OWNER');
    if (hasApprovedStory) newBadges.push('STORYTELLER');

    let newLevel: CardLevel = 1;
    if (hasPaidShirt && hasApprovedStory) {
      newLevel = 3;
      newBadges.push('COMPLETE_COLLECTION');
    } else if (hasPaidShirt || hasApprovedStory) {
      newLevel = 2;
    }

    const baseSpecies = THAI_GHOSTS[card.speciesId];
    // Base stats
    const stats: GhostCardStats = { ...card.stats };

    // Bonus based on level & badges
    if (hasPaidShirt) {
      stats.speed = Math.min(100, Math.max(stats.speed, baseSpecies.baseStats.speed + 6));
      stats.latentPower = Math.min(100, Math.max(stats.latentPower, baseSpecies.baseStats.latentPower + 6));
    }
    if (hasApprovedStory) {
      stats.spookiness = Math.min(100, Math.max(stats.spookiness, baseSpecies.baseStats.spookiness + 7));
      stats.hauntingAura = Math.min(100, Math.max(stats.hauntingAura, baseSpecies.baseStats.hauntingAura + 7));
    }
    if (newLevel === 3) {
      stats.spookiness = Math.min(100, stats.spookiness + 5);
      stats.speed = Math.min(100, stats.speed + 5);
      stats.latentPower = Math.min(100, stats.latentPower + 5);
      stats.stealth = Math.min(100, stats.stealth + 5);
      stats.hauntingAura = Math.min(100, stats.hauntingAura + 5);
    }

    return {
      ...card,
      level: newLevel,
      badges: newBadges,
      stats,
      unlockedAtLv2: newLevel >= 2 ? card.unlockedAtLv2 || new Date().toISOString() : undefined,
      unlockedAtLv3: newLevel === 3 ? card.unlockedAtLv3 || new Date().toISOString() : undefined,
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
      phiruen: 0,
    };

    const accumulatedStatBoost: GhostCardStats = {
      spookiness: 0,
      speed: 0,
      latentPower: 0,
      stealth: 0,
      hauntingAura: 0,
    };

    params.quizAnswers.forEach((ans) => {
      const q = GHOST_QUIZ_QUESTIONS.find((item) => item.id === ans.questionId);
      if (q && q.options[ans.selectedOptionIndex]) {
        const opt = q.options[ans.selectedOptionIndex];
        opt.biasSpecies.forEach((sp) => {
          speciesScore[sp] = (speciesScore[sp] || 0) + 3;
        });
        if (opt.statBoost.speed) accumulatedStatBoost.speed += opt.statBoost.speed;
        if (opt.statBoost.spookiness) accumulatedStatBoost.spookiness += opt.statBoost.spookiness;
        if (opt.statBoost.latentPower) accumulatedStatBoost.latentPower += opt.statBoost.latentPower;
        if (opt.statBoost.stealth) accumulatedStatBoost.stealth += opt.statBoost.stealth;
        if (opt.statBoost.hauntingAura) accumulatedStatBoost.hauntingAura += opt.statBoost.hauntingAura;
      }
    });

    // Find top scoring species
    let chosenSpeciesId: GhostSpeciesId = 'krasue';
    let maxScore = -1;
    (Object.keys(speciesScore) as GhostSpeciesId[]).forEach((sp) => {
      if (speciesScore[sp] > maxScore) {
        maxScore = speciesScore[sp];
        chosenSpeciesId = sp;
      }
    });

    // 2. Rarity lottery (Section 6: Common 55%, Rare 30%, Epic 12%, Legendary 3%)
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

    const baseSpecies = THAI_GHOSTS[chosenSpeciesId];
    const rarityBonus = rarity === 'Legendary' ? 8 : rarity === 'Epic' ? 5 : rarity === 'Rare' ? 3 : 0;

    const initialStats: GhostCardStats = {
      spookiness: Math.min(100, baseSpecies.baseStats.spookiness + (accumulatedStatBoost.spookiness % 8) + rarityBonus),
      speed: Math.min(100, baseSpecies.baseStats.speed + (accumulatedStatBoost.speed % 8) + rarityBonus),
      latentPower: Math.min(100, baseSpecies.baseStats.latentPower + (accumulatedStatBoost.latentPower % 8) + rarityBonus),
      stealth: Math.min(100, baseSpecies.baseStats.stealth + (accumulatedStatBoost.stealth % 8) + rarityBonus),
      hauntingAura: Math.min(100, baseSpecies.baseStats.hauntingAura + (accumulatedStatBoost.hauntingAura % 8) + rarityBonus),
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
    };

    let shirtOrderId: string | undefined;
    if (params.regType === 'RUN_AND_SHIRT' || params.regType === 'SHIRT_ONLY') {
      const ordNum = Math.floor(1000 + Math.random() * 9000);
      shirtOrderId = `ORD-${ordNum}`;
      const qty = params.shirtQuantity || 1;
      const newOrder: ShirtOrder = {
        orderId: shirtOrderId,
        cardId,
        customerName: params.fullName,
        phone: params.phone,
        email: params.email,
        size: params.shirtSize || 'L',
        quantity: qty,
        unitPrice: 390,
        totalAmount: 390 * qty,
        deliveryMethod: params.deliveryMethod || 'pickup_event',
        shippingAddress: params.shippingAddress,
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
      fullName: params.fullName,
      nickname: params.nickname,
      age: params.age,
      gender: params.gender,
      phone: params.phone,
      email: params.email,
      province: params.province,
      organization: params.organization,
      emergencyContactName: params.emergencyContactName,
      emergencyContactPhone: params.emergencyContactPhone,
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

    return { runner: newRunner, card: newCard };
  };

  const orderShirt = (params: {
    cardId: string;
    customerName: string;
    phone: string;
    email: string;
    size: ShirtSize;
    quantity: number;
    deliveryMethod: 'pickup_event' | 'shipping';
    shippingAddress?: string;
    slipImage?: string;
  }) => {
    const ordNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${ordNum}`;
    const newOrder: ShirtOrder = {
      orderId,
      cardId: params.cardId,
      customerName: params.customerName,
      phone: params.phone,
      email: params.email,
      size: params.size,
      quantity: params.quantity,
      unitPrice: 390,
      totalAmount: 390 * params.quantity,
      deliveryMethod: params.deliveryMethod,
      shippingAddress: params.shippingAddress,
      status: params.slipImage ? 'pending_verification' : 'unpaid',
      slipImage: params.slipImage,
      paymentTimestamp: params.slipImage ? new Date().toISOString() : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // link to runner if exists
    setRunners((prev) =>
      prev.map((r) => (r.cardId === params.cardId ? { ...r, shirtOrderId: orderId } : r))
    );

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
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, stories) : c
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
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, stories) : c
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
          c.cardId === targetCardId ? recomputeCardLevel(c, updatedOrders, stories) : c
        )
      );
      setRunners((prev) =>
        prev.map((r) => (r.cardId === targetCardId ? { ...r, shirtClaimed: false } : r))
      );
    }
  };

  const submitHorrorStory = (params: {
    cardId: string;
    authorNickname: string;
    isAnonymous: boolean;
    title: string;
    content: string;
    category: HorrorStoryCategory;
    spookinessRating: number;
    location: string;
  }) => {
    const newStory: HorrorStory = {
      id: `STORY-${Math.floor(100 + Math.random() * 900)}`,
      cardId: params.cardId,
      authorNickname: params.authorNickname,
      isAnonymous: params.isAnonymous,
      title: params.title,
      content: params.content,
      category: params.category,
      spookinessRating: params.spookinessRating,
      location: params.location,
      status: 'pending', // Section 12: เริ่มต้นเป็นรอตรวจสอบ
      reactions: {
        spooky: 0,
        funny: 0,
        flashlight: 0,
        runAway: 0,
        cannotSleep: 0,
      },
      submittedAt: new Date().toISOString(),
    };

    setStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const approveHorrorStory = (storyId: string, officerName: string = 'เจ้าหน้าที่เรื่องสยอง') => {
    let targetCardId = '';
    const updatedStories = stories.map((s) => {
      if (s.id === storyId) {
        targetCardId = s.cardId;
        return {
          ...s,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: officerName,
        };
      }
      return s;
    });
    setStories(updatedStories);

    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, orders, updatedStories) : c
        )
      );
    }
  };

  const rejectHorrorStory = (storyId: string) => {
    let targetCardId = '';
    const updatedStories = stories.map((s) => {
      if (s.id === storyId) {
        targetCardId = s.cardId;
        return { ...s, status: 'rejected' as const };
      }
      return s;
    });
    setStories(updatedStories);

    if (targetCardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.cardId === targetCardId ? recomputeCardLevel(c, orders, updatedStories) : c
        )
      );
    }
  };

  const toggleFeatureStory = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, featuredOnHome: !s.featuredOnHome } : s))
    );
  };

  const reactToStory = (storyId: string, reaction: keyof StoryReactions) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          return {
            ...s,
            reactions: {
              ...s.reactions,
              [reaction]: (s.reactions[reaction] || 0) + 1,
            },
          };
        }
        return s;
      })
    );
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

    setRunners((prev) => prev.map((r) => (r.regId === runner.regId ? updatedRunner : r)));
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

  const resetToDefaults = () => {
    setCards(INITIAL_CARDS);
    setRunners(INITIAL_RUNNERS);
    setOrders(INITIAL_SHIRT_ORDERS);
    setStories(INITIAL_STORIES);
    setCurrentCardId('FSS26-00872');
    localStorage.clear();
  };

  return (
    <EventContext.Provider
      value={{
        cards,
        runners,
        orders,
        stories,
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
        isFirebaseConnected,
        registerParticipant,
        orderShirt,
        approveShirtPayment,
        rejectShirtPayment,
        markShirtClaimed,
        refundShirtOrder,
        submitHorrorStory,
        approveHorrorStory,
        rejectHorrorStory,
        toggleFeatureStory,
        reactToStory,
        checkInRunner,
        claimMedal,
        resetToDefaults,
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
