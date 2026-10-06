import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  QrCode,
  CheckCircle,
  Clock,
  Shirt,
  Flame,
  Search,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Eye,
  FileText,
  Award,
  Cloud,
  LogOut,
  Download,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Package,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { OfficerRole, ShirtOrder, RunnerRegistration, GhostCard } from '../types';
import { THAI_GHOSTS } from '../data/ghosts';
import { csvRow } from '../lib/csv';
import { ShirtDashboard } from '../components/ShirtDashboard';
import { RunnerEditModal } from '../components/RunnerEditModal';
import { RunnerDeleteModal } from '../components/RunnerDeleteModal';
import { ShirtOrderEditModal } from '../components/ShirtOrderEditModal';
import { ShirtOrderDeleteModal } from '../components/ShirtOrderDeleteModal';

export const AdminDashboardView: React.FC<{ onNavigate: (view: any) => void }> = ({
  onNavigate,
}) => {
  const {
    runners,
    cards,
    orders,
    activeOfficerRole,
    setActiveOfficerRole,
    approveShirtPayment,
    rejectShirtPayment,
    markShirtClaimed,
    refundShirtOrder,
    resetToDefaults,
    clearSystemCache,
    adminUser,
    logoutAdmin,
    syncFromCloud,
    isSyncing,
    lastSyncedAt,
    connectionStatus,
    quotaErrorMessage,
    subscribeAdminData,
    exportLocalBackup,
    updateRunnerFull,
    deleteRunner,
    updateShirtOrderFull,
    deleteShirtOrder,
  } = useEventContext();

  // Admin Dashboard on-demand subscription for runners & orders
  useEffect(() => {
    const unsubscribe = subscribeAdminData();
    return () => {
      unsubscribe();
    };
  }, [subscribeAdminData]);

  const [activeTab, setActiveTab] = useState<
    'runners' | 'orders' | 'finance' | 'shirt_dashboard' | 'metrics'
  >('runners');

  // Search and filter states
  const [runnerSearch, setRunnerSearch] = useState('');
  const [runnerCategoryFilter, setRunnerCategoryFilter] = useState('all');
  const [runnerRegTypeFilter, setRunnerRegTypeFilter] = useState('all');
  const [runnerCheckinFilter, setRunnerCheckinFilter] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDeliveryFilter, setOrderDeliveryFilter] = useState('all');

  // Modals
  const [viewingSlip, setViewingSlip] = useState<string | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<RunnerRegistration | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ShirtOrder | null>(null);
  const [editingRunner, setEditingRunner] = useState<RunnerRegistration | null>(null);
  const [deletingRunner, setDeletingRunner] = useState<RunnerRegistration | null>(null);
  const [editingOrder, setEditingOrder] = useState<ShirtOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<ShirtOrder | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Statistics calculation
  const safeRunners = Array.isArray(runners) ? runners : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRunners = safeRunners.length;
  const freeRunnersCount = safeRunners.filter((r) => r.regType === 'RUN_FREE').length;
  const runAndShirtCount = safeRunners.filter((r) => r.regType === 'RUN_AND_SHIRT').length;
  const shirtOnlyCount = safeRunners.filter((r) => r.regType === 'SHIRT_ONLY').length;
  const checkedInCount = safeRunners.filter((r) => r.checkedIn).length;

  const totalOrders = safeOrders.length;
  const paidOrders = safeOrders.filter((o) => o.status === 'paid' || o.status === 'claimed');
  const pendingOrders = safeOrders.filter((o) => o.status === 'pending_verification');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalShirtsCount = safeOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);

  // Filtered Runners
  const filteredRunners = safeRunners.filter((r) => {
    const q = runnerSearch.trim().toLowerCase();
    if (q) {
      const matchName = (r.fullName || '').toLowerCase().includes(q);
      const matchNick = (r.nickname || '').toLowerCase().includes(q);
      const matchPhone = (r.phone || '').includes(q);
      const matchReg = (r.regId || '').toLowerCase().includes(q);
      const matchBib = (r.bibNumber || '').toLowerCase().includes(q);
      const matchCard = (r.cardId || '').toLowerCase().includes(q);
      const matchOrg = (r.organization || '').toLowerCase().includes(q);
      if (!matchName && !matchNick && !matchPhone && !matchReg && !matchBib && !matchCard && !matchOrg) {
        return false;
      }
    }

    if (runnerCategoryFilter !== 'all' && r.participantCategory !== runnerCategoryFilter) {
      return false;
    }
    if (runnerRegTypeFilter !== 'all' && r.regType !== runnerRegTypeFilter) {
      return false;
    }
    if (runnerCheckinFilter === 'checked' && !r.checkedIn) return false;
    if (runnerCheckinFilter === 'not_checked' && r.checkedIn) return false;

    return true;
  });

  // Filtered Orders
  const filteredOrders = safeOrders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    if (q) {
      const matchCust = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.phone || '').includes(q);
      const matchOrderId = (o.orderId || '').toLowerCase().includes(q);
      const matchCard = (o.cardId || '').toLowerCase().includes(q);
      const matchEmail = (o.email || '').toLowerCase().includes(q);
      if (!matchCust && !matchPhone && !matchOrderId && !matchCard && !matchEmail) {
        return false;
      }
    }

    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
      return false;
    }
    if (orderDeliveryFilter !== 'all' && o.deliveryMethod !== orderDeliveryFilter) {
      return false;
    }

    return true;
  });

  // CSV Export for Runners
  const exportRunnersCSV = () => {
    if (safeRunners.length === 0) {
      alert('ยังไม่มีข้อมูลผู้สมัครวิ่งสำหรับส่งออก');
      return;
    }

    const headers = [
      'รหัสลงทะเบียน',
      'หมายเลข BIB',
      'Card ID',
      'ชื่อ-นามสกุล',
      'ชื่อเล่น',
      'เบอร์โทรศัพท์',
      'เพศ',
      'ประเภทผู้สมัคร',
      'ชั้นปี (นิสิต)',
      'สังกัด/คณะ/หน่วยงาน',
      'ประเภทการสมัคร',
      'ไซซ์เสื้อ',
      'โรคประจำตัว/แพ้ยา',
      'ผู้ติดต่อฉุกเฉิน',
      'เบอร์ติดต่อฉุกเฉิน',
      'สถานะเช็กอิน',
      'เวลาเช็กอิน',
      'วันที่สมัคร',
    ];

    const rows = safeRunners.map((r) => {
      const runnerOrder = safeOrders.find(
        (o) => (r.shirtOrderId && o.orderId === r.shirtOrderId) || o.cardId === r.cardId
      );
      const shirtSizeStr = runnerOrder
        ? (runnerOrder.sizes && runnerOrder.sizes.length > 0 ? runnerOrder.sizes.join(', ') : runnerOrder.size)
        : '-';

      const catLabel =
        r.participantCategory === 'student'
          ? 'นิสิต'
          : r.participantCategory === 'alumni'
          ? 'ศิษย์เก่า'
          : r.participantCategory === 'staff'
          ? 'บุคลากร'
          : 'บุคคลทั่วไป';

      const typeLabel =
        r.regType === 'RUN_FREE'
          ? 'วิ่งฟรี'
          : r.regType === 'RUN_AND_SHIRT'
          ? 'วิ่ง + สั่งเสื้อ'
          : 'ซื้อเสื้ออย่างเดียว';

      return csvRow([
        r.regId,
        r.bibNumber || '-',
        r.cardId,
        r.fullName,
        r.nickname || '-',
        r.phone,
        r.gender || '-',
        catLabel,
        r.studentYear || '-',
        (r.organization || '-'),
        typeLabel,
        shirtSizeStr,
        (r.medicalConditions || '-'),
        (r.emergencyContactName || '-'),
        r.emergencyContactPhone || '-',
        r.checkedIn ? 'เช็กอินแล้ว' : 'ยังไม่เช็กอิน',
        r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('th-TH') : '-',
        new Date(r.registeredAt).toLocaleString('th-TH'),
      ]);
    });

    const csvContent = '\uFEFF' + [csvRow(headers), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FSS2026_Runners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Export for Shirt Orders
  const exportOrdersCSV = () => {
    if (safeOrders.length === 0) {
      alert('ยังไม่มีข้อมูลคำสั่งซื้อเสื้อสำหรับส่งออก');
      return;
    }

    const headers = [
      'Order ID',
      'Card ID',
      'ชื่อผู้สั่งซื้อ',
      'เบอร์โทรศัพท์',
      'อีเมล',
      'จำนวนตัว',
      'ไซซ์เสื้อ',
      'ยอดเงินรวม (บาท)',
      'วิธีรับเสื้อ',
      'ที่อยู่จัดส่ง',
      'สถานะชำระเงิน',
      'มีสลิปโอนเงิน',
      'วันที่สั่งซื้อ',
    ];

    const rows = safeOrders.map((o) => {
      const statusLabel =
        o.status === 'paid'
          ? 'ชำระเงินแล้ว'
          : o.status === 'claimed'
          ? 'รับเสื้อแล้ว'
          : o.status === 'pending_verification'
          ? 'รอตรวจสอบสลิป'
          : 'รอชำระเงิน';

      const deliveryLabel = o.deliveryMethod === 'pickup_event' ? 'รับหน้างาน' : 'จัดส่งไปรษณีย์';
      const sizesStr = o.sizes && o.sizes.length > 0 ? o.sizes.join(', ') : o.size || '-';

      return csvRow([
        o.orderId,
        o.cardId || '-',
        o.customerName,
        o.phone,
        o.email || '-',
        o.quantity || 1,
        sizesStr,
        o.totalAmount,
        deliveryLabel,
        (o.shippingAddress || '-'),
        statusLabel,
        o.slipImage ? 'มี' : 'ไม่มี',
        new Date(o.paymentTimestamp || Date.now()).toLocaleString('th-TH'),
      ]);
    });

    const csvContent = '\uFEFF' + [csvRow(headers), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FSS2026_ShirtOrders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar: Admin Identity & Role Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-xl shadow-sm">
            🛡️
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
              EVENT MANAGEMENT & OPERATIONS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Dashboard ผู้ดูแลระบบและเจ้าหน้าที่
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <select
              value={activeOfficerRole}
              onChange={(e) => setActiveOfficerRole(e.target.value as OfficerRole)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="SUPER_ADMIN">👑 Super Admin (ผู้ดูแลสูงสุด)</option>
              <option value="OFFICER_FINANCE">💰 ฝ่ายการเงิน & ตรวจสอบสลิป</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const res = exportLocalBackup();
              alert(`ส่งออกข้อมูลสำรอง (Backup) สำเร็จ: ${res.filename}`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200 cursor-pointer shadow-sm"
            title="ดาวน์โหลดไฟล์สำรองข้อมูลทั้งหมดในเครื่อง (JSON)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> สำรองข้อมูล (Backup)
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              const res = await syncFromCloud({ forceAdminSync: true });
              alert(res.message);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 cursor-pointer shadow-sm"
            title="ดึงข้อมูลล่าสุดจาก Cloud Firestore"
          >
            <Cloud className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'กำลังซิงค์...' : '🔄 ซิงค์ข้อมูล Cloud'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('ต้องการล้างแคชหน่วยความจำเบราว์เซอร์ทั้งหมดและโหลดใหม่ใช่หรือไม่?')) {
                clearSystemCache();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
            title="ล้างแคช LocalStorage และ IndexedDB ทั้งหมด"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> ล้างแคชเบราว์เซอร์
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('ต้องการรีเซ็ตข้อมูลผู้สมัครและคำสั่งซื้อทั้งหมดใช่หรือไม่? (รูปภาพเสื้อ เหรียญ แผนที่ จะไม่หาย)')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูล
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('ต้องการออกจากระบบผู้ดูแลใช่หรือไม่?')) {
                logoutAdmin();
                onNavigate('home');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-colors border border-rose-200 shadow-sm cursor-pointer"
            title="ออกจากระบบแอดมิน"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Quota Exhaustion / Connection Warning Banner */}
      {connectionStatus === 'quota_exhausted' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">⚠️ โควตาการอ่านฐานข้อมูลรายวัน (Free Daily Read Units) เต็มแล้ว</p>
            <p className="text-xs text-amber-800">
              {quotaErrorMessage || 'ระบบกำลังใช้งานโหมดสำรองในเครื่อง (Offline Local Mode) เพื่อป้องกันการเรียกซ้ำ ข้อมูลที่บันทึกไว้ในเครื่องยังคงอยู่ครบถ้วน'}
            </p>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#DC2626]" /> ผู้สมัครวิ่งทั้งหมด
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalRunners} <span className="text-xs font-normal text-slate-500">คน</span></p>
          <span className="text-[11px] text-emerald-600 font-bold block">เช็กอินแล้ว: {checkedInCount} คน</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Shirt className="w-3.5 h-3.5 text-blue-600" /> ยอดสั่งซื้อเสื้อ
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalOrders} <span className="text-xs font-normal text-slate-500">ออเดอร์</span></p>
          <span className="text-[11px] text-blue-600 font-bold block">รวม {totalShirtsCount} ตัว</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> รอตรวจสอบสลิป
          </span>
          <p className="text-2xl font-black text-amber-600 font-mono">{pendingOrders.length} <span className="text-xs font-normal text-slate-500">รายการ</span></p>
          <span className="text-[11px] text-slate-500 font-medium block">ชำระแล้ว: {paidOrders.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> รายรับค่าเสื้อชำระแล้ว
          </span>
          <p className="text-2xl font-black text-emerald-600 font-mono">฿{totalRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 font-medium block">ตัวละ 300 บาท</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('runners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'runners'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> รายชื่อผู้สมัครวิ่ง ({totalRunners})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shirt className="w-4 h-4" /> รายชื่อผู้สั่งซื้อเสื้อ ({totalOrders})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'finance'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> ตรวจสอบสลิปค่าเสื้อ
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shirt_dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shirt_dashboard'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> สรุปสต็อกเสื้อ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4" /> สถิติและภาพรวม
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RUNNERS LIST (รายชื่อผู้สมัครวิ่ง) */}
      {/* ======================================================== */}
      {activeTab === 'runners' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="fastwork-card p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={runnerSearch}
                  onChange={(e) => setRunnerSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, เบอร์โทร, BIB, Card ID, สังกัด/คณะ..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={runnerCategoryFilter}
                  onChange={(e) => setRunnerCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">ทุกสถานะผู้สมัคร</option>
                  <option value="student">นิสิต</option>
                  <option value="alumni">ศิษย์เก่า</option>
                  <option value="staff">บุคลากร</option>
                  <option value="public">บุคคลทั่วไป</option>
                </select>

                <select
                  value={runnerRegTypeFilter}
                  onChange={(e) => setRunnerRegTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">ทุกประเภทการสมัคร</option>
                  <option value="RUN_FREE">วิ่งฟรี (RUN_FREE)</option>
                  <option value="RUN_AND_SHIRT">วิ่ง + สั่งเสื้อ</option>
                  <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว</option>
                </select>

                <select
                  value={runnerCheckinFilter}
                  onChange={(e) => setRunnerCheckinFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">สถานะเช็กอินทั้งหมด</option>
                  <option value="checked">✓ เช็กอินแล้ว</option>
                  <option value="not_checked">ยังไม่เช็กอิน</option>
                </select>

                <button
                  type="button"
                  onClick={exportRunnersCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="ดาวน์โหลดไฟล์ Excel/CSV รายชื่อผู้สมัครวิ่ง"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> ส่งออก Excel/CSV
                </button>
              </div>
            </div>
          </div>

          {/* Runners Table */}
          <div className="fastwork-card overflow-hidden bg-white">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#DC2626]" /> รายชื่อผู้สมัครวิ่ง ({filteredRunners.length} / {totalRunners} คน)
              </h3>
              <span className="text-xs text-slate-500">คลิกที่แถวเพื่อดูรายละเอียดเพิ่มเติม</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5">รหัสสมัคร / BIB</th>
                    <th className="py-3 px-3.5">ชื่อ-นามสกุล (ชื่อเล่น)</th>
                    <th className="py-3 px-3.5">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-3.5">สถานะ/สังกัด</th>
                    <th className="py-3 px-3.5">ประเภทการสมัคร</th>
                    <th className="py-3 px-3.5">ไซซ์เสื้อ</th>
                    <th className="py-3 px-3.5">Card ID</th>
                    <th className="py-3 px-3.5">เช็กอิน</th>
                    <th className="py-3 px-3.5 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRunners.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        {safeRunners.length === 0 ? 'ยังไม่มีผู้สมัครวิ่งในระบบ' : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'}
                      </td>
                    </tr>
                  ) : (
                    filteredRunners.map((r) => {
                      const card = cards.find((c) => c.cardId === r.cardId);
                      const species = card ? (THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret) : null;
                      const runnerOrder = safeOrders.find(
                        (o) => (r.shirtOrderId && o.orderId === r.shirtOrderId) || o.cardId === r.cardId
                      );
                      const shirtSizeStr = runnerOrder
                        ? (runnerOrder.sizes && runnerOrder.sizes.length > 0 ? runnerOrder.sizes.join(', ') : runnerOrder.size)
                        : null;

                      return (
                        <tr
                          key={r.regId}
                          onClick={() => setSelectedRunner(r)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3.5 font-mono">
                            <span className="font-bold text-[#DC2626] block">{r.regId}</span>
                            {r.bibNumber ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold inline-block mt-0.5">
                                {r.bibNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">ไม่มี BIB</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 font-medium text-slate-900">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{r.fullName}</span>
                              {r.nickname && <span className="text-slate-500 font-normal text-xs">({r.nickname})</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              สมัครเมื่อ: {new Date(r.registeredAt).toLocaleDateString('th-TH')}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-700">
                            {r.phone}
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 inline-block">
                              {r.participantCategory === 'student'
                                ? `นิสิตปี ${r.studentYear || '-'}`
                                : r.participantCategory === 'alumni'
                                ? 'ศิษย์เก่า'
                                : r.participantCategory === 'staff'
                                ? 'บุคลากร'
                                : 'บุคคลทั่วไป'}
                            </span>
                            {r.organization && (
                              <span className="text-[11px] text-slate-500 block mt-0.5 max-w-[140px] truncate" title={r.organization}>
                                {r.organization}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.regType === 'RUN_FREE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.regType === 'RUN_AND_SHIRT'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {r.regType === 'RUN_FREE'
                                ? 'วิ่งฟรี'
                                : r.regType === 'RUN_AND_SHIRT'
                                ? 'วิ่ง + เสื้อ'
                                : 'ซื้อเสื้ออย่างเดียว'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                            {shirtSizeStr ? `ไซซ์ ${shirtSizeStr}` : <span className="text-slate-400 font-normal">-</span>}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-600">
                            <div className="flex items-center gap-1">
                              <span>{r.cardId}</span>
                              {species && <span className="text-xs" title={species.name}>👻</span>}
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            {r.checkedIn ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> เช็กอินแล้ว
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                ยังไม่เช็กอิน
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setSelectedRunner(r)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="ดูรายละเอียดข้อมูลผู้สมัคร"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                <span className="hidden sm:inline">ดู</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRunner(r)}
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="แก้ไขข้อมูลทั้งหมดของผู้สมัครและสลิปโอนเงิน"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">แก้ไข</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingRunner(r)}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="ลบรายชื่อผู้สมัคร (ต้องใช้รหัส 07011985)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ลบ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SHIRT ORDERS LIST (รายชื่อผู้สั่งซื้อเสื้อ) */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="fastwork-card p-4 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้สั่งซื้อ, เบอร์โทร, Order ID, Card ID, อีเมล..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">สถานะคำสั่งซื้อทั้งหมด</option>
                  <option value="paid">✓ ชำระเงินแล้ว</option>
                  <option value="pending_verification">⏳ รอตรวจสอบสลิป</option>
                  <option value="claimed">🎁 รับเสื้อแล้ว</option>
                  <option value="pending_payment">ยังไม่ชำระ</option>
                </select>

                <select
                  value={orderDeliveryFilter}
                  onChange={(e) => setOrderDeliveryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">วิธีรับเสื้อทั้งหมด</option>
                  <option value="pickup_event">รับหน้างาน (31 ต.ค.)</option>
                  <option value="delivery_postal">จัดส่งทางไปรษณีย์</option>
                </select>

                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="ดาวน์โหลดไฟล์ Excel/CSV รายชื่อผู้สั่งซื้อเสื้อ"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> ส่งออก Excel/CSV
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="fastwork-card overflow-hidden bg-white">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#DC2626]" /> รายชื่อผู้สั่งซื้อเสื้อ ({filteredOrders.length} / {totalOrders} ออเดอร์)
              </h3>
              <span className="text-xs text-slate-500">คลิกที่แถวเพื่อดูรายละเอียดเพิ่มเติม</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5">Order ID</th>
                    <th className="py-3 px-3.5">ชื่อผู้สั่งซื้อ</th>
                    <th className="py-3 px-3.5">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-3.5">จำนวน / ไซซ์</th>
                    <th className="py-3 px-3.5">ยอดรวม</th>
                    <th className="py-3 px-3.5">วิธีรับเสื้อ</th>
                    <th className="py-3 px-3.5">สลิปโอนเงิน</th>
                    <th className="py-3 px-3.5">สถานะ</th>
                    <th className="py-3 px-3.5 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        {safeOrders.length === 0 ? 'ยังไม่มีรายการสั่งซื้อเสื้อในระบบ' : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr
                        key={ord.orderId}
                        onClick={() => setSelectedOrder(ord)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3.5 font-mono font-bold text-[#DC2626]">
                          {ord.orderId}
                          {ord.cardId && (
                            <span className="text-[10px] text-slate-400 block font-normal">{ord.cardId}</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-slate-900">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          {ord.email && <span className="text-[11px] text-slate-400">{ord.email}</span>}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-700">
                          {ord.phone}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900 font-mono">
                            {ord.quantity || 1} ตัว
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ไซซ์: {ord.sizes && ord.sizes.length > 0 ? ord.sizes.join(', ') : ord.size || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-[#DC2626]">
                          ฿{ord.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {ord.deliveryMethod === 'pickup_event' ? 'รับหน้างาน' : 'จัดส่งไปรษณีย์'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          {ord.slipImage ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingSlip(ord.slipImage || null);
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> ดูสลิป
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">ไม่มีสลิป</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'claimed'
                                ? 'bg-red-100 text-red-800'
                                : ord.status === 'pending_verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ord.status === 'paid'
                              ? 'ชำระแล้ว'
                              : ord.status === 'claimed'
                              ? 'รับเสื้อแล้ว'
                              : ord.status === 'pending_verification'
                              ? 'รอตรวจสลิป'
                              : 'รอชำระ'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            {ord.status === 'pending_verification' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveShirtPayment(ord.orderId)}
                                  className="px-2 py-1 bg-[#00B67A] hover:bg-emerald-600 text-white rounded text-[11px] font-bold shadow-xs cursor-pointer"
                                  title="อนุมัติสลิป"
                                >
                                  อนุมัติ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectShirtPayment(ord.orderId)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-xs cursor-pointer"
                                  title="ปฏิเสธสลิป"
                                >
                                  ปฏิเสธ
                                </button>
                              </>
                            )}

                            {ord.status === 'paid' && (
                              <button
                                type="button"
                                onClick={() => markShirtClaimed(ord.orderId)}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                                title="บันทึกว่ารับเสื้อแล้ว"
                              >
                                มอบเสื้อแล้ว
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              title="ดูรายละเอียดออเดอร์"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span className="hidden sm:inline">ดู</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingOrder(ord)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="แก้ไขคำสั่งซื้อและสลิปโอนเงิน"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">แก้ไข</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingOrder(ord)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="ลบคำสั่งซื้อ (ต้องใช้รหัส 07011985)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ลบ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FINANCE & SLIP APPROVAL */}
      {/* ======================================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="fastwork-card p-6 bg-white space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>รายการสั่งซื้อเสื้อทั้งหมด ({orders.length} รายการ)</span>
              <span className="text-xs text-[#DC2626] font-bold">
                รอตรวจสอบ: {pendingOrders.length} รายการ
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">ผู้สั่งซื้อ</th>
                    <th className="py-2.5 px-3">จำนวน/ไซซ์</th>
                    <th className="py-2.5 px-3">ยอดรวม</th>
                    <th className="py-2.5 px-3">สลิป</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        ยังไม่มีรายการสั่งซื้อเสื้อในระบบ
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-[#DC2626]">{ord.orderId}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {ord.customerName}
                          <span className="text-slate-400 block font-normal text-[11px]">{ord.phone}</span>
                        </td>
                        <td className="py-3 px-3">
                          {ord.quantity} ตัว ({ord.sizes?.join(', ') || ord.size})
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#DC2626]">฿{ord.totalAmount}</td>
                        <td className="py-3 px-3">
                          {ord.slipImage ? (
                            <button
                              type="button"
                              onClick={() => setViewingSlip(ord.slipImage || null)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> ดูสลิป
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">ไม่มีสลิป</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'claimed'
                                ? 'bg-red-100 text-red-800'
                                : ord.status === 'pending_verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ord.status === 'paid'
                              ? 'ชำระแล้ว'
                              : ord.status === 'claimed'
                              ? 'รับเสื้อแล้ว'
                              : ord.status === 'pending_verification'
                              ? 'รอตรวจสลิป'
                              : 'รอชำระ'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {ord.status === 'pending_verification' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => approveShirtPayment(ord.orderId)}
                                className="px-2.5 py-1 bg-[#00B67A] hover:bg-emerald-600 text-white rounded text-[11px] font-bold shadow-sm"
                              >
                                อนุมัติ
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectShirtPayment(ord.orderId)}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-sm"
                              >
                                ปฏิเสธ
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">ดำเนินการแล้ว</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SHIRT INVENTORY & SALES DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === 'shirt_dashboard' && (
        <div className="space-y-6">
          <ShirtDashboard
            orders={orders}
            onOrderClick={(ord) => setSelectedOrder(ord)}
            onEditOrder={(ord) => setEditingOrder(ord)}
            onDeleteOrder={(ord) => setDeletingOrder(ord)}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: METRICS */}
      {/* ======================================================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="fastwork-card p-5 bg-white space-y-1">
              <span className="text-xs text-slate-500 font-medium">ผู้สมัครวิ่งทั้งหมด</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{totalRunners} คน</p>
            </div>
            <div className="fastwork-card p-5 bg-white space-y-1">
              <span className="text-xs text-slate-500 font-medium">สมัครวิ่งฟรี (100%)</span>
              <p className="text-2xl font-black text-[#00B67A] font-mono">{freeRunnersCount} คน</p>
            </div>
            <div className="fastwork-card p-5 bg-white space-y-1">
              <span className="text-xs text-slate-500 font-medium">ยอดสั่งซื้อเสื้อทั้งหมด</span>
              <p className="text-2xl font-black text-amber-600 font-mono">{totalOrders} คำสั่งซื้อ</p>
            </div>
            <div className="fastwork-card p-5 bg-white space-y-1">
              <span className="text-xs text-slate-500 font-medium">ยอดเงินชำระสำเร็จ</span>
              <p className="text-2xl font-black text-[#DC2626] font-mono">฿{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#DC2626]" /> สัดส่วนประเภทการสมัคร
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span>วิ่งฟรี (RUN_FREE)</span>
                  <span className="font-bold font-mono text-slate-900">{freeRunnersCount} คน ({totalRunners ? Math.round((freeRunnersCount / totalRunners) * 100) : 0}%)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span>วิ่ง + สั่งเสื้อ (RUN_AND_SHIRT)</span>
                  <span className="font-bold font-mono text-purple-700">{runAndShirtCount} คน ({totalRunners ? Math.round((runAndShirtCount / totalRunners) * 100) : 0}%)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span>ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</span>
                  <span className="font-bold font-mono text-blue-700">{shirtOnlyCount} คน ({totalRunners ? Math.round((shirtOnlyCount / totalRunners) * 100) : 0}%)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> สถานะการเช็กอินวันงาน
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-900">
                  <span className="font-semibold">เช็กอินเข้างานแล้ว</span>
                  <span className="font-bold font-mono text-base">{checkedInCount} คน</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                  <span>ยังไม่เช็กอิน</span>
                  <span className="font-bold font-mono">{totalRunners - checkedInCount} คน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {viewingSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setViewingSlip(null)}
        >
          <div
            className="relative bg-white p-4 rounded-2xl max-w-md w-full shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">หลักฐานการโอนเงิน (Slip)</h4>
              <button
                type="button"
                onClick={() => setViewingSlip(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              <img src={viewingSlip} alt="Slip" className="max-w-full rounded object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Runner Details Modal */}
      {selectedRunner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedRunner(null)}
        >
          <div
            className="relative bg-white p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold">
                  🏃
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#DC2626] uppercase">RUNNER DETAILS</span>
                  <h3 className="text-base font-black text-slate-900">{selectedRunner.fullName}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRunner(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">รหัสลงทะเบียน</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{selectedRunner.regId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">หมายเลข BIB</span>
                <span className="font-bold text-[#DC2626] font-mono text-sm">{selectedRunner.bibNumber || 'ไม่มี (ซื้อเสื้ออย่างเดียว)'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">Card ID ผีประจำตัว</span>
                <span className="font-bold text-purple-700 font-mono">{selectedRunner.cardId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">เบอร์โทรศัพท์</span>
                <span className="font-bold text-slate-900 font-mono">{selectedRunner.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">สถานะผู้สมัคร</span>
                <span className="font-bold text-slate-900">
                  {selectedRunner.participantCategory === 'student'
                    ? `นิสิตปี ${selectedRunner.studentYear || '-'}`
                    : selectedRunner.participantCategory === 'alumni'
                    ? 'ศิษย์เก่า'
                    : selectedRunner.participantCategory === 'staff'
                    ? 'บุคลากร'
                    : 'บุคคลทั่วไป'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">ไซซ์เสื้อ</span>
                <span className="font-bold text-slate-900 font-mono">
                  {(() => {
                    const runnerOrder = safeOrders.find(
                      (o) => (selectedRunner.shirtOrderId && o.orderId === selectedRunner.shirtOrderId) || o.cardId === selectedRunner.cardId
                    );
                    return runnerOrder
                      ? (runnerOrder.sizes && runnerOrder.sizes.length > 0 ? runnerOrder.sizes.join(', ') : runnerOrder.size)
                      : 'ไม่ได้สั่งเสื้อ (วิ่งฟรี)';
                  })()}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {selectedRunner.organization && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">สังกัด / คณะ / หน่วยงาน</span>
                  <span className="font-semibold text-slate-900">{selectedRunner.organization}</span>
                </div>
              )}

              {selectedRunner.medicalConditions && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
                  <span className="text-rose-700 block font-bold">โรคประจำตัว / ยาที่แพ้</span>
                  <span>{selectedRunner.medicalConditions}</span>
                </div>
              )}

              {selectedRunner.emergencyContactName && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                  <span className="text-amber-800 block font-bold">ผู้ติดต่อฉุกเฉิน</span>
                  <span>{selectedRunner.emergencyContactName} ({selectedRunner.emergencyContactPhone || '-'})</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedRunner;
                    setSelectedRunner(null);
                    setEditingRunner(r);
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> แก้ไขข้อมูลทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = selectedRunner;
                    setSelectedRunner(null);
                    setDeletingRunner(r);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบผู้สมัครนี้
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRunner(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="relative bg-white p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  👕
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">ORDER DETAILS</span>
                  <h3 className="text-base font-black text-slate-900">{selectedOrder.orderId}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">ชื่อผู้สั่งซื้อ</span>
                <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">เบอร์โทรศัพท์</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{selectedOrder.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">จำนวนเสื้อ</span>
                <span className="font-bold text-slate-900 font-mono">{selectedOrder.quantity || 1} ตัว</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">ไซซ์ที่สั่ง</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedOrder.sizes && selectedOrder.sizes.length > 0 ? selectedOrder.sizes.join(', ') : selectedOrder.size || '-'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">ยอดรวมทั้งสิ้น</span>
                <span className="font-bold text-[#DC2626] font-mono text-base">฿{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">วิธีรับเสื้อ</span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.deliveryMethod === 'pickup_event' ? 'รับหน้างาน (31 ต.ค.)' : 'จัดส่งไปรษณีย์'}
                </span>
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500 block font-medium">ที่อยู่จัดส่ง</span>
                <span className="font-semibold text-slate-900">{selectedOrder.shippingAddress}</span>
              </div>
            )}

            {selectedOrder.slipImage && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-slate-500 text-xs font-medium block">หลักฐานการโอนเงิน (สลิป)</span>
                <img src={selectedOrder.slipImage} alt="Slip" className="max-h-48 rounded-xl object-contain mx-auto" />
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              {selectedOrder.status === 'pending_verification' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveShirtPayment(selectedOrder.orderId);
                      setSelectedOrder(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#00B67A] hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    ✓ อนุมัติสลิป
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      rejectShirtPayment(selectedOrder.orderId);
                      setSelectedOrder(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    ✕ ปฏิเสธ
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setEditingOrder(ord);
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> แก้ไขคำสั่งซื้อ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    setDeletingOrder(ord);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบคำสั่งซื้อนี้
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white" />
            )}
            <span>{actionFeedback.message}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="ml-2 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Runner Edit Modal */}
      <RunnerEditModal
        isOpen={Boolean(editingRunner)}
        runner={editingRunner}
        linkedOrder={
          editingRunner
            ? safeOrders.find(
                (o) =>
                  (editingRunner.shirtOrderId && o.orderId === editingRunner.shirtOrderId) ||
                  o.cardId === editingRunner.cardId
              ) || null
            : null
        }
        onClose={() => setEditingRunner(null)}
        onSave={async (updatedRunner, updatedOrder) => {
          const res = await updateRunnerFull(updatedRunner, updatedOrder);
          setActionFeedback({ type: 'success', message: res.message || 'บันทึกข้อมูลเรียบร้อยแล้ว' });
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />

      {/* Runner Delete Modal */}
      <RunnerDeleteModal
        isOpen={Boolean(deletingRunner)}
        runner={deletingRunner}
        onClose={() => setDeletingRunner(null)}
        onConfirmDelete={async (regId, passcode) => {
          const res = await deleteRunner(regId, passcode);
          setActionFeedback({ type: 'success', message: res.message || 'ลบข้อมูลผู้สมัครเรียบร้อยแล้ว' });
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />

      {/* Shirt Order Edit Modal */}
      <ShirtOrderEditModal
        isOpen={Boolean(editingOrder)}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={async (updatedOrder) => {
          const res = await updateShirtOrderFull(updatedOrder);
          setActionFeedback({ type: 'success', message: res.message || 'บันทึกการแก้ไขคำสั่งซื้อสำเร็จ' });
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />

      {/* Shirt Order Delete Modal */}
      <ShirtOrderDeleteModal
        isOpen={Boolean(deletingOrder)}
        order={deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirmDelete={async (orderId, passcode) => {
          const res = await deleteShirtOrder(orderId, passcode);
          setActionFeedback({ type: 'success', message: res.message || 'ลบคำสั่งซื้อเสื้อเรียบร้อยแล้ว' });
          setTimeout(() => setActionFeedback(null), 4000);
        }}
      />
    </div>
  );
};
