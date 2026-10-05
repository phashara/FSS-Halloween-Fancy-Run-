import React from 'react';
import { GhostSpeciesId } from '../types';

interface Props {
  speciesId: GhostSpeciesId;
  className?: string;
  scaryLevel?: number;
  mode?: 'realistic' | 'talisman';
  customImageUrl?: string;
}

// Curated high-resolution photorealistic cinematic photography for 12 Thai ghosts
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
    ambientGlow: 'rgba(239, 68, 68, 0.4)',
    elementBadge: 'แสงไฟวิญญาณเรืองรอง',
    realisticPromptDesc: 'ศีรษะลอยคว้างพร้อมพวงไส้เรืองแสงสีแดง-เขียว ส่องสว่างกลางป่าดงดิบยามค่ำคืน',
  },
  krahang: {
    photoUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#8b5cf6',
    ambientGlow: 'rgba(139, 92, 246, 0.4)',
    elementBadge: 'เวหาติดปีกกระด้ง',
    realisticPromptDesc: 'ชายหนุ่มเหาะทะยานข้ามยอดไม้ด้วยปีกกระด้งโบราณตัดกับเงาจันทร์เต็มดวง',
  },
  pop: {
    photoUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#991b1b',
    ambientGlow: 'rgba(185, 28, 28, 0.4)',
    elementBadge: 'ยายปอบคร่อมซากควาย',
    realisticPromptDesc: 'หญิงชราผมหงอกยาว ลิ้นยาวลิ้มรสก้อนเนื้อสด นั่งคร่อมซากควายธนูขนาดใหญ่กลางความมืด',
  },
  tani: {
    photoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#10b981',
    ambientGlow: 'rgba(16, 185, 129, 0.4)',
    elementBadge: 'พรายมรกตดงกล้วย',
    realisticPromptDesc: 'สตรีงามเร้นลับนุ่งสไบเขียวมรกต ยืนท่ามกลางดงกล้วยตานีและมวลหมอกใต้แสงจันทร์',
  },
  maenak: {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f43f5e',
    ambientGlow: 'rgba(244, 63, 94, 0.4)',
    elementBadge: 'รักนิรันดร์ริมท่าน้ำ',
    realisticPromptDesc: 'หญิงสาวชุดไทยโบราณอุ้มลูกน้อยยืนคอยริมคลอง แขนขาวซีดยื่นออกในความมืด',
  },
  kuman: {
    photoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#eab308',
    ambientGlow: 'rgba(234, 179, 8, 0.4)',
    elementBadge: 'กุมารทองอาคมขลัง',
    realisticPromptDesc: 'วิญญาณเด็กน้อยผมจุกเรืองแสงทองคำ พร้อมควันธูปศักดิ์สิทธิ์และพลังซุกซน',
  },
  pret: {
    photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#06b6d4',
    ambientGlow: 'rgba(6, 182, 212, 0.4)',
    elementBadge: 'ร่างโย่งเสียดฟ้า',
    realisticPromptDesc: 'เงาร่างสูงตระหง่านทัดเทียมยอดเจดีย์ท่ามกลางฟ้าผ่าและเสียงผิวปากโหยหวน',
  },
  kongkoi: {
    photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#14b8a6',
    ambientGlow: 'rgba(20, 184, 166, 0.4)',
    elementBadge: 'ภูตไพรขาเดียว',
    realisticPromptDesc: 'ภูตแห่งพงไพรขาเดียวกระโดดบนรากไม้ใหญ่ ดวงตาสีทองสะท้อนความลี้ลับ',
  },
  pitakhon: {
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f59e0b',
    ambientGlow: 'rgba(245, 158, 11, 0.4)',
    elementBadge: 'หน้ากากง้าวไม้วิจิตร',
    realisticPromptDesc: 'หน้ากากผีตาโขนโบราณลวดลายวิจิตรบรรจง แขวนหมากกะแหล่งก้องกังวาน',
  },
  pusom: {
    photoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#eab308',
    ambientGlow: 'rgba(234, 179, 8, 0.4)',
    elementBadge: 'ผู้พิทักษ์สมบัติแผ่นดิน',
    realisticPromptDesc: 'วิญญาณนักรบโบราณกายเปล่งประกายสีทองอร่าม ถือดาบไทยโบราณพิทักษ์กรุสมบัติ',
  },
  mabong: {
    photoUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#6366f1',
    ambientGlow: 'rgba(99, 102, 241, 0.4)',
    elementBadge: 'อาชาลี้ลับแห่งล้านนา',
    realisticPromptDesc: 'ม้าศึกดำทมิฬร่างยักษ์ นัยน์ตาสีเปลวไฟ วิ่งทะยานฝ่าสายหมอกด้วยความเร็วปานสายฟ้า',
  },
  taithongklom: {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f43f5e',
    ambientGlow: 'rgba(244, 63, 94, 0.4)',
    elementBadge: 'พลังรักแรงอาฆาต',
    realisticPromptDesc: 'วิญญาณหญิงสาวชุดไทยโบราณโอบอุ้มทารกในอ้อมอก ออร่าความผูกพันและแรงอธิษฐาน',
  },
  sueasaming: {
    photoUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#d97706',
    ambientGlow: 'rgba(217, 119, 6, 0.4)',
    elementBadge: 'จอมขมังเวทย์แปลงพยัคฆ์',
    realisticPromptDesc: 'เสือโคร่งขนาดยักษ์ลายพาดกลอนเรืองแสงอาคม ดวงตาสีอำพันสะท้อนร่างมนุษย์',
  },
  phraumma: {
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#7c3aed',
    ambientGlow: 'rgba(124, 58, 237, 0.4)',
    elementBadge: 'ตำนานลี้ลับข้างทางเปลี่ยว',
    realisticPromptDesc: 'เงาร่างพระภิกษุและแม่ชีในเงามืดริมทางเปลี่ยวยามดึก สะกดทุกสายตาชวนขนลุก',
  },
  sihuhata: {
    photoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#10b981',
    ambientGlow: 'rgba(16, 185, 129, 0.4)',
    elementBadge: 'สัตว์เทวะกินถ่านไฟถ่ายเป็นทอง',
    realisticPromptDesc: 'สัตว์เทวะสี่หูห้าตาดวงตาสีมรกตเรืองแสง กินถ่านไฟแดงระอุและคายแสงทองคำ',
  },
  headless: {
    photoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#f97316',
    ambientGlow: 'rgba(249, 115, 22, 0.4)',
    elementBadge: 'ขุนพลไร้เศียร',
    realisticPromptDesc: 'นักรบโบราณถือดาบคู่ฟาดฟัน ร่างไร้เศียรพุ่งทะยานผ่านสะเก็ดไฟสงคราม',
  },
  nangram: {
    photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#a855f7',
    ambientGlow: 'rgba(168, 85, 247, 0.4)',
    elementBadge: 'รำอวยพรแห่งความตาย',
    realisticPromptDesc: 'นางรำสวมชฎาทองคำวิจิตร ร่ายรำลอยตัวในความมืดพร้อมเสียงดนตรีไทยชวนขนลุก',
  },
  phiphong: {
    photoUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#84cc16',
    ambientGlow: 'rgba(132, 204, 22, 0.4)',
    elementBadge: 'ดวงไฟพรายบึงน้ำ',
    realisticPromptDesc: 'ดวงประทีปสว่างวาบพุ่งออกจากรูจมูก ส่องประกายเหนือบึงน้ำหนองเหล็กยามฝนพรำ',
  },
  phi_am: {
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    atmosphereColor: '#6366f1',
    ambientGlow: 'rgba(99, 102, 241, 0.4)',
    elementBadge: 'เงามืดสะกดวิญญาณ',
    realisticPromptDesc: 'เงามืดปริศนากดทับอกในมิติทับซ้อนยามนิทรา นัยน์ตาสีม่วงครามสะกดลมหายใจ',
  },
};

export const RealisticGhostPortrait: React.FC<Props> = ({
  speciesId,
  className = 'w-48 h-64 sm:w-56 sm:h-72',
  customImageUrl,
}) => {
  const asset = REALISTIC_GHOST_ASSETS[speciesId] || REALISTIC_GHOST_ASSETS.krasue;
  const imageSrc = customImageUrl || asset.photoUrl;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-950/95 border border-slate-800 flex items-center justify-center select-none ${className}`}
    >
      <img
        src={imageSrc}
        alt={asset.elementBadge}
        referrerPolicy="no-referrer"
        className={`w-full h-full ${customImageUrl ? 'object-contain' : 'object-cover'} object-center rounded-xl`}
      />
    </div>
  );
};
