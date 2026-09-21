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
  Truck,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { ShirtSize } from '../types';
import { EditableText } from '../components/EditableText';
import { ShirtDashboard } from '../components/ShirtDashboard';

export const ShirtView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { currentCard, cards, orderShirt, orders } = useEventContext();

  const [activeTab, setActiveTab] = useState<'order' | 'dashboard'>('order');
  const [cardId, setCardId] = useState(currentCard?.cardId || '');
  const [customerName, setCustomerName] = useState(currentCard?.fullName || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [size, setSize] = useState<ShirtSize>('L');
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup_event' | 'shipping'>('pickup_event');
  const [shippingAddress, setShippingAddress] = useState('');
  const [slipImage, setSlipImage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    if (deliveryMethod === 'shipping' && !shippingAddress.trim()) {
      setErrorMsg('กรุณาระบุที่อยู่สำหรับจัดส่งทางไปรษณีย์');
      return;
    }

    const createdOrder = orderShirt({
      cardId,
      customerName,
      phone,
      email,
      size,
      quantity,
      deliveryMethod,
      shippingAddress,
      slipImage: slipImage || undefined,
    });

    setSuccessMsg(
      `บันทึกคำสั่งซื้อ #${createdOrder.orderId} เรียบร้อยแล้ว! ${
        slipImage
          ? 'เจ้าหน้าที่กำลังตรวจสอบสลิป เมื่ออนุมัติแล้วการ์ดจะอัปเกรดเป็น LV.2/LV.3 ทันที'
          : 'กรุณาโอนเงินและส่งสลิปเพื่อปลดล็อกตรา SHIRT OWNER'
      }`
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
            fallbackText="สั่งซื้อเสื้อราคา 390 บาท เพื่อปลดล็อกตรา SHIRT OWNER และยกระดับการ์ดผีของคุณเป็น LV.2 หรือ LV.3 (ULTIMATE GHOST) ทันทีที่ยืนยันยอดโอน!"
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

          <div className="my-6 relative flex items-center justify-center">
            <Shirt className="w-48 h-48 sm:w-56 sm:h-56 text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]" />
            <div className="absolute bottom-2 bg-slate-950/90 text-emerald-400 text-[11px] font-mono px-3 py-1 rounded-full border border-emerald-500/40">
              เรืองแสงในที่มืด 100%
            </div>
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
              ฿ <EditableText sectionKey="shirt_page" field="price" fallbackText="390" /> / ตัว
            </p>
            <p className="text-xs text-slate-400">
              <EditableText
                sectionKey="shirt_page"
                field="description"
                fallbackText="เนื้อผ้า Micro Polyester ระบายเหงื่อยอดเยี่ยม แห้งไว ใส่สบาย"
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ไซซ์เสื้อ</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as ShirtSize)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="XS">XS (รอบอก 34&quot;)</option>
                <option value="S">S (รอบอก 36&quot;)</option>
                <option value="M">M (รอบอก 38&quot;)</option>
                <option value="L">L (รอบอก 40&quot;)</option>
                <option value="XL">XL (รอบอก 42&quot;)</option>
                <option value="2XL">2XL (รอบอก 44&quot;)</option>
                <option value="3XL">3XL (รอบอก 48&quot;)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">จำนวน (ตัว)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">วิธีรับเสื้อ</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="pickup_event">รับที่จุดรับของที่ระลึกวันงาน (ไม่มีค่าจัดส่ง)</option>
                <option value="shipping">จัดส่งถึงบ้าน (+50 บาท)</option>
              </select>
            </div>

            {deliveryMethod === 'shipping' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ที่อยู่จัดส่งพัสดุ *
                </label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="บ้านเลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-[#140e28] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> บัญชีชำระเงิน FSS Halloween Fancy Run
              </div>
              <p className="text-sm font-bold text-white mt-1">
                <EditableText sectionKey="shirt_page" field="bankName" fallbackText="ธนาคารกสิกรไทย" />: <EditableText sectionKey="shirt_page" field="accountNo" fallbackText="098-7-65432-1" />
              </p>
              <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
                ยอดรวม: {390 * quantity + (deliveryMethod === 'shipping' ? 50 : 0)} บาท
              </div>
            </div>

            {/* Slip Upload */}
            <div className="w-full sm:w-auto">
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                {slipImage ? 'เปลี่ยนรูปสลิป' : 'อัปโหลดสลิปโอนเงิน'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSlipImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {slipImage && (
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">✓ แนบสลิปแล้ว</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-950/50 transition-all flex items-center justify-center gap-2"
          >
            <span>ยืนยันการสั่งซื้อเสื้อ</span>
            <ArrowRight className="w-5 h-5" />
          </button>
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
                    ไซซ์ {ord.size} ({ord.quantity} ตัว) • ฿{ord.totalAmount}
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    Card ID: {ord.cardId} | {ord.deliveryMethod === 'pickup_event' ? 'รับที่งาน' : 'จัดส่งถึงบ้าน'}
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
