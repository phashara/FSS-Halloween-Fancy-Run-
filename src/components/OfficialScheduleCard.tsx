import React from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  Award,
  Sparkles,
  Share2,
  Users,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface ScheduleItem {
  time: string;
  title: string;
  desc: string;
  highlight?: boolean;
  badge?: string;
  icon: string;
}

const OFFICIAL_SCHEDULE: ScheduleItem[] = [
  {
    time: '17:00 – 18:00 น.',
    title: 'ลงทะเบียนผู้เข้าร่วมงาน',
    desc: 'เปิดจุดลงทะเบียน เช็กอินรับ BIB ประจำตัว, ตรวจสอบการ์ดผี และรับเสื้อวิ่งที่ระลึกสำหรับผู้สั่งจองล่วงหน้า',
    icon: '📝',
    badge: 'Check-in & Bib',
  },
  {
    time: '18:00 – 18:15 น.',
    title: 'พิธีเปิด',
    desc: 'กล่าวเปิดงานอย่างเป็นทางการ โดยคณบดีและผู้บริหารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร',
    icon: '🎙️',
    badge: 'Opening Ceremony',
  },
  {
    time: '18:15 – 18:30 น.',
    title: 'Warm Up',
    desc: 'กิจกรรมวอร์มอัปยืดเหยียดร่างกายสไตล์หลอน ปลุกเอนเนอร์จี้วิญญาณนักวิ่งโดยทีมเทรนเนอร์มืออาชีพ',
    icon: '⚡',
    badge: 'Ghost Warm-Up',
  },
  {
    time: '18:30 – 18:40 น.',
    title: 'ปล่อยตัวผู้แข่งขัน',
    desc: 'ปล่อยตัวนักวิ่งแฟนซีระยะ 5.0 KM ออกสตาร์ทจากหน้าคณะสังคมศาสตร์ สู่เส้นทางรอบมหาวิทยาลัยนเรศวร - สระสุริโยทัย',
    highlight: true,
    icon: '🏁',
    badge: 'Race Flag-off',
  },
  {
    time: '20:00 เป็นต้นไป',
    title: 'มอบรางวัล',
    desc: 'พิธีมอบเหรียญรางวัล Finisher Medal และคูปองอาหารมื้อพิเศษสำหรับ 350 ท่านแรกที่เข้าเส้นชัย พร้อมประกาศผลรางวัลการประกวดชุดแฟนซีผีไทยยอดเยี่ยม',
    highlight: true,
    icon: '🏆',
    badge: 'Medal & 350 Finisher Perks',
  },
];

export const OfficialScheduleCard: React.FC = () => {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#140b1e] via-[#0f0a17] to-[#07050c] border border-purple-500/30 shadow-2xl overflow-hidden relative">
      {/* Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Poster Header */}
      <div className="p-6 sm:p-8 text-center border-b border-purple-500/20 relative">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
            🏛️ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight mt-1">
          กำหนดการงานวิ่งคืนปล่อยผี
        </h3>
        <p className="text-base sm:text-lg font-normal text-orange-400 mt-1 font-horror tracking-wider drop-shadow-[1px_2px_0px_rgba(0,0,0,0.85)]">
          FSS HALLOWEEN FANCY RUN 2026
        </p>

        {/* Date & Location Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>วันเสาร์ที่ 31 ตุลาคม 2569</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</span>
          </div>
        </div>
      </div>

      {/* Finisher Alert Bar */}
      <div className="px-6 py-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border-b border-amber-500/30 text-center">
        <p className="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-2">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>มีเหรียญรางวัลและคูปองอาหารสำหรับ 350 ท่านแรกที่วิ่งเข้าเส้นชัย!</span>
        </p>
      </div>

      {/* Schedule Timeline Steps */}
      <div className="p-6 sm:p-8 space-y-4 relative">
        {OFFICIAL_SCHEDULE.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              item.highlight
                ? 'bg-gradient-to-r from-orange-950/40 via-slate-900/90 to-purple-950/40 border-orange-500/40 shadow-lg shadow-orange-950/20'
                : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3.5">
              {/* Icon / Clock */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xl shadow-inner ${
                  item.highlight
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-orange-500/30'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}
              >
                {item.icon}
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span
                    className={`font-mono font-bold text-sm sm:text-base ${
                      item.highlight ? 'text-amber-300' : 'text-orange-400'
                    }`}
                  >
                    {item.time}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        item.highlight
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Official Poster Social Links Footer (From the uploaded poster) */}
      <div className="p-5 sm:p-6 bg-slate-950/80 border-t border-purple-500/20">
        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
          ติดตามข่าวสารและช่องทางประชาสัมพันธ์อย่างเป็นทางการ
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-blue-400 font-bold">Facebook:</span>
            <span className="truncate text-slate-200 font-medium">FSS Fancy Run</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-pink-400 font-bold">Instagram:</span>
            <span className="truncate text-slate-200 font-medium">@fss_fancyrun</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-emerald-400 font-bold">LINE:</span>
            <span className="truncate text-slate-200 font-medium">FSS Fancy Run</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="text-rose-400 font-bold">TikTok:</span>
            <span className="truncate text-slate-200 font-medium">@fss_fancyrun</span>
          </div>
        </div>
      </div>
    </div>
  );
};
