import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  Users,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  Lock,
  CreditCard,
  Ghost,
  Eye,
  X,
  Shirt,
  Package,
  FileText,
  AlertTriangle,
  DollarSign,
  Truck,
  User,
  GraduationCap,
  Building2,
  Phone,
  Calendar,
  HeartPulse,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard, RunnerRegistration, ShirtOrder } from '../types';
import { GhostCardView } from '../components/GhostCardView';
import { EditableText } from '../components/EditableText';
import { REALISTIC_GHOST_ASSETS } from '../components/RealisticGhostPortrait';

export const DirectoryView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const {
    ghostSpeciesList,
    adminUser,
    syncFromCloud,
    isSyncing,
    loadDirectoryPage,
    searchRunnersRemote,
  } = useEventContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'runners' | 'orders'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterShirt, setFilterShirt] = useState<string>('all');

  // Isolated Directory State (Does NOT filter global cached runners)
  const [directoryRunners, setDirectoryRunners] = useState<RunnerRegistration[]>([]);
  const [directoryCards, setDirectoryCards] = useState<GhostCard[]>([]);
  const [directoryOrders, setDirectoryOrders] = useState<ShirtOrder[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState<boolean>(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  // Request generation guard to prevent race conditions or stale overrides
  const requestIdRef = useRef<number>(0);

  // Pagination for blank search query
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [cursorStack, setCursorStack] = useState<any[]>([]); // stack of cursor docs for pagination

  const [previewCard, setPreviewCard] = useState<GhostCard | null>(null);
  const [previewOrder, setPreviewOrder] = useState<ShirtOrder | null>(null);
  const [previewRunner, setPreviewRunner] = useState<RunnerRegistration | null>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState<boolean>(false);

  // Drop private previews and invalidate in-flight requests when identity changes.
  useEffect(() => {
    ++requestIdRef.current;
    setDirectoryRunners([]);
    setDirectoryOrders([]);
    setDirectoryCards([]);
    setPreviewRunner(null);
    setPreviewOrder(null);
    setPreviewCard(null);
    setCursorStack([]);
  }, [adminUser?.username]);

  // Load a directory page from Cloud with request generation guard
  const fetchPageData = useCallback(
    async (pageNum: number, lastDocCursor?: any) => {
      const currentReqId = ++requestIdRef.current;
      setDirectoryLoading(true);
      setDirectoryError(null);

      try {
        const res = await loadDirectoryPage({ pageSize: 20, lastDoc: lastDocCursor });
        if (currentReqId !== requestIdRef.current) return;

        setDirectoryRunners(res.runners);
        setDirectoryCards(res.cards);
        setDirectoryOrders(res.orders);
        setHasMorePages(res.hasMore);
        setCurrentPage(pageNum);

        if (res.lastDoc) {
          setCursorStack((prev) => {
            const next = [...prev];
            next[pageNum] = res.lastDoc;
            return next;
          });
        }
      } catch (err: any) {
        if (currentReqId !== requestIdRef.current) return;
        console.error('Directory page load failed:', err);
        setDirectoryError(err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลไดเรกทอรีจาก Cloud');
      } finally {
        if (currentReqId === requestIdRef.current) {
          setDirectoryLoading(false);
        }
      }
    },
    [loadDirectoryPage]
  );

  // Unified Effect for Blank Page & Debounced Remote Search with Request Generation Guard
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (trimmed.length === 1) {
      ++requestIdRef.current; // invalidate previous in-flight requests
      setDirectoryRunners([]);
      setDirectoryCards([]);
      setDirectoryOrders([]);
      setDirectoryLoading(false);
      setDirectoryError(null);
      return;
    }

    if (!trimmed) {
      fetchPageData(1);
      return;
    }

    if (trimmed.length >= 2) {
      const currentReqId = ++requestIdRef.current;
      const timer = setTimeout(async () => {
        setDirectoryLoading(true);
        setDirectoryError(null);
        setDirectoryRunners([]);
        setDirectoryCards([]);
        setDirectoryOrders([]);

        try {
          const res = await searchRunnersRemote(trimmed);
          if (currentReqId !== requestIdRef.current) return;

          setDirectoryRunners(res.runners);
          setDirectoryCards(res.cards);
          setDirectoryOrders(res.orders);
          setHasMorePages(false);
        } catch (err: any) {
          if (currentReqId !== requestIdRef.current) return;
          setDirectoryError(err?.message || '⚠️ ค้นหาไม่ได้เพราะ Cloud ขัดข้องหรือโควตาการอ่านรายวันเต็ม');
        } finally {
          if (currentReqId === requestIdRef.current) {
            setDirectoryLoading(false);
          }
        }
      }, 400);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [searchTerm, fetchPageData, searchRunnersRemote, adminUser?.username]);

  const handleNextPage = () => {
    if (!hasMorePages || directoryLoading) return;
    const currentCursor = cursorStack[currentPage];
    if (currentCursor) {
      fetchPageData(currentPage + 1, currentCursor);
    }
  };

  const handlePrevPage = () => {
    if (currentPage <= 1 || directoryLoading) return;
    const prevCursor = cursorStack[currentPage - 2];
    fetchPageData(currentPage - 1, prevCursor);
  };

  // Mask phone number for public privacy
  const maskPhone = (phone: string) => {
    if (!phone) return '-';
    if (adminUser?.isLoggedIn) return phone;
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 3)}-xxx-${clean.slice(7)}`;
    }
    if (clean.length >= 7) {
      return `${clean.slice(0, 3)}***${clean.slice(-3)}`;
    }
    return phone;
  };

  // Filter local directory results
  const filteredRunners = directoryRunners.filter((runner) => {
    if (filterType !== 'all' && runner.regType !== filterType) {
      return false;
    }
    if (filterShirt !== 'all') {
      const order = directoryOrders.find((o) => o.cardId === runner.cardId || o.orderId === runner.shirtOrderId);
      if (filterShirt === 'ordered' && !order) return false;
      if (filterShirt === 'not_ordered' && order) return false;
      if (filterShirt === 'paid' && (!order || (order.status !== 'paid' && order.status !== 'claimed'))) return false;
      if (filterShirt === 'pending' && (!order || order.status !== 'pending_verification')) return false;
    }
    return true;
  });

  const filteredOrders = directoryOrders.filter((order) => {
    if (filterShirt !== 'all') {
      if (filterShirt === 'paid' && order.status !== 'paid' && order.status !== 'claimed') return false;
      if (filterShirt === 'pending' && order.status !== 'pending_verification') return false;
    }
    return true;
  });

  const getRunnerOrder = (runner: RunnerRegistration): ShirtOrder | undefined => {
    return directoryOrders.find((o) => o.orderId === runner.shirtOrderId || o.cardId === runner.cardId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> PUBLIC RUNNER DIRECTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            <EditableText
              sectionKey="directory"
              field="title"
              fallbackText="ค้นหารายชื่อผู้สมัคร & ตรวจสอบการ์ดผี"
            />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            <EditableText
              sectionKey="directory"
              field="subtitle"
              fallbackText="ค้นหารายชื่อ ตรวจสอบสถานะ BIB การ์ดผี และการเช็กอินวันงานจาก Cloud"
            />
          </p>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={async () => {
            const res = await syncFromCloud({ forceAdminSync: !!adminUser?.isLoggedIn });
            alert(res.message);
            fetchPageData(1);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#DC2626] border border-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className={`text-base ${isSyncing ? 'animate-spin' : ''}`}>🔄</span>
          <span>{isSyncing ? 'กำลังดึงข้อมูลล่าสุด...' : 'ซิงค์ข้อมูลกับ Cloud'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="fastwork-card p-5 bg-white space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วย ชื่อ-นามสกุลจริง, BIB, Card ID (FSS26-xxxx), รหัสออเดอร์ (ORD-xxxx) หรือเบอร์โทรศัพท์..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
          />
          {directoryLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#DC2626] flex items-center gap-1">
              <span className="animate-spin">🔄</span> กำลังโหลด...
            </div>
          )}
        </div>

        {searchTerm.trim().length === 1 ? (
          <p className="text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            💬 กรุณาพิมพ์ข้อความอย่างน้อย 2 ตัวอักษรขึ้นไปเพื่อเริ่มค้นหาจาก Cloud
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 font-medium">
            💡 การค้นหาจาก Cloud จำเป็นต้องพิมพ์ ชื่อ-นามสกุลจริง, BIB, Card ID, รหัสออเดอร์ หรือเบอร์โทรศัพท์ ให้ตรงกับที่ลงทะเบียนไว้
          </p>
        )}

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ประเภทการสมัคร</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">ทุกประเภท</option>
              <option value="RUN_FREE">วิ่งฟรี (RUN_FREE)</option>
              <option value="RUN_AND_SHIRT">วิ่ง + สั่งเสื้อ (RUN_AND_SHIRT)</option>
              <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ข้อมูลการสั่งเสื้อ</label>
            <select
              value={filterShirt}
              onChange={(e) => setFilterShirt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">สถานะสั่งเสื้อทั้งหมด</option>
              <option value="ordered">👕 สั่งเสื้อแล้ว</option>
              <option value="not_ordered">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</option>
              <option value="paid">✓ ชำระเงินแล้ว</option>
              <option value="pending">รอตรวจสอบสลิป</option>
            </select>
          </div>
        </div>
      </div>

      {/* Local Directory Error Banner */}
      {directoryError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-2 shadow-sm">
          <span>{directoryError}</span>
          <button
            type="button"
            onClick={() => fetchPageData(currentPage)}
            className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition-colors cursor-pointer"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {/* Tabs with Clarified Page/Search Result Counts */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveViewTab('all')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeViewTab === 'all'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ✨ ทั้งหมดในหน้านี้ ({filteredRunners.length + filteredOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('runners')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewTab === 'runners'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> ผู้สมัครวิ่งในหน้านี้ ({filteredRunners.length} คน)
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('orders')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewTab === 'orders'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Shirt className="w-4 h-4" /> คำสั่งซื้อเสื้อที่ระลึกในหน้านี้ ({filteredOrders.length} รายการ)
        </button>
      </div>

      <p className="text-[11px] text-slate-500 font-medium -mt-2">
        💡 ตัวเลขจำนวนรายการที่แสดงในหน้านี้คือผลลัพธ์จากการแบ่งหน้าหรือการค้นหาจาก Cloud (ไม่ใช่ยอดรวมผู้สมัครทั้งหมดในระบบ)
      </p>

      {/* SHIRT ORDERS TABLE */}
      {(activeViewTab === 'orders' || (activeViewTab === 'all' && filteredOrders.length > 0)) && (
        <div className="fastwork-card overflow-hidden bg-white space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#DC2626]" /> รายการสั่งซื้อเสื้อที่ระลึกในหน้านี้ ({filteredOrders.length} รายการ)
            </h3>
            <span className="text-xs text-slate-500">
              ดึงข้อมูลสั่งซื้อและสถานะชำระเงินที่สัมพันธ์จาก Cloud
            </span>
          </div>

          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs sm:text-sm text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 text-xs font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">ผู้สั่งซื้อ</th>
                  <th className="py-3.5 px-4">จำนวน & ไซซ์</th>
                  <th className="py-3.5 px-4">ยอดรวม</th>
                  <th className="py-3.5 px-4">สถานะชำระเงิน</th>
                  <th className="py-3.5 px-4 text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] whitespace-nowrap">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {maskPhone(order.phone)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900">
                          {order.quantity} ตัว (ไซซ์: {order.sizes && order.sizes.length > 0 ? order.sizes.join(', ') : order.size})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ฿{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            order.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'claimed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {order.status === 'paid'
                            ? '✓ ชำระเงินเรียบร้อย'
                            : order.status === 'claimed'
                            ? '✓ รับเสื้อแล้ว'
                            : order.status === 'pending_verification'
                            ? 'รอตรวจสอบสลิป'
                            : 'รอชำระเงิน'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#DC2626] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      ไม่พบรายการสั่งซื้อเสื้อในหน้านี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RUNNERS TABLE */}
      {(activeViewTab === 'runners' || activeViewTab === 'all') && (
        <div className="fastwork-card overflow-hidden bg-white space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#DC2626]" /> รายชื่อผู้สมัครวิ่งในหน้านี้ ({filteredRunners.length} คน)
            </h3>
            <span className="text-xs text-slate-500">
              ข้อมูล BIB, การ์ดผี, และสถานะการสมัครจาก Cloud
            </span>
          </div>

          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs sm:text-sm text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 text-xs font-bold">
                <tr>
                  <th className="py-3.5 px-4">รหัสลงทะเบียน</th>
                  <th className="py-3.5 px-4">ชื่อจริง-นามสกุลนักวิ่ง</th>
                  <th className="py-3.5 px-4">ผีประจำตัว</th>
                  <th className="py-3.5 px-4">Card ID</th>
                  <th className="py-3.5 px-4">ข้อมูลสั่งเสื้อ</th>
                  <th className="py-3.5 px-4 text-center">ดูการ์ด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRunners.length > 0 ? (
                  filteredRunners.map((runner) => {
                    const card = directoryCards.find((c) => c.cardId === runner.cardId);
                    const species = card ? (THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret) : null;
                    const order = getRunnerOrder(runner);

                    return (
                      <tr key={runner.regId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] whitespace-nowrap">
                          {runner.regId}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setPreviewRunner(runner)}
                            className="text-left group hover:text-[#DC2626] transition-colors cursor-pointer"
                            title="คลิกเพื่อดูข้อมูลผู้สมัคร"
                          >
                            <div className="font-bold text-slate-900 group-hover:text-[#DC2626] flex items-center gap-2">
                              <span>{runner.nameThai || runner.fullName}</span>
                              {runner.nickname && (
                                <span className="text-xs text-slate-500 font-medium">
                                  ({runner.nickname})
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {runner.participantCategory && (
                                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                  {runner.participantCategory === 'student'
                                    ? `นิสิตปี ${runner.studentYear || '-'}`
                                    : runner.participantCategory === 'alumni'
                                    ? 'ศิษย์เก่า'
                                    : runner.participantCategory === 'staff'
                                    ? 'บุคลากร'
                                    : 'บุคคลทั่วไป'}
                                </span>
                              )}
                              {runner.organization && (
                                <span className="text-xs text-slate-500">
                                  {runner.organization}
                                </span>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {species ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-900 text-xs sm:text-sm">
                              <span>👻</span>
                              <span>{species.name}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap text-xs">
                          {runner.cardId}
                        </td>

                        <td className="py-3.5 px-4 min-w-[200px]">
                          {order ? (
                            <button
                              type="button"
                              onClick={() => setPreviewOrder(order)}
                              className="text-left w-full hover:bg-slate-100 p-2 rounded-xl border border-slate-200 bg-slate-50 transition-all cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1">
                                  <Shirt className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                                  <span>ไซซ์ {order.size}</span>
                                  <span className="text-slate-500">({order.quantity} ตัว)</span>
                                </span>
                                <span className="text-xs font-mono text-[#DC2626] font-bold">
                                  ฿{order.totalAmount}
                                </span>
                              </div>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {card && (
                            <button
                              type="button"
                              onClick={() => setPreviewCard(card)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#DC2626] text-slate-700 hover:text-white transition-colors cursor-pointer"
                              title="ดูการ์ดผี"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      {directoryLoading ? (
                        <p className="font-bold text-slate-700">กำลังดึงข้อมูลจาก Cloud...</p>
                      ) : searchTerm.trim() ? (
                        <p className="font-bold text-slate-700">ไม่พบข้อมูลผู้สมัครที่ตรงกับคำค้นหา "{searchTerm}"</p>
                      ) : (
                        <p className="font-bold text-slate-700">ไม่มีข้อมูลในหน้านี้</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS (Only for blank search query browsing) */}
      {!searchTerm.trim() && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-xs text-slate-500 font-medium">
            หน้าปัจจุบัน: <b className="text-slate-900 font-bold">{currentPage}</b>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || directoryLoading}
              onClick={handlePrevPage}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> หน้าก่อนหน้า
            </button>
            <button
              type="button"
              disabled={!hasMorePages || directoryLoading}
              onClick={handleNextPage}
              className="px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              หน้าถัดไป <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Runner Profile Detail Modal */}
      {previewRunner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewRunner(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {previewRunner.nameThai || previewRunner.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  รหัสลงทะเบียน: <b className="text-[#DC2626] font-mono">{previewRunner.regId}</b> &middot; Card ID: <b className="font-mono">{previewRunner.cardId}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-500 block">ชื่อเล่น:</span>
                  <span className="font-bold text-slate-900">{previewRunner.nickname || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">จังหวัด:</span>
                  <span className="font-bold text-slate-900">{previewRunner.province || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ประเภทการสมัคร:</span>
                  <span className="font-bold text-[#DC2626]">{previewRunner.regType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">เบอร์โทรศัพท์ (PDPA):</span>
                  <span className="font-mono font-bold text-slate-900">{maskPhone(previewRunner.phone)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Card Preview Modal */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="relative w-full max-w-sm my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewCard(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" /> ปิดหน้าต่าง
            </button>
            <GhostCardView card={previewCard} />
          </div>
        </div>
      )}
    </div>
  );
};
