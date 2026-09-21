import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Shirt,
  Award,
  Flame,
  Ghost,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Edit3,
} from 'lucide-react';
import { EVENT_DETAILS, EVENT_TIMELINE } from '../data/initialData';
import { GHOST_SPECIES_LIST } from '../data/ghosts';
import { GhostAvatarSvg } from '../components/GhostAvatarSvg';
import { EditableText } from '../components/EditableText';
import { NaresuanRouteMap } from '../components/NaresuanRouteMap';
import { OfficialScheduleCard } from '../components/OfficialScheduleCard';
import { useEventContext } from '../context/EventContext';

interface Props {
  onNavigate: (view: any) => void;
  onSelectRegistrationType?: (type: 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY') => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate, onSelectRegistrationType }) => {
  const { adminUser, isLiveEditMode } = useEventContext();

  const handleRegisterChoice = (type: 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY') => {
    if (onSelectRegistrationType) {
      onSelectRegistrationType(type);
    }
    onNavigate('register');
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Admin Notice if live edit mode is on */}
      {adminUser?.isLoggedIn && isLiveEditMode && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <b>โหมดแก้ไขข้อความเว็บไซต์เปิดอยู่</b> — คลิกปุ่ม <code>แก้ไข</code> ที่ข้อความเพื่อเปลี่ยนหัวข้อ คำโปรย หรือประกาศ แล้วบันทึกลง Firebase
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
            Firebase Sync
          </span>
        </div>
      )}

