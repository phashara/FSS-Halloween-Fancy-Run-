import React, { useState } from 'react';
import {
  Navigation,
  Award,
  ExternalLink,
  Sparkles,
  Maximize2,
  Info,
} from 'lucide-react';

interface LandmarkPoint {
  id: string;
  name: string;
  km: string;
  type: 'start' | 'stadium' | 'science' | 'gate' | 'finish';
  desc: string;
  x: number; // percentage in view
  y: number;
}

// Exactly the landmarks present in the uploaded map image
const UPLOADED_MAP_LANDMARKS: LandmarkPoint[] = [
  {
    id: 'start_finish',
    name: 'จุดปล่อยตัว / เส้นชัย คณะสังคมศาสตร์',
    km: '0.0 KM / 5.0 KM',
    type: 'start',
    desc: 'จุดปล่อยตัวหลักและเส้นชัย ณ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร (มีเหรียญรางวัล Finisher และคูปองอาหารสำหรับ 350 ท่านแรก)',
    x: 63,
    y: 24,
  },
  {
    id: 'stadium',
    name: 'สนามกีฬากลาง',
    km: '0.6 KM',
    type: 'stadium',
    desc: 'สนามกีฬากลาง มหาวิทยาลัยนเรศวร ทางวิ่งเลียบด้านล่างสนามกีฬา ทิศทางมุ่งหน้าสู่ฝั่งตะวันตก',
    x: 52,
    y: 18,
  },
  {
    id: 'science',
    name: 'คณะวิทยาศาสตร์',
    km: '2.3 KM',
    type: 'science',
    desc: 'เลี้ยวโค้งเข้าสู่ถนนด้านหน้าคณะวิทยาศาสตร์ จุดเช็กพอยต์สำคัญก่อนมุ่งหน้าลงสู่สระน้ำทางทิศใต้',
    x: 35,
    y: 53,
  },
  {
    id: 'gate4',
    name: 'ประตู 4',
    km: '4.3 KM',
    type: 'gate',
    desc: 'ถนนทางตรงยาวฝั่งทิศตะวันออก มุ่งหน้าขึ้นเหนือผ่านหน้าประตู 4 สู่ทางราบเร่งสปีดเข้าเส้นชัย ณ คณะสังคมศาสตร์',
    x: 85,
    y: 45,
  },
];

