import React, { useState } from 'react';
import { Sparkles, Eye, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  className?: string;
  showControls?: boolean;
}

export const OfficialShirtMockup: React.FC<Props> = ({
  className = '',
  showControls = true,
}) => {
  const [view, setView] = useState<'both' | 'front' | 'back'>('both');

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* View Switcher Controls */}
      {showControls && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs mb-4 shadow-lg">
          <button
            type="button"
            onClick={() => setView('both')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              view === 'both'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ทั้งด้านหน้า & หลัง
          </button>
          <button
            type="button"
            onClick={() => setView('front')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              view === 'front'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ด้านหน้า (Front)
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              view === 'back'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ด้านหลัง (Back)
          </button>
        </div>
      )}

      {/* Mockup Display Grid */}
      <div className="w-full flex flex-wrap justify-center items-center gap-4 sm:gap-6">
        {/* FRONT VIEW */}
        {(view === 'both' || view === 'front') && (
          <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="relative w-56 sm:w-64 h-72 sm:h-80 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              <svg viewBox="0 0 320 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Fabric Heather Texture */}
                  <linearGradient id="bodyDarkHeather" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#27272a" />
                    <stop offset="40%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                  </linearGradient>

                  {/* Crimson Sleeve Gradient */}
                  <linearGradient id="crimsonSleeve" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="50%" stopColor="#7f1d1d" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </linearGradient>

                  {/* Crimson Collar */}
                  <linearGradient id="crimsonCollar" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#b91c1c" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>

                  {/* Diagonal Blood Stripes */}
                  <linearGradient id="bloodSlash" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#991b1b" stopOpacity="0.85" />
                    <stop offset="35%" stopColor="#dc2626" stopOpacity="0.6" />
                    <stop offset="70%" stopColor="#e2e8f0" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                  </linearGradient>

                  {/* Gold Filigree Glow */}
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Left Sleeve (Maroon with White Trim) */}
                <path d="M 95,85 L 20,150 L 50,185 L 105,125 Z" fill="url(#crimsonSleeve)" stroke="#450a0a" strokeWidth="1.5" />
                {/* Left Sleeve White Cuff */}
                <polygon points="20,150 50,185 45,190 15,155" fill="#f8fafc" />

                {/* Right Sleeve (Maroon with White Trim) */}
                <path d="M 225,85 L 300,150 L 270,185 L 215,125 Z" fill="url(#crimsonSleeve)" stroke="#450a0a" strokeWidth="1.5" />
                {/* Right Sleeve White Cuff */}
                <polygon points="300,150 270,185 275,190 305,155" fill="#f8fafc" />

                {/* Main Shirt Body (Contoured Sport Cut) */}
                <path
                  d="M 95,85 
                     C 125,95 195,95 225,85 
                     L 245,160 
                     C 240,240 248,320 252,365 
                     C 195,372 125,372 68,365 
                     C 72,320 80,240 75,160 Z"
                  fill="url(#bodyDarkHeather)"
                  stroke="#3f3f46"
                  strokeWidth="1.5"
                />

                {/* Shadow of King Naresuan Silhouette on Body */}
                <g fill="#450a0a" opacity="0.35">
                  <ellipse cx="120" cy="270" rx="35" ry="50" />
                  <path d="M 95,240 Q 120,200 145,240 Z" />
                </g>

                {/* Diagonal Distressed Blood / White Slashes */}
                <g>
                  {/* Stripe 1 */}
                  <polygon points="70,360 160,250 178,250 88,362" fill="url(#bloodSlash)" opacity="0.9" />
                  {/* Stripe 2 */}
                  <polygon points="100,364 195,250 210,250 115,366" fill="url(#bloodSlash)" opacity="0.85" />
                </g>

                {/* Half-Zip Collar (Sport Cut) */}
                <path d="M 125,90 C 135,70 185,70 195,90 L 185,105 C 175,98 145,98 135,105 Z" fill="url(#crimsonCollar)" stroke="#450a0a" strokeWidth="1.5" />
                {/* Front Zipper Placket */}
                <rect x="156" y="92" width="8" height="42" rx="2" fill="#7f1d1d" stroke="#b91c1c" strokeWidth="1" />
                {/* Silver Zipper Puller */}
                <rect x="158" y="115" width="4" height="12" rx="2" fill="#e2e8f0" />
                <circle cx="160" cy="128" r="2" fill="#94a3b8" />

                {/* Left Chest: FSS Thai Sacred Yantra Dagger Monogram */}
                <g transform="translate(195, 115)" filter="url(#goldGlow)">
                  {/* Unalome Spiral at Top */}
                  <circle cx="15" cy="8" r="2" fill="#ffffff" />
                  <line x1="15" y1="10" x2="15" y2="18" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Dagger / Yantra Cross */}
                  <line x1="8" y1="28" x2="22" y2="28" stroke="#ffffff" strokeWidth="2" />
                  <line x1="15" y1="20" x2="15" y2="48" stroke="#ffffff" strokeWidth="2" />
                  {/* FSS Stylized Letters */}
                  <text x="15" y="36" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="serif" textAnchor="middle">
                    FSS
                  </text>
                </g>

                {/* Golden Traditional Thai Kanok Filigree Hem Border */}
                <g fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.95" filter="url(#goldGlow)">
                  <line x1="72" y1="358" x2="248" y2="358" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Kanok Swirls at Corners */}
                  <path d="M 74,358 Q 80,345 92,352 Q 82,357 74,358" fill="#f59e0b" />
                  <path d="M 246,358 Q 240,345 228,352 Q 238,357 246,358" fill="#f59e0b" />
                  {/* Center Lotus Flower Crest */}
                  <circle cx="160" cy="355" r="3.5" fill="#f59e0b" />
                  <path d="M 155,355 C 158,348 162,348 165,355 Z" fill="#f59e0b" />
                </g>

                {/* Right Rib Golden Lotus Mandala Motif */}
                <g transform="translate(230, 190)" fill="#f59e0b" opacity="0.85" filter="url(#goldGlow)">
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  <path d="M 0,-14 C 4,-7 4,7 0,14 C -4,7 -4,-7 0,-14 Z" />
                  <path d="M -14,0 C -7,4 7,4 14,0 C 7,-4 -7,-4 -14,0 Z" />
                </g>
              </svg>
            </div>
            <div className="mt-2 text-center">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-400">
                ด้านหน้า (Front View)
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">คอซิป Half-Zip • ตรามนต์ FSS ยันต์</p>
            </div>
          </div>
        )}

        {/* BACK VIEW */}
        {(view === 'both' || view === 'back') && (
          <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="relative w-56 sm:w-64 h-72 sm:h-80 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              <svg viewBox="0 0 320 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Same texture reuse */}
                </defs>

                {/* Left Sleeve (Back) */}
                <path d="M 95,85 L 20,150 L 50,185 L 105,125 Z" fill="url(#crimsonSleeve)" stroke="#450a0a" strokeWidth="1.5" />
                <polygon points="20,150 50,185 45,190 15,155" fill="#f8fafc" />

                {/* Right Sleeve (Back) */}
                <path d="M 225,85 L 300,150 L 270,185 L 215,125 Z" fill="url(#crimsonSleeve)" stroke="#450a0a" strokeWidth="1.5" />
                <polygon points="300,150 270,185 275,190 305,155" fill="#f8fafc" />

                {/* Main Shirt Body Back */}
                <path
                  d="M 95,85 
                     C 125,90 195,90 225,85 
                     L 245,160 
                     C 240,240 248,320 252,365 
                     C 195,372 125,372 68,365 
                     C 72,320 80,240 75,160 Z"
                  fill="url(#bodyDarkHeather)"
                  stroke="#3f3f46"
                  strokeWidth="1.5"
                />

                {/* Back Collar Band */}
                <path d="M 125,86 C 140,82 180,82 195,86 L 190,98 C 175,94 145,94 130,98 Z" fill="url(#crimsonCollar)" stroke="#450a0a" strokeWidth="1.5" />

                {/* Deity / Warrior Silhouette in Deep Crimson Mist on Back */}
                <g fill="#991b1b" opacity="0.45">
                  <path d="M 200,240 Q 225,180 235,240 Q 240,290 220,330 Q 195,330 200,240 Z" />
                  <polygon points="225,185 220,165 230,165" />
                </g>

                {/* Diagonal Distressed Blood & White Stripes */}
                <g>
                  <polygon points="70,360 160,250 178,250 88,362" fill="url(#bloodSlash)" opacity="0.9" />
                  <polygon points="100,364 195,250 210,250 115,366" fill="url(#bloodSlash)" opacity="0.85" />
                </g>

                {/* Upper Back Official Typography matching image */}
                <g textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">
                  <text x="210" y="125" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="serif">
                    Faculty of Social Science
                  </text>
                  <text x="210" y="142" fill="#f8fafc" fontSize="11" fontWeight="600" fontFamily="serif">
                    Halloween Fancy Run
                  </text>
                  {/* Stylized Year 2026 with flame / wings */}
                  <text x="210" y="172" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
                    2026
                  </text>
                </g>

                {/* Golden Traditional Thai Kanok Hem Border */}
                <g fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.95" filter="url(#goldGlow)">
                  <line x1="72" y1="358" x2="248" y2="358" stroke="#f59e0b" strokeWidth="1.5" />
                  <path d="M 74,358 Q 80,345 92,352 Q 82,357 74,358" fill="#f59e0b" />
                  <path d="M 246,358 Q 240,345 228,352 Q 238,357 246,358" fill="#f59e0b" />
                  <circle cx="160" cy="355" r="3.5" fill="#f59e0b" />
                </g>

                {/* Left Rib Golden Lotus Motif */}
                <g transform="translate(85, 210)" fill="#f59e0b" opacity="0.85" filter="url(#goldGlow)">
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  <path d="M 0,-14 C 4,-7 4,7 0,14 C -4,7 -4,-7 0,-14 Z" />
                  <path d="M -14,0 C -7,4 7,4 14,0 C 7,-4 -7,-4 -14,0 Z" />
                </g>
              </svg>
            </div>
            <div className="mt-2 text-center">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-400">
                ด้านหลัง (Back View)
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">สกรีน Faculty of Social Science 2026</p>
            </div>
          </div>
        )}
      </div>

      {/* Highlights Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> เนื้อผ้า Micro Dry-Tech แท้ 100%
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> สกรีนลายไทยกนกเรืองแสง
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-200 font-bold">
          ฿300 บาท (จากปกติ 390)
        </span>
      </div>
    </div>
  );
};
