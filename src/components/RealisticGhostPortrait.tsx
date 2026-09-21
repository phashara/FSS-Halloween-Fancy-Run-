import React from 'react';
import { GhostSpeciesId } from '../types';
import { GhostAvatarSvg } from './GhostAvatarSvg';

interface Props {
  speciesId: GhostSpeciesId;
  className?: string;
  scaryLevel?: number;
  mode?: 'realistic' | 'talisman';
}

// Curated high-resolution photorealistic cinematic dark horror photography for Thai ghosts
export const REALISTIC_GHOST_ASSETS: Record<
  GhostSpeciesId,
  {
    photoUrl: string;
    atmosphereColor: string;
    ambientGlow: string;
    elementBadge: string;
    realisticPromptDesc: string;
  }
> = {
  krasue: {
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#ef4444',
    ambientGlow: 'rgba(239, 68, 68, 0.65)',
    elementBadge: 'แสงไฟวิญญาณเรืองรอง',
    realisticPromptDesc: 'ศีรษะลอยคว้างพร้อมพวงไส้เรืองแสงสีแดง-เขียว ส่องสว่างกลางป่าดงดิบยามค่ำคืน',
  },
  krahang: {
    photoUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#8b5cf6',
    ambientGlow: 'rgba(139, 92, 246, 0.65)',
    elementBadge: 'เวหาติดปีกกระด้ง',
    realisticPromptDesc: 'ชายหนุ่มเหาะทะยานข้ามยอดไม้ด้วยปีกกระด้งโบราณตัดกับเงาจันทร์เต็มดวง',
  },
  pop: {
    photoUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#dc2626',
    ambientGlow: 'rgba(220, 38, 38, 0.7)',
    elementBadge: 'ดวงตากระหายวิญญาณ',
    realisticPromptDesc: 'ร่างหญิงสาวต้องมนต์ดำ ดวงตาลุกวาวในเงามืดบ้านไม้โบราณข้างโอ่งดินเผา',
  },
  tani: {
    photoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#10b981',
    ambientGlow: 'rgba(16, 185, 129, 0.65)',
    elementBadge: 'พรายมรกตดงกล้วย',
    realisticPromptDesc: 'สตรีงามเร้นลับนุ่งสไบเขียวมรกต ยืนท่ามกลางดงกล้วยตานีและมวลหมอกใต้แสงจันทร์',
  },
  maenak: {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f43f5e',
    ambientGlow: 'rgba(244, 63, 94, 0.65)',
    elementBadge: 'รักนิรันดร์ริมท่าน้ำ',
    realisticPromptDesc: 'หญิงสาวชุดไทยโบราณอุ้มลูกน้อยยืนคอยริมคลอง แขนขาวซีดยื่นออกในความมืด',
  },
  kuman: {
    photoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#eab308',
    ambientGlow: 'rgba(234, 179, 8, 0.65)',
    elementBadge: 'กุมารทองอาคมขลัง',
    realisticPromptDesc: 'วิญญาณเด็กน้อยผมจุกเรืองแสงทองคำ พร้อมควันธูปศักดิ์สิทธิ์และพลังซุกซน',
  },
  pret: {
    photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#06b6d4',
    ambientGlow: 'rgba(6, 182, 212, 0.65)',
    elementBadge: 'ร่างโย่งเสียดฟ้า',
    realisticPromptDesc: 'เงาร่างสูงตระหง่านทัดเทียมยอดเจดีย์ท่ามกลางฟ้าผ่าและเสียงผิวปากโหยหวน',
  },
  kongkoi: {
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#14b8a6',
    ambientGlow: 'rgba(20, 184, 166, 0.65)',
    elementBadge: 'ภูตไพรขาเดียว',
    realisticPromptDesc: 'ภูตแห่งพงไพรขาเดียวกระโดดบนรากไม้ใหญ่ ดวงตาสีทองสะท้อนความลี้ลับ',
  },
  headless: {
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f97316',
    ambientGlow: 'rgba(249, 115, 22, 0.7)',
    elementBadge: 'ขุนพลไร้เศียร',
    realisticPromptDesc: 'นักรบโบราณถือดาบคู่ฟาดฟัน ร่างไร้เศียรพุ่งทะยานผ่านสะเก็ดไฟสงคราม',
  },
  nangram: {
    photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#a855f7',
    ambientGlow: 'rgba(168, 85, 247, 0.65)',
    elementBadge: 'รำอวยพรแห่งความตาย',
    realisticPromptDesc: 'นางรำสวมชฎาทองคำวิจิตร ร่ายรำลอยตัวในความมืดพร้อมเสียงดนตรีไทยชวนขนลุก',
  },
  phiphong: {
    photoUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#84cc16',
    ambientGlow: 'rgba(132, 204, 22, 0.65)',
    elementBadge: 'ดวงไฟพรายบึงน้ำ',
    realisticPromptDesc: 'ดวงประทีปสว่างวาบพุ่งออกจากรูจมูก ส่องประกายเหนือบึงน้ำหนองเหล็กยามฝนพรำ',
  },
  phiruen: {
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#38bdf8',
    ambientGlow: 'rgba(56, 189, 248, 0.65)',
    elementBadge: 'เทวารักษ์เรือนไทย',
    realisticPromptDesc: 'แสงเทพารักษ์นวลตารอบเรือนไทยโบราณ แผ่บารมีคุ้มครองนักวิ่งให้ปลอดภัย',
  },
};