export const NaresuanRouteMap: React.FC = () => {
  const [activePoint, setActivePoint] = useState<LandmarkPoint>(UPLOADED_MAP_LANDMARKS[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Navigation className="w-3.5 h-3.5" /> NARESUAN UNIVERSITY OFFICIAL RUNNING ROUTE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight flex items-center gap-2">
            <span>เส้นทางวิ่ง (ตรงตามไฟล์แผนที่ทางการ 100%)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            จุดปล่อยตัว / เส้นชัย คณะสังคมศาสตร์ • สนามกีฬากลาง • มหาวิทยาลัยนเรศวร • คณะวิทยาศาสตร์ • ประตู 4
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="https://maps.google.com/?q=16.7431,100.1925"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <span>พิกัด ม.นเรศวร</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-500/15 hover:bg-lime-500/25 text-lime-400 border border-lime-500/30 text-xs font-semibold transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'ย่อแผนที่' : 'ขยายเต็มจอ'}</span>
          </button>
        </div>
      </div>

      {/* 350 Finishers Ribbon */}
      <div className="px-5 py-3 bg-gradient-to-r from-lime-500/15 via-emerald-500/15 to-amber-500/15 border-b border-lime-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-lime-300 font-semibold">
          <Award className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>
            สิทธิพิเศษ: <b>เหรียญรางวัล Finisher & คูปองอาหาร</b> สำหรับ <b>350 ท่านแรก</b> ที่วิ่งเข้าเส้นชัย ณ คณะสังคมศาสตร์!
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>ระยะทาง: 5.0 KM</span>
          <span>•</span>
          <span className="text-lime-400 font-bold">วิ่งตามแนวลูกศรวันเวย์</span>
        </div>
      </div>

      {/* Main Vector Map Display (Strictly 1:1 with the Uploaded Route Poster) */}
      <div className="relative w-full bg-[#080d16] flex justify-center py-6 px-2 overflow-hidden select-none">
        {/* Ambient Dark Moon & Mist Backing */}
        <div className="absolute top-4 right-16 w-36 h-36 rounded-full bg-amber-100/15 blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />

        <div
          className={`relative w-full max-w-[580px] ${
            isExpanded ? 'h-[960px] sm:h-[1050px]' : 'h-[620px] sm:h-[760px]'
          } transition-all duration-500 flex justify-center`}
        >
          <svg
            viewBox="0 0 576 1024"
            className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Neon Green Glow Filter for Running Line */}
              <filter id="neonLimeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Title Spooky Glow */}
              <filter id="titleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.5   0 0 0 0 0.9   0 0 0 0 0.2   0 0 0 0.8 0"
                />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Lake Gradient */}
              <radialGradient id="lakeWaterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#0369a1" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>

              {/* Stadium Gradient */}
              <radialGradient id="stadiumTrack" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="70%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </radialGradient>
            </defs>

            {/* 1. Background Campus Base */}
            <rect x="0" y="0" width="576" height="1024" fill="#0b121e" />

            {/* Western Natural Canal */}
            <path
              d="M 50,1024 C 80,780 60,450 30,120"
              fill="none"
              stroke="#0284c7"
              strokeWidth="18"
              strokeOpacity="0.35"
            />

            {/* Campus Street Network (Dark Slate Roads) */}
            <g opacity="0.45">
              {/* North-South Roads */}
              <line x1="90" y1="180" x2="90" y2="920" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
              <line x1="160" y1="260" x2="160" y2="720" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
              <line x1="280" y1="220" x2="280" y2="600" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
              <line x1="470" y1="200" x2="470" y2="920" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />

              {/* East-West Crossings */}
              <line x1="80" y1="230" x2="480" y2="230" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              <line x1="80" y1="530" x2="480" y2="530" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
              <line x1="140" y1="640" x2="460" y2="640" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            </g>

            {/* Campus Building Rectangles (Atmospheric Silhouettes) */}
            <g fill="#1e293b" opacity="0.35">
              <rect x="180" y="270" width="60" height="35" rx="6" />
              <rect x="330" y="270" width="70" height="35" rx="6" />
              <rect x="140" y="340" width="75" height="40" rx="6" />
              <rect x="340" y="350" width="80" height="40" rx="6" />
              <rect x="360" y="490" width="85" height="45" rx="8" />
              <rect x="370" y="550" width="75" height="40" rx="6" />
              <rect x="130" y="600" width="70" height="35" rx="6" />
              <rect x="140" y="670" width="80" height="40" rx="6" />
              <rect x="230" y="780" width="65" height="35" rx="6" />
            </g>

            {/* Trees & Groves (Dark Green Circles) */}
            <g fill="#064e3b" opacity="0.5">
              <circle cx="210" cy="440" r="22" />
              <circle cx="225" cy="470" r="18" />
              <circle cx="295" cy="460" r="24" />
              <circle cx="340" cy="440" r="20" />
              <circle cx="230" cy="620" r="28" />
              <circle cx="240" cy="710" r="30" />
              <circle cx="220" cy="840" r="35" />
              <circle cx="300" cy="910" r="40" />
              <circle cx="480" cy="850" r="32" />
            </g>

            {/* Warm Streetlight Glow Dots */}
            <g fill="#fbbf24" opacity="0.8">
              <circle cx="115" cy="235" r="3" />
              <circle cx="100" cy="320" r="3" />
              <circle cx="110" cy="420" r="3" />
              <circle cx="140" cy="510" r="3" />
              <circle cx="280" cy="520" r="3" />
              <circle cx="330" cy="550" r="3" />
              <circle cx="250" cy="670" r="3" />
              <circle cx="260" cy="790" r="3" />
              <circle cx="360" cy="850" r="3" />
              <circle cx="480" cy="780" r="3" />
              <circle cx="490" cy="650" r="3" />
              <circle cx="480" cy="500" r="3" />
              <circle cx="430" cy="380" r="3" />
              <circle cx="380" cy="270" r="3" />
            </g>

            {/* South Lake (Teardrop Shaped Lake from Uploaded Poster) */}
            <g id="south-lake">
              <path
                d="M 330,680 
                   C 320,630 380,580 435,590 
                   C 490,600 520,660 500,750 
                   C 485,815 435,845 385,830 
                   C 335,815 340,730 330,680 Z"
                fill="url(#lakeWaterGrad)"
                stroke="#38bdf8"
                strokeWidth="3"
                className="drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]"
              />
              {/* Lake Reflections */}
              <ellipse cx="410" cy="680" rx="30" ry="8" fill="#ffffff" opacity="0.25" />
              <ellipse cx="440" cy="740" rx="22" ry="5" fill="#ffffff" opacity="0.2" />
            </g>

            {/* Center Landmark: มหาวิทยาลัยนเรศวร (King Naresuan Monument Roundabout) */}
            <g id="center-monument">
              <circle cx="250" cy="390" r="42" fill="#14532d" fillOpacity="0.4" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="250" cy="390" r="20" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              {/* Standing Statue Silhouette on Pedestal */}
              <rect x="247" y="380" width="6" height="15" fill="#fbbf24" rx="2" />
              <circle cx="250" cy="377" r="3.5" fill="#fbbf24" />

              {/* Bold Title matching image: มหาวิทยาลัย นเรศวร */}
              <text
                x="250"
                y="335"
                fill="#ffffff"
                fontSize="20"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="sans-serif"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                มหาวิทยาลัย
              </text>
              <text
                x="250"
                y="358"
                fill="#ffffff"
                fontSize="20"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="sans-serif"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                นเรศวร
              </text>
            </g>

            {/* Top Landmark 1: สนามกีฬากลาง */}
            <g id="stadium-landmark">
              {/* Stadium Oval Track */}
              <rect
                x="225"
                y="135"
                width="140"
                height="80"
                rx="40"
                fill="url(#stadiumTrack)"
                stroke="#ef4444"
                strokeWidth="2.5"
              />
              {/* Inner Football Pitch */}
              <rect x="252" y="152" width="86" height="46" rx="20" fill="#16a34a" />
              <line x1="295" y1="152" x2="295" y2="198" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
              <circle cx="295" cy="175" r="9" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
              {/* 4 Stadium Floodlight Towers */}
              <circle cx="230" cy="140" r="4" fill="#fbbf24" className="animate-pulse" />
              <circle cx="360" cy="140" r="4" fill="#fbbf24" className="animate-pulse" />
              <circle cx="230" cy="210" r="4" fill="#fbbf24" className="animate-pulse" />
              <circle cx="360" cy="210" r="4" fill="#fbbf24" className="animate-pulse" />

              {/* White Pill Badge matching image: สนามกีฬากลาง */}
              <g className="cursor-pointer" onClick={() => setActivePoint(UPLOADED_MAP_LANDMARKS[1])}>
                <rect
                  x="265"
                  y="178"
                  width="110"
                  height="26"
                  rx="13"
                  fill="#030712"
                  fillOpacity="0.95"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle cx="295" cy="209" r="2.5" fill="#ffffff" />
                <text x="320" y="196" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  สนามกีฬากลาง
                </text>
              </g>
            </g>

            {/* Top Landmark 2: จุดปล่อยตัว / เส้นชัย คณะสังคมศาสตร์ */}
            <g
              id="start-finish-pin"
              className="cursor-pointer"
              onClick={() => setActivePoint(UPLOADED_MAP_LANDMARKS[0])}
            >
              {/* Red Location Teardrop Pin */}
              <circle cx="365" cy="245" r="16" fill="#dc2626" stroke="#ffffff" strokeWidth="2" className="drop-shadow-lg" />
              <text x="365" y="250" fontSize="13" textAnchor="middle">🏁</text>

              {/* White Badge: จุดปล่อยตัว / เส้นชัย */}
              <rect
                x="385"
                y="224"
                width="168"
                height="30"
                rx="15"
                fill="#030712"
                fillOpacity="0.95"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
              <text x="469" y="244" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                จุดปล่อยตัว / เส้นชัย
              </text>

              {/* Dark Sub-Badge: คณะสังคมศาสตร์ */}
              <rect
                x="385"
                y="262"
                width="135"
                height="24"
                rx="12"
                fill="#030712"
                fillOpacity="0.9"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <text x="452" y="278" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                คณะสังคมศาสตร์
              </text>
            </g>

            {/* Mid-West Landmark 3: คณะวิทยาศาสตร์ */}
            <g
              id="science-pin"
              className="cursor-pointer"
              onClick={() => setActivePoint(UPLOADED_MAP_LANDMARKS[2])}
            >
              <rect
                x="125"
                y="544"
                width="145"
                height="28"
                rx="14"
                fill="#030712"
                fillOpacity="0.95"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle cx="235" cy="576" r="2.5" fill="#ffffff" />
              <line x1="235" y1="572" x2="235" y2="582" stroke="#ffffff" strokeWidth="1.5" />
              <text x="197" y="563" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                คณะวิทยาศาสตร์
              </text>
            </g>

            {/* Mid-East Landmark 4: ประตู 4 */}
            <g
              id="gate4-pin"
              className="cursor-pointer"
              onClick={() => setActivePoint(UPLOADED_MAP_LANDMARKS[3])}
            >
              <rect
                x="470"
                y="445"
                width="82"
                height="26"
                rx="13"
                fill="#030712"
                fillOpacity="0.95"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle cx="498" cy="475" r="2.5" fill="#ffffff" />
              <line x1="498" y1="471" x2="498" y2="480" stroke="#ffffff" strokeWidth="1.5" />
              <text x="511" y="463" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                ประตู 4
              </text>
            </g>

            {/* ============================================================ */}
            {/* THE NEON GREEN RUNNING PATH (STRICTLY FROM UPLOADED IMAGE)   */}
            {/* ============================================================ */}

            {/* 1. Outer Dark Shadow Stroke */}
            <path
              d="M 360,265 
                 L 330,230 
                 L 230,230 
                 L 155,195 
                 C 105,175 80,195 85,215 
                 L 125,270 
                 L 105,370 
                 L 155,480 
                 C 175,528 215,532 255,526 
                 C 315,518 350,540 350,580 
                 L 265,645 
                 L 275,775 
                 C 280,845 330,870 395,855 
                 C 455,840 495,785 505,720 
                 L 515,620 
                 L 465,510 
                 L 405,405 
                 L 380,345 
                 L 360,265 Z"
              fill="none"
              stroke="#052e16"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* 2. Neon Lime Green Road Line */}
            <path
              d="M 360,265 
                 L 330,230 
                 L 230,230 
                 L 155,195 
                 C 105,175 80,195 85,215 
                 L 125,270 
                 L 105,370 
                 L 155,480 
                 C 175,528 215,532 255,526 
                 C 315,518 350,540 350,580 
                 L 265,645 
                 L 275,775 
                 C 280,845 330,870 395,855 
                 C 455,840 495,785 505,720 
                 L 515,620 
                 L 465,510 
                 L 405,405 
                 L 380,345 
                 L 360,265 Z"
              fill="none"
              stroke="#84cc16"
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neonLimeGlow)"
            />

            {/* 3. Intense Lime-White Core Center */}
            <path
              d="M 360,265 
                 L 330,230 
                 L 230,230 
                 L 155,195 
                 C 105,175 80,195 85,215 
                 L 125,270 
                 L 105,370 
                 L 155,480 
                 C 175,528 215,532 255,526 
                 C 315,518 350,540 350,580 
                 L 265,645 
                 L 275,775 
                 C 280,845 330,870 395,855 
                 C 455,840 495,785 505,720 
                 L 515,620 
                 L 465,510 
                 L 405,405 
                 L 380,345 
                 L 360,265 Z"
              fill="none"
              stroke="#bef264"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Direction Arrows in White along the course (Exact match to uploaded image) */}
            <g fill="#ffffff" className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              {/* Arrow 1: Heading West under stadium */}
              <polygon points="230,230 238,225 238,235" />
              {/* Arrow 2: Heading West-Northwest toward corner */}
              <polygon points="150,195 158,190 158,200" transform="rotate(-15 150 195)" />
              {/* Arrow 3: Turning South on western road */}
              <polygon points="115,280 110,272 120,272" />
              {/* Arrow 4: Heading South down western corridor */}
              <polygon points="105,370 100,362 110,362" />
              {/* Arrow 5: Continuing South toward science turn */}
              <polygon points="155,470 150,462 160,462" transform="rotate(20 155 470)" />
              {/* Arrow 6: Heading East into Faculty of Science */}
              <polygon points="255,526 247,521 247,531" />
              {/* Arrow 7: Curving South-East past Science */}
              <polygon points="345,580 341,571 350,573" transform="rotate(45 345 580)" />
              {/* Arrow 8: Heading South approaching lake */}
              <polygon points="268,695 263,687 273,687" />
              {/* Arrow 9: Heading South near lake bank */}
              <polygon points="278,795 273,787 283,787" transform="rotate(15 278 795)" />
              {/* Arrow 10: Looping along bottom of lake */}
              <polygon points="345,860 338,854 340,864" transform="rotate(-10 345 860)" />
              {/* Arrow 11: Curving up eastern bank of lake */}
              <polygon points="440,840 433,835 437,844" transform="rotate(-40 440 840)" />
              {/* Arrow 12: Heading North exiting lake */}
              <polygon points="505,720 500,728 510,728" transform="rotate(180 505 720)" />
              {/* Arrow 13: Heading North along eastern main road */}
              <polygon points="515,625 510,633 520,633" transform="rotate(180 515 625)" />
              {/* Arrow 14: Heading North passing Gate 4 */}
              <polygon points="465,515 460,523 470,523" transform="rotate(170 465 515)" />
              {/* Arrow 15: Continuing North */}
              <polygon points="405,405 400,413 410,413" transform="rotate(165 405 405)" />
              {/* Arrow 16: Approaching finish */}
              <polygon points="380,345 375,353 385,353" transform="rotate(160 380 345)" />
              {/* Arrow 17: Entering start/finish pin */}
              <polygon points="360,275 355,283 365,283" transform="rotate(160 360 275)" />
            </g>

            {/* Clickable Interactive Hotspots for the 4 Official Landmarks */}
            {UPLOADED_MAP_LANDMARKS.map((pt) => {
              const isSelected = activePoint.id === pt.id;
              const cx = (pt.x / 100) * 576;
              const cy = (pt.y / 100) * 1024;
              return (
                <g
                  key={pt.id}
                  onClick={() => setActivePoint(pt)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 18 : 12}
                    fill={isSelected ? '#f59e0b' : '#84cc16'}
                    fillOpacity="0.35"
                    className="animate-ping"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : 7}
                    fill={isSelected ? '#f59e0b' : '#84cc16'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              );
            })}

            {/* Top Header Title matching image: "เส้นทางวิ่ง" */}
            <g id="top-title-banner">
              <text
                x="288"
                y="95"
                fill="#bef264"
                fontSize="52"
                fontWeight="900"
                fontFamily="Prompt, sans-serif"
                textAnchor="middle"
                filter="url(#titleGlow)"
                className="select-none tracking-tight"
              >
                เส้นทางวิ่ง
              </text>
              {/* Spooky underline splash */}
              <path
                d="M 170,110 Q 288,118 406,110"
                stroke="#84cc16"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Temple Chedi Silhouettes & Full Moon Top Right */}
            <circle cx="485" cy="55" r="28" fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 15px #fef08a)" />
            {/* Chedi spire silhouette */}
            <polygon points="495,75 500,40 505,75" fill="#0b121e" />
            <polygon points="460,85 464,55 468,85" fill="#0b121e" />

            {/* Floating Paper Lanterns Left & Right */}
            <g fill="#f97316" opacity="0.85">
              {/* Left lantern */}
              <rect x="105" y="50" width="10" height="15" rx="3" fill="#fb923c" />
              <line x1="110" y1="42" x2="110" y2="50" stroke="#f97316" strokeWidth="1" />
              <circle cx="110" cy="58" r="3" fill="#ffffff" />
              {/* Right lantern */}
              <rect x="490" y="125" width="10" height="15" rx="3" fill="#fb923c" />
              <line x1="495" y1="117" x2="495" y2="125" stroke="#f97316" strokeWidth="1" />
              <circle cx="495" cy="133" r="3" fill="#ffffff" />
            </g>
          </svg>

          {/* Floating Selected Landmark Info Card */}
          <div className="absolute top-4 left-4 max-w-[280px] sm:max-w-xs p-3.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-lime-500/40 text-xs text-slate-200 shadow-2xl space-y-1 z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-lime-400 flex items-center gap-1 truncate">
                <Navigation className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                {activePoint.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 font-mono text-[10px] font-bold shrink-0">
                {activePoint.km}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{activePoint.desc}</p>
          </div>

          {/* Legend Badge */}
          <div className="absolute bottom-4 left-4 p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center gap-2 text-xs text-slate-300 shadow-xl z-10">
            <span className="w-3 h-3 rounded-full bg-[#84cc16] border border-white" />
            <span className="text-[11px] text-lime-400 font-bold">เส้นทางวิ่ง (5.0 KM)</span>
            <span className="text-[10px] text-slate-400">• วิ่งตามลูกศรวันเวย์</span>
          </div>
        </div>
      </div>

      {/* Official Landmarks Carousel / Buttons (Only the 4 Landmarks on the Map) */}
      <div className="p-5 sm:p-6 bg-slate-950/80 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" /> จุดสังเกตหลักตามแผนที่ทางการ
          </h4>
          <span className="text-[11px] text-slate-500">คลิกที่จุดเพื่อดูรายละเอียด</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {UPLOADED_MAP_LANDMARKS.map((pt) => {
            const isSelected = activePoint.id === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setActivePoint(pt)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-lime-950/30 border-lime-500/60 ring-1 ring-lime-500/30 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${isSelected ? 'text-lime-400' : 'text-slate-200'}`}
                  >
                    {pt.km}
                  </span>
                  {pt.type === 'start' ? (
                    <span className="text-xs">🏁</span>
                  ) : pt.type === 'stadium' ? (
                    <span className="text-xs">🏟️</span>
                  ) : pt.type === 'science' ? (
                    <span className="text-xs">🔬</span>
                  ) : (
                    <span className="text-xs">🚪</span>
                  )}
                </div>
                <p className="text-xs text-slate-200 font-medium truncate">{pt.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{pt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
