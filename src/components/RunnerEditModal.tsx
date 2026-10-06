import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  Phone,
  Mail,
  Shirt,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import {
  RunnerRegistration,
  ShirtOrder,
  ShirtSize,
  ParticipantCategory,
  ParticipantGender,
  RegistrationType,
  StudentYear,
  ShirtOrderStatus,
} from '../types';

interface RunnerEditModalProps {
  isOpen: boolean;
  runner: RunnerRegistration | null;
  linkedOrder?: ShirtOrder | null;
  onClose: () => void;
  onSave: (
    updatedRunner: RunnerRegistration,
    updatedOrder?: Partial<ShirtOrder> | null
  ) => Promise<void>;
}

const SHIRT_SIZES: ShirtSize[] = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', 'XS'];

export const RunnerEditModal: React.FC<RunnerEditModalProps> = ({
  isOpen,
  runner,
  linkedOrder,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'race' | 'shirt'>('profile');

  // Form states - Runner
  const [fullName, setFullName] = useState('');
  const [nameThai, setNameThai] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<ParticipantGender>('unspecified');
  const [age, setAge] = useState<number>(20);
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [category, setCategory] = useState<ParticipantCategory>('general');
  const [studentYear, setStudentYear] = useState<StudentYear>('1');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [organization, setOrganization] = useState('');

  // Emergency & Medical
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');

  // Race & Check-in
  const [bibNumber, setBibNumber] = useState('');
  const [regType, setRegType] = useState<RegistrationType>('RUN_FREE');
  const [costumeStyle, setCostumeStyle] = useState<'sportswear' | 'ghost' | 'other'>('sportswear');
  const [costumeStyleNote, setCostumeStyleNote] = useState('');
  const [teamName, setTeamName] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [medalClaimed, setMedalClaimed] = useState(false);
  const [shirtClaimed, setShirtClaimed] = useState(false);
  const [officerNotes, setOfficerNotes] = useState('');

  // Shirt Order & Slip
  const [hasShirtOrder, setHasShirtOrder] = useState(false);
  const [shirtSize, setShirtSize] = useState<ShirtSize>('L');
  const [shirtQuantity, setShirtQuantity] = useState<number>(1);
  const [orderStatus, setOrderStatus] = useState<ShirtOrderStatus>('unpaid');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup_event' | 'shipping'>('pickup_event');
  const [shippingAddress, setShippingAddress] = useState('');
  const [slipImage, setSlipImage] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (runner) {
      setFullName(runner.fullName || '');
      setNameThai(runner.nameThai || '');
      setNameEng(runner.nameEng || '');
      setNickname(runner.nickname || '');
      setGender(runner.gender || 'unspecified');
      setAge(runner.age || 20);
      setBirthDate(runner.birthDate || '');
      setPhone(runner.phone || '');
      setEmail(runner.email || '');
      setProvince(runner.province || '');
      setCategory(runner.participantCategory || 'general');
      setStudentYear(runner.studentYear || '1');
      setStudentId(runner.studentId || '');
      setFaculty(runner.faculty || '');
      setOrganization(runner.organization || '');
      setEmergencyName(runner.emergencyContactName || '');
      setEmergencyPhone(runner.emergencyContactPhone || '');
      setEmergencyRelation(runner.emergencyContactRelation || '');
      setMedicalConditions(runner.medicalConditions || '');
      setBibNumber(runner.bibNumber || '');
      setRegType(runner.regType || 'RUN_FREE');
      setCostumeStyle(runner.costumeStyle || 'sportswear');
      setCostumeStyleNote(runner.costumeStyleNote || '');
      setTeamName(runner.teamName || '');
      setCheckedIn(runner.checkedIn || false);
      setMedalClaimed(runner.medalClaimed || false);
      setShirtClaimed(runner.shirtClaimed || false);
      setOfficerNotes(runner.officerNotes || '');

      if (linkedOrder || runner.shirtOrderId) {
        setHasShirtOrder(true);
        setShirtSize(linkedOrder?.size || (linkedOrder?.sizes?.[0] as ShirtSize) || 'L');
        setShirtQuantity(linkedOrder?.quantity || 1);
        setOrderStatus(linkedOrder?.status || 'unpaid');
        setDeliveryMethod(linkedOrder?.deliveryMethod || 'pickup_event');
        setShippingAddress(linkedOrder?.shippingAddress || '');
        setSlipImage(linkedOrder?.slipImage || '');
      } else {
        setHasShirtOrder(runner.regType === 'RUN_AND_SHIRT' || runner.regType === 'SHIRT_ONLY');
        setShirtSize('L');
        setShirtQuantity(1);
        setOrderStatus('unpaid');
        setDeliveryMethod('pickup_event');
        setShippingAddress('');
        setSlipImage('');
      }

      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [runner, linkedOrder]);

  if (!isOpen || !runner) return null;

  // Handle Slip File Selection
  const handleSlipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('ไฟล์มีขนาดใหญ่เกิน 2MB กรุณาลดขนาดรูปภาพก่อนอัปโหลด');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress image using canvas if larger than 500KB
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setSlipImage(compressed);
          setErrorMsg('');
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    setIsSaving(true);
    try {
      const updatedRunner: RunnerRegistration = {
        ...runner,
        fullName: fullName.trim(),
        nameThai: nameThai.trim() || fullName.trim(),
        nameEng: nameEng.trim(),
        nickname: nickname.trim(),
        gender,
        age: Number(age) || 20,
        birthDate: birthDate.trim(),
        phone: phone.trim(),
        email: email.trim(),
        province: province.trim(),
        participantCategory: category,
        studentYear: category === 'student' ? studentYear : undefined,
        studentId: category === 'student' ? studentId.trim() : undefined,
        faculty: faculty.trim(),
        organization: organization.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        emergencyContactRelation: emergencyRelation.trim(),
        medicalConditions: medicalConditions.trim(),
        bibNumber: bibNumber.trim() || undefined,
        regType,
        costumeStyle,
        costumeStyleNote: costumeStyle === 'other' ? costumeStyleNote.trim() : undefined,
        teamName: teamName.trim() || undefined,
        checkedIn,
        medalClaimed,
        shirtClaimed,
        officerNotes: officerNotes.trim() || undefined,
      };

      let updatedOrderData: Partial<ShirtOrder> | null = null;
      if (hasShirtOrder || linkedOrder || slipImage) {
        const orderId = linkedOrder?.orderId || runner.shirtOrderId || `ORD-${Date.now().toString().slice(-6)}`;
        updatedRunner.shirtOrderId = orderId;
        updatedOrderData = {
          orderId,
          cardId: runner.cardId,
          customerName: updatedRunner.fullName,
          phone: updatedRunner.phone,
          email: updatedRunner.email,
          size: shirtSize,
          sizes: [shirtSize],
          quantity: shirtQuantity,
          unitPrice: 300,
          totalAmount: shirtQuantity * 300,
          deliveryMethod,
          shippingAddress: deliveryMethod === 'shipping' ? shippingAddress.trim() : undefined,
          status: orderStatus,
          slipImage: slipImage || undefined,
          paymentTimestamp: slipImage ? (linkedOrder?.paymentTimestamp || new Date().toISOString()) : undefined,
        };
      }

      await onSave(updatedRunner, updatedOrderData);
      setSuccessMsg('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                แก้ไขข้อมูลผู้สมัคร ({runner.regId})
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {runner.fullName} {runner.bibNumber ? `• BIB: ${runner.bibNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> ข้อมูลทั่วไป & การติดต่อ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('race')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'race'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> การแข่งขัน & เช็กอิน
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shirt')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'shirt'
                ? 'border-[#DC2626] text-[#DC2626]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" /> เสื้อวิ่ง & สลิปโอนเงิน
          </button>
        </div>

        {/* Scrollable Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & CONTACT */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล (หลัก) *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อเล่น</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อภาษาไทย</label>
                  <input
                    type="text"
                    value={nameThai}
                    onChange={(e) => setNameThai(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อภาษาอังกฤษ</label>
                  <input
                    type="text"
                    value={nameEng}
                    onChange={(e) => setNameEng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เพศ</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as ParticipantGender)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="female">หญิง</option>
                    <option value="male">ชาย</option>
                    <option value="nonbinary">หลากหลาย / Non-binary</option>
                    <option value="unspecified">ไม่ระบุ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันเดือนปีเกิด (วว/ดด/ปปปป)</label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="เช่น 15/10/2545"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" /> เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-600" /> อีเมล
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & University Affiliation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">ประเภทผู้สมัคร & สังกัด</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">สถานะผู้สมัคร</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ParticipantCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="student">นิสิต (Student)</option>
                      <option value="alumni">ศิษย์เก่า (Alumni)</option>
                      <option value="staff">บุคลากร (Staff)</option>
                      <option value="general">บุคคลทั่วไป (General)</option>
                    </select>
                  </div>
                  {category === 'student' && (
                    <>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">ชั้นปี</label>
                        <select
                          value={studentYear}
                          onChange={(e) => setStudentYear(e.target.value as StudentYear)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                        >
                          <option value="1">ปี 1</option>
                          <option value="2">ปี 2</option>
                          <option value="3">ปี 3</option>
                          <option value="4">ปี 4</option>
                          <option value=">4">เกินปี 4 / บัณฑิตศึกษา</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">รหัสนิสิต</label>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none font-mono"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">คณะ / ภาควิชา</label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="เช่น คณะสังคมศาสตร์"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-600 mb-1">หน่วยงาน / สังกัด / มหาวิทยาลัย</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="เช่น มหาวิทยาลัยนเรศวร"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-3">
                <span className="font-bold text-amber-900 block text-xs">ผู้ติดต่อฉุกเฉิน & ข้อมูลสุขภาพ</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">ชื่อผู้ติดต่อฉุกเฉิน</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">เบอร์ผู้ติดต่อฉุกเฉิน</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">ความสัมพันธ์</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="เช่น บิดา / มารดา / เพื่อน"
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-rose-800 mb-1">โรคประจำตัว / ยาที่แพ้</label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="เช่น ไม่มี, แพ้ยาเพนนิซิลลิน, หอบหืด"
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RACE & STATUS */}
          {activeTab === 'race' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมายเลข BIB</label>
                  <input
                    type="text"
                    value={bibNumber}
                    onChange={(e) => setBibNumber(e.target.value)}
                    placeholder="เช่น BIB-1001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono font-bold text-[#DC2626]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ประเภทการสมัคร</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as RegistrationType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-bold"
                  >
                    <option value="RUN_FREE">วิ่งฟรี (RUN_FREE)</option>
                    <option value="RUN_AND_SHIRT">วิ่ง + สั่งซื้อเสื้อ (RUN_AND_SHIRT)</option>
                    <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">การแต่งกายวันงาน</label>
                  <select
                    value={costumeStyle}
                    onChange={(e) => setCostumeStyle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="sportswear">ชุดกีฬา (Sportswear)</option>
                    <option value="ghost">ชุดผีแฟนซี (Ghost Costume)</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                {costumeStyle === 'other' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">รายละเอียดชุดแต่งกาย</label>
                    <input
                      type="text"
                      value={costumeStyleNote}
                      onChange={(e) => setCostumeStyleNote(e.target.value)}
                      placeholder="เช่น ชุดแม่มด, แวมไพร์"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อทีม / กลุ่มเพื่อน</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="เช่น ทีมนักวิ่งป่าช้าแตก"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">สถานะการร่วมงาน (Check-in & Claims)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border bg-white cursor-pointer select-none border-slate-200 hover:border-emerald-300">
                    <input
                      type="checkbox"
                      checked={checkedIn}
                      onChange={(e) => setCheckedIn(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-slate-800">เช็กอินหน้างานแล้ว</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border bg-white cursor-pointer select-none border-slate-200 hover:border-amber-300">
                    <input
                      type="checkbox"
                      checked={medalClaimed}
                      onChange={(e) => setMedalClaimed(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-bold text-slate-800">รับเหรียญรางวัลแล้ว</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border bg-white cursor-pointer select-none border-slate-200 hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={shirtClaimed}
                      onChange={(e) => setShirtClaimed(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-slate-800">รับเสื้อวิ่งแล้ว</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมายเหตุเจ้าหน้าที่ (Staff Notes)</label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="บันทึกข้อความพิเศษสำหรับผู้สมัครรายนี้..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHIRT ORDER & SLIP UPLOAD */}
          {activeTab === 'shirt' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasShirtOrder}
                  onChange={(e) => setHasShirtOrder(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-bold text-blue-900 text-xs">
                  ผู้สมัครรายนี้มีรายการสั่งซื้อเสื้อ (หรือต้องการเพิ่มคำสั่งซื้อเสื้อ)
                </span>
              </label>

              {hasShirtOrder && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ไซซ์เสื้อ</label>
                      <select
                        value={shirtSize}
                        onChange={(e) => setShirtSize(e.target.value as ShirtSize)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-bold"
                      >
                        {SHIRT_SIZES.map((s) => (
                          <option key={s} value={s}>
                            ไซซ์ {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">จำนวน (ตัว)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={shirtQuantity}
                        onChange={(e) => setShirtQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ยอดเงินรวม</label>
                      <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-bold font-mono text-[#DC2626]">
                        ฿{(shirtQuantity * 300).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">สถานะคำสั่งซื้อ</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value as ShirtOrderStatus)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-bold"
                      >
                        <option value="unpaid">ยังไม่ชำระ (unpaid)</option>
                        <option value="pending_verification">รอตรวจสอบสลิป (pending_verification)</option>
                        <option value="paid">ชำระเงินแล้ว (paid)</option>
                        <option value="claimed">รับเสื้อแล้ว (claimed)</option>
                        <option value="rejected">ปฏิเสธสลิป / สลิปไม่ถูกต้อง (rejected)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">วิธีรับเสื้อ</label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      >
                        <option value="pickup_event">รับหน้างาน (31 ต.ค.)</option>
                        <option value="shipping">จัดส่งทางไปรษณีย์</option>
                      </select>
                    </div>
                  </div>

                  {deliveryMethod === 'shipping' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ที่อยู่จัดส่ง</label>
                      <textarea
                        rows={2}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  {/* SLIP UPLOAD & PREVIEW */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      หลักฐานสลิปโอนเงิน (Payment Slip)
                    </span>

                    {slipImage ? (
                      <div className="space-y-3">
                        <div className="relative inline-block border-2 border-emerald-300 rounded-2xl p-1 bg-white shadow-sm max-w-xs">
                          <img
                            src={slipImage}
                            alt="Slip Preview"
                            className="max-h-48 rounded-xl object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setSlipImage('')}
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                            title="ลบสลิปนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5 text-blue-600" /> เปลี่ยนรูปสลิปใหม่
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSlipFileUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setSlipImage('')}
                            className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-all"
                          >
                            นำรูปสลิปออก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-white space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-xs">ยังไม่มีสลิปโอนเงิน</p>
                          <p className="text-[11px] text-slate-400">อัปโหลดสลิปธนาคารเพื่อแนบในระบบ</p>
                        </div>
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all shadow-sm">
                          <Upload className="w-3.5 h-3.5" /> อัปโหลดรูปสลิปโอนเงิน
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSlipFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
