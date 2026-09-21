export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CardLevel = 1 | 2 | 3;

export type GhostSpeciesId =
  | 'krasue'
  | 'krahang'
  | 'pop'
  | 'tani'
  | 'maenak'
  | 'kuman'
  | 'pret'
  | 'kongkoi'
  | 'headless'
  | 'nangram'
  | 'phiphong'
  | 'phiruen';

export interface GhostCardStats {
  spookiness: number; // ความหลอน
  speed: number; // ความเร็ว
  latentPower: number; // พลังแฝง
  stealth: number; // การพรางตัว
  hauntingAura: number; // ความเฮี้ยน
}

export interface GhostSpecies {
  id: GhostSpeciesId;
  name: string;
  title: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  element: string;
  baseStats: GhostCardStats;
  avatarSvg: string;
  lore: string;
}

export interface GhostCard {
  cardId: string; // e.g. "FSS26-00872"
  speciesId: GhostSpeciesId;
  nickname: string;
  fullName: string;
  rarity: Rarity;
  level: CardLevel;
  stats: GhostCardStats;
  badges: Array<'SHIRT_OWNER' | 'STORYTELLER' | 'COMPLETE_COLLECTION'>;
  qrPayload: string;
  createdAt: string;
  unlockedAtLv2?: string;
  unlockedAtLv3?: string;
  customQuote?: string;
}

export type RegistrationType = 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY';

export interface RunnerRegistration {
  regId: string; // e.g. "REG-1042"
  bibNumber?: string; // e.g. "BIB-5088"
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
  cardId: string;
  shirtOrderId?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  medalClaimed: boolean;
  shirtClaimed: boolean;
  officerNotes?: string;
}

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export type ShirtOrderStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'paid'
  | 'rejected'
  | 'ready_for_pickup'
  | 'claimed'
  | 'cancelled'
  | 'refunded';

export interface ShirtOrder {
  orderId: string; // e.g. "ORD-8819"
  cardId: string;
  customerName: string;
  phone: string;
  email: string;
  size: ShirtSize;
  sizes?: ShirtSize[];
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryMethod: 'pickup_event' | 'shipping';
  shippingAddress?: string;
  status: ShirtOrderStatus;
  slipImage?: string;
  paymentTimestamp?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  claimedAt?: string;
}

export type HorrorStoryCategory =
  | 'running_encounter' // วิ่งอยู่ดีๆ ก็เจอ
  | 'dark_alley' // หลอนในซอยเปลี่ยว
  | 'sleep_paralysis' // ผีอำ/สัมผัสพิเศษ
  | 'workplace_school' // ที่ทำงาน/มหาวิทยาลัย
  | 'funny_ghost' // ตลกปนหลอน
  | 'real' // เรื่องจริง
  | 'fiction' // เรื่องแต่ง
  | 'funny' // เรื่องขำ
  | 'urban_legend' // ได้ยินต่อกันมา
  | 'unexplained'; // ยังหาคำตอบไม่ได้

export type StoryStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'revision_requested'
  | 'rejected'
  | 'hidden';

export interface StoryReactions {
  spooky: number; // 👻 หลอนจริง
  funny: number; // 😂 ผีไม่พัก
  flashlight: number; // 🔦 ขอไฟฉาย
  runAway: number; // 🏃 วิ่งก่อนแล้ว
  cannotSleep: number; // 💀 อ่านตอนกลางคืนไม่ได้
}

export interface HorrorStory {
  id: string;
  cardId: string;
  authorNickname: string;
  isAnonymous: boolean;
  title: string;
  content: string;
  category: HorrorStoryCategory;
  spookinessRating: number; // 1 to 5
  location: string;
  status: StoryStatus;
  reactions: StoryReactions;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  featuredOnHome?: boolean;
}

export interface QuizAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface QuizQuestion {
  id: number;
  prompt: string;
  options: {
    text: string;
    description: string;
    biasSpecies: GhostSpeciesId[];
    statBoost: Partial<GhostCardStats>;
  }[];
}

export type OfficerRole =
  | 'SUPER_ADMIN' // ผู้ดูแลหลัก
  | 'OFFICER_REGISTRATION' // จุดลงทะเบียน & สแกนเช็กอิน
  | 'OFFICER_FINANCE' // จุดการเงิน & ตรวจสอบสลิป
  | 'OFFICER_HORROR' // ฝ่ายคัดกรองเรื่องสยองขวัญ
  | 'REGISTRAR'
  | 'FINANCE'
  | 'SHIRT_OFFICER'
  | 'STORY_OFFICER'
  | 'GATE_CHECKIN';
