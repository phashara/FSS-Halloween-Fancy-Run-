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
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { ShirtSize } from '../types';
import { EditableText } from '../components/EditableText';
import { ShirtDashboard } from '../components/ShirtDashboard';
import { OfficialShirtImage } from '../components/OfficialShirtImage';
import { compressImage } from '../lib/imageCompressor';

const SHIRT_SIZES: { size: ShirtSize; chest: string }[] = [
  { size: 'XS', chest: '34"' },
  { size: 'S', chest: '36"' },
  { size: 'M', chest: '38"' },
  { size: 'L', chest: '40"' },
  { size: 'XL', chest: '42"' },
  { size: '2XL', chest: '44"' },
  { size: '3XL', chest: '48"' },
];

export const ShirtView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { currentCard, cards, orderShirt, orders } = useEventContext();

  const [activeTab, setActiveTab] = useState<'order' | 'dashboard'>('order');
  const [cardId, setCardId] = useState(currentCard?.cardId || '');
  const [customerName, setCustomerName] = useState(currentCard?.fullName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizes, setSizes] = useState<ShirtSize[]>(['L']);
  const [slipImage, setSlipImage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  // Find user's existing orders
  const myOrders = orders.filter((o) => o.cardId === cardId || (currentCard && o.cardId === currentCard.cardId));

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
    if (!cardId.trim()) {
      setErrorMsg('กรุณากรอก Card ID หรือกดปุ่ม "ยังไม่มีการ์ดผี" เพื่อสมัครวิ่งก่อน');
      return;
    }
    // Strict requirement: slip must be uploaded
    if (!slipImage) {
      setErrorMsg('⚠️ กรุณาแนบสลิปหลักฐานการโอนเงินก่อนกดยืนยันการสั่งซื้อเสื้อ');
      return;
    }

    const createdOrder = orderShirt({
      cardId,
      customerName,
      phone,
      email,
      size: sizes[0] || 'L',
      sizes,
      quantity,
      deliveryMethod: 'pickup_event',
      slipImage,
    });

    setSuccessMsg(
      `บันทึกคำสั่งซื้อ #${createdOrder.orderId} เรียบร้อยแล้ว! (จำนวน ${quantity} ตัว - ไซซ์: ${sizes.join(', ')}) เจ้าหน้าที่กำลังตรวจสอบสลิป เมื่ออนุมัติแล้วการ์ดจะอัปเกรดเป็น LV.2/LV.3 ทันที`
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> FSS OFFICIAL MERCHANDISE & CARD UPGRADE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight">
          <EditableText
            sectionKey="shirt"
            field="title"
            fallbackText="เสื้อวิ่งที่ระลึก Glow-in-the-Dark"
          />
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          <EditableText
            sectionKey="shirt"
            field="description"
            fallbackText="สั่งซื้อเสื้อราคา 300 บาท เพื่อปลดล็อกตรา SHIRT OWNER และยกระดับการ์ดผีของคุณเป็น LV.2 หรือ LV.3 (ULTIMATE GHOST) ทันทีที่ยืนยันยอดโอน!"
          />
        </p>
      </div>

      {/* View Switcher Tabs: Order Form vs Shirt Dashboard */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'order'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>สั่งซื้อเสื้อที่ระลึก (Order Shirt)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>แดชบอร์ดสรุปยอด ({orders.reduce((sum, o) => sum + (o.quantity || 1), 0)} ตัว)</span>
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <ShirtDashboard orders={orders} onNavigateToOrderForm={() => setActiveTab('order')} />
      ) : (
        <>
          {/* Shirt Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Product Visual */}
        <div className="rounded-3xl bg-gradient-to-b from-[#1c1230] via-[#100b1e] to-[#0a0714] border border-amber-500/40 p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full shadow-lg">
            LIMITED EDITION
          </div>

          <div className="my-4 w-full">
            <OfficialShirtImage />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              <EditableText
                sectionKey="shirt_page"
                field="title"
                fallbackText="FSS Halloween Fancy Run 2026 Ghost Jersey"
              />
            </h3>
            <p className="text-2xl font-black text-amber-400 font-mono">
              ฿ <EditableText sectionKey="shirt_page" field="price" fallbackText="300" /> / ตัว
            </p>
            <p className="text-xs text-slate-400">
              <EditableText
                sectionKey="shirt_page"
                field="description"
                fallbackText="เสื้อคอซิป Half-Zip ผ้า Dry-Tech ระบายเหงื่อยอดเยี่ยม สกรีนลายยันต์ FSS และลายผีไทยเรืองแสง"
              />
            </p>
          </div>
        </div>

        {/* Size Chart & Perks */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              <EditableText
                sectionKey="shirt_page"
                field="tagline"
                fallbackText="ตารางไซซ์เสื้อ (หน่วยเป็นนิ้ว)"
              />
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="py-2 px-3">ไซซ์</th>
                    <th className="py-2 px-3">รอบอก</th>
                    <th className="py-2 px-3">ความยาว</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">XS</td>
                    <td className="py-2 px-3">34 นิ้ว</td>
                    <td className="py-2 px-3">25 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">S</td>
                    <td className="py-2 px-3">36 นิ้ว</td>
                    <td className="py-2 px-3">26 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">M</td>
                    <td className="py-2 px-3">38 นิ้ว</td>
                    <td className="py-2 px-3">27 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">L</td>
                    <td className="py-2 px-3">40 นิ้ว</td>
                    <td className="py-2 px-3">28 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">XL</td>
                    <td className="py-2 px-3">42 นิ้ว</td>
                    <td className="py-2 px-3">29 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">2XL</td>
                    <td className="py-2 px-3">44 นิ้ว</td>
                    <td className="py-2 px-3">30 นิ้ว</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-amber-400">3XL</td>
                    <td className="py-2 px-3">48 นิ้ว</td>
                    <td className="py-2 px-3">31 นิ้ว</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400">
              *แนะนำให้วัดรอบอกเสื้อตัวโปรดเพื่อเปรียบเทียบขนาดที่พอดีตัว
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-purple-200 block mb-0.5">
                กลไก Level-Up การ์ดผีอัตโนมัติ
              </span>
              หมายเลข Card ID เดียวกับตอนที่คุณสมัคร เมื่อทีมงานตรวจสอบยอดโอน ระบบจะติดตรา <b>SHIRT OWNER</b> เพิ่มพลังความเร็ว +6 และปลดล็อกเป็น <b>LV.2</b> หรือหากคุณเคยเขียนเรื่องสยองขวัญแล้ว จะอัปเกรดเป็น <b>LV.3 (ULTIMATE GHOST)</b> ทันที!
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Shirt className="w-5 h-5 text-amber-400" /> แบบฟอร์มสั่งซื้อเสื้อ
        </h3>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                หมายเลขการ์ดผีของคุณ (Card ID) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value.toUpperCase())}
                  placeholder="เช่น FSS26-00872"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono text-sm uppercase focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs whitespace-nowrap"
                >
                  ยังไม่มีการ์ด? สมัครก่อน
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ชื่อ-นามสกุลผู้สั่งซื้อ *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Quantity Selector */}
            <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
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
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-16 h-9 text-center rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 20}
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
                      quantity === cnt
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
            <div className="sm:col-span-2 space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-[#18112e]/60 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-amber-400" />
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    เลือกไซซ์เสื้อให้ครบทุกตัว (ทั้งหมด {quantity} ตัว) *
                  </label>
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  {sizes.map((s, i) => `ตัวที่ ${i + 1}: ${s}`).join(' • ')}
                </div>
              </div>

              <div className="space-y-3">
                {sizes.map((currentSize, index) => (
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
                      {SHIRT_SIZES.map((item) => {
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
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>วิธีรับเสื้อ: รับที่การจัดงานเท่านั้น (ไม่มีแบบจัดส่ง)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                📍 จุดรับของที่ระลึกและเสื้อวิ่ง ณ บริเวณลานกิจกรรม คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ในวันงาน (31 ตุลาคม 2569) เวลา 16:30 เป็นต้นไป
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" /> รับที่หน้างานไม่มีค่าจัดส่ง (ฟรี 0 บาท)
              </div>
            </div>
          </div>

          {/* Payment & Slip Upload */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#140e28] to-slate-950 border border-amber-500/30 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> บัญชีชำระเงิน FSS Halloween Fancy Run
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  <EditableText sectionKey="shirt_page" field="bankName" fallbackText="ธนาคารกสิกรไทย" />: <EditableText sectionKey="shirt_page" field="accountNo" fallbackText="098-7-65432-1" />
                </p>
                <p className="text-xs text-slate-400 mt-0.5">ชื่อบัญชี: สโมสรนิสิตคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                <span className="text-xs text-slate-400 block">ยอดรวมทั้งสิ้น ({quantity} ตัว):</span>
                <span className="text-3xl font-black text-amber-400 font-mono">
                  ฿{(300 * quantity).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">300 บาท × {quantity} ตัว (ไม่มีค่าส่ง)</span>
              </div>
            </div>

            {/* Slip Upload - STRICT REQUIREMENT */}
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
                      กรุณาแนบรูปภาพสลิปหลักฐานการโอนเงิน (ยอด ฿{(300 * quantity).toLocaleString()})
                    </p>
                    <p className="text-[11px] text-rose-400 font-medium mt-0.5">
                      *ระบบไม่อนุญาตให้กดยืนยันสั่งซื้อหากยังไม่มีการแนบสลิปโอนเงิน
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
                        พร้อมสำหรับการยืนยันคำสั่งซื้อเสื้อ
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

          {/* Submit Button - LOCKED IF NO SLIP */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={!slipImage}
              className={`w-full py-4 font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                slipImage
                  ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 shadow-orange-950/60 cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              {slipImage ? (
                <>
                  <span>ยืนยันการสั่งซื้อเสื้อ {quantity} ตัว (฿{(300 * quantity).toLocaleString()})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500/70" />
                  <span>กรุณาแนบสลิปโอนเงินเพื่อกดยืนยันคำสั่งซื้อ</span>
                </>
              )}
            </button>

            {!slipImage && (
              <p className="text-center text-xs text-amber-400/80 font-medium">
                *ปุ่มยืนยันจะเปิดใช้งานอัตโนมัติเมื่อท่านอัปโหลดรูปสลิปหลักฐานการโอนเงิน
              </p>
            )}
          </div>
        </form>
      </div>

      {/* User's Existing Orders list */}
      {myOrders.length > 0 && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> คำสั่งซื้อของคุณ ({myOrders.length} รายการ)
          </h4>
          <div className="space-y-2.5">
            {myOrders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-amber-400 mr-2">{ord.orderId}</span>
                  <span className="text-slate-300">
                    ไซซ์ {ord.sizes && ord.sizes.length > 0 ? ord.sizes.join(', ') : ord.size} ({ord.quantity} ตัว) • ฿{ord.totalAmount?.toLocaleString()}
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    Card ID: {ord.cardId} | รับที่หน้างาน คณะสังคมศาสตร์ ม.นเรศวร
                  </span>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : ord.status === 'claimed'
                        ? 'bg-blue-950 text-blue-300 border border-blue-600'
                        : ord.status === 'pending_verification'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ord.status === 'paid'
                      ? '✓ ชำระแล้ว (การ์ดอัปเกรดแล้ว)'
                      : ord.status === 'claimed'
                      ? '✓ รับเสื้อแล้ว'
                      : ord.status === 'pending_verification'
                      ? 'รอตรวจสอบสลิป'
                      : 'รอชำระเงิน'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
