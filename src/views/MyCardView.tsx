import React, { useState } from 'react';
import {
  Sparkles,
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  Shirt,
  Flame,
  Award,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { GhostCardView } from '../components/GhostCardView';
import { THAI_GHOSTS } from '../data/ghosts';

export const MyCardView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const {
    currentCard,
    currentRunner,
    cards,
    runners,
    setCurrentCardId,
    ghostSpeciesList,
    loadCardById,
    searchRunnersRemote,
  } = useEventContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const species = currentCard
    ? ghostSpeciesList.find((g) => g.id === currentCard.speciesId) || THAI_GHOSTS[currentCard.speciesId] || THAI_GHOSTS.pret
    : null;
  const ghostHeadline = species
    ? species.name.startsWith('ผี') || species.name.startsWith('นาง')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`
    : '';

  const handleSearchCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    // 1. Check local state
    const foundCard = cards.find(
      (c) =>
        c.cardId.toUpperCase() === q ||
        c.nickname.toUpperCase().includes(q) ||
        runners.some(
          (r) =>
            r.cardId === c.cardId &&
            (r.phone.includes(q) || r.regId.toUpperCase() === q || (r.bibNumber && r.bibNumber.toUpperCase() === q))
        )
    );

    if (foundCard) {
      setCurrentCardId(foundCard.cardId);
      setSearchQuery('');
      return;
    }

    // 2. Fetch on-demand from Cloud Firestore
    setIsSearching(true);
    try {
      if (q.startsWith('FSS26')) {
        const remoteCard = await loadCardById(q);
        if (remoteCard) {
          setCurrentCardId(remoteCard.cardId);
          setSearchQuery('');
          return;
        }
      }

      const remoteRunners = await searchRunnersRemote(q);
      if (remoteRunners.length > 0 && remoteRunners[0].cardId) {
        await loadCardById(remoteRunners[0].cardId);
        setCurrentCardId(remoteRunners[0].cardId);
        setSearchQuery('');
        return;
      }

      setSearchError('ไม่พบการ์ดผีด้วยหมายเลข Card ID, BIB, หรือเบอร์โทรนี้');
    } catch {
      setSearchError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Card Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" /> DIGITAL GHOST PASS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            การ์ดผีประจำตัวของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            การ์ด 1 ใบ หมายเลขเดิม QR Code เดียว ใช้เช็กอินและสะสมพลังตลอดงาน
          </p>
        </div>

        {/* Quick Search Card form */}
        <form onSubmit={handleSearchCard} className="w-full sm:w-auto flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา Card ID หรือเบอร์โทร..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2626] w-full sm:w-60 shadow-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors shrink-0"
          >
            <Search className="w-3.5 h-3.5" /> ค้นหา
          </button>
        </form>
      </div>

      {/* Quick Select Runner Card Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs text-slate-500 font-bold shrink-0">การ์ดตัวอย่าง:</span>
        {cards.map((c) => {
          const sp = ghostSpeciesList.find((g) => g.id === c.speciesId) || THAI_GHOSTS[c.speciesId];
          const isSelected = currentCard?.cardId === c.cardId;
          return (
            <button
              key={c.cardId}
              type="button"
              onClick={() => setCurrentCardId(c.cardId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{sp?.name || c.speciesId}</span>
              <span className="text-[11px] font-mono opacity-80">({c.cardId})</span>
            </button>
          );
        })}
      </div>

      {searchError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Main Card Display & Status Overview */}
      {currentCard ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card Column */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {ghostHeadline && (
              <div className="w-full max-w-[340px] sm:max-w-[400px] mb-3 text-center sm:text-left bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest block mb-0.5">
                  👻 THAI GHOST IDENTITY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {ghostHeadline}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {species?.title} &middot; การ์ดประจำตัวพร้อมตราสัญลักษณ์
                </p>
              </div>
            )}
            <GhostCardView card={currentCard} showModeToggle={true} />
          </div>

          {/* Level Evolution & Info Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Level Timeline */}
            <div className="fastwork-card p-6 bg-white space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DC2626]" /> สถานะวิวัฒนาการการ์ด (Card Evolution)
              </h3>

              <div className="space-y-3">
                {/* Level 1 */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">LV.1 วิญญาณตื่น (Awakened)</h4>
                      <p className="text-[11px] text-slate-500">ได้รับทันทีเมื่อสมัครวิ่งฟรี</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00B67A]">✓ ปลดล็อกแล้ว</span>
                </div>

                {/* Level 2 */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    currentCard.level >= 2
                      ? 'bg-[#FEF2F2] border-red-200'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                        currentCard.level >= 2
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      2
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        LV.2 ปลดผนึกพลัง (Unleashed)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        สั่งซื้อเสื้อที่ระลึก + ตรา SHIRT OWNER (+6 SPD)
                      </p>
                    </div>
                  </div>
                  {currentCard.level >= 2 ? (
                    <span className="text-xs font-bold text-[#DC2626]">✓ ปลดล็อกแล้ว</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('shirt')}
                      className="px-3 py-1 bg-[#DC2626] text-white rounded-lg text-xs font-bold hover:bg-[#B91C1C]"
                    >
                      สั่งเสื้อเพื่ออัปเกรด
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Runner Pass Info Card */}
            {currentRunner && (
              <div className="fastwork-card p-6 bg-white space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DC2626]" /> ข้อมูลนักวิ่งประจำการ์ด
                </h3>
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">ชื่อนักวิ่ง:</span>
                    <span className="font-bold text-slate-900">{currentRunner.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">รหัสลงทะเบียน:</span>
                    <span className="font-bold text-[#DC2626] font-mono">{currentRunner.regId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ประเภท:</span>
                    <span className="font-semibold text-slate-800">
                      {currentRunner.regType === 'RUN_FREE'
                        ? 'วิ่งฟรี (Free Run)'
                        : currentRunner.regType === 'RUN_AND_SHIRT'
                        ? 'วิ่ง + เสื้อ'
                        : 'ซื้อเสื้ออย่างเดียว'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">สถานะเช็กอิน:</span>
                    <span className={`font-bold ${currentRunner.checkedIn ? 'text-[#00B67A]' : 'text-slate-500'}`}>
                      {currentRunner.checkedIn ? '✓ เช็กอินแล้ว' : 'ยังไม่เช็กอิน'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center fastwork-card bg-white space-y-4">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">ยังไม่มีการ์ดผีที่เลือก</h3>
          <p className="text-xs text-slate-500">
            คุณสามารถค้นหาด้วยหมายเลข Card ID หรือสมัครวิ่งเพื่อรับการ์ดใหม่
          </p>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl shadow-sm"
          >
            สมัครวิ่งเพื่อรับการ์ดผี
          </button>
        </div>
      )}
    </div>
  );
};
