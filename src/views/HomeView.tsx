import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Shirt,
  Award,
  Flame,
  Ghost,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Search,
  Star,
  ChevronRight,
  Tag,
  Gift,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';
import { GHOST_SPECIES_LIST } from '../data/ghosts';
import { GhostAvatarSvg } from '../components/GhostAvatarSvg';
import { EditableText } from '../components/EditableText';
import { NaresuanRouteMap } from '../components/NaresuanRouteMap';
import { OfficialScheduleCard } from '../components/OfficialScheduleCard';
import { OfficialShirtImage } from '../components/OfficialShirtImage';
import { OfficialMedalImage } from '../components/OfficialMedalImage';
import { CosmicCountdownHighlight } from '../components/CosmicCountdownHighlight';
import { useEventContext } from '../context/EventContext';

interface Props {
  onNavigate: (view: any) => void;
  onSelectRegistrationType?: (type: 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY') => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate, onSelectRegistrationType }) => {
  const { adminUser, isLiveEditMode, ghostSpeciesList, runners } = useEventContext();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRegisterChoice = (type: 'RUN_FREE' | 'RUN_AND_SHIRT' | 'SHIRT_ONLY') => {
    if (onSelectRegistrationType) {
      onSelectRegistrationType(type);
    }
    onNavigate('register');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate('directory');
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Fastwork-style Hero Banner (Crimson Blood Edition with Official Logo) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-rose-950 text-white p-6 sm:p-10 lg:p-14 shadow-xl shadow-red-900/20">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-80 h-80 rounded-full bg-red-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <EditableText
              sectionKey="hero"
              field="announcement"
              fallbackText="🔥 เปิดรับสมัครแล้ววันนี้ &middot; วิ่งฟรีทุกคน พร้อมสุ่มการ์ดผีไทยประจำตัว!"
            />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              <EditableText
                sectionKey="hero"
                field="title"
                fallbackText="FSS HALLOWEEN FANCY RUN 2026"
              />
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-red-100">
              <EditableText
                sectionKey="hero"
                field="subtitle"
                fallbackText="สมัคร วิ่ง สะสมพลัง และค้นหาว่าคุณคือผีไทยอะไร!"
              />
            </p>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-2xl leading-relaxed">
              <EditableText
                sectionKey="hero"
                field="tagline"
                fallbackText="งานวิ่งแฟนซีสุดมันส์ ระยะทาง 5.0 KM ณ คณะสังคมศาสตร์ และรอบมหาวิทยาลัยนเรศวร วันที่ 31 ตุลาคม 2569"
              />
            </p>
          </div>

          {/* Fastwork Search & Explore Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl pt-1"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารายชื่อนักวิ่ง, ค้นหาผีไทย, หรือดูเสื้อที่ระลึก..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-300/50 shadow-md"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ค้นหา</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-xs sm:text-sm shadow-lg shadow-black/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>สมัครเข้าร่วมกิจกรรมทันที (ฟรี 0฿)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('shirt')}
              className="px-5 py-3 rounded-2xl bg-black/30 hover:bg-black/40 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shirt className="w-4 h-4 text-amber-300" />
              <span>สั่งซื้อเสื้อที่ระลึก 300฿</span>
            </button>
          </div>

          {/* Quick Key Facts Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 text-xs sm:text-sm text-red-100 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>31 ตุลาคม 2569</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>เริ่ม 17:00 น. (ปล่อยตัว 18:30 น.)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-200" />
              <span>คณะสังคมศาสตร์ ม.นเรศวร</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>ระยะทาง 5.0 KM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Halloween Countdown Highlight */}
      <section>
        <CosmicCountdownHighlight />
      </section>

      {/* 3. Fastwork Trust & Benefits Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ผู้สมัครแล้ว</p>
            <p className="text-sm font-bold text-slate-900">
              {runners.length.toLocaleString()} คน
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">เหรียญ Finisher</p>
            <p className="text-sm font-bold text-slate-900">350 ท่านแรกที่วิ่งเข้าเส้นชัย</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">เสื้อ Limited Edition</p>
            <p className="text-sm font-bold text-slate-900">ราคา 300 บาท</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Ghost className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">สุ่มการ์ดผีไทย</p>
            <p className="text-sm font-bold text-slate-900">12 ชนิดทันที</p>
          </div>
        </div>
      </section>

      {/* 3. Fastwork Marketplace Gig Cards (3 แพ็กเกจรับสมัคร) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              REGISTRATION PACKAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              เลือกรูปแบบการเข้าร่วมกิจกรรม
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            เลือกแพ็กเกจที่เหมาะกับคุณ ไม่ว่าจะมาร่วมวิ่งฟรี หรือสั่งซื้อเสื้อที่ระลึกสุดเอ็กซ์คลูซีฟ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Run Free */}
          <div className="fastwork-card p-6 flex flex-col justify-between border-slate-200 relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                  ฟรี 100%
                </span>
                <span className="text-xs text-slate-500">สำหรับทุกคน</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">1. สมัครวิ่งฟรี (Free Run)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  เข้าร่วมงานวิ่งแฟนซี 5.0 KM สุ่มรับการ์ดผีประจำตัวและ QR Code เช็กอิน
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-2xl font-black text-slate-900 font-mono">฿0 <span className="text-xs font-normal text-slate-500">/ คน</span></div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>สิทธิ์ร่วมวิ่งระยะ 5.0 KM ในคืน 31 ต.ค.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>การ์ดผีไทยประจำตัว (LV.1 Awakened Spirit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>QR Code สำหรับเช็กอิน & ลุ้นเหรียญ Finisher 350 ท่านแรกที่วิ่งเข้าเส้นชัย</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>น้ำดื่มและจุดปฐมพยาบาลตลอดเส้นทาง</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={() => handleRegisterChoice('RUN_FREE')}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>เลือกสมัครวิ่งฟรี</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Run + Shirt (Most Popular Red Theme) */}
          <div className="fastwork-card p-6 flex flex-col justify-between border-2 border-red-600 relative shadow-md shadow-red-600/10 group">
            {/* Best Seller Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>ยอดนิยมอันดับ 1</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">
                  วิ่ง + เสื้อที่ระลึก
                </span>
                <span className="text-xs text-amber-600 font-bold">อัปเกรดการ์ดเป็น LV.2 ⚡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">2. วิ่งพร้อมสั่งเสื้อ</h3>
                <p className="text-xs text-slate-500 mt-1">
                  วิ่ง 5.0 KM พร้อมรับเสื้อ LIMITED EDITION
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-2xl font-black text-red-600 font-mono">฿300 <span className="text-xs font-normal text-slate-500">/ คน</span></div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>ทุกสิทธิ์ของการสมัครวิ่งฟรีครบถ้วน</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span><b>เสื้อที่ระลึก LIMITED EDITION</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>อัปเกรดการ์ดเป็น <b>LV.2 ปลดผนึกพลัง</b> + ตรา Shirt Owner</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={() => handleRegisterChoice('RUN_AND_SHIRT')}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2"
              >
                <span>เลือกแพ็กเกจวิ่งพร้อมสั่งเสื้อ (300฿)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Shirt Only */}
          <div className="fastwork-card p-6 flex flex-col justify-between border-slate-200 relative group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold">
                  ของที่ระลึก
                </span>
                <span className="text-xs text-slate-500">ไม่ร่วมวิ่ง</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">3. ซื้อเสื้ออย่างเดียว</h3>
                <p className="text-xs text-slate-500 mt-1">
                  สำหรับผู้ที่ต้องการสะสมเสื้อวิ่งและสุ่มการ์ดผี
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-2xl font-black text-slate-900 font-mono">฿300 <span className="text-xs font-normal text-slate-500">/ ตัว</span></div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><b>เสื้อที่ระลึก LIMITED EDITION</b> (Dry-Tech 100%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>สุ่มการ์ดผีประจำตัว LV.2 ปลดล็อกตรา SHIRT OWNER</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>QR Code สำหรับยืนยันการรับเสื้อ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>สั่งซื้อได้หลายตัว หลายไซซ์ในรอบเดียว</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={() => handleRegisterChoice('SHIRT_ONLY')}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>สั่งซื้อเสื้ออย่างเดียว (300฿)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Merchandise Showcase Section (ต่อจากการรับสมัคร) */}
      <section className="fastwork-card p-6 sm:p-10 bg-white border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Shirt Image */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-full max-w-md">
              <OfficialShirtImage allowUpload={true} />
            </div>
          </div>

          {/* Details & Specs */}
          <div className="space-y-5">
            <div>
              <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold">
                OFFICIAL MERCHANDISE 2026
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                เสื้อวิ่ง FSS Ghost Run 2026
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-red-600 font-mono">฿300</span>
                <span className="text-xs text-slate-500">(สั่งซื้อพร้อมวิ่ง หรือสั่งซื้ออย่างเดียว)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ผลิตจากเนื้อผ้าเกรดพรีเมียม <b>Dry-Tech Micro Polyester 100%</b> นุ่ม เบา ระบายเหงื่อยอดเยี่ยม เมื่อสั่งซื้อเสื้อจะได้รับการปลดล็อกการ์ดเป็น <b>LV.2 Unleashed Power</b> ทันที
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('shirt')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2"
              >
                <Shirt className="w-4 h-4" />
                <span>สั่งซื้อเสื้อที่ระลึกทันที</span>
              </button>
              <button
                type="button"
                onClick={() => handleRegisterChoice('RUN_AND_SHIRT')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
              >
                <span>วิ่งพร้อมสั่งเสื้อ</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Finisher Medal Showcase Section */}
      <section className="fastwork-card p-6 sm:p-10 bg-white border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Medal Image Container */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-full max-w-md">
              <OfficialMedalImage allowUpload={true} />
            </div>
            <p className="text-xs text-slate-500">
              * ภาพจำลองเหรียญที่ระลึกอะคริลิกพรีเมียม (ด้านหน้า: ผีนางรำชฎา / ด้านหลัง: OCTOBER 31, 2026)
            </p>
          </div>

          {/* Details, Concept & Specs */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5 w-fit">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  OFFICIAL FINISHER MEDAL 2026
                </span>
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold">
                  วัสดุอะคริลิกพรีเมียม (Acrylic)
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                เหรียญที่ระลึก FSS Halloween Fancy Run 2026
              </h3>
              <p className="text-sm sm:text-base font-bold text-red-600 mt-1">
                เหรียญรางวัลแห่งเกียรติยศสำหรับผู้พิชิตเส้นชัย 350 คนแรก
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                (ณ ลานกิจกรรม คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร วันที่ 31 ตุลาคม 2026)
              </p>
            </div>

            {/* Design Concept Box */}
            <div className="space-y-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-5 text-slate-200 border border-slate-800 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                คอนเซปต์การออกแบบเหรียญ (Design Concept)
              </h4>

              {/* Front Concept */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <span>✦ ด้านหน้า (Front):</span>
                  <span className="text-white">ระบำผีนางรำหลอนวิญญาณ (The Spooky Thai Dancer)</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-3 border-l-2 border-red-500/50">
                  โดดเด่นด้วยภาพ <b>ผีนางรำไทยโบราณ</b> สวมชฎาทองคำ ห่มสไบแดงเข้มปักดิ้นทอง ร่ายรำท่ามกลางเปลวเพลิงสีเลือดและลวดลายกระหนกไทย ดวงตาสีขาวโพลนไร้แววหลั่งรินด้วยสายเลือด สะท้อนตำนานนาฏศิลป์ไทยผสานความสยองขวัญในคืนฮาโลวีน พร้อมโลโก้ข้อความ <b>FSS HALLOWEEN FANCY RUN 2026</b>
                </p>
              </div>

              {/* Back Concept */}
              <div className="space-y-1 text-xs pt-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>✦ ด้านหลัง (Back):</span>
                  <span className="text-white">รัตติกาล 31 ตุลาคม &amp; ปริศนาใต้หน้ากาก (Mystery Behind the Mask)</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-3 border-l-2 border-amber-500/50">
                  สลักตัวอักษรสีขาวทองสไตล์หยดเลือด <b>OCTOBER 31, 2026</b> คืนวันวิ่งฮาโลวีน กลางเหรียญเป็นภาพเงาลึกลับกำลังปลดหน้ากากละครรำเปื้อนเลือดและรอยเย็บ เผยตัวตนที่แท้จริง ขนาบข้างด้วยหัวกะโหลกคู่เรืองแสงวิญญาณ ล้อมรอบด้วยลายกระหนกไทย และสลักเกียรติยศ <b>FACULTY OF SOCIAL SCIENCE</b> (คณะสังคมศาสตร์)
                </p>
              </div>
            </div>

            {/* Material & Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-medium">วัสดุเหรียญ</p>
                <p className="font-bold text-slate-900 mt-0.5">อะคริลิกพรีเมียม (Acrylic)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ผิวเงาใส น้ำหนักเบา ไม่เป็นสนิม</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-medium">ระบบพิมพ์ลาย</p>
                <p className="font-bold text-slate-900 mt-0.5">UV Direct Print 2 ด้าน</p>
                <p className="text-[10px] text-slate-500 mt-0.5">สีสดคมชัด ทนเหงื่อ ไม่ลอก</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <p className="text-slate-500 font-medium">สายคล้องคอ</p>
                <p className="font-bold text-slate-900 mt-0.5">Sublimation 2 หน้า</p>
                <p className="text-[10px] text-slate-500 mt-0.5">ลายกระหนกเพลิงแดง-ทอง</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleRegisterChoice('RUN_FREE')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>สมัครวิ่งเพื่อพิชิตเหรียญรางวัล</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('collection')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Ghost className="w-4 h-4 text-slate-600" />
                <span>ดูคลังการ์ดผี 12 ชนิด</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Route Map & Timeline (เส้นทาง & กำหนดการ) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
            EVENT SCHEDULE & ROUTE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            เส้นทางการวิ่ง & กำหนดการวันงาน
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ณ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร จ.พิษณุโลก วันที่ 31 ตุลาคม 2569
          </p>
        </div>

        {/* Naresuan Map */}
        <div className="fastwork-card overflow-hidden p-4 sm:p-6 bg-white">
          <NaresuanRouteMap />
        </div>

        {/* Official Schedule Card */}
        <div className="fastwork-card overflow-hidden bg-white">
          <OfficialScheduleCard />
        </div>
      </section>

      {/* 6. 12 Thai Ghost Collection Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              12 THAI GHOST COLLECTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              คลังการ์ด 12 ผีไทยในงานวิ่ง
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('collection')}
            className="text-xs sm:text-sm font-semibold text-red-600 hover:underline flex items-center gap-1"
          >
            <span>ดูรายละเอียดการ์ดผีทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(ghostSpeciesList || GHOST_SPECIES_LIST).map((ghost) => (
            <div
              key={ghost.id}
              onClick={() => onNavigate('collection')}
              className="fastwork-card p-4 sm:p-5 flex flex-col justify-between cursor-pointer group bg-white"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 group-hover:bg-red-50 flex items-center justify-center transition-colors p-2">
                  <GhostAvatarSvg
                    speciesId={ghost.id}
                    className="w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                    ธาตุ {ghost.element}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 group-hover:text-red-600 transition-colors">
                    {ghost.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{ghost.title}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 text-[11px]">SPD: <b>{ghost.baseStats.speed}</b></span>
                <span className="text-red-600 font-semibold text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  ดูการ์ด ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
