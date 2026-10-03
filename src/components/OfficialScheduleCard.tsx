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
    title: 'ลงทะเบียนผู้เข้าร่วมงาน & รับเสื้อ',
    desc: 'เปิดจุดลงทะเบียน เช็กอินรับ BIB ประจำตัว, ตรวจสอบการ์ดผี และรับเสื้อวิ่งที่ระลึกสำหรับผู้สั่งจองล่วงหน้า',
    icon: '📝',
    badge: 'Check-in & Bib',
  },
  {
    time: '18:00 – 18:15 น.',
    title: 'พิธีเปิดกิจกรรมอย่างเป็นทางการ',
    desc: 'กล่าวเปิดงานอย่างเป็นทางการ โดยคณบดีและผู้บริหารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร',
    icon: '🎙️',
    badge: 'Opening Ceremony',
  },
  {
    time: '18:15 – 18:30 น.',
    title: 'Ghost Warm Up ยืดเหยียดร่างกาย',
    desc: 'กิจกรรมวอร์มอัปยืดเหยียดร่างกายสไตล์หลอน ปลุกเอนเนอร์จี้วิญญาณนักวิ่งโดยทีมเทรนเนอร์มืออาชีพ',
    icon: '⚡',
    badge: 'Ghost Warm-Up',
  },
  {
    time: '18:30 – 18:40 น.',
    title: 'ปล่อยตัวนักวิ่งแฟนซี 5.0 KM',
    desc: 'ปล่อยตัวนักวิ่งแฟนซีระยะ 5.0 KM ออกสตาร์ทจากหน้าคณะสังคมศาสตร์ สู่เส้นทางรอบมหาวิทยาลัยนเรศวร - สระสุริโยทัย',
    highlight: true,
    icon: '🏁',
    badge: 'Race Flag-off',
  },
  {
    time: '20:00 เป็นต้นไป',
    title: 'พิธีมอบเหรียญรางวัล & ประกาศผลแฟนซี',
    desc: 'พิธีมอบเหรียญรางวัล Finisher Medal และคูปองอาหารมื้อพิเศษสำหรับ 350 ท่านแรกที่เข้าเส้นชัย พร้อมประกาศผลรางวัลการประกวดชุดแฟนซีผีไทยยอดเยี่ยม',
    highlight: true,
    icon: '🏆',
    badge: 'Medal & 350 Finisher Perks',
  },
];

export const OfficialScheduleCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 text-center border-b border-slate-100 bg-slate-50/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold mb-2">
          🏛️ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          กำหนดการงานวิ่ง FSS HALLOWEEN 2026
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>วันเสาร์ที่ 31 ตุลาคม 2569</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>ลานกิจกรรม คณะสังคมศาสตร์ ม.นเรศวร</span>
          </div>
        </div>
      </div>

      {/* Finisher Alert Bar */}
      <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 text-center">
        <p className="text-xs sm:text-sm font-bold text-amber-800 flex items-center justify-center gap-2">
          <Award className="w-4 h-4 text-amber-600 shrink-0" />
          <span>มีเหรียญรางวัลและคูปองอาหารสำหรับ 350 ท่านแรกที่วิ่งเข้าเส้นชัย!</span>
        </p>
      </div>

      {/* Schedule Timeline */}
      <div className="p-6 sm:p-8 space-y-3">
        {OFFICIAL_SCHEDULE.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-xl border transition-all ${
              item.highlight
                ? 'bg-[#FEF2F2]/70 border-red-200 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-sm ${
                  item.highlight
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span
                    className={`font-mono font-bold text-sm ${
                      item.highlight ? 'text-[#DC2626]' : 'text-slate-700'
                    }`}
                  >
                    {item.time}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.highlight
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900">
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer channels */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 text-xs">
        <p className="text-slate-500 font-medium text-center mb-3">
          ติดตามข่าวสารและช่องทางประชาสัมพันธ์อย่างเป็นทางการ
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
            FB: FSS Fancy Run
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
            IG: @fss_fancyrun
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
            LINE: @FSSGhostRun
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 font-medium">
            TikTok: @fss_fancyrun
          </div>
        </div>
      </div>
    </div>
  );
};
