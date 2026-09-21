import React, { useState } from 'react';
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
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { GHOST_QUIZ_QUESTIONS } from '../data/quiz';
import { GhostCard, RegistrationType, ShirtSize } from '../types';
import { CardPackRevealModal } from '../components/CardPackRevealModal';
import { EditableText } from '../components/EditableText';
import { OfficialShirtImage } from '../components/OfficialShirtImage';
import { compressImage } from '../lib/imageCompressor';

const SHIRT_SIZES_OPTIONS: { size: ShirtSize; chest: string }[] = [
  { size: 'XS', chest: '34"' },
  { size: 'S', chest: '36"' },
  { size: 'M', chest: '38"' },
  { size: 'L', chest: '40"' },
  { size: 'XL', chest: '42"' },
  { size: '2XL', chest: '44"' },
  { size: '3XL', chest: '48"' },
];

interface Props {
  initialType?: RegistrationType;
  onNavigate: (view: any) => void;
}

export const RegisterView: React.FC<Props> = ({ initialType = 'RUN_FREE', onNavigate }) => {
  const { registerParticipant } = useEventContext();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [regType, setRegType] = useState<RegistrationType>(initialType);

  // Runner info form state
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'male' | 'female' | 'nonbinary' | 'unspecified'>('female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [organization, setOrganization] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [teamName, setTeamName] = useState('');
  const [displayNameType, setDisplayNameType] = useState<'fullName' | 'nickname' | 'teamName' | 'anonymous'>('nickname');

  // Minor
  const isMinor = age < 18;
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Terms
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPhotoRelease, setAgreedPhotoRelease] = useState(false);
  const [agreedDataPolicy, setAgreedDataPolicy] = useState(false);

  // Shirt Order state (for type 2 or 3)
  const [shirtQuantity, setShirtQuantity] = useState<number>(1);
  const [shirtSizes, setShirtSizes] = useState<ShirtSize[]>(['L']);
  const [slipImage, setSlipImage] = useState<string>('');

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

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Array<{ questionId: number; selectedOptionIndex: number }>>([]);

  // Reveal Modal
  const [newlyCreatedCard, setNewlyCreatedCard] = useState<GhostCard | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);

  // Validation errors
  const [errorMsg, setErrorMsg] = useState('');

  const handleStep1Next = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = () => {
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลจริง');
      return;
    }
    if (!nickname.trim()) {
      setErrorMsg('กรุณากรอกชื่อเล่นสำหรับการทำการ์ด');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง');
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setErrorMsg('กรุณาระบุชื่อและเบอร์ติดต่อกรณีฉุกเฉินเพื่อความปลอดภัย');
      return;
    }
    if (isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
      setErrorMsg('ผู้สมัครอายุต่ำกว่า 18 ปี ต้องระบุชื่อและเบอร์โทรผู้ปกครอง');
      return;
    }
    if (!agreedTerms || !agreedPhotoRelease || !agreedDataPolicy) {
      setErrorMsg('กรุณากดยินยอมข้อตกลง กฎความปลอดภัย และนโยบายข้อมูลเพื่อดำเนินการต่อ');
      return;
    }

    if (regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY') {
      setStep(3); // Go to shirt & payment
    } else {
      setStep(4); // Free run goes directly to quiz
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Next = () => {
    setErrorMsg('');
    if (!slipImage) {
      setErrorMsg('⚠️ กรุณาแนบสลิปหลักฐานการโอนเงินก่อนดำเนินการต่อ (จำเป็นต้องมีสลิป)');
      return;
    }
    setStep(4); // Go to quiz
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quiz option selection
  const handleSelectQuizOption = (optIndex: number) => {
    const q = GHOST_QUIZ_QUESTIONS[currentQuestionIndex];
    const updated = [...quizAnswers.filter((a) => a.questionId !== q.id), { questionId: q.id, selectedOptionIndex: optIndex }];
    setQuizAnswers(updated);

    if (currentQuestionIndex < GHOST_QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Completed quiz! Submit everything
      handleSubmitRegistration(updated);
    }
  };

  const handleSubmitRegistration = (finalAnswers = quizAnswers) => {
    const { runner, card } = registerParticipant({
      regType,
      fullName,
      nickname,
      age: Number(age),
      gender,
      phone,
      email,
      province,
      organization,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      teamName,
      displayNameType,
      isMinor,
      guardianName,
      guardianPhone,
      agreedTerms,
      agreedPhotoRelease,
      agreedDataPolicy,
      shirtSize: regType !== 'RUN_FREE' ? shirtSizes[0] || 'L' : undefined,
      shirtSizes: regType !== 'RUN_FREE' ? shirtSizes : undefined,
      shirtQuantity: regType !== 'RUN_FREE' ? shirtQuantity : undefined,
      deliveryMethod: 'pickup_event',
      shippingAddress: undefined,
      slipImage: regType !== 'RUN_FREE' ? slipImage : undefined,
      quizAnswers: finalAnswers,
    });

    setNewlyCreatedCard(card);
    setShowRevealModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400 mb-2">
          <span className={step >= 1 ? 'text-amber-400 font-bold' : ''}>1. เลือกประเภท</span>
          <span className={step >= 2 ? 'text-amber-400 font-bold' : ''}>2. ข้อมูลผู้สมัคร</span>
          {(regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY') && (
            <span className={step >= 3 ? 'text-amber-400 font-bold' : ''}>3. สั่งเสื้อ & ชำระ</span>
          )}
          <span className={step === 4 ? 'text-amber-400 font-bold' : ''}>
            {step === 4 ? '4. ตอบคำถามค้นหาผี' : '4. ค้นหาผี'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-300"
            style={{
              width: `${
                step === 1
                  ? 25
                  : step === 2
                  ? 50
                  : step === 3
                  ? 75
                  : 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-sm flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Registration Type Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              <EditableText
                sectionKey="register_page"
                field="title"
                fallbackText="เลือกรูปแบบการเข้าร่วมกิจกรรม"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              <EditableText
                sectionKey="register_page"
                field="subtitle"
                fallbackText="FSS Halloween Fancy Run 2026 เปิดรับสมัครทั้งวิ่งฟรี และสั่งเสื้อที่ระลึกสุดลิมิเต็ด"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Type 1: Free Run */}
            <div
              onClick={() => setRegType('RUN_FREE')}
              className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 relative flex flex-col justify-between ${
                regType === 'RUN_FREE'
                  ? 'bg-slate-900 border-emerald-400 shadow-2xl shadow-emerald-950/60 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <span className="text-3xl">🏃</span>
                <h3 className="text-lg font-bold text-white">1. สมัครวิ่งฟรี (Free Run)</h3>
                <p className="text-2xl font-black text-emerald-400 font-mono">฿ 0</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  สำหรับผู้ที่ต้องการมาร่วมสนุก วิ่งแฟนซี ออกกำลังกาย โดยไม่มีค่าใช้จ่าย
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                  <li>✔ สิทธิ์ร่วมวิ่ง 5 กม. วันที่ 31 ต.ค.</li>
                  <li>✔ การ์ดผีประจำตัว LV.1 (12 ผีไทย)</li>
                  <li>✔ QR Code เช็กอินหน้างาน</li>
                  <li>✔ ประกันอุบัติเหตุและจุดบริการน้ำมนต์</li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">
                  {regType === 'RUN_FREE' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>

            {/* Type 2: Run & Shirt */}
            <div
              onClick={() => setRegType('RUN_AND_SHIRT')}
              className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 relative flex flex-col justify-between ${
                regType === 'RUN_AND_SHIRT'
                  ? 'bg-gradient-to-b from-[#251538] to-[#120a1e] border-amber-400 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                RECOMMENDED ★
              </div>
              <div className="space-y-3">
                <span className="text-3xl">🎽</span>
                <h3 className="text-lg font-bold text-white">2. วิ่ง + สั่งเสื้อที่ระลึก</h3>
                <p className="text-2xl font-black text-amber-400 font-mono">฿ 300</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  รับเสื้อวิ่ง Glow-in-the-dark พร้อมอัปเกรดการ์ดผีเป็น LV.2 ทันทีที่ยืนยันการชำระเงิน!
                </p>
                <ul className="text-xs text-slate-200 space-y-1.5 pt-2">
                  <li>✔ เสื้อวิ่ง Dry-Tech เรืองแสง 1 ตัว</li>
                  <li>✔ การ์ดผีอัปเกรดเป็น <b>LV.2</b> (ตรา SHIRT OWNER)</li>
                  <li>✔ สิทธิ์ร่วมวิ่ง 5 กม. & เหรียญที่ระลึก</li>
                  <li>✔ เพิ่มค่าพลังความเร็ว & พลังแฝง</li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-amber-400">
                  {regType === 'RUN_AND_SHIRT' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>

            {/* Type 3: Shirt Only */}
            <div
              onClick={() => setRegType('SHIRT_ONLY')}
              className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 relative flex flex-col justify-between ${
                regType === 'SHIRT_ONLY'
                  ? 'bg-slate-900 border-purple-400 shadow-2xl shadow-purple-950/60 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <span className="text-3xl">📦</span>
                <h3 className="text-lg font-bold text-white">3. สั่งซื้อเสื้ออย่างเดียว</h3>
                <p className="text-2xl font-black text-purple-400 font-mono">฿ 300</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ไม่สะดวกมาวิ่ง แต่ต้องการสะสมเสื้อลิมิเต็ดและการ์ดผีไทยประจำตัว
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                  <li>✔ เสื้อวิ่ง Glow-in-the-dark 1 ตัว</li>
                  <li>✔ การ์ดผีประจำตัว + QR Code สำหรับรับเสื้อ</li>
                  <li>✔ อัปเกรดเป็น LV.2 ทันทีที่ชำระเงิน</li>
                  <li>✔ เลือกรับที่งานหรือจัดส่งถึงบ้าน</li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-purple-400">
                  {regType === 'SHIRT_ONLY' ? '✓ เลือกประเภทนี้อยู่' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="button"
              onClick={handleStep1Next}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all"
            >
              <span>ถัดไป: กรอกข้อมูลผู้สมัคร</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Participant Registration Form (Section 4) */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              ข้อมูลผู้สมัคร & การ์ดผี
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              กรุณากรอกข้อมูลตามจริง เพื่อสิทธิประโยชน์ด้านความปลอดภัยและการออกการ์ด
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Identity Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. ข้อมูลส่วนตัว
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อ-นามสกุลจริง (สำหรับประกันอุบัติเหตุ) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น สมชาย ใจกล้า"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อเล่น (จะแสดงบนหน้าการ์ดผี) *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น โจ้ สปีด หรือ น้องแอน"
                    maxLength={15}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">อายุ (ปี) *</label>
                  <input
                    type="number"
                    value={age}
                    min={5}
                    max={99}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">เพศ</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="nonbinary">Non-binary / ความหลากหลาย</option>
                    <option value="unspecified">ไม่ระบุ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    เบอร์โทรศัพท์ (สำหรับค้นหาและแจ้งเหตุฉุกเฉิน) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="somchai@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">จังหวัดที่อยู่</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">สังกัด / ชมรม / องค์กร (ถ้ามี)</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="เช่น ชมรมวิ่งมิดไนท์ หรือ FSS"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Emergency & Medical Group */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> 2. ข้อมูลการแพทย์และผู้ติดต่อฉุกเฉิน
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อผู้ติดต่อฉุกเฉิน *
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="เช่น คุณแม่สมศรี"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    เบอร์โทรผู้ติดต่อฉุกเฉิน *
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="0898765432"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    โรคประจำตัว / ยาที่แพ้ / ข้อจำกัดด้านสุขภาพ (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="เช่น หอบหืด, แพ้ยาเพนิซิลลิน หรือไม่มี"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Team & Display Name */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Ghost className="w-4 h-4" /> 3. การแสดงผลในระบบ & แก๊งผี
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อทีม / แก๊งผี (ถ้ามาเป็นกลุ่ม)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="เช่น แก๊งผีหัวขาดซิ่ง"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ต้องการแสดงชื่อในรายชื่อนักวิ่งสาธารณะแบบใด
                  </label>
                  <select
                    value={displayNameType}
                    onChange={(e) => setDisplayNameType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                  >
                    <option value="nickname">แสดงชื่อเล่น (แนะนำ)</option>
                    <option value="fullName">แสดงชื่อ-นามสกุลจริง</option>
                    <option value="teamName">แสดงชื่อทีม</option>
                    <option value="anonymous">ไม่ระบุชื่อ (นิรนาม / วิญญาณเร่ร่อน)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Minor Guardian check */}
            {isMinor && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <p className="text-xs font-bold text-amber-300">
                  ⚠️ ผู้สมัครมีอายุต่ำกว่า 18 ปี กรุณากรอกข้อมูลผู้ปกครองยินยอม
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">ชื่อผู้ปกครอง *</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="ชื่อ-นามสกุลผู้ปกครอง"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">เบอร์โทรผู้ปกครอง *</label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="081xxxxxxx"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mandatory Consents (Section 4) */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                />
                <span>
                  ฉันได้อ่านและยอมรับกฎความปลอดภัย กติกาการร่วมกิจกรรม และเงื่อนไขการปล่อยตัว *
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedPhotoRelease}
                  onChange={(e) => setAgreedPhotoRelease(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                />
                <span>
                  ยินยอมให้ทีมงานบันทึกภาพถ่าย/วิดีโอ เพื่อเผยแพร่ภาพกิจกรรมและบรรยากาศในงาน *
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedDataPolicy}
                  onChange={(e) => setAgreedDataPolicy(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700"
                />
                <span>
                  ยินยอมให้นำข้อมูลไปใช้สำหรับการประสานงาน ประกันอุบัติเหตุ และการออกการ์ดผี *
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-2xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={handleStep2Next}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all"
            >
              <span>
                {regType === 'RUN_AND_SHIRT' || regType === 'SHIRT_ONLY'
                  ? 'ถัดไป: เลือกไซซ์เสื้อ & ชำระเงิน'
                  : 'ถัดไป: ตอบคำถามค้นหาผี'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Shirt Order & Payment (Section 4.3 & Section 10) */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              เลือกไซซ์เสื้อและชำระเงิน
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              เสื้อวิ่งเรืองแสง Dry-Tech ราคา 300 บาท / ตัว (เมื่อชำระแล้วจะได้รับการ์ด LV.2 ทันที!)
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Official Shirt 2D Preview */}
            <div className="max-w-xl mx-auto">
              <OfficialShirtImage allowUpload={false} />
            </div>

            {/* Quantity Selector */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    จำนวนเสื้อที่ต้องการสั่ง (ตัว) *
                  </label>
                  <p className="text-[11px] text-slate-400">
                    สั่งซื้อกี่ตัว ระบบจะให้เลือกไซซ์ตามจำนวนตัวที่สั่ง (ตัวละ 300 บาท)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(shirtQuantity - 1)}
                    disabled={shirtQuantity <= 1}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={shirtQuantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-16 h-9 text-center rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(shirtQuantity + 1)}
                    disabled={shirtQuantity >= 10}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 ml-1">ตัว</span>
                </div>
              </div>

              {/* Quick count chips */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">เลือกด่วน:</span>
                {[1, 2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleQuantityChange(cnt)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      shirtQuantity === cnt
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cnt} ตัว
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Size Pickers mapped to Quantity */}
            <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-[#18112e]/60 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-amber-400" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    เลือกไซซ์เสื้อให้ครบทุกตัว (ทั้งหมด {shirtQuantity} ตัว) *
                  </label>
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  {shirtSizes.map((s, i) => `ตัวที่ ${i + 1}: ${s}`).join(' • ')}
                </div>
              </div>

              <div className="space-y-3">
                {shirtSizes.map((currentSize, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          เสื้อตัวที่ {index + 1}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                        ไซซ์ที่เลือก: {currentSize}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                      {SHIRT_SIZES_OPTIONS.map((item) => {
                        const isSelected = currentSize === item.size;
                        return (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => handleSizeChange(index, item.size)}
                            className={`py-2 px-1 rounded-lg text-center font-bold transition-all border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-mono">{item.size}</div>
                            <div className="text-[10px] opacity-75">{item.chest}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Method: Fixed to Event Pickup Only */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>วิธีรับเสื้อ: รับที่การจัดงานเท่านั้น (ไม่มีแบบจัดส่ง)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                📍 จุดรับของที่ระลึกและเสื้อวิ่ง ณ ลานกิจกรรม คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ในวันจัดกิจกรรม (31 ตุลาคม 2569) เวลา 16:30 น. เป็นต้นไป
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> รับที่หน้างานไม่มีค่าจัดส่ง (ฟรี 0 บาท)
              </div>
            </div>

            {/* Payment instructions & QR */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#140e28] to-slate-950 border border-amber-500/30 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" /> สแกนชำระเงินค่าเสื้อ FSS Halloween Fancy Run
                  </div>
                  <p className="text-sm font-bold text-white mt-1">
                    ธนาคารกสิกรไทย: <span className="font-mono text-amber-400">098-7-65432-1</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ชื่อบัญชี: สโมสรนิสิตคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                  <span className="text-xs text-slate-400 block">ยอดชำระ ({shirtQuantity} ตัว):</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    ฿{(300 * shirtQuantity).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">300 บาท × {shirtQuantity} ตัว</span>
                </div>
              </div>

              {/* Slip upload - STRICT REQUIREMENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" />
                    แนบสลิปหลักฐานการโอนเงิน <span className="text-rose-400">*จำเป็นต้องแนบ</span>
                  </label>
                  {!slipImage && (
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-800/60 animate-pulse">
                      ⚠️ ยังไม่ได้แนบสลิป
                    </span>
                  )}
                </div>

                {!slipImage ? (
                  <div className="p-6 rounded-2xl bg-slate-900/60 border-2 border-dashed border-amber-500/40 text-center space-y-3 hover:border-amber-400 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        กรุณาแนบรูปภาพสลิปหลักฐานการโอนเงิน (ยอด ฿{(300 * shirtQuantity).toLocaleString()})
                      </p>
                      <p className="text-[11px] text-rose-400 font-medium mt-0.5">
                        *ระบบไม่อนุญาตให้ดำเนินการต่อหากยังไม่มีการแนบสลิปโอนเงิน
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all">
                      <Upload className="w-4 h-4" />
                      <span>เลือกรูปภาพสลิปจากเครื่อง</span>
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
                              console.error('Slip compression error:', err);
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
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 shrink-0">
                        <img src={slipImage} alt="Payment slip preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          แนบสลิปหลักฐานเรียบร้อยแล้ว
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          พร้อมสำหรับการไปขั้นตอนตอบคำถามค้นหาผี
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors">
                        เปลี่ยนรูปสลิป
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
                                console.error('Slip compression error:', err);
                                const reader = new FileReader();
                                reader.onloadend = () => setSlipImage(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setSlipImage('')}
                        className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
                        title="ลบสลิป"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-2xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={handleStep3Next}
              disabled={!slipImage}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 font-black text-sm rounded-2xl shadow-lg transition-all ${
                slipImage
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-950/50 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              {slipImage ? (
                <>
                  <span>ถัดไป: ตอบคำถามค้นหาผี (ขั้นตอนสุดท้าย!)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500/70" />
                  <span>กรุณาแนบสลิปโอนเงินเพื่อดำเนินการต่อ</span>
                </>
              )}
            </button>
          </div>

          {!slipImage && (
            <p className="text-center text-xs text-amber-400/80 font-medium">
              *จำเป็นต้องแนบรูปสลิปหลักฐานการโอนเงินก่อน เพื่อให้ระบบเปิดปุ่มไปยังขั้นตอนค้นหาผี
            </p>
          )}
        </div>
      )}

      {/* STEP 4: Ghost Discovery Quiz (7 Questions) */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              คำถามข้อที่ {currentQuestionIndex + 1} จาก {GHOST_QUIZ_QUESTIONS.length}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif leading-snug">
              {GHOST_QUIZ_QUESTIONS[currentQuestionIndex].prompt}
            </h2>
          </div>

          {/* Question Options */}
          <div className="space-y-3 pt-2">
            {GHOST_QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuizOption(idx)}
                className="w-full text-left p-5 rounded-2xl bg-slate-900/80 hover:bg-gradient-to-r hover:from-purple-950/60 hover:to-slate-900 border border-slate-800 hover:border-amber-400/80 transition-all duration-200 group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 font-mono font-bold flex items-center justify-center transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm sm:text-base text-slate-200 group-hover:text-white font-medium">
                    {opt.text}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 text-xs text-slate-500">
            <span>
              ตอบตามสัญชาตญาณ ระบบจะวิเคราะห์ค่าพลังและความเข้ากันกับ 12 ผีไทย
            </span>
            {currentQuestionIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="text-slate-400 hover:text-white"
              >
                ย้อนกลับข้อก่อนหน้า
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gacha Reveal Modal after submission */}
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
          onGoToShareStory={() => {
            setShowRevealModal(false);
            onNavigate('horror');
          }}
          onGoToMyCard={() => {
            setShowRevealModal(false);
            onNavigate('mycard');
          }}
          onGoToStorySanctuary={() => {
            setShowRevealModal(false);
            onNavigate('horror');
          }}
        />
      )}
    </div>
  );
};
