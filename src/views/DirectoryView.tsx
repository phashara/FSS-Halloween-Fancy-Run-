import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  Ghost,
  Eye,
  X,
  Shirt,
  Package,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  HelpCircle,
  RefreshCw,
  LayoutGrid,
  List,
  QrCode,
  MapPin,
  Award,
  AlertCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard, RunnerRegistration, ShirtOrder } from '../types';
import { GhostCardView } from '../components/GhostCardView';
import { EditableText } from '../components/EditableText';

export const DirectoryView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const {
    adminUser,
    syncFromCloud,
    isSyncing,
    loadDirectoryPage,
    searchRunnersRemote,
    runners: cachedRunners,
    cards: cachedCards,
    orders: cachedOrders,
    setCurrentCardId,
  } = useEventContext();

  // Search input & presets
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'name' | 'phone' | 'bib' | 'card'>('all');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'runners' | 'orders'>('all');
  const [filterRegType, setFilterRegType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterShirtStatus, setFilterShirtStatus] = useState<string>('all');

  // Directory Cloud State
  const [directoryRunners, setDirectoryRunners] = useState<RunnerRegistration[]>([]);
  const [directoryCards, setDirectoryCards] = useState<GhostCard[]>([]);
  const [directoryOrders, setDirectoryOrders] = useState<ShirtOrder[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState<boolean>(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  // Pagination for blank search browsing
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [cursorStack, setCursorStack] = useState<any[]>([]);

  // Modals & Previews
  const [previewCard, setPreviewCard] = useState<GhostCard | null>(null);
  const [previewOrder, setPreviewOrder] = useState<ShirtOrder | null>(null);
  const [previewRunner, setPreviewRunner] = useState<RunnerRegistration | null>(null);
  const [runnerQrDataUrl, setRunnerQrDataUrl] = useState<string>('');
  const [showTroubleshooter, setShowTroubleshooter] = useState<boolean>(false);

  // Request generation guard
  const requestIdRef = useRef<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Drop private previews when identity changes
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

  // Generate QR code for the selected participant modal
  useEffect(() => {
    if (previewRunner) {
      const qrPayload = previewRunner.regId || previewRunner.cardId || 'FSS26-RUNNER';
      QRCode.toDataURL(qrPayload, {
        width: 240,
        margin: 1.5,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      })
        .then(setRunnerQrDataUrl)
        .catch(() => setRunnerQrDataUrl(''));
    } else {
      setRunnerQrDataUrl('');
    }
  }, [previewRunner]);

  // Fetch paginated directory from Cloud
  const fetchPageData = useCallback(
    async (pageNum: number, lastDocCursor?: any) => {
      const currentReqId = ++requestIdRef.current;
      setDirectoryLoading(true);
      setDirectoryError(null);

      try {
        const res = await loadDirectoryPage({ pageSize: 24, lastDoc: lastDocCursor });
        if (currentReqId !== requestIdRef.current) return;

        setDirectoryRunners(res.runners || []);
        setDirectoryCards(res.cards || []);
        setDirectoryOrders(res.orders || []);
        setHasMorePages(Boolean(res.hasMore));
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
        setDirectoryError(err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้สมัครจาก Cloud');
      } finally {
        if (currentReqId === requestIdRef.current) {
          setDirectoryLoading(false);
        }
      }
    },
    [loadDirectoryPage]
  );

  // Handle Search Input Debounce & Remote Search
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      fetchPageData(1);
      return;
    }

    // Debounced remote search
    const currentReqId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      setDirectoryLoading(true);
      setDirectoryError(null);

      try {
        const res = await searchRunnersRemote(trimmed);
        if (currentReqId !== requestIdRef.current) return;

        // If remote search returned documents, use them
        const foundRunners = res.runners || [];
        const foundCards = res.cards || [];
        const foundOrders = res.orders || [];

        // If remote returned zero, but we have local cached runners, perform fallback substring search
        if (foundRunners.length === 0 && Array.isArray(cachedRunners) && cachedRunners.length > 0) {
          const q = trimmed.toLowerCase();
          const localMatchedRunners = cachedRunners.filter((r) => {
            const matchName = (r.fullName || '').toLowerCase().includes(q);
            const matchThai = (r.nameThai || '').toLowerCase().includes(q);
            const matchEng = (r.nameEng || '').toLowerCase().includes(q);
            const matchNick = (r.nickname || '').toLowerCase().includes(q);
            const matchPhone = (r.phone || '').includes(q);
            const matchBib = (r.bibNumber || '').toLowerCase().includes(q);
            const matchCard = (r.cardId || '').toLowerCase().includes(q);
            const matchReg = (r.regId || '').toLowerCase().includes(q);
            const matchOrg = (r.organization || '').toLowerCase().includes(q);
            return matchName || matchThai || matchEng || matchNick || matchPhone || matchBib || matchCard || matchReg || matchOrg;
          });

          setDirectoryRunners(localMatchedRunners);
          setDirectoryCards(cachedCards || []);
          setDirectoryOrders(cachedOrders || []);
        } else {
          setDirectoryRunners(foundRunners);
          setDirectoryCards(foundCards);
          setDirectoryOrders(foundOrders);
        }

        setHasMorePages(false);
      } catch (err: any) {
        if (currentReqId !== requestIdRef.current) return;
        console.warn('Search query fallback:', err);
        // Fallback to local memory filtering on error/quota cooldown
        if (Array.isArray(cachedRunners) && cachedRunners.length > 0) {
          const q = trimmed.toLowerCase();
          const localFallback = cachedRunners.filter((r) =>
            (r.fullName || '').toLowerCase().includes(q) ||
            (r.nickname || '').toLowerCase().includes(q) ||
            (r.phone || '').includes(q) ||
            (r.bibNumber || '').toLowerCase().includes(q) ||
            (r.cardId || '').toLowerCase().includes(q)
          );
          setDirectoryRunners(localFallback);
          setDirectoryCards(cachedCards || []);
          setDirectoryOrders(cachedOrders || []);
        } else {
          setDirectoryError('ค้นหาด้วย Cloud ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง');
        }
      } finally {
        if (currentReqId === requestIdRef.current) {
          setDirectoryLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchPageData, searchRunnersRemote, cachedRunners, cachedCards, cachedOrders, adminUser?.username]);

  // Mask phone number for public view (PDPA safe)
  const maskPhone = (phone?: string) => {
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

  // Helper to find matching order for a runner
  const getRunnerOrder = (runner: RunnerRegistration): ShirtOrder | undefined => {
    return directoryOrders.find((o) => o.orderId === runner.shirtOrderId || o.cardId === runner.cardId);
  };

  // Filter local directory results by tabs and categories
  const filteredRunners = useMemo(() => {
    return directoryRunners.filter((runner) => {
      // Search preset category constraint if user selected a specific focus
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        if (searchCategory === 'name') {
          const m1 = (runner.fullName || '').toLowerCase().includes(q);
          const m2 = (runner.nameThai || '').toLowerCase().includes(q);
          const m3 = (runner.nameEng || '').toLowerCase().includes(q);
          const m4 = (runner.nickname || '').toLowerCase().includes(q);
          if (!m1 && !m2 && !m3 && !m4) return false;
        } else if (searchCategory === 'phone') {
          const cleanQ = q.replace(/\D/g, '');
          if (!runner.phone.includes(cleanQ)) return false;
        } else if (searchCategory === 'bib') {
          if (!(runner.bibNumber || '').toLowerCase().includes(q)) return false;
        } else if (searchCategory === 'card') {
          if (!(runner.cardId || '').toLowerCase().includes(q)) return false;
        }
      }

      // Reg Type Filter
      if (filterRegType !== 'all' && runner.regType !== filterRegType) {
        return false;
      }

      // Participant Category Filter
      if (filterCategory !== 'all' && runner.participantCategory !== filterCategory) {
        return false;
      }

      // Shirt Status Filter
      if (filterShirtStatus !== 'all') {
        const order = getRunnerOrder(runner);
        if (filterShirtStatus === 'ordered' && !order) return false;
        if (filterShirtStatus === 'not_ordered' && order) return false;
        if (filterShirtStatus === 'paid' && (!order || (order.status !== 'paid' && order.status !== 'claimed'))) return false;
        if (filterShirtStatus === 'pending' && (!order || order.status !== 'pending_verification')) return false;
      }

      return true;
    });
  }, [directoryRunners, directoryOrders, searchTerm, searchCategory, filterRegType, filterCategory, filterShirtStatus]);

  const filteredOrders = useMemo(() => {
    return directoryOrders.filter((order) => {
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const matchName = (order.customerName || '').toLowerCase().includes(q);
        const matchPhone = (order.phone || '').includes(q);
        const matchId = (order.orderId || '').toLowerCase().includes(q);
        const matchCard = (order.cardId || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchId && !matchCard) return false;
      }

      if (filterShirtStatus !== 'all') {
        if (filterShirtStatus === 'paid' && order.status !== 'paid' && order.status !== 'claimed') return false;
        if (filterShirtStatus === 'pending' && order.status !== 'pending_verification') return false;
      }

      return true;
    });
  }, [directoryOrders, searchTerm, filterShirtStatus]);

  // Quick Preset Click Handler
  const handlePresetClick = (preset: 'all' | 'name' | 'phone' | 'bib' | 'card') => {
    setSearchCategory(preset);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleNextPage = () => {
    if (!hasMorePages || directoryLoading) return;
    const currentCursor = cursorStack[currentPage];
    if (currentCursor) {
      fetchPageData(currentPage + 1, currentCursor);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage <= 1 || directoryLoading) return;
    const prevCursor = cursorStack[currentPage - 2];
    fetchPageData(currentPage - 1, prevCursor);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ======================================================== */}
      {/* 1. HERO HEADER & SEARCH SECTION                          */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 mb-1">
              <Users className="w-4 h-4 text-red-600" />
              <span>ระบบค้นหาและตรวจสอบสิทธิ์ผู้เข้าร่วมกิจกรรม</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              <EditableText
                sectionKey="directory"
                field="title"
                fallbackText="ค้นหารายชื่อผู้สมัคร & ตรวจสอบสถานะ BIB"
              />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              <EditableText
                sectionKey="directory"
                field="subtitle"
                fallbackText="พิมพ์ชื่อ-นามสกุล, ชื่อเล่น, หมายเลข BIB, Card ID หรือเบอร์โทรศัพท์ เพื่อดูสถานะการสมัคร การ์ดผีประจำตัว และ QR Code สำหรับเช็กอินวันงาน"
              />
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              type="button"
              disabled={isSyncing}
              onClick={async () => {
                const res = await syncFromCloud({ forceAdminSync: Boolean(adminUser?.isLoggedIn) });
                alert(res.message);
                fetchPageData(1);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="ดึงข้อมูลผู้สมัครล่าสุดจากระบบ Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลล่าสุด'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. PROMINENT SEARCH CARD (Anti-Slop, Highly Usable)      */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                searchCategory === 'name'
                  ? 'พิมพ์ชื่อจริง, นามสกุล หรือชื่อเล่น (ไม่ต้องมีนาย/นางสาว)...'
                  : searchCategory === 'phone'
                  ? 'พิมพ์เบอร์โทรศัพท์ 10 หลักที่ใช้ลงทะเบียน...'
                  : searchCategory === 'bib'
                  ? 'พิมพ์หมายเลข BIB (เช่น 001, 142)...'
                  : searchCategory === 'card'
                  ? 'พิมพ์ Card ID เช่น FSS26-xxxx หรือรหัสออเดอร์ ORD-xxxx...'
                  : 'ค้นหาด้วยชื่อ-นามสกุล, ชื่อเล่น, เบอร์โทรศัพท์, หมายเลข BIB, หรือ Card ID (FSS26-xxxx)...'
              }
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all shadow-xs"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {directoryLoading && (
                <div className="text-xs font-bold text-red-600 flex items-center gap-1.5 pl-1">
                  <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">กำลังค้นหา...</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Helper Presets & Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1 hidden sm:inline">เจาะจงค้นหา:</span>
              <button
                type="button"
                onClick={() => handlePresetClick('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  searchCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick('name')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  searchCategory === 'name'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👤 ชื่อ / นามสกุล
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick('phone')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  searchCategory === 'phone'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📞 เบอร์โทรศัพท์
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick('bib')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  searchCategory === 'bib'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏃 หมายเลข BIB
              </button>
              <button
                type="button"
                onClick={() => handlePresetClick('card')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  searchCategory === 'card'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🪪 Card ID
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowTroubleshooter(!showTroubleshooter)}
              className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showTroubleshooter ? 'ซ่อนคำแนะนำ' : 'หาชื่อไม่พบ? ดูคำแนะนำ'}</span>
            </button>
          </div>

          {/* Expandable Troubleshooter / Search Tips */}
          {showTroubleshooter && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs space-y-2 animate-in fade-in">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>คำแนะนำสำหรับการค้นหารายชื่อให้เจออย่างรวดเร็ว:</span>
              </div>
              <ul className="space-y-1.5 text-amber-900/90 pl-5 list-disc leading-relaxed">
                <li>
                  <b>พิมพ์เฉพาะชื่อจริง หรือเฉพาะนามสกุล:</b> ไม่ต้องพิมพ์คำนำหน้าชื่อ เช่น ให้พิมพ์ <i>"สมชาย"</i> แทน <i>"นายสมชาย"</i> หรือพิมพ์เพียงนามสกุล <i>"ใจดี"</i>
                </li>
                <li>
                  <b>ค้นหาด้วยเบอร์โทรศัพท์ 10 หลัก:</b> กรอกหมายเลขโทรศัพท์ที่ใช้ตอนลงทะเบียน (เช่น <i>0812345678</i>)
                </li>
                <li>
                  <b>ค้นหาด้วย Card ID:</b> พิมพ์รหัสการ์ดผี เช่น <i>FSS26-xxxx</i> ที่แสดงหลังลงทะเบียนสำเร็จ
                </li>
                <li>
                  <b>เพิ่งลงทะเบียนเสร็จไม่ถึงนาที?</b> หากยังไม่พบชื่อทันที ให้กดปุ่ม <b>"ซิงค์ข้อมูลล่าสุด"</b> ที่มุมขวาบนเพื่ออัปเดตข้อมูลจากระบบ Cloud
                </li>
              </ul>
            </div>
          )}

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">ประเภทการสมัคร</label>
              <select
                value={filterRegType}
                onChange={(e) => setFilterRegType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
              >
                <option value="all">ทุกประเภทการสมัคร</option>
                <option value="RUN_FREE">วิ่งฟรี 5.0 KM (RUN_FREE)</option>
                <option value="RUN_AND_SHIRT">วิ่ง + สั่งเสื้อ (RUN_AND_SHIRT)</option>
                <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">สถานะผู้สมัคร</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
              >
                <option value="all">ทุกกลุ่มผู้สมัคร</option>
                <option value="student">นิสิต ม.นเรศวร</option>
                <option value="staff">บุคลากร</option>
                <option value="alumni">ศิษย์เก่า</option>
                <option value="public">บุคคลทั่วไป</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">สถานะเสื้อที่ระลึก</label>
              <select
                value={filterShirtStatus}
                onChange={(e) => setFilterShirtStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
              >
                <option value="all">ทั้งหมด</option>
                <option value="ordered">👕 มีการสั่งเสื้อ</option>
                <option value="paid">✓ ชำระเงินแล้ว</option>
                <option value="pending">⏳ รอตรวจสอบสลิป</option>
                <option value="not_ordered">ไม่ได้รับเสื้อ (วิ่งฟรี)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {directoryError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{directoryError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchPageData(currentPage)}
            className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition-colors cursor-pointer shrink-0"
          >
            ลองโหลดใหม่
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TABS & VIEW LAYOUT TOGGLE (Cards vs Table)           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            รายชื่อทั้งหมด ({filteredRunners.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('runners')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'runners'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>เฉพาะนักวิ่ง ({filteredRunners.filter((r) => r.regType !== 'SHIRT_ONLY').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>ออเดอร์เสื้อ ({filteredOrders.length})</span>
          </button>
        </div>

        {/* Layout Toggle (Card View vs Table View) */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500">
            แสดง <b className="text-slate-900">{filteredRunners.length}</b> รายชื่อ
          </span>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองการ์ด (อ่านง่ายบนมือถือ)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ด</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองตาราง (สำหรับคอมพิวเตอร์)"
            >
              <List className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA (Cards or Table)                    */}
      {/* ======================================================== */}
      {activeTab === 'orders' ? (
        /* Orders Only View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shirt className="w-4 h-4 text-red-600" />
              <span>รายการคำสั่งซื้อเสื้อที่ระลึก ({filteredOrders.length} รายการ)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200 text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">ผู้สั่งซื้อ</th>
                  <th className="py-3 px-4">จำนวน & ไซซ์</th>
                  <th className="py-3 px-4">ยอดรวม</th>
                  <th className="py-3 px-4">สถานะการชำระเงิน</th>
                  <th className="py-3 px-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600 whitespace-nowrap">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div>{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{maskPhone(order.phone)}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">
                          {order.quantity} ตัว
                        </span>{' '}
                        <span className="text-slate-500">
                          (ไซซ์: {order.sizes && order.sizes.length > 0 ? order.sizes.join(', ') : order.size})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 whitespace-nowrap">
                        ฿{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${
                            order.status === 'paid'
                              ? 'text-emerald-700'
                              : order.status === 'claimed'
                              ? 'text-blue-700'
                              : order.status === 'pending_verification'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {order.status === 'paid'
                            ? '✓ ชำระเงินเรียบร้อย'
                            : order.status === 'claimed'
                            ? '🎁 รับเสื้อแล้ว'
                            : order.status === 'pending_verification'
                            ? '⏳ รอตรวจสอบสลิป'
                            : 'ยังไม่ชำระ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      ไม่พบรายการสั่งซื้อเสื้อที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredRunners.length === 0 ? (
        /* Zero Results - Helpful Troubleshooting Box */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {directoryLoading
                ? 'กำลังดึงข้อมูลรายชื่อจากระบบ Cloud...'
                : searchTerm.trim()
                ? `ไม่พบรายชื่อที่ตรงกับ "${searchTerm}"`
                : 'ยังไม่มีข้อมูลผู้สมัครในหน้านี้'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              หากท่านเพิ่งลงทะเบียน หรือยังหาชื่อไม่พบ ลองค้นหาด้วยวิธีแนะนำด้านล่าง หรือตรวจสอบตัวสะกดอีกครั้ง
            </p>
          </div>

          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>วิธีค้นหาที่แนะนำ:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block">1. ลองพิมพ์เฉพาะ "ชื่อจริง"</span>
                <span className="text-slate-500">ไม่ต้องใส่คำนำหน้า เช่น "กิตติศักดิ์" หรือพิมพ์เฉพาะนามสกุล</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block">2. ค้นหาด้วยเบอร์โทรศัพท์</span>
                <span className="text-slate-500">พิมพ์เบอร์โทรศัพท์ 10 หลักที่กรอกตอนสมัครวิ่ง</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block">3. ค้นหาด้วย Card ID หรือ BIB</span>
                <span className="text-slate-500">พิมพ์รหัสการ์ด FSS26-xxxx หรือเลข BIB</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block">4. ซิงค์ข้อมูลล่าสุด</span>
                <span className="text-slate-500">กดปุ่มซิงค์หากเพิ่งสมัครเสร็จเมื่อสักครู่</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRegType('all');
                  setFilterCategory('all');
                  setFilterShirtStatus('all');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                ล้างคำค้นหา (ดูรายชื่อทั้งหมด)
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>ยังไม่ได้ลงทะเบียน? สมัครวิ่งตอนนี้</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : viewLayout === 'cards' ? (
        /* ======================================================== */
        /* CARDS VIEW: Mobile-Optimized, High Legibility, Anti-Slop */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRunners.map((runner) => {
            const card = directoryCards.find((c) => c.cardId === runner.cardId);
            const species = card ? THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret : null;
            const order = getRunnerOrder(runner);

            return (
              <div
                key={runner.regId}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Card Top: BIB & Registration ID */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {runner.bibNumber ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-bold text-xs tracking-wider shadow-xs">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>BIB {runner.bibNumber}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">รอจัดสรร BIB</span>
                    )}
                  </div>

                  <span className="font-mono text-[11px] text-slate-400">
                    {runner.regId}
                  </span>
                </div>

                {/* Participant Core Identity */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {runner.nameThai || runner.fullName}
                    </h3>
                    {runner.nickname && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({runner.nickname})
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata with subtle separators (Zero-Pill Discipline) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                    <span>
                      {runner.participantCategory === 'student'
                        ? `นิสิตปี ${runner.studentYear || '-'}`
                        : runner.participantCategory === 'staff'
                        ? 'บุคลากร'
                        : runner.participantCategory === 'alumni'
                        ? 'ศิษย์เก่า'
                        : 'บุคคลทั่วไป'}
                    </span>
                    {runner.organization && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[150px]" title={runner.organization}>
                          {runner.organization}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Package & Shirt Order Details */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">ประเภท:</span>
                    <span className="font-semibold text-slate-900">
                      {runner.regType === 'RUN_FREE'
                        ? 'วิ่งฟรี 5.0 KM'
                        : runner.regType === 'RUN_AND_SHIRT'
                        ? 'วิ่ง + เสื้อเรืองแสง'
                        : 'ซื้อเสื้ออย่างเดียว'}
                    </span>
                  </div>

                  {order ? (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Shirt className="w-3.5 h-3.5 text-red-600" />
                        <span>เสื้อ {order.size}:</span>
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {order.status === 'paid'
                          ? '✓ ชำระแล้ว'
                          : order.status === 'claimed'
                          ? '🎁 รับเสื้อแล้ว'
                          : order.status === 'pending_verification'
                          ? '⏳ รอตรวจสลิป'
                          : 'รอชำระ'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-400">
                      <span>เสื้อ:</span>
                      <span>ไม่ได้สั่งเสื้อ</span>
                    </div>
                  )}

                  {/* Ghost Card Badge */}
                  {species && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Ghost className="w-3.5 h-3.5 text-purple-600" />
                        <span>การ์ดผี:</span>
                      </span>
                      <span className="font-semibold text-purple-900">
                        {species.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewRunner(runner)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูข้อมูล / QR</span>
                  </button>

                  {card && (
                    <button
                      type="button"
                      onClick={() => setPreviewCard(card)}
                      className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="ดูการ์ดผีประจำตัว"
                    >
                      <Ghost className="w-3.5 h-3.5" />
                      <span>การ์ดผี</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* TABLE VIEW: Spacious, High Contrast Desktop Format       */
        /* ======================================================== */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200 text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">BIB & รหัสสมัคร</th>
                  <th className="py-3.5 px-4">ชื่อ-นามสกุล (ชื่อเล่น)</th>
                  <th className="py-3.5 px-4">สถานะ & สังกัด</th>
                  <th className="py-3.5 px-4">ประเภทการสมัคร</th>
                  <th className="py-3.5 px-4">เสื้อที่ระลึก</th>
                  <th className="py-3.5 px-4">การ์ดผี</th>
                  <th className="py-3.5 px-4 text-center">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRunners.map((runner) => {
                  const card = directoryCards.find((c) => c.cardId === runner.cardId);
                  const species = card ? THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret : null;
                  const order = getRunnerOrder(runner);

                  return (
                    <tr key={runner.regId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {runner.bibNumber ? (
                          <span className="font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md mr-1.5">
                            {runner.bibNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 mr-1.5">-</span>
                        )}
                        <span className="text-[11px] text-slate-400">{runner.regId}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{runner.nameThai || runner.fullName}</span>
                          {runner.nickname && (
                            <span className="text-xs text-slate-500 font-normal">({runner.nickname})</span>
                          )}
                        </div>
                        {runner.nameEng && (
                          <div className="text-[11px] text-slate-400">{runner.nameEng}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {runner.participantCategory === 'student'
                            ? `นิสิตปี ${runner.studentYear || '-'}`
                            : runner.participantCategory === 'staff'
                            ? 'บุคลากร'
                            : runner.participantCategory === 'alumni'
                            ? 'ศิษย์เก่า'
                            : 'บุคคลทั่วไป'}
                        </div>
                        {runner.organization && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={runner.organization}>
                            {runner.organization}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 font-medium">
                          {runner.regType === 'RUN_FREE'
                            ? 'วิ่งฟรี 5.0 KM'
                            : runner.regType === 'RUN_AND_SHIRT'
                            ? 'วิ่ง + เสื้อ'
                            : 'ซื้อเสื้ออย่างเดียว'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order ? (
                          <div>
                            <span className="font-semibold text-slate-900">ไซซ์ {order.size}</span>
                            <span className="text-[11px] text-emerald-700 block">
                              {order.status === 'paid'
                                ? '✓ ชำระแล้ว'
                                : order.status === 'claimed'
                                ? '🎁 รับเสื้อแล้ว'
                                : 'รอตรวจสอบ'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {species ? (
                          <button
                            type="button"
                            onClick={() => card && setPreviewCard(card)}
                            className="text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>👻</span>
                            <span>{species.name}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewRunner(runner)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          ดูข้อมูล
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PAGINATION (Browsing when search is blank)            */}
      {/* ======================================================== */}
      {!searchTerm.trim() && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <span className="text-xs text-slate-500 font-medium">
            หน้าปัจจุบัน: <b className="text-slate-900 font-bold">{currentPage}</b>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || directoryLoading}
              onClick={handlePrevPage}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" /> หน้าก่อนหน้า
            </button>
            <button
              type="button"
              disabled={!hasMorePages || directoryLoading}
              onClick={handleNextPage}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              หน้าถัดไป <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. PARTICIPANT DETAIL & QR MODAL                         */}
      {/* ======================================================== */}
      {previewRunner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setPreviewRunner(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold mb-1">
                  <span>ผู้เข้าร่วมกิจกรรม FSS 2026</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {previewRunner.nameThai || previewRunner.fullName}
                  {previewRunner.nickname && <span className="text-slate-500 font-normal ml-1">({previewRunner.nickname})</span>}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รหัสลงทะเบียน: <b className="text-red-600 font-mono">{previewRunner.regId}</b> &middot; Card ID: <b className="font-mono">{previewRunner.cardId}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code and BIB Highlight */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {runnerQrDataUrl ? (
                <img
                  src={runnerQrDataUrl}
                  alt="QR Code สำหรับเช็กอิน"
                  className="w-28 h-28 rounded-xl bg-white p-1.5 border border-slate-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="space-y-1 flex-1">
                <div className="text-xs text-slate-500">หมายเลขประจำตัวนักวิ่ง (BIB)</div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {previewRunner.bibNumber ? `BIB ${previewRunner.bibNumber}` : 'รอจัดสรร BIB หน้างาน'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                  📱 บันทึกภาพหน้าจอ QR Code นี้เพื่อใช้แสดงต่อเจ้าหน้าที่จุดลงทะเบียนในวันงานวิ่ง 31 ต.ค. 2569
                </p>
              </div>
            </div>

            {/* Full Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">ประเภทการสมัคร:</span>
                <span className="font-bold text-slate-900">
                  {previewRunner.regType === 'RUN_FREE'
                    ? 'วิ่งฟรี 5.0 KM'
                    : previewRunner.regType === 'RUN_AND_SHIRT'
                    ? 'วิ่ง + สั่งเสื้อ'
                    : 'ซื้อเสื้ออย่างเดียว'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">สถานะ/สังกัด:</span>
                <span className="font-bold text-slate-900">
                  {previewRunner.participantCategory === 'student'
                    ? `นิสิตปี ${previewRunner.studentYear || '-'}`
                    : previewRunner.participantCategory === 'staff'
                    ? 'บุคลากร'
                    : previewRunner.participantCategory === 'alumni'
                    ? 'ศิษย์เก่า'
                    : 'บุคคลทั่วไป'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">เบอร์โทรศัพท์:</span>
                <span className="font-mono font-bold text-slate-900">{maskPhone(previewRunner.phone)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">การเช็กอินวันงาน:</span>
                <span className={`font-bold ${previewRunner.checkedIn ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {previewRunner.checkedIn ? '✓ เช็กอินแล้ว' : 'ยังไม่เช็กอิน'}
                </span>
              </div>

              {previewRunner.organization && (
                <div className="col-span-2 p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">คณะ / หน่วยงาน:</span>
                  <span className="font-bold text-slate-900">{previewRunner.organization}</span>
                </div>
              )}
            </div>

            {/* Ghost Card & Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const c = directoryCards.find((card) => card.cardId === previewRunner.cardId);
                  if (c) {
                    setPreviewCard(c);
                  } else {
                    setCurrentCardId(previewRunner.cardId);
                    onNavigate('mycard');
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ghost className="w-4 h-4" />
                <span>เปิดดูการ์ดผีประจำตัว</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. GHOST CARD PREVIEW MODAL                              */}
      {/* ======================================================== */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in"
          onClick={() => setPreviewCard(null)}
        >
          <div className="relative w-full max-w-sm my-8" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewCard(null)}
              className="absolute -top-12 right-0 p-2 text-white/90 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" /> ปิดหน้าต่าง
            </button>
            <GhostCardView card={previewCard} />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. ORDER DETAIL MODAL                                    */}
      {/* ======================================================== */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setPreviewOrder(null)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">คำสั่งซื้อ {previewOrder.orderId}</h3>
                <p className="text-xs text-slate-500">ผู้สั่งซื้อ: {previewOrder.customerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวนเสื้อ:</span>
                  <span className="font-bold text-slate-900">{previewOrder.quantity} ตัว</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ไซซ์:</span>
                  <span className="font-bold text-slate-900">
                    {previewOrder.sizes && previewOrder.sizes.length > 0 ? previewOrder.sizes.join(', ') : previewOrder.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดรวม:</span>
                  <span className="font-bold text-red-600 font-mono">฿{(previewOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">การจัดส่ง:</span>
                  <span className="font-bold text-slate-900">
                    {previewOrder.deliveryMethod === 'pickup_event' ? 'รับหน้างาน ม.นเรศวร' : 'จัดส่งไปรษณีย์'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">สถานะชำระเงิน:</span>
                  <span className="font-bold text-emerald-700">
                    {previewOrder.status === 'paid'
                      ? '✓ ชำระแล้ว'
                      : previewOrder.status === 'claimed'
                      ? '🎁 มอบเสื้อแล้ว'
                      : previewOrder.status === 'pending_verification'
                      ? '⏳ รอตรวจสลิป'
                      : 'ยังไม่ชำระ'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewOrder(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
