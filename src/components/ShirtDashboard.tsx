import React, { useState, useMemo } from 'react';
import {
  Shirt,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  FileText,
  UserCheck,
  Pencil,
  Trash2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ShirtOrder, ShirtSize } from '../types';
import { OFFICIAL_SHIRT_SIZES } from '../data/shirtSizes';

interface Props {
  orders: ShirtOrder[];
  onOrderClick?: (order: ShirtOrder) => void;
  onNavigateToOrderForm?: () => void;
  onEditOrder?: (order: ShirtOrder) => void;
  onDeleteOrder?: (order: ShirtOrder) => void;
  isShirtPreorderClosed?: boolean;
  onTogglePreorder?: () => void;
}

export const ShirtDashboard: React.FC<Props> = ({
  orders = [],
  onOrderClick,
  onNavigateToOrderForm,
  onEditOrder,
  onDeleteOrder,
  isShirtPreorderClosed,
  onTogglePreorder,
}) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [filterQty, setFilterQty] = useState<'all' | 'single' | 'multi' | 'duplicates'>('all');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Aggregations
  const totalShirts = safeOrders.reduce((sum, ord) => sum + (ord.quantity || 1), 0);
  const totalRevenue = safeOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

  // Single vs Multi-shirt order breakdown
  const singleShirtOrders = useMemo(
    () => safeOrders.filter((o) => (o.quantity || 1) === 1),
    [safeOrders]
  );
  const multiShirtOrders = useMemo(
    () => safeOrders.filter((o) => (o.quantity || 1) > 1),
    [safeOrders]
  );
  const multiShirtsTotalQty = useMemo(
    () => multiShirtOrders.reduce((sum, o) => sum + (o.quantity || 1), 0),
    [multiShirtOrders]
  );

  // Potential duplicates detection (same phone or customer name)
  const duplicateOrderIds = useMemo(() => {
    const phoneMap = new Map<string, ShirtOrder[]>();
    const nameMap = new Map<string, ShirtOrder[]>();

    safeOrders.forEach((o) => {
      const cleanPhone = (o.phone || '').replace(/\D/g, '');
      if (cleanPhone.length >= 8) {
        const list = phoneMap.get(cleanPhone) || [];
        list.push(o);
        phoneMap.set(cleanPhone, list);
      }
      const cleanName = (o.customerName || '').trim().toLowerCase();
      if (cleanName.length >= 3) {
        const list = nameMap.get(cleanName) || [];
        list.push(o);
        nameMap.set(cleanName, list);
      }
    });

    const dupes = new Set<string>();
    phoneMap.forEach((list) => {
      if (list.length > 1) list.forEach((o) => dupes.add(o.orderId));
    });
    nameMap.forEach((list) => {
      if (list.length > 1) list.forEach((o) => dupes.add(o.orderId));
    });
    return dupes;
  }, [safeOrders]);

  // Revenue by status
  const paidOrders = safeOrders.filter((o) => o.status === 'paid' || o.status === 'claimed');
  const paidShirts = paidOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = safeOrders.filter((o) => o.status === 'pending_verification');
  const pendingShirts = pendingOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const unpaidOrders = safeOrders.filter((o) => o.status === 'unpaid');
  const unpaidShirts = unpaidOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Delivery breakdown (supports both 'shipping' and 'delivery_postal')
  const pickupOrders = safeOrders.filter((o) => o.deliveryMethod === 'pickup_event');
  const pickupShirts = pickupOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
  const shippingOrders = safeOrders.filter(
    (o) => o.deliveryMethod === 'shipping' || (o.deliveryMethod as any) === 'delivery_postal'
  );
  const shippingShirts = shippingOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  // Size breakdown: accurately derived from ord.sizes to count each piece correctly
  const ALL_SIZES: { size: ShirtSize; chest: string }[] = OFFICIAL_SHIRT_SIZES.map((item) => ({
    size: item.size,
    chest: item.chestLabel,
  }));

  // Detect any extra sizes present in orders (such as legacy 'XS')
  const extraSizes = useMemo(() => {
    const set = new Set<string>();
    safeOrders.forEach((ord) => {
      if (Array.isArray(ord.sizes)) {
        ord.sizes.forEach((s) => {
          if (!ALL_SIZES.some((x) => x.size === s)) set.add(s);
        });
      } else if (ord.size && !ALL_SIZES.some((x) => x.size === ord.size)) {
        set.add(ord.size);
      }
    });
    return Array.from(set);
  }, [safeOrders, ALL_SIZES]);

  const DISPLAY_SIZES = useMemo(() => {
    return [
      ...ALL_SIZES,
      ...extraSizes.map((s) => ({ size: s as ShirtSize, chest: '-' })),
    ];
  }, [ALL_SIZES, extraSizes]);

  const sizeCounts: Record<string, { count: number; revenue: number; ordersCount: number }> = {};
  DISPLAY_SIZES.forEach(({ size }) => {
    sizeCounts[size] = { count: 0, revenue: 0, ordersCount: 0 };
  });

  safeOrders.forEach((ord) => {
    const qty = ord.quantity || 1;
    const unitPrice = ord.unitPrice || 300;
    const orderSizes =
      Array.isArray(ord.sizes) && ord.sizes.length > 0
        ? ord.sizes
        : [ord.size || 'L'];

    // Accurately map each individual shirt piece to its chosen size
    for (let i = 0; i < qty; i++) {
      const s = (orderSizes[i] || orderSizes[0] || ord.size || 'L') as string;
      if (!sizeCounts[s]) {
        sizeCounts[s] = { count: 0, revenue: 0, ordersCount: 0 };
      }
      sizeCounts[s].count += 1;
      sizeCounts[s].revenue += unitPrice;
    }

    // Tally orders that ordered this size
    const uniqueSizesInOrder = new Set(orderSizes.slice(0, qty));
    uniqueSizesInOrder.forEach((s) => {
      if (sizeCounts[s]) {
        sizeCounts[s].ordersCount += 1;
      }
    });
  });

  // Find most popular size
  let maxCount = 0;
  let topSize: ShirtSize | null = null;
  DISPLAY_SIZES.forEach(({ size }) => {
    if (sizeCounts[size].count > maxCount) {
      maxCount = sizeCounts[size].count;
      topSize = size;
    }
  });

  // Filtered orders list
  const filteredOrders = safeOrders.filter((ord) => {
    const q = searchTerm.toLowerCase();
    const matchQuery =
      !searchTerm ||
      ord.orderId.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.cardId.toLowerCase().includes(q) ||
      ord.phone.includes(q) ||
      (ord.email || '').toLowerCase().includes(q);

    const orderSizes = Array.isArray(ord.sizes) && ord.sizes.length > 0 ? ord.sizes : [ord.size];
    const matchSize =
      filterSize === 'all' ||
      ord.size === filterSize ||
      orderSizes.includes(filterSize as ShirtSize);
    const matchStatus = filterStatus === 'all' || ord.status === filterStatus;
    const matchDelivery =
      filterDelivery === 'all' ||
      ord.deliveryMethod === filterDelivery ||
      (filterDelivery === 'shipping' && (ord.deliveryMethod as any) === 'delivery_postal');

    let matchQty = true;
    if (filterQty === 'single') matchQty = (ord.quantity || 1) === 1;
    if (filterQty === 'multi') matchQty = (ord.quantity || 1) > 1;
    if (filterQty === 'duplicates') matchQty = duplicateOrderIds.has(ord.orderId);

    return matchQuery && matchSize && matchStatus && matchDelivery && matchQty;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Card ID', 'Customer Name', 'Phone', 'Size', 'Quantity', 'Total Amount', 'Delivery Method', 'Status', 'Timestamp'];
    const rows = safeOrders.map((o) => [
      o.orderId,
      o.cardId,
      `"${o.customerName}"`,
      o.phone,
      o.size,
      o.quantity,
      o.totalAmount,
      o.deliveryMethod === 'pickup_event' ? 'รับหน้างาน' : 'จัดส่งไปรษณีย์',
      o.status,
      o.paymentTimestamp || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FSS_Shirt_Orders_Dashboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-slate-900 border border-orange-500/30 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" /> LIVE DASHBOARD • แดชบอร์ดสรุปยอดเสื้อเรืองแสง
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
            สรุปยอดสั่งจองเสื้อ Glow-in-the-Dark
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            ระบบคำนวณและประมวลผลจำนวนเสื้อ ยอดเงิน สถิติแยกตามไซซ์ และสถานะการชำระเงินแบบเรียลไทม์
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>ส่งออก CSV</span>
          </button>
          {onNavigateToOrderForm && (
            <button
              type="button"
              onClick={onNavigateToOrderForm}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-orange-950/50"
            >
              <Shirt className="w-4 h-4" />
              <span>สั่งซื้อเสื้อเพิ่ม</span>
            </button>
          )}
        </div>
      </div>

      {/* Pre-order Status & Production Window Banner */}
      <div
        className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
          isShirtPreorderClosed
            ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/40'
            : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border-emerald-500/40'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg shadow-inner ${
              isShirtPreorderClosed
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isShirtPreorderClosed ? '🔒' : '👕'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                  isShirtPreorderClosed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isShirtPreorderClosed ? '🔴 ปิดรับสั่งเสื้อรอบ Pre-Order แล้ว' : '🟢 เปิดรับสั่งเสื้อรอบ Pre-Order'}
              </span>
              <span className="text-xs text-slate-400">
                (การรับสมัครวิ่งฟรี: <b>ยังเปิดรับตามปกติ 100%</b>)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isShirtPreorderClosed
                ? 'กำลังสรุปยอดสั่งเสื้อทั้งหมดส่งโรงงานตัดเย็บ เพื่อผลิตให้ทันวันจัดกิจกรรม 31 ต.ค. 2569'
                : 'เปิดรับคำสั่งซื้อเสื้อที่ระลึกและพรีออเดอร์ตามปกติ'}
            </p>
          </div>
        </div>

        {onTogglePreorder && (
          <button
            type="button"
            onClick={onTogglePreorder}
            className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isShirtPreorderClosed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isShirtPreorderClosed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>เปิดรับสั่งเสื้อใหม่ (ปีหน้า/รอบเก็บตก)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>ปิดรับสั่งเสื้อ (ตัดรอบส่งโรงงาน)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Shirts */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-orange-500/40 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shirt className="w-20 h-20 text-orange-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-orange-400 font-semibold mb-1">
            <span>ยอดรวมจำนวนเสื้อ</span>
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Shirt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {totalShirts.toLocaleString()}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">ตัว</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">ชำระแล้ว: {paidShirts} ตัว</span>
            <span className="text-amber-400 font-medium">รอตรวจ: {pendingShirts} ตัว</span>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-20 h-20 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>ยอดเงินรวมทั้งหมด</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">รับเงินแล้ว ฿{paidRevenue.toLocaleString()}</span>
            <span className="text-amber-400">รอตรวจ ฿{pendingRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package className="w-20 h-20 text-purple-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
            <span>จำนวนคำสั่งซื้อ</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {(orders?.length || 0).toLocaleString()}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">ออเดอร์</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>เฉลี่ย {(totalShirts / ((orders?.length) || 1)).toFixed(1)} ตัว/ออเดอร์</span>
            <span className="text-purple-400 font-bold">฿300 / ตัว</span>
          </div>
        </div>

        {/* Card 4: Delivery Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/40 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Truck className="w-20 h-20 text-blue-400" />
          </div>
          <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
            <span>ช่องทางการรับเสื้อ</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-white mt-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">🏢 รับหน้างาน ม.นเรศวร:</span>
              <span className="font-mono text-blue-400 font-black">{pickupShirts} ตัว</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">📦 จัดส่งไปรษณีย์:</span>
              <span className="font-mono text-amber-400 font-black">{shippingShirts} ตัว</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              รับงาน {totalShirts > 0 ? Math.round((pickupShirts / totalShirts) * 100) : 0}%
            </span>
            <span>
              ส่งบ้าน {totalShirts > 0 ? Math.round((shippingShirts / totalShirts) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Order vs Quantity Diagnostic & Audit Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                ตรวจเช็กความสัมพันธ์: ยอดคำสั่งซื้อ ({orders.length} ออเดอร์) รวมเสื้อ ({totalShirts} ตัว)
              </h4>
              <p className="text-xs text-slate-400">
                วิเคราะห์สัดส่วนจำนวนเสื้อต่อออเดอร์ ตรวจจับรายการที่สั่งมากกว่า 1 ตัว และรายการที่อาจซ้ำซ้อน
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
              เฉลี่ย {(totalShirts / (orders.length || 1)).toFixed(2)} ตัว / ออเดอร์
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Card 1: 1-piece orders */}
          <button
            type="button"
            onClick={() => setFilterQty(filterQty === 'single' ? 'all' : 'single')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterQty === 'single'
                ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>สั่งซื้อ 1 ตัว/ออเดอร์</span>
              <span className="font-mono font-bold text-blue-400">{singleShirtOrders.length} ออเดอร์</span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              {singleShirtOrders.length}{' '}
              <span className="text-xs font-normal text-slate-400">ตัว ({totalShirts > 0 ? Math.round((singleShirtOrders.length / totalShirts) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-blue-400/80 mt-1">คลิกเพื่อกรองเฉพาะออเดอร์ 1 ตัว</div>
          </button>

          {/* Card 2: Multi-piece orders */}
          <button
            type="button"
            onClick={() => setFilterQty(filterQty === 'multi' ? 'all' : 'multi')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterQty === 'multi'
                ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-amber-300 font-semibold">สั่งซื้อ &gt;1 ตัว/ออเดอร์ 🔥</span>
              <span className="font-mono font-bold text-amber-400">{multiShirtOrders.length} ออเดอร์</span>
            </div>
            <div className="text-lg font-black text-amber-400 font-mono">
              {multiShirtsTotalQty}{' '}
              <span className="text-xs font-normal text-slate-400">ตัว ({totalShirts > 0 ? Math.round((multiShirtsTotalQty / totalShirts) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-amber-400/90 mt-1">
              {multiShirtOrders.length > 0 ? `คลิกดูทั้ง ${multiShirtOrders.length} ออเดอร์ที่สั่งหลายตัว` : 'ไม่มีออเดอร์ที่สั่งหลายตัว'}
            </div>
          </button>

          {/* Card 3: Duplicates Audit */}
          <button
            type="button"
            onClick={() => setFilterQty(filterQty === 'duplicates' ? 'all' : 'duplicates')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              filterQty === 'duplicates'
                ? 'bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>ตรวจจับชื่อ/เบอร์โทรซ้ำ</span>
              <span className={`font-mono font-bold ${duplicateOrderIds.size > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {duplicateOrderIds.size} รายการ
              </span>
            </div>
            <div className="text-lg font-black font-mono text-white">
              {duplicateOrderIds.size > 0 ? (
                <span className="text-rose-400">พบ {duplicateOrderIds.size} รายการ</span>
              ) : (
                <span className="text-emerald-400 text-sm">✓ ข้อมูลปกติ ไม่พบชื่อซ้ำ</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {duplicateOrderIds.size > 0 ? 'คลิกเพื่อตรวจสอบออเดอร์ที่ชื่อ/เบอร์ซ้ำ' : 'ไม่มีคำสั่งซื้อที่ชื่อหรือเบอร์ตรงกัน'}
            </div>
          </button>
        </div>

        {filterQty !== 'all' && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-300">
              ตัวกรองปัจจุบัน: <b className="text-amber-400 font-semibold">
                {filterQty === 'single' ? 'ออเดอร์ที่สั่ง 1 ตัว' : filterQty === 'multi' ? 'ออเดอร์ที่สั่งมากกว่า 1 ตัว' : 'ออเดอร์ที่ตรวจพบชื่อหรือเบอร์โทรซ้ำ'}
              </b> ({filteredOrders.length} รายการ)
            </span>
            <button
              type="button"
              onClick={() => setFilterQty('all')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              แสดงทั้งหมด ({orders.length} ออเดอร์)
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: Size Breakdown Visual Bars & Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              สรุปจำนวนเสื้อแยกตามไซซ์ (Size Breakdown)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              แสดงสัดส่วนยอดสั่งจองเสื้อทุกไซซ์ คำนวณรายตัวอย่างแม่นยำ เพื่อใช้ในการวางแผนผลิตและสต็อกสินค้า
            </p>
          </div>
          {topSize && sizeCounts[topSize as ShirtSize] && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>🔥 ไซซ์ขายดีอันดับ 1:</span>
              <span className="font-black font-mono text-amber-400">
                {String(topSize)} ({sizeCounts[topSize as ShirtSize]?.count} ตัว)
              </span>
            </div>
          )}
        </div>

        {/* Size Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DISPLAY_SIZES.map(({ size, chest }) => {
            const data = sizeCounts[size];
            const pct = totalShirts > 0 ? Math.round((data.count / totalShirts) * 100) : 0;
            const isTop = size === topSize && data.count > 0;

            return (
              <div
                key={size}
                className={`p-4 rounded-2xl border transition-all text-center relative overflow-hidden ${
                  isTop
                    ? 'bg-gradient-to-b from-orange-950/60 to-slate-950 border-orange-500 shadow-lg shadow-orange-950/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isTop && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white">
                    TOP
                  </span>
                )}
                <div className="text-lg font-black text-white font-mono">{size}</div>
                <div className="text-[11px] text-slate-400 mb-2">รอบอก {chest}</div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {data.count}{' '}
                  <span className="text-[11px] font-sans font-normal text-slate-400">ตัว</span>
                </div>
                <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, data.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{pct}%</span>
                  <span className="font-mono text-slate-300">฿{data.revenue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Payment & Verification Status Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> ชำระเงินแล้ว (Paid / Claimed)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300">
              {paidOrders.length} ออเดอร์
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {paidShirts} <span className="text-xs font-normal text-slate-300">ตัว</span>
            <span className="text-emerald-400 text-lg ml-3 font-semibold">
              ฿{paidRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ผู้สั่งซื้อได้รับการอนุมัติเรียบร้อย การ์ดผีถูกอัปเกรดเป็น LV.2 และได้รับตรา SHIRT OWNER
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> รอตรวจสอบสลิป (Pending)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 animate-pulse">
              {pendingOrders.length} ออเดอร์
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {pendingShirts} <span className="text-xs font-normal text-slate-300">ตัว</span>
            <span className="text-amber-400 text-lg ml-3 font-semibold">
              ฿{pendingRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ลูกค้าแนบสลิปแล้ว กำลังรอเจ้าหน้าที่ฝ่ายการเงินตรวจสอบยอดเงินโอน
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-slate-400" /> ยังไม่ชำระ / รอสลิป (Unpaid)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {unpaidOrders.length} ออเดอร์
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {unpaidShirts} <span className="text-xs font-normal text-slate-300">ตัว</span>
            <span className="text-slate-400 text-lg ml-3 font-semibold">
              ฿{unpaidRevenue.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            ลูกค้าลงทะเบียนสั่งเสื้อไว้ แต่ยังไม่ได้โอนเงินหรือยังไม่ได้ส่งสลิปหลักฐาน
          </p>
        </div>
      </div>

      {/* SECTION 4: Order Records Table with Filters */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              รายการคำสั่งซื้อทั้งหมด ({filteredOrders.length} / {orders.length} รายการ)
            </h3>
            <p className="text-xs text-slate-400">
              ตรวจสอบรายละเอียดคำสั่งซื้อ ค้นหาผู้สั่งซื้อ หรือดูหลักฐานสลิปโอนเงิน
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา Order ID, ชื่อ, เบอร์, อีเมล..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">ไซซ์ทั้งหมด (All Sizes)</option>
              {DISPLAY_SIZES.map(({ size, chest }) => (
                <option key={size} value={size}>
                  ไซซ์ {size} {chest !== '-' ? `(อก ${chest})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="paid">ชำระแล้ว (Paid)</option>
              <option value="claimed">รับเสื้อแล้ว (Claimed)</option>
              <option value="pending_verification">รอตรวจสอบสลิป (Pending)</option>
              <option value="unpaid">ยังไม่ชำระ (Unpaid)</option>
            </select>
          </div>

          <div>
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">ทุกรูปแบบการรับ</option>
              <option value="pickup_event">รับหน้างาน ม.นเรศวร</option>
              <option value="shipping">จัดส่งถึงบ้าน (ไปรษณีย์)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">ผู้สั่งซื้อ / Card ID</th>
                <th className="py-3 px-4">เบอร์โทร</th>
                <th className="py-3 px-4 text-center">ไซซ์ & จำนวน</th>
                <th className="py-3 px-4">ยอดเงิน</th>
                <th className="py-3 px-4">การจัดส่ง</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">สลิป</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {ord.orderId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{ord.cardId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {ord.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 font-bold font-mono">
                          {ord.sizes && ord.sizes.length > 0 ? ord.sizes.join(', ') : ord.size || '-'} ({ord.quantity || 1} ตัว)
                        </span>
                        {(ord.quantity || 1) > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            สั่งหลายตัว ({ord.quantity} ตัว)
                          </span>
                        )}
                        {duplicateOrderIds.has(ord.orderId) && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            ⚠️ ชื่อ/เบอร์ซ้ำ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      ฿{ord.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.deliveryMethod === 'pickup_event' ? (
                        <span className="text-blue-400 flex items-center gap-1 font-medium">
                          🏢 รับหน้างาน
                        </span>
                      ) : (
                        <div>
                          <span className="text-amber-400 flex items-center gap-1 font-medium">
                            📦 จัดส่งไปรษณีย์
                          </span>
                          {ord.shippingAddress && (
                            <span className="text-[10px] text-slate-500 block max-w-xs truncate" title={ord.shippingAddress}>
                              {ord.shippingAddress}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : ord.status === 'claimed'
                            ? 'bg-blue-950 text-blue-300 border border-blue-600'
                            : ord.status === 'pending_verification'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {ord.status === 'paid'
                          ? '✓ ชำระแล้ว'
                          : ord.status === 'claimed'
                          ? '✓ รับเสื้อแล้ว'
                          : ord.status === 'pending_verification'
                          ? 'รอตรวจสอบ'
                          : 'รอชำระ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {ord.slipImage ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlip(ord.slipImage || null)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูสลิป</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {onOrderClick && (
                          <button
                            type="button"
                            onClick={() => onOrderClick(ord)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="ดูรายละเอียดออเดอร์"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ดู</span>
                          </button>
                        )}
                        {onEditOrder && (
                          <button
                            type="button"
                            onClick={() => onEditOrder(ord)}
                            className="px-2 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-800/60 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="แก้ไขคำสั่งซื้อและสลิป"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">แก้ไข</span>
                          </button>
                        )}
                        {onDeleteOrder && (
                          <button
                            type="button"
                            onClick={() => onDeleteOrder(ord)}
                            className="px-2 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/60 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="ลบคำสั่งซื้อ (ต้องใช้รหัส 07011985)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ลบ</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    {orders.length === 0 ? 'ยังไม่มีรายการสั่งซื้อเสื้อในระบบ' : 'ไม่พบรายการคำสั่งซื้อตามเงื่อนไขที่เลือก'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal Preview */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">หลักฐานการโอนเงิน (สลิป)</h4>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕ ปิด
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-96">
              <img
                src={selectedSlip}
                alt="สลิปโอนเงิน"
                className="max-h-96 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
