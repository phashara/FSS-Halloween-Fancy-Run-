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
  CreditCard,
  Image as ImageIcon,
  Trash2,
  Truck,
} from 'lucide-react';
import { ShirtOrder, ShirtSize, ShirtOrderStatus } from '../types';

interface ShirtOrderEditModalProps {
  isOpen: boolean;
  order: ShirtOrder | null;
  onClose: () => void;
  onSave: (updatedOrder: ShirtOrder) => Promise<void>;
}

const SHIRT_SIZES: ShirtSize[] = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', 'XS'];

export const ShirtOrderEditModal: React.FC<ShirtOrderEditModalProps> = ({
  isOpen,
  order,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [size, setSize] = useState<ShirtSize>('L');
  const [quantity, setQuantity] = useState<number>(1);
  const [totalAmount, setTotalAmount] = useState<number>(300);
  const [status, setStatus] = useState<ShirtOrderStatus>('unpaid');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup_event' | 'shipping'>('pickup_event');
  const [shippingAddress, setShippingAddress] = useState('');
  const [slipImage, setSlipImage] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName || '');
      setPhone(order.phone || '');
      setEmail(order.email || '');
      setSize(order.size || (order.sizes?.[0] as ShirtSize) || 'L');
      setQuantity(order.quantity || 1);
      setTotalAmount(order.totalAmount || (order.quantity || 1) * 300);
      setStatus(order.status || 'unpaid');
      setDeliveryMethod(order.deliveryMethod || 'pickup_event');
      setShippingAddress(order.shippingAddress || '');
      setSlipImage(order.slipImage || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleQuantityChange = (qty: number) => {
    const val = Math.max(1, qty);
    setQuantity(val);
    setTotalAmount(val * 300);
  };

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

    if (!customerName.trim()) {
      setErrorMsg('กรุณาระบุชื่อผู้สั่งซื้อ');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    setIsSaving(true);
    try {
      const updated: ShirtOrder = {
        ...order,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        size,
        sizes: [size],
        quantity,
        totalAmount,
        status,
        deliveryMethod,
        shippingAddress: deliveryMethod === 'shipping' ? shippingAddress.trim() : undefined,
        slipImage: slipImage || undefined,
        paymentTimestamp: slipImage ? (order.paymentTimestamp || new Date().toISOString()) : order.paymentTimestamp,
      };

      await onSave(updated);
      setSuccessMsg('บันทึกการแก้ไขคำสั่งซื้อสำเร็จ');
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
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              👕
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                แก้ไขคำสั่งซื้อเสื้อ ({order.orderId})
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {order.customerName} {order.cardId ? `• Card: ${order.cardId}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> ชื่อผู้สั่งซื้อ *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> เบอร์โทรศัพท์ *
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
                <Mail className="w-3.5 h-3.5 text-blue-600" /> อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Shirt Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-[#DC2626]" /> ข้อมูลเสื้อและยอดเงิน
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ไซซ์เสื้อ</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as ShirtSize)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none font-bold"
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
                  max="100"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ยอดเงินรวม (บาท)</label>
                <input
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none font-bold font-mono text-[#DC2626]"
                />
              </div>
            </div>

            {/* Status & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">สถานะคำสั่งซื้อ *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ShirtOrderStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none font-bold cursor-pointer"
                >
                  <option value="unpaid">รอชำระเงิน (unpaid)</option>
                  <option value="pending_verification">รอตรวจสอบสลิป (pending_verification)</option>
                  <option value="paid">✓ ชำระเงินแล้ว (paid)</option>
                  <option value="ready_for_pickup">พร้อมรับเสื้อ (ready_for_pickup)</option>
                  <option value="claimed">🎁 รับเสื้อเรียบร้อย (claimed)</option>
                  <option value="rejected">✕ ปฏิเสธสลิป (rejected)</option>
                  <option value="cancelled">ยกเลิกออเดอร์ (cancelled)</option>
                  <option value="refunded">คืนเงินแล้ว (refunded)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> วิธีการรับเสื้อ
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none cursor-pointer"
                >
                  <option value="pickup_event">รับหน้างาน (31 ต.ค.)</option>
                  <option value="shipping">จัดส่งทางไปรษณีย์</option>
                </select>
              </div>
            </div>

            {deliveryMethod === 'shipping' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">ที่อยู่จัดส่งทางไปรษณีย์</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Slip Upload & Preview Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
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
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขคำสั่งซื้อ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