      {/* 3.1 Hero Banner */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 text-center rounded-3xl bg-gradient-to-b from-[#19102c] via-[#100a20] to-[#0a0714] border border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)]">
        {/* Floating atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-b from-amber-500/15 via-purple-600/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-12 left-10 text-6xl opacity-20 pointer-events-none animate-bounce">
          🎃
        </div>
        <div className="absolute -bottom-6 right-10 text-7xl opacity-20 pointer-events-none">
          👻
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Edition Tag / Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <EditableText
              sectionKey="hero"
              field="announcement"
              fallbackText="🔥 เปิดรับสมัครแล้ววันนี้! วิ่งฟรีทุกคน พร้อมรับการ์ดผีประจำตัว 1 ใบ"
            />
          </div>

          {/* Title - Scary Horror Display Font (Ultra Crisp & Razor Sharp) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-amber-400 tracking-wider leading-[1.15] font-horror select-none drop-shadow-[2px_4px_0px_#450a0a]">
            <EditableText
              sectionKey="hero"
              field="title"
              fallbackText="FSS HALLOWEEN FANCY RUN 2026"
            />
          </h1>

          {/* Subtitle & Tagline */}
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              <EditableText
                sectionKey="hero"
                field="subtitle"
                fallbackText="สมัคร วิ่ง สะสมพลัง และค้นหาว่าคุณคือผีไทยอะไร!"
              />
            </p>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              <EditableText
                sectionKey="hero"
                field="tagline"
                fallbackText="งานวิ่งแฟนซีสุดเฮี้ยนแห่งปี ระยะ 5.0 KM ณ คณะสังคมศาสตร์ และรอบมหาวิทยาลัยนเรศวร"
              />
            </p>
          </div>

          {/* Finisher Perk Golden Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-amber-500/40 text-xs sm:text-sm text-amber-300 font-bold shadow-lg shadow-amber-950/20">
            <Award className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>🔥 สิทธิพิเศษ: มีเหรียญรางวัล & คูปองอาหารสำหรับ 350 ท่านแรกที่วิ่งเข้าเส้นชัย!</span>
          </div>

          {/* Key Facts Pill Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>31 ตุลาคม 2569</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>ปล่อยตัว 18:30 น. (เริ่มงาน 17:00 น.)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>คณะสังคมศาสตร์ ม.นเรศวร</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>ระยะทาง 5.0 KM</span>
            </div>
          </div>

          {/* 3 Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleRegisterChoice('RUN_FREE')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🎃 สมัครวิ่งฟรี (Free Run)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleRegisterChoice('SHIRT_ONLY')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold text-sm sm:text-base rounded-2xl border border-slate-700 shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Shirt className="w-5 h-5 text-amber-400" />
              <span>ซื้อเสื้ออย่างเดียว (390฿)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Ghost className="w-5 h-5 text-amber-300" />
              <span>ค้นหาว่าคุณคือผีอะไร?</span>
            </button>
          </div>

          {/* User Type Table Overview (Section 2) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-2xl mx-auto text-left">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              เลือกรูปแบบการเข้าร่วมกิจกรรมที่เหมาะกับคุณ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">1. สมัครวิ่งฟรี</span>
                <p className="text-slate-400 leading-snug">สิทธิ์ร่วมวิ่ง + การ์ดผี LV.1 + QR Code เช็กอินหน้างาน</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <span className="font-bold text-amber-300 block mb-1">2. วิ่งพร้อมสั่งเสื้อ</span>
                <p className="text-slate-400 leading-snug">สิทธิ์ร่วมวิ่ง + เสื้อ Glow-in-the-dark + การ์ดผีอัป LV.2 + QR</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="font-bold text-purple-300 block mb-1">3. ซื้อเสื้ออย่างเดียว</span>
                <p className="text-slate-400 leading-snug">เสื้อที่ระลึก + การ์ดผี + QR รับเสื้อ (ไม่เข้าร่วมวิ่ง)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.2 รายละเอียดกิจกรรม & เส้นทางการวิ่ง & Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            OFFICIAL ROUTE & SCHEDULE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-serif">
            <EditableText
              sectionKey="home_timeline"
              field="title"
              fallbackText="เส้นทางวิ่งรอบ ม.นเรศวร & กำหนดการวันงาน"
            />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            <EditableText
              sectionKey="home_timeline"
              field="subtitle"
              fallbackText="ณ คณะสังคมศาสตร์ และรอบมหาวิทยาลัยนเรศวร จ.พิษณุโลก วันที่ 31 ตุลาคม 2569"
            />
          </p>
        </div>

        {/* Naresuan University Route Map (Full Width Interactive Map) */}
        <NaresuanRouteMap />

        {/* Official Schedule Card */}
        <div className="pt-4">
          <OfficialScheduleCard />
        </div>
      </section>

      {/* 3.3 สิ่งที่ผู้เข้าร่วมจะได้รับ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 text-center">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            PARTICIPANT PERKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-serif">
            <EditableText
              sectionKey="home_highlights"
              field="title"
              fallbackText="สิ่งที่ผู้เข้าร่วมงานจะได้รับ"
            />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 text-left text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-2xl">🎟️</span>
              <h4 className="font-bold text-slate-100">
                <EditableText sectionKey="home_highlights" field="step1_title" fallbackText="ฟรีค่าสมัคร 100%" />
              </h4>
              <p className="text-slate-400 text-xs">
                <EditableText sectionKey="home_highlights" field="step1_desc" fallbackText="วิ่งสนุกไม่มีค่าใช้จ่ายแอบแฝง สมัครได้ทุกคน" />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-2xl">🃏</span>
              <h4 className="font-bold text-slate-100">
                <EditableText sectionKey="home_highlights" field="step2_title" fallbackText="การ์ดผีประจำตัว" />
              </h4>
              <p className="text-slate-400 text-xs">
                <EditableText sectionKey="home_highlights" field="step2_desc" fallbackText="12 ชนิด สุ่มตามผลแบบทดสอบ อัปได้ถึง LV.3" />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900/90 border border-amber-500/40 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🏅</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  350 ท่านแรก
                </span>
              </div>
              <h4 className="font-bold text-amber-300">
                <EditableText sectionKey="home_highlights" field="step3_title" fallbackText="เหรียญรางวัล Finisher" />
              </h4>
              <p className="text-slate-300 text-xs">
                <EditableText sectionKey="home_highlights" field="step3_desc" fallbackText="เหรียญรางวัลสุดพิเศษสำหรับ 350 ท่านแรกที่วิ่งเข้าเส้นชัย" />
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-b from-orange-950/30 to-slate-900/90 border border-orange-500/40 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🍜</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold">
                  350 ท่านแรก
                </span>
              </div>
              <h4 className="font-bold text-orange-300">คูปองอาหารมื้อพิเศษ</h4>
              <p className="text-slate-300 text-xs">คูปองอาหารและเครื่องดื่มสำหรับ 350 ท่านแรกที่เข้าเส้นชัย ณ ลานกิจกรรมคณะสังคมศาสตร์</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.4 ตัวอย่างเสื้อและเหรียญ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            OFFICIAL MERCHANDISE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-serif">
            <EditableText
              sectionKey="shirt_promo"
              field="title"
              fallbackText="เสื้อวิ่งที่ระลึก Glow in the Dark & เหรียญรางวัล"
            />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            <EditableText
              sectionKey="shirt_promo"
              field="subtitle"
              fallbackText="ผลิตจากผ้า Dry-Tech Micro Polyester 100% ลายพิมพ์ 12 ผีไทยเรืองแสงในความมืด พร้อมปลดล็อกการ์ดเป็น LV.2 หรือ LV.3!"
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Shirt Visual Showcase */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col items-center text-center space-y-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-gradient-to-b from-[#1c1432] to-[#0c0918] border border-slate-700 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <Shirt className="w-32 h-32 text-amber-400 mx-auto drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full">
                  GLOW IN THE DARK ✨
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">เสื้อวิ่ง FSS Ghost Run 2026</h3>
              <p className="text-amber-400 font-mono font-black text-2xl mt-1">390 บาท</p>
              <p className="text-xs text-slate-400 mt-1">ไซซ์รอบอก: XS (34&quot;) ถึง 3XL (48&quot;)</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('shirt')}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              สั่งซื้อเสื้อที่ระลึก
            </button>
          </div>

          {/* Medal Showcase & Upgrades */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                  🏅
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">เหรียญรางวัล Fancy Finisher</h4>
                  <p className="text-xs text-slate-400">โลหะซิงค์อัลลอยด์รมดำ ลายหน้ากากผีไทยเรืองแสง</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                มอบให้สำหรับผู้เข้าเส้นชัยที่ผ่านเงื่อนไขของกิจกรรม และเช็กอินผ่านระบบ QR Code หน้างาน
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-500/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-purple-200 text-base">สิทธิพิเศษเมื่อสั่งเสื้อ</h4>
                  <p className="text-xs text-purple-300">ปลดล็อกตรา SHIRT OWNER และอัปเกรดการ์ดผี</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ทันทีที่การชำระเงินได้รับการอนุมัติ การ์ดของคุณจะอัปเกรดเป็น LV.2 (หรือ LV.3 หากส่งเรื่องสยองแล้ว) พร้อมเพิ่มค่าพลังความเร็วและพลังแฝงอัตโนมัติ!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 การ์ดผีตัวอย่าง & 3 Levels System (Section 8) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            CARD EVOLUTION SYSTEM
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-serif">
            ระบบ Level ของการ์ด (LV.1 ถึง LV.3)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            การ์ด 1 ใบ หมายเลขเดิม QR Code เดิม แต่สะสมพลังและเปลี่ยนรูปลักษณ์ตามภารกิจที่คุณทำสำเร็จ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LV 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-bold">
                LV.1: วิญญาณตื่น
              </span>
              <h3 className="text-lg font-bold text-white mt-3">Awakened Spirit</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ได้รับเมื่อสมัครวิ่งสำเร็จ หรือลงทะเบียนเป็นผู้ซื้อเสื้อ
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li>• กรอบการ์ดมาตรฐานตามระดับความหายาก</li>
                <li>• ค่าพลังเริ่มต้นตามคำตอบแบบทดสอบ</li>
                <li>• QR Code สำหรับเช็กอินวันงาน</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-amber-400 font-semibold">
              เงื่อนไข: สมัครสำเร็จ
            </div>
          </div>

          {/* LV 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/50 flex flex-col justify-between space-y-4 shadow-xl shadow-purple-950/50">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                LV.2: ปลดผนึกพลัง
              </span>
              <h3 className="text-lg font-bold text-purple-200 mt-3">Unleashed Power</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                เลือกทำภารกิจใดภารกิจหนึ่งให้สำเร็จ (ซื้อเสื้อ หรือแชร์เรื่องสยอง)
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li>• ได้ตรา <b>SHIRT OWNER</b> หรือ <b>STORYTELLER</b></li>
                <li>• กรอบการ์ดมีลวดลายเสื้อหรือหมอกวิญญาณ</li>
                <li>• โบนัสค่าพลัง +8 ถึง +12 แต้ม</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-purple-400 font-semibold">
              เงื่อนไข: สั่งซื้อเสื้อ OR แชร์เรื่องสยอง
            </div>
          </div>

          {/* LV 3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#221638] to-[#120a22] border-2 border-amber-400 flex flex-col justify-between space-y-4 shadow-2xl shadow-amber-500/20">
            <div>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-black">
                LV.3: ตำนานสยอง (ULTIMATE)
              </span>
              <h3 className="text-lg font-bold text-amber-300 mt-3">Ultimate Ghost</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ทำครบทั้งสองภารกิจ: สั่งซื้อเสื้อสำเร็จ และแชร์เรื่องสยองผ่านอนุมัติ
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-200">
                <li>• ได้ตรา <b>COMPLETE COLLECTION</b> ครบเซ็ต</li>
                <li>• กรอบการ์ดทองคำเปล่งประกายแสงเคลื่อนไหว</li>
                <li>• ข้อความ &ldquo;ULTIMATE GHOST&rdquo; และโบนัสพลังทุกด้าน</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-amber-300 font-bold">
              เงื่อนไข: สั่งซื้อเสื้อ AND แชร์เรื่องสยอง
            </div>
          </div>
        </div>
      </section>

      {/* 12 Thai Ghost Collection Grid (Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            THE 12 THAI GHOSTS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1 font-serif">
            <EditableText
              sectionKey="home_ghosts"
              field="title"
              fallbackText="คอลเลกชัน 12 ผีไทยในงานวิ่ง"
            />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            <EditableText
              sectionKey="home_ghosts"
              field="subtitle"
              fallbackText="สำรวจคาแรกเตอร์ผีไทยในมุมมองใหม่ ปั่น ป่วน ฮา สปีดแรงไม่มีพัก"
            />
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {GHOST_SPECIES_LIST.map((ghost) => (
            <div
              key={ghost.id}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <GhostAvatarSvg speciesId={ghost.id} className="w-24 h-24 sm:w-28 sm:h-28 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm sm:text-base font-bold text-white mt-2 group-hover:text-amber-300">
                {ghost.name}
              </h4>
              <p className="text-[11px] text-amber-400/90 font-medium line-clamp-1">{ghost.title}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ghost.tagline}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                <span>SPD: {ghost.baseStats.speed}</span> | <span>SPK: {ghost.baseStats.spookiness}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
