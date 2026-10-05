import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Ghost,
  Shirt,
  User,
  HeartPulse,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  QrCode,
  MapPin,
  Lock,
  Plus,
  Minus,
  Trash2,
  GraduationCap,
  Building2,
  Phone,
  Calendar,
  Radio,
  Share2,
  Star,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import {
  generateCardId,
  generateRegId,
  generateOrderId,
  generateBibNumber,
} from '../lib/idGenerator';
import {
  GhostCard,
  ParticipantCategory,
  ParticipantGender,
  RegistrationType,
  ShirtSize,
  StudentYear,
} from '../types';
import { CardPackRevealModal } from '../components/CardPackRevealModal';
import { EditableText } from '../components/EditableText';
import { OfficialShirtImage } from '../components/OfficialShirtImage';
import { compressImage } from '../lib/imageCompressor';
import {
  FACULTY_GROUPS,
  STAFF_DEPARTMENT_GROUPS,
  INFO_SOURCES,
  MONTH_NAMES_THAI,
} from '../data/nuDepartments';
import { OFFICIAL_SHIRT_SIZES } from '../data/shirtSizes';

const SHIRT_SIZES_OPTIONS = OFFICIAL_SHIRT_SIZES;

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 80 }, (_, i) => String(2026 - i));

interface Props {
  initialType?: RegistrationType;
  initialPackage?: RegistrationType;
  onNavigate: (view: any) => void;
}