export const RealisticGhostPortrait: React.FC<Props> = ({
  speciesId,
  className = 'w-48 h-64 sm:w-56 sm:h-72',
  scaryLevel = 3,
  mode = 'realistic',
}) => {
  const asset = REALISTIC_GHOST_ASSETS[speciesId] || REALISTIC_GHOST_ASSETS.krasue;

  if (mode === 'talisman') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <GhostAvatarSvg speciesId={speciesId} className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]" />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 group select-none ${className}`}
      style={{
        boxShadow: `0 0 35px ${asset.ambientGlow}`,
      }}
    >
      {/* 1. Cinematic Photorealistic Background Image */}
      <img
        src={asset.photoUrl}
        alt={asset.elementBadge}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.2] transition-transform duration-700 group-hover:scale-110"
      />

      {/* 2. Atmospheric Volumetric Dark Mist & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${asset.atmosphereColor} 0%, transparent 70%)`,
        }}
      />

      {/* 3. Ghost Silhouette / Character Projection Layer */}
      <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <GhostAvatarSvg
            speciesId={speciesId}
            className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)] opacity-95 filter saturate-[1.25] contrast-[1.1] transition-transform duration-500 group-hover:scale-105"
            scaryLevel={scaryLevel}
          />
        </div>
      </div>

      {/* 4. Realistic Floating Embers & Ghost Fog Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-2 h-2 rounded-full animate-ping opacity-75"
          style={{
            top: '25%',
            left: '20%',
            backgroundColor: asset.atmosphereColor,
            boxShadow: `0 0 10px ${asset.atmosphereColor}`,
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full animate-pulse opacity-85"
          style={{
            top: '65%',
            right: '25%',
            backgroundColor: asset.atmosphereColor,
            boxShadow: `0 0 8px ${asset.atmosphereColor}`,
          }}
        />
        <div
          className="absolute w-2.5 h-2.5 rounded-full animate-bounce opacity-60"
          style={{
            bottom: '20%',
            left: '35%',
            backgroundColor: '#fbbf24',
            boxShadow: '0 0 12px #fbbf24',
          }}
        />
      </div>

      {/* 5. Realistic Lighting Sheen / Lens Glare on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* 6. Realistic Authenticity Seal / Badge in corner */}
      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-amber-500/40 text-[9px] font-mono text-amber-300 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>REALISTIC 3D</span>
      </div>

      <div className="absolute bottom-2 inset-x-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700/80 text-center">
        <p className="text-[10px] sm:text-[11px] font-semibold text-amber-300 truncate">
          {asset.elementBadge}
        </p>
        <p className="text-[8px] sm:text-[9px] text-slate-400 line-clamp-1">
          {asset.realisticPromptDesc}
        </p>
      </div>
    </div>
  );
};
