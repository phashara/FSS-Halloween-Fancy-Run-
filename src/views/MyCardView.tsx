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
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { GhostCardView } from '../components/GhostCardView';
import { THAI_GHOSTS } from '../data/ghosts';

export const MyCardView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { currentCard, currentRunner, cards, runners, setCurrentCardId } = useEventContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const species = currentCard ? THAI_GHOSTS[currentCard.speciesId] : null;
  const ghostHeadline = species
    ? species.name.startsWith('ผี') || species.name.startsWith('นาง')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`
    : '';

  const handleSearchCard = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    const foundCard = cards.find(
      (c) =>
        c.cardId.toUpperCase() === q ||
        c.nickname.toUpperCase().includes(q) ||
        runners.some(
          (r) =>
            r.cardId === c.cardId &&
            (r.phone.includes(q) || (r.bibNumber && r.bibNumber.toUpperCase() === q))
        )
    );

    if (foundCard) {
      setCurrentCardId(foundCard.cardId);
      setSearchQuery('');
    } else {
      setSearchError('ไม่พบการ์ดผีด้วยหมายเลขหรือเบอร์โทรนี้');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Header & Card Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-400" /> การ์ดผีประจำตัวของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            การ์ด 1 ใบ หมายเลขเดิม QR Code เดียว ใช้เช็กอินและสะสมพลังตลอดงาน
          </p>
        </div>

        {/* Quick Search Card form */}
        <form onSubmit={handleSearchCard} className="w-full sm:w-auto flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา Card ID หรือเบอร์โทร"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 focus:outline-none w-full sm:w-56"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md transition-colors shrink-0"
          >
            <Search className="w-3.5 h-3.5" /> ค้นหา
          </button>
        </form>
      </div>

      {searchError && (
        <div className="p-3.5 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Main Card Display & Status Overview */}
      {currentCard ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Card Column */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {ghostHeadline && (
              <div className="w-full max-w-[340px] sm:max-w-[400px] mb-3 text-center sm:text-left bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-0.5">
                  👻 THAI GHOST IDENTITY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
                  {ghostHeadline}
                </h2>
                <p className="text-[11px] text-slate-300">
                  {species?.title} • การ์ดเสมือนจริง 3D พร้อมตราสัญลักษณ์
                </p>
              </div>
            )}
            <GhostCardView card={currentCard} showModeToggle={true} />
          </div>

          {/* Details & Mission Evolution Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Level Progress Widget */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    EVOLUTION PROGRESS
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    สถานะการพัฒนา: LV.{currentCard.level} / 3
                  </h3>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded-full">
                  {currentCard.level === 3 ? '100% ULTIMATE' : currentCard.level === 2 ? '65% UNLEASHED' : '33% AWAKENED'}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: currentCard.level === 3 ? '100%' : currentCard.level === 2 ? '66%' : '33%',
                  }}
                />
              </div>

              {/* Evolution Checklist */}
              <div className="space-y-3 pt-2 text-xs">
                {/* Task 1: Registration */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        1. สมัครเข้าร่วมงาน (Awakened)
                      </span>
                      <span className="text-[10px] text-slate-400">ปลดล็อกการ์ดผี LV.1</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">สำเร็จ ✓</span>
                </div>

                {/* Task 2: Shirt Owner */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {currentCard.badges.includes('SHIRT_OWNER') ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Shirt className="w-4 h-4 text-orange-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        2. สั่งซื้อเสื้อที่ระลึก (Shirt Owner)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currentCard.badges.includes('SHIRT_OWNER')
                          ? 'ปลดล็อกตรา SHIRT OWNER แล้ว (+ความเร็ว & พลังแฝง)'
                          : 'สั่งซื้อเสื้อเพื่ออัปเกรดเป็น LV.2 หรือ LV.3'}
                      </span>
                    </div>
                  </div>
                  {currentCard.badges.includes('SHIRT_OWNER') ? (
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">สำเร็จ ✓</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('shirt')}
                      className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold transition-colors"
                    >
                      สั่งซื้อเสื้อ
                    </button>
                  )}
                </div>

                {/* Task 3: Storyteller */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {currentCard.badges.includes('STORYTELLER') ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Flame className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        3. แชร์เรื่องสยองขวัญ (Storyteller)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currentCard.badges.includes('STORYTELLER')
                          ? 'เรื่องผ่านการอนุมัติแล้ว ได้รับตรา STORYTELLER'
                          : 'แบ่งปันประสบการณ์หลอนเพื่อปลดล็อกตรา'}
                      </span>
                    </div>
                  </div>
                  {currentCard.badges.includes('STORYTELLER') ? (
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">สำเร็จ ✓</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('horror')}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-colors"
                    >
                      เล่าเรื่องสยอง
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Check-In Pass */}
            {currentRunner && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#150f28] border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> บัตรเช็กอินวันงาน (Event Pass)
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">หมายเลข BIB</span>
                    <span className="text-base font-black text-white font-mono">
                      {currentRunner.bibNumber || 'ไม่มี (เฉพาะซื้อเสื้อ)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">สถานะเช็กอิน</span>
                    <span
                      className={`text-xs font-bold block mt-1 ${
                        currentRunner.checkedIn ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {currentRunner.checkedIn ? '✓ เช็กอินแล้ว' : 'ยังไม่เช็กอิน (สแกนหน้างาน)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">การรับเสื้อ</span>
                    <span className="text-xs font-bold text-slate-200 block mt-1">
                      {currentRunner.shirtClaimed ? '✓ รับเสื้อแล้ว' : 'ยังไม่ได้รับ'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">เหรียญรางวัล Finisher</span>
                    <span className="text-xs font-bold text-slate-200 block mt-1">
                      {currentRunner.medalClaimed ? '✓ รับเหรียญแล้ว' : 'รับหลังเข้าเส้นชัย'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic text-center pt-2">
                  *ในวันงาน 31 ต.ค. เพียงเปิดหน้าจอแสดง QR Code จากการ์ดผีของคุณให้เจ้าหน้าที่สแกน
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <span className="text-4xl">👻</span>
          <h3 className="text-xl font-bold text-white">ยังไม่มีการ์ดผีประจำตัว</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            ร่วมสมัครวิ่งแฟนซี หรือตอบแบบทดสอบเพื่อค้นพบว่าคุณคือผีไทยชนิดไหน พร้อมรับการ์ดและ QR Code ทันที
          </p>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all"
          >
            สมัครวิ่งและรับการ์ดผี
          </button>
        </div>
      )}
    </div>
  );
};