export const RegisterView: React.FC<Props> = ({
  initialType = 'RUN_FREE',
  initialPackage,
  onNavigate,
}) => {
  const { registerParticipant } = useEventContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [regType, setRegType] = useState<RegistrationType>(initialPackage || initialType);

  // Form Fields
  const [nameThai, setNameThai] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<ParticipantGender>('female');

  // Birth Date
  const [birthDay, setBirthDay] = useState('01');
  const [birthMonth, setBirthMonth] = useState('09');
  const [birthYear, setBirthYear] = useState('2002');
  const [age, setAge] = useState<number>(24);

  // Category
  const [participantCategory, setParticipantCategory] = useState<ParticipantCategory>('student');
  const [studentYear, setStudentYear] = useState<StudentYear>('1');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('คณะแพทยศาสตร์');
  const [customFaculty, setCustomFaculty] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('กองกลาง');
  const [customStaffDepartment, setCustomStaffDepartment] = useState('');

  // Contacts
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('พิษณุโลก');
  const [organization, setOrganization] = useState('');

  // Emergency
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('มารดา');

  // Info source & shirt
  const [infoSource, setInfoSource] = useState<string>('Facebook');
  const [interestedInShirt, setInterestedInShirt] = useState<'yes' | 'no'>(
    regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY' ? 'yes' : 'no'
  );

  // Survey: 1. เคยมาร่วมงานหรือไม่, 2. วันงานจะแต่งตัวแบบไหน
  const [hasAttendedBefore, setHasAttendedBefore] = useState<'yes' | 'no'>('no');
  const [costumeStyle, setCostumeStyle] = useState<'sportswear' | 'ghost' | 'other'>('sportswear');

  const [medicalConditions, setMedicalConditions] = useState('');
  const [teamName, setTeamName] = useState('');
  const [displayNameType, setDisplayNameType] = useState<
    'fullName' | 'nickname' | 'teamName' | 'anonymous'
  >('nickname');

  // Calculate age
  const handleBirthDateChange = (d: string, m: string, y: string) => {
    setBirthDay(d);
    setBirthMonth(m);
    setBirthYear(y);

    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);
    if (dayNum && monthNum && yearNum) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - yearNum;
      const mDiff = today.getMonth() + 1 - monthNum;
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < dayNum)) {
        calculatedAge--;
      }
      setAge(Math.max(0, calculatedAge));
    }
  };

  const handleShirtInterestChange = (val: 'yes' | 'no') => {
    setInterestedInShirt(val);
    if (val === 'yes') {
      if (regType === 'RUN_FREE') {
        setRegType('RUN_AND_SHIRT');
      }
    } else {
      if (regType === 'RUN_AND_SHIRT') {
        setRegType('RUN_FREE');
      }
    }
  };

  // Minor
  const isMinor = age < 18;
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Terms
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPhotoRelease, setAgreedPhotoRelease] = useState(false);
  const [agreedDataPolicy, setAgreedDataPolicy] = useState(false);

  // Shirt Order state
  const [shirtQuantity, setShirtQuantity] = useState<number>(1);
  const [shirtSizes, setShirtSizes] = useState<ShirtSize[]>(['L']);
  const [slipImage, setSlipImage] = useState<string>('');
  const [copiedPromptPay, setCopiedPromptPay] = useState(false);

  const handleCopyPromptPay = (num: string = '2178417854') => {
    navigator.clipboard?.writeText(num);
    setCopiedPromptPay(true);
    setTimeout(() => setCopiedPromptPay(false), 2000);
  };

  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, Math.min(10, newQty));
    setShirtQuantity(qty);
    setShirtSizes((prev) => {
      if (qty > prev.length) {
        const lastSize = prev[prev.length - 1] || 'L';
        return [...prev, ...Array(qty - prev.length).fill(lastSize)];
      }
      return prev.slice(0, qty);
    });
  };

  const handleSizeChange = (index: number, newSize: ShirtSize) => {
    setShirtSizes((prev) => {
      const next = [...prev];
      next[index] = newSize;
      return next;
    });
  };

  // Reveal Modal & Submitting state
  const [newlyCreatedCard, setNewlyCreatedCard] = useState<GhostCard | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store pre-generated idempotent IDs for retry without duplicate records
  const pendingIdempotencyRef = useRef<{
    cardId: string;
    regId: string;
    orderId: string;
    bibNumber?: string;
  }>({
    cardId: generateCardId(),
    regId: generateRegId(),
    orderId: generateOrderId(),
    bibNumber: generateBibNumber(),
  });

  // Validation error
  const [errorMsg, setErrorMsg] = useState('');

  const handleStep1Next = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = () => {
    setErrorMsg('');
    if (!nameThai.trim()) {
      setErrorMsg('กรุณากรอกชื่อภาษาไทย');
      return;
    }
    if (!nameEng.trim()) {
      setErrorMsg('กรุณากรอกชื่อภาษาอังกฤษ');
      return;
    }
    if (!nickname.trim()) {
      setErrorMsg('กรุณากรอกชื่อเล่นสำหรับการทำการ์ด');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setErrorMsg('กรุณากรอกเบอร์โทรผู้สมัครที่ถูกต้อง');
      return;
    }

    if (participantCategory === 'student' || participantCategory === 'alumni') {
      if (!studentId.trim()) {
        setErrorMsg('กรุณากรอกรหัสนิสิต');
        return;
      }
      if (!faculty) {
        setErrorMsg('กรุณาเลือกคณะ');
        return;
      }
      if (faculty === 'อื่นๆ' && !customFaculty.trim()) {
        setErrorMsg('กรุณาระบุชื่อคณะ/วิทยาลัย/หน่วยงานของคุณ');
        return;
      }
    } else if (participantCategory === 'staff') {
      if (!staffDepartment) {
        setErrorMsg('กรุณาเลือกสังกัด/หน่วยงานของบุคลากร');
        return;
      }
      if (staffDepartment === 'อื่นๆ' && !customStaffDepartment.trim()) {
        setErrorMsg('กรุณาระบุสังกัด/หน่วยงานของคุณ');
        return;
      }
    }

    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setErrorMsg('กรุณากรอกชื่อและเบอร์โทรผู้ติดต่อฉุกเฉิน');
      return;
    }
    if (!emergencyContactRelation.trim()) {
      setErrorMsg('กรุณาระบุความเกี่ยวข้องของผู้ติดต่อฉุกเฉิน');
      return;
    }

    if (isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
      setErrorMsg('ผู้สมัครอายุต่ำกว่า 18 ปี ต้องระบุชื่อและเบอร์โทรผู้ปกครอง');
      return;
    }
    if (!agreedTerms || !agreedPhotoRelease || !agreedDataPolicy) {
      setErrorMsg('กรุณากดยินยอมข้อตกลงและเงื่อนไขเพื่อดำเนินการต่อ');
      return;
    }

    if (interestedInShirt === 'yes' || regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY') {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Free Run: Submit immediately and random ghost card directly!
      handleSubmitRegistration();
    }
  };

  const handleStep3Submit = () => {
    setErrorMsg('');
    if (!slipImage) {
      setErrorMsg('⚠️ กรุณาแนบสลิปหลักฐานการโอนเงินก่อนดำเนินการต่อ');
      return;
    }
    handleSubmitRegistration();
  };

  const handleSubmitRegistration = async () => {
    if (isSubmitting) return;
    setErrorMsg('');
    setIsSubmitting(true);

    const birthDateFormatted = `${birthDay}/${birthMonth}/${birthYear}`;
    const effectiveFaculty =
      faculty === 'อื่นๆ' ? (customFaculty.trim() || 'อื่นๆ') : faculty;
    const effectiveStaffDepartment =
      staffDepartment === 'อื่นๆ'
        ? (customStaffDepartment.trim() || 'อื่นๆ')
        : staffDepartment;

    const selectedFacultyGroup =
      FACULTY_GROUPS.find((g) => g.faculties.includes(faculty))?.groupName ||
      (faculty === 'อื่นๆ' ? 'อื่นๆ' : undefined);
    const selectedStaffGroup =
      STAFF_DEPARTMENT_GROUPS.find((g) => g.departments.includes(staffDepartment))
        ?.groupName || (staffDepartment === 'อื่นๆ' ? 'อื่นๆ' : undefined);

    const computedOrg =
      participantCategory === 'student' || participantCategory === 'alumni'
        ? `${effectiveFaculty} (มหาวิทยาลัยนเรศวร)`
        : participantCategory === 'staff'
        ? effectiveStaffDepartment
        : organization.trim() || 'บุคคลทั่วไป';

    try {
      const { runner, card } = await registerParticipant(
        {
          regType: interestedInShirt === 'yes' && regType === 'RUN_FREE' ? 'RUN_AND_SHIRT' : regType,
          fullName: nameThai.trim(),
          nameThai: nameThai.trim(),
          nameEng: nameEng.trim(),
          nickname: nickname.trim(),
          age: Number(age),
          gender,
          birthDate: birthDateFormatted,
          birthDay,
          birthMonth,
          birthYear,
          participantCategory,
          studentYear: participantCategory === 'student' ? studentYear : undefined,
          studentId:
            participantCategory === 'student' || participantCategory === 'alumni'
              ? studentId.trim()
              : undefined,
          facultyGroup:
            participantCategory === 'student' || participantCategory === 'alumni'
              ? selectedFacultyGroup
              : undefined,
          faculty:
            participantCategory === 'student' || participantCategory === 'alumni'
              ? effectiveFaculty
              : undefined,
          staffDepartmentGroup:
            participantCategory === 'staff' ? selectedStaffGroup : undefined,
          staffDepartment:
            participantCategory === 'staff' ? effectiveStaffDepartment : undefined,
          phone: phone.trim(),
          email: email.trim(),
          province: province.trim(),
          organization: computedOrg,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          emergencyContactRelation: emergencyContactRelation.trim(),
          infoSource,
          interestedInShirt,
          hasAttendedBefore,
          costumeStyle,
          medicalConditions,
          teamName,
          displayNameType,
          isMinor,
          guardianName,
          guardianPhone,
          agreedTerms,
          agreedPhotoRelease,
          agreedDataPolicy,
          shirtSize:
            interestedInShirt === 'yes' && regType !== 'RUN_FREE'
              ? shirtSizes[0] || 'L'
              : undefined,
          shirtSizes:
            interestedInShirt === 'yes' && regType !== 'RUN_FREE' ? shirtSizes : undefined,
          shirtQuantity:
            interestedInShirt === 'yes' && regType !== 'RUN_FREE' ? shirtQuantity : undefined,
          deliveryMethod: 'pickup_event',
          shippingAddress: undefined,
          slipImage:
            interestedInShirt === 'yes' && regType !== 'RUN_FREE' ? slipImage : undefined,
        },
        {
          existingCardId: pendingIdempotencyRef.current.cardId,
          existingRegId: pendingIdempotencyRef.current.regId,
          existingOrderId: pendingIdempotencyRef.current.orderId,
          existingBibNumber: pendingIdempotencyRef.current.bibNumber,
        }
      );

      setNewlyCreatedCard(card);
      setShowRevealModal(true);
    } catch (err: any) {
      console.error('Registration submit error:', err);
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasShirtPayment =
    regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY' || interestedInShirt === 'yes';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Progress Bar - Fastwork Clean Style */}
      <div className="fastwork-card p-4 sm:p-5 bg-white">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 mb-3">
          <span className={step >= 1 ? 'text-[#DC2626]' : ''}>1. เลือกแพ็กเกจ</span>
          <span className={step >= 2 ? 'text-[#DC2626]' : ''}>2. ข้อมูลผู้สมัคร</span>
          {hasShirtPayment && (
            <span className={step >= 3 ? 'text-[#DC2626]' : ''}>3. ชำระเงินค่าเสื้อ & สลิป</span>
          )}
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#DC2626] h-full transition-all duration-300"
            style={{
              width: `${
                hasShirtPayment
                  ? step === 1
                    ? 33.3
                    : step === 2
                    ? 66.6
                    : 100
                  : step === 1
                  ? 50
                  : 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Registration Type Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              REGISTRATION PACKAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              <EditableText
                sectionKey="register_page"
                field="title"
                fallbackText="เลือกรูปแบบการเข้าร่วมกิจกรรม"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              <EditableText
                sectionKey="register_page"
                field="subtitle"
                fallbackText="FSS Halloween Fancy Run 2026 เปิดรับสมัครทั้งวิ่งฟรี และสั่งเสื้อที่ระลึกสุดลิมิเต็ด"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Type 1: Free Run */}
            <div
              onClick={() => setRegType('RUN_FREE')}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                regType === 'RUN_FREE'
                  ? 'bg-emerald-50/30 border-[#00B67A] shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#00B67A] font-bold text-xs">
                  ฟรี 100%
                </span>
                <h3 className="text-lg font-bold text-slate-900">1. สมัครวิ่งฟรี (Free Run)</h3>
                <p className="text-2xl font-black text-slate-900 font-mono">฿ 0</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  สำหรับผู้ที่ต้องการมาร่วมสนุก วิ่งแฟนซี ออกกำลังกาย โดยไม่มีค่าใช้จ่าย
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00B67A] shrink-0" />
                    <span>สิทธิ์ร่วมวิ่ง 5.0 KM คืนวันที่ 31 ต.ค.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00B67A] shrink-0" />
                    <span>การ์ดผีประจำตัว LV.1 (12 ผีไทย)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00B67A] shrink-0" />
                    <span>QR Code เช็กอินหน้างาน</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-[#00B67A]">
                  {regType === 'RUN_FREE' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>

            {/* Type 2: Run & Shirt */}
            <div
              onClick={() => setRegType('RUN_AND_SHIRT')}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                regType === 'RUN_AND_SHIRT'
                  ? 'bg-red-50/40 border-[#DC2626] shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#DC2626] text-white font-bold text-[11px] shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>ยอดนิยม ★</span>
              </div>
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FEF2F2] text-[#DC2626] font-bold text-xs">
                  วิ่ง + เสื้อที่ระลึก
                </span>
                <h3 className="text-lg font-bold text-slate-900">2. วิ่งพร้อมสั่งเสื้อ</h3>
                <p className="text-2xl font-black text-[#DC2626] font-mono">฿ 300</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  วิ่ง 5.0 KM พร้อมรับเสื้อ LIMITED EDITION
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>เสื้อที่ระลึก LIMITED EDITION</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>การ์ดผีอัปเกรดเป็น <b>LV.2</b> (ตรา SHIRT OWNER)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>สิทธิ์ร่วมวิ่ง 5 KM & ลุ้นเหรียญ Finisher</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-[#DC2626]">
                  {regType === 'RUN_AND_SHIRT' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>

            {/* Type 3: Shirt Only */}
            <div
              onClick={() => setRegType('SHIRT_ONLY')}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                regType === 'SHIRT_ONLY'
                  ? 'bg-purple-50/40 border-purple-500 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-xs">
                  สั่งเสื้ออย่างเดียว
                </span>
                <h3 className="text-lg font-bold text-slate-900">3. สั่งซื้อเสื้ออย่างเดียว</h3>
                <p className="text-2xl font-black text-purple-700 font-mono">฿ 300</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ไม่สะดวกมาวิ่ง แต่ต้องการสะสมเสื้อลิมิเต็ดและการ์ดผีไทยประจำตัว
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>เสื้อที่ระลึก LIMITED EDITION 1 ตัว</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>การ์ดผีประจำตัว LV.2 + QR รับเสื้อ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>รับเสื้อหน้างาน ณ คณะสังคมศาสตร์</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-purple-700">
                  {regType === 'SHIRT_ONLY' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleStep1Next}
              className="px-8 py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>ถัดไป: กรอกข้อมูลผู้สมัคร</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Participant Registration Form */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              PARTICIPANT DETAILS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ข้อมูลผู้สมัคร & การ์ดผี
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              กรุณากรอกข้อมูลตามจริง เพื่อสิทธิประโยชน์ด้านความปลอดภัยและการออกการ์ด
            </p>
          </div>

          <div className="fastwork-card p-6 sm:p-8 bg-white space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-[#DC2626]" /> ข้อมูลส่วนบุคคล (1 - 5)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                {/* 1. Thai Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. ชื่อภาษาไทย *
                  </label>
                  <input
                    type="text"
                    value={nameThai}
                    onChange={(e) => setNameThai(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจกล้า"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                {/* 2. English Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. ชื่อภาษาอังกฤษ *
                  </label>
                  <input
                    type="text"
                    value={nameEng}
                    onChange={(e) => setNameEng(e.target.value)}
                    placeholder="เช่น Mr. Somchai Jaikla"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                {/* 3. Nickname */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. ชื่อเล่น (จะปรากฏบนการ์ดวิญญาณผี) *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น โจ้ สปีด หรือ น้องแอน"
                    maxLength={15}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                {/* 4. Gender */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. เพศ *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  >
                    <option value="female">หญิง</option>
                    <option value="male">ชาย</option>
                    <option value="other">ไม่ระบุเพศ</option>
                  </select>
                </div>

                {/* 5. Birth Date */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    5. วัน/เดือน/ปี เกิด (ค.ศ.) * (คำนวณอายุ: <b className="text-[#DC2626]">{age} ปี</b>)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={birthDay}
                      onChange={(e) => handleBirthDateChange(e.target.value, birthMonth, birthYear)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>วันที่ {d}</option>
                      ))}
                    </select>

                    <select
                      value={birthMonth}
                      onChange={(e) => handleBirthDateChange(birthDay, e.target.value, birthYear)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                    >
                      {MONTH_NAMES_THAI.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={birthYear}
                      onChange={(e) => handleBirthDateChange(birthDay, birthMonth, e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>ค.ศ. {y} (พ.ศ. {parseInt(y) + 543})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Department */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-[#DC2626]" /> สถานะผู้สมัคร & สังกัด
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    6. ประเภทผู้สมัคร *
                  </label>
                  <select
                    value={participantCategory}
                    onChange={(e) => setParticipantCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  >
                    <option value="student">นิสิต ม.นเรศวร</option>
                    <option value="alumni">ศิษย์เก่า ม.นเรศวร</option>
                    <option value="staff">บุคลากร / อาจารย์ ม.นเรศวร</option>
                    <option value="general">บุคคลทั่วไป</option>
                  </select>
                </div>

                {(participantCategory === 'student' || participantCategory === 'alumni') && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">รหัสนิสิต *</label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="เช่น 65012345"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">คณะ/วิทยาลัย *</label>
                      <select
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                      >
                        {FACULTY_GROUPS.map((group) => (
                          <optgroup key={group.groupName} label={group.groupName}>
                            {group.faculties.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {faculty === 'อื่นๆ' && (
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          โปรดระบุคณะ / วิทยาลัย / หน่วยงานของคุณ *
                        </label>
                        <input
                          type="text"
                          value={customFaculty}
                          onChange={(e) => setCustomFaculty(e.target.value)}
                          placeholder="เช่น คณะ... หรือ วิทยาลัย..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                        />
                      </div>
                    )}

                    {participantCategory === 'student' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ชั้นปี *</label>
                        <select
                          value={studentYear}
                          onChange={(e) => setStudentYear(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                        >
                          <option value="1">ปี 1</option>
                          <option value="2">ปี 2</option>
                          <option value="3">ปี 3</option>
                          <option value="4">ปี 4</option>
                          <option value="other">ปีอื่นๆ / ป.โท-เอก</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {participantCategory === 'staff' && (
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">สังกัด / หน่วยงาน *</label>
                      <select
                        value={staffDepartment}
                        onChange={(e) => setStaffDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                      >
                        {STAFF_DEPARTMENT_GROUPS.map((group) => (
                          <optgroup key={group.groupName} label={group.groupName}>
                            {group.departments.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {staffDepartment === 'อื่นๆ' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          โปรดระบุสังกัด / หน่วยงานของคุณ *
                        </label>
                        <input
                          type="text"
                          value={customStaffDepartment}
                          onChange={(e) => setCustomStaffDepartment(e.target.value)}
                          placeholder="เช่น กอง... หรือ สังกัด..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contacts & Emergency */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#DC2626]" /> ข้อมูลติดต่อ & ฉุกเฉิน
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">7. เบอร์โทรศัพท์ผู้สมัคร *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">8. ชื่อผู้ติดต่อฉุกเฉิน *</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล ผู้ติดต่อฉุกเฉิน"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรผู้ติดต่อฉุกเฉิน *</label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Event Experience & Costume Survey */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-[#DC2626]" /> ข้อมูลเพิ่มเติมสำหรับวันงาน
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                {/* 1. เคยมาร่วมงานหรือไม่ */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    9. เคยมาร่วมงานหรือไม่? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasAttendedBefore('yes')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        hasAttendedBefore === 'yes'
                          ? 'border-[#DC2626] bg-red-50 text-[#DC2626] ring-1 ring-[#DC2626]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${hasAttendedBefore === 'yes' ? 'opacity-100' : 'opacity-0'}`} />
                      <span>เคย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasAttendedBefore('no')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        hasAttendedBefore === 'no'
                          ? 'border-[#DC2626] bg-red-50 text-[#DC2626] ring-1 ring-[#DC2626]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${hasAttendedBefore === 'no' ? 'opacity-100' : 'opacity-0'}`} />
                      <span>ไม่เคย</span>
                    </button>
                  </div>
                </div>

                {/* 2. วันงานจะแต่งตัวแบบไหน */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    10. วันงานจะแต่งตัวแบบไหน? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCostumeStyle('sportswear')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        costumeStyle === 'sportswear'
                          ? 'border-[#DC2626] bg-red-50 text-[#DC2626] ring-1 ring-[#DC2626]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${costumeStyle === 'sportswear' ? 'opacity-100' : 'opacity-0'}`} />
                      <span>ชุดกีฬา</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostumeStyle('ghost')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        costumeStyle === 'ghost'
                          ? 'border-[#DC2626] bg-red-50 text-[#DC2626] ring-1 ring-[#DC2626]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${costumeStyle === 'ghost' ? 'opacity-100' : 'opacity-0'}`} />
                      <span>ชุดผี</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Agreements */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#DC2626] focus:ring-[#DC2626]"
                />
                <span>ข้าพเจ้ายินยอมปฏิบัติตามกฎกติกาและมาตรการความปลอดภัยของงานวิ่ง</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedPhotoRelease}
                  onChange={(e) => setAgreedPhotoRelease(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#DC2626] focus:ring-[#DC2626]"
                />
                <span>ยินยอมให้บันทึกภาพถ่าย/วิดีโอเพื่อการประชาสัมพันธ์กิจกรรม</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedDataPolicy}
                  onChange={(e) => setAgreedDataPolicy(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#DC2626] focus:ring-[#DC2626]"
                />
                <span>ยินยอมให้นำข้อมูลไปใช้เพื่อการจัดงานวิ่งและการออกการ์ดดิจิทัล</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStep2Next}
              className={`px-8 py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังบันทึกข้อมูลเข้าระบบ...</span>
                </>
              ) : hasShirtPayment ? (
                <>
                  <span>ถัดไป: ชำระเงินค่าเสื้อ & แนบสลิป</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ยืนยันการสมัครวิ่ง (สุ่มการ์ดผีทันที 👻)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Shirt & Payment */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              SHIRT PAYMENT & CONFIRMATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              เลือกไซซ์เสื้อ & แนบสลิปชำระเงิน
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              เสื้อที่ระลึก Limited Edition ราคา 300 บาท (รับหน้างานฟรี 0 บาท)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Shirt Image Preview */}
            <div className="lg:col-span-5 fastwork-card p-6 bg-white flex flex-col items-center text-center space-y-4">
              <div className="w-full">
                <OfficialShirtImage allowUpload={false} />
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p className="font-bold text-slate-900">เสื้อที่ระลึก FSS Ghost Run 2026</p>
                <p>ผ้า Dry-Tech Micro Polyester 100% เรืองแสงในที่มืด</p>
              </div>
            </div>

            {/* Right: Size & Payment */}
            <div className="lg:col-span-7 fastwork-card p-6 sm:p-8 bg-white space-y-6">
              {/* Quantity and Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    เลือกไซซ์เสื้อ ({shirtQuantity} ตัว) *
                  </label>
                  <span className="text-[11px] text-[#DC2626] font-semibold">
                    เลือก: ไซซ์ {shirtSizes[0]} (อก {SHIRT_SIZES_OPTIONS.find(s => s.size === shirtSizes[0])?.chestInches || 42}")
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {SHIRT_SIZES_OPTIONS.map((item) => {
                    const isSelected = shirtSizes[0] === item.size;
                    return (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setShirtSizes([item.size])}
                        title={`รอบอก ${item.chestInches}" / ยาว ${item.lengthInches}"`}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-md ring-2 ring-red-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-red-300'
                        }`}
                      >
                        <div className="text-sm font-bold font-mono">{item.size}</div>
                        <div className="text-[10px] font-medium opacity-90">อก {item.chestInches}"</div>
                        <div className="text-[9px] opacity-75">ยาว {item.lengthInches}"</div>
                      </button>
                    );
                  })}
                </div>

                {/* Size guide helper note */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>* หน่วยวัดเป็นนิ้ว (Inches) • วัดรอบอกเสื้อตัวโปรดเพื่อเปรียบเทียบขนาดที่พอดี</span>
                  <span className="text-[#DC2626] font-bold">12 ไซซ์ (SSS – 7XL)</span>
                </div>
              </div>

            {/* Bank Info & Slip */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="text-xs text-[#DC2626] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> บัญชีชำระเงินค่าเสื้อ (ธนาคารกสิกรไทย)
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#137E43] text-white text-xs font-bold shadow-sm flex items-center gap-1">
                      KBANK กสิกรไทย
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-wider">
                      217-8-41785-4
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPromptPay('2178417854')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                      title="คัดลอกเลขที่บัญชี"
                    >
                      {copiedPromptPay ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>คัดลอกเลขบัญชี</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium pt-0.5">
                    ชื่อบัญชี: <span className="font-bold text-slate-900">น.ส.พริมรตา ใจเฉียง</span>
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                  <span className="text-xs text-slate-500">ยอดชำระ:</span>
                  <p className="text-2xl font-black text-[#DC2626] font-mono">฿300</p>
                </div>
              </div>

              {/* Slip Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900">
                  แนบสลิปหลักฐานการโอนเงิน *
                </label>
                {!slipImage ? (
                  <div className="p-6 rounded-xl bg-white border-2 border-dashed border-slate-300 text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">อัปโหลดรูปภาพสลิปโอนเงิน (300 บาท)</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกรูปสลิป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 1000, 1000, 0.85);
                              setSlipImage(compressed);
                            } catch (err) {
                              const reader = new FileReader();
                              reader.onloadend = () => setSlipImage(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                        <img src={slipImage} alt="Slip" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-emerald-900">แนบสลิปเรียบร้อยแล้ว ✓</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSlipImage('')}
                      className="p-1.5 rounded-lg bg-white text-rose-600 border border-slate-200 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!slipImage || isSubmitting}
              onClick={handleStep3Submit}
              className={`px-8 py-3.5 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 ${
                slipImage && !isSubmitting
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังบันทึกข้อมูลเข้าระบบ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ยืนยันการสมัคร & ชำระเงิน (สุ่มการ์ดผีทันที 👻)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Card Reveal Modal */}
      {showRevealModal && newlyCreatedCard && (
        <CardPackRevealModal
          card={newlyCreatedCard}
          onClose={() => {
            setShowRevealModal(false);
            onNavigate('mycard');
          }}
          onGoToOrderShirt={() => {
            setShowRevealModal(false);
            onNavigate('shirt');
          }}
          onGoToMyCard={() => {
            setShowRevealModal(false);
            onNavigate('mycard');
          }}
        />
      )}
    </div>
  );
};
