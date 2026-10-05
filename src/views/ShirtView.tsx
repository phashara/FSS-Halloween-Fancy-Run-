import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Upload,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Clock,
  BarChart3,
  MapPin,
  Lock,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { ShirtOrder, ShirtSize } from '../types';
import { OFFICIAL_SHIRT_SIZES } from '../data/shirtSizes';
import { EditableText } from '../components/EditableText';
import { OfficialShirtImage } from '../components/OfficialShirtImage';
import { compressImage } from '../lib/imageCompressor';

const SHIRT_SIZES = OFFICIAL_SHIRT_SIZES;

export const ShirtView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { currentCard, cards, orderShirt, orders } = useEventContext();

  const [cardId, setCardId] = useState(currentCard?.cardId || '');
  const [customerName, setCustomerName] = useState(currentCard?.fullName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizes, setSizes] = useState<ShirtSize[]>(['L']);
  const [slipImage, setSlipImage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedPromptPay, setCopiedPromptPay] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<ShirtOrder | null>(null);

  const handleCopyPromptPay = (num: string = '2178417854') => {
    navigator.clipboard?.writeText(num);
    setCopiedPromptPay(true);
    setTimeout(() => setCopiedPromptPay(false), 2000);
  };

  // Handle quantity change keeping sizes array in sync
  const handleQuantityChange = (newQty: number) => {
    const qty = Math.max(1, Math.min(20, newQty));
    setQuantity(qty);
    setSizes((prev) => {
      if (qty > prev.length) {
        const lastSize = prev[prev.length - 1] || 'L';
        return [...prev, ...Array(qty - prev.length).fill(lastSize)];
      }
      return prev.slice(0, qty);
    });
  };

  const handleSizeChange = (index: number, newSize: ShirtSize) => {
    setSizes((prev) => {
      const next = [...prev];
      next[index] = newSize;
      return next;
    });
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!customerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลผู้สั่งซื้อ');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    // Strict requirement: slip must be uploaded
    if (!slipImage) {
      setErrorMsg('⚠️ กรุณาแนบสลิปหลักฐานการโอนเงินก่อนกดยืนยันการสั่งซื้อเสื้อ');
      return;
    }

    const createdOrder = orderShirt({
      cardId: cardId || 'DIRECT_ORDER',
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      size: sizes[0] || 'L',
      sizes,
      quantity,
      deliveryMethod: 'pickup_event',
      slipImage,
    });

    setSubmittedOrder(createdOrder);
    setSuccessMsg(
      `บันทึกคำสั่งซื้อ #${createdOrder.orderId} เรียบร้อยแล้ว! เจ้าหน้าที่กำลังตรวจสอบสลิปและจะยืนยันคำสั่งซื้อของคุณทันที`
    );

    // Reset form fields
    setCustomerName('');
    setPhone('');
    setEmail('');
    setSlipImage('');
    setQuantity(1);
    setSizes(['L']);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> FSS OFFICIAL MERCHANDISE 2026
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          <EditableText
            sectionKey="shirt"
            field="title"
            fallbackText="เสื้อวิ่งที่ระลึก Glow-in-the-Dark"
          />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          <EditableText
            sectionKey="shirt"
            field="description"
            fallbackText="สั่งซื้อเสื้อราคา 300 บาท เพื่อปลดล็อกตรา SHIRT OWNER และยกระดับการ์ดผีของคุณเป็น LV.2 ปลดผนึกพลัง ทันทีที่ยืนยันยอดโอน!"
          />
        </p>
      </div>

      {/* Shirt Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Product Visual */}
            <div className="fastwork-card p-6 sm:p-8 bg-white flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
                LIMITED EDITION
              </div>

              <div className="my-4 w-full max-w-sm">
                <OfficialShirtImage />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  <EditableText
                    sectionKey="shirt_page"
                    field="title"
                    fallbackText="FSS Halloween Fancy Run 2026 Ghost Jersey"
                  />
                </h3>
                <p className="text-2xl font-black text-[#DC2626] font-mono">
                  ฿ <EditableText sectionKey="shirt_page" field="price" fallbackText="300" /> <span className="text-xs font-normal text-slate-500">/ ตัว</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  <EditableText
                    sectionKey="shirt_page"
                    field="description"
                    fallbackText="เสื้อคอซิป Half-Zip ผ้า Dry-Tech ระบายเหงื่อยอดเยี่ยม สกรีนลายยันต์ FSS และลายผีไทยเรืองแสง"
                  />
                </p>
              </div>
            </div>

            {/* Size Chart & Perks */}
            <div className="space-y-4">
              <div className="fastwork-card p-6 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <EditableText
                    sectionKey="shirt_page"
                    field="tagline"
                    fallbackText="ตารางไซซ์เสื้อ (หน่วยเป็นนิ้ว)"
                  />
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">ไซซ์ (Size)</th>
                        <th className="py-2.5 px-3">รอบอก (นิ้ว)</th>
                        <th className="py-2.5 px-3">ความยาว (นิ้ว)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {SHIRT_SIZES.map((item) => (
                        <tr key={item.size} className="hover:bg-red-50/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#DC2626]">{item.size}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-medium">{item.chestInches}"</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.lengthInches}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-400">
                  *แนะนำให้วัดรอบอกเสื้อตัวโปรดเพื่อเปรียบเทียบขนาดที่พอดีตัว
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-red-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-[#DC2626] block mb-0.5">
                    สั่งซื้อเสื้อที่ระลึกอย่างเป็นทางการ
                  </span>
                  เมื่อทีมงานตรวจสอบยอดโอนแล้ว ระบบจะยืนยันคำสั่งซื้อเสื้อที่ระลึกของคุณและจัดเตรียมสินค้าให้อย่างเป็นทางการทันที!
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="fastwork-card p-6 sm:p-8 bg-white space-y-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#DC2626]" /> แบบฟอร์มสั่งซื้อเสื้อที่ระลึก
            </h3>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B67A] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุลผู้สั่งซื้อ *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">อีเมล (ถ้ามี)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>

                {/* Quantity Selector */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block font-bold text-slate-900 text-xs">
                        จำนวนเสื้อที่ต้องการสั่ง (ตัว) *
                      </label>
                      <p className="text-[11px] text-slate-500">
                        สั่งซื้อกี่ตัว ระบบจะให้เลือกไซซ์ตามจำนวนตัวที่สั่ง (ตัวละ 300 บาท)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 font-bold border border-slate-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        className="w-14 h-8 text-center rounded-lg bg-white border border-slate-200 text-[#DC2626] font-mono text-sm font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= 20}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-900 font-bold border border-slate-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-600">ตัว</span>
                    </div>
                  </div>
                </div>

                {/* Size Pickers */}
                <div className="sm:col-span-2 space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <label className="text-xs font-bold text-slate-900">
                      เลือกไซซ์เสื้อให้ครบทุกตัว ({quantity} ตัว) *
                    </label>
                    <span className="text-xs text-[#DC2626] font-semibold">
                      {sizes.map((s, i) => `ตัวที่ ${i + 1}: ${s}`).join(' &middot; ')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sizes.map((currentSize, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="text-xs font-bold text-slate-700">
                          เสื้อตัวที่ {index + 1} (ไซซ์: <b className="text-[#DC2626]">{currentSize}</b>)
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {SHIRT_SIZES.map((item) => {
                            const isSelected = currentSize === item.size;
                            return (
                              <button
                                key={item.size}
                                type="button"
                                onClick={() => handleSizeChange(index, item.size)}
                                title={`ไซซ์ ${item.size} - รอบอก ${item.chestLabel} ความยาว ${item.lengthLabel}`}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all border ${
                                  isSelected
                                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-red-300'
                                }`}
                              >
                                {item.size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Note */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>วิธีรับเสื้อ: รับที่คณะสังคมศาสตร์ ม.นเรศวร ในวันงาน (31 ต.ค. 2569) เวลา 17:00 – 18:00 น. (ฟรีค่าส่ง 0 บาท)</span>
                </div>
              </div>

              {/* Payment & Slip Upload */}
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
                        <EditableText sectionKey="shirt_page" field="accountNo" fallbackText="217-8-41785-4" />
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
                      ชื่อบัญชี: <span className="font-bold text-slate-900"><EditableText sectionKey="shirt_page" field="accountName" fallbackText="น.ส.พริมรตา ใจเฉียง" /></span>
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                    <span className="text-xs text-slate-500 block">ยอดรวมทั้งสิ้น ({quantity} ตัว):</span>
                    <span className="text-2xl font-black text-[#DC2626] font-mono">
                      ฿{(300 * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Slip Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>แนบสลิปหลักฐานการโอนเงิน *</span>
                    {!slipImage && (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        จำเป็นต้องแนบสลิป
                      </span>
                    )}
                  </label>

                  {!slipImage ? (
                    <div className="p-6 rounded-xl bg-white border-2 border-dashed border-slate-300 text-center space-y-2">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        อัปโหลดรูปภาพสลิปหลักฐานการโอนเงิน (ยอด ฿{(300 * quantity).toLocaleString()})
                      </p>
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
                          <img src={slipImage} alt="Slip preview" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-[#00B67A]" /> แนบสลิปเรียบร้อยแล้ว
                          </p>
                          <p className="text-[11px] text-emerald-700">พร้อมสำหรับการยืนยันคำสั่งซื้อ</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSlipImage('')}
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!slipImage}
                className={`w-full py-3.5 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                  slipImage
                    ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {slipImage ? (
                  <>
                    <span>ยืนยันการสั่งซื้อเสื้อ {quantity} ตัว (฿{(300 * quantity).toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>กรุณาแนบสลิปโอนเงินเพื่อกดยืนยันคำสั่งซื้อ</span>
                  </>
                )}
              </button>
            </form>
          </div>

      {/* Thank You / Order Success Modal */}
      {submittedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setSubmittedOrder(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Celebration */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
                🎉
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ขอขอบคุณสำหรับการสั่งซื้อเสื้อที่ระลึก!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                ระบบได้บันทึกคำสั่งซื้อของคุณเข้าสู่ระบบเรียบร้อยแล้ว
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">หมายเลขคำสั่งซื้อ (Order ID)</span>
                <span className="font-mono font-black text-[#DC2626] text-base">
                  #{submittedOrder.orderId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">ผู้สั่งซื้อ:</span>
                <span className="font-bold text-slate-800">{submittedOrder.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                <span className="font-medium text-slate-800">{submittedOrder.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">จำนวน & ไซซ์:</span>
                <span className="font-bold text-slate-900">
                  {submittedOrder.quantity} ตัว (ไซซ์: {submittedOrder.sizes?.join(', ') || submittedOrder.size})
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">ยอดเงินรวมทั้งสิ้น:</span>
                <span className="font-black text-[#DC2626] text-lg font-mono">
                  ฿{(submittedOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> รอเจ้าหน้าที่ตรวจสอบสลิปโอนเงิน
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              ฝ่ายการเงินจะทำการตรวจสอบความถูกต้องของสลิปโอนเงิน ขอบคุณที่ร่วมสนับสนุนกิจกรรม <b>FSS Halloween Fancy Run 2026</b>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSubmittedOrder(null);
                  onNavigate('home');
                }}
                className="flex-1 py-3 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                กลับหน้าหลัก
              </button>
              <button
                type="button"
                onClick={() => setSubmittedOrder(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors text-center cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
