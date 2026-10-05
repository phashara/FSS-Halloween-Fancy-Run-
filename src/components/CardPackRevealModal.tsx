import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GhostCard } from '../types';
import { GhostCardView } from './GhostCardView';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  card: GhostCard | null;
  onClose: () => void;
  onGoToOrderShirt?: () => void;
  onGoToMyCard?: () => void;
}

export const CardPackRevealModal: React.FC<Props> = ({
  isOpen = true,
  card,
  onClose,
}) => {
  useEffect(() => {
    if (!card || !isOpen) return;

    // Fire celebratory confetti matching card rarity
    const colors =
      card.rarity === 'Legendary'
        ? ['#f59e0b', '#ef4444', '#fde047']
        : card.rarity === 'Epic'
        ? ['#a855f7', '#ec4899', '#8b5cf6']
        : ['#3b82f6', '#06b6d4', '#10b981'];

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors,
    });
  }, [card?.rarity, isOpen]);

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181328] via-[#100c1e] to-[#0a0714] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl my-8 text-center text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> ลงทะเบียนสำเร็จเรียบร้อย
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            🎃 การ์ดผีประจำตัวของคุณ
          </h2>

          <div className="pt-1">
            <p className="text-base sm:text-lg md:text-xl font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 py-2.5 px-4 rounded-2xl shadow-inner inline-flex items-center gap-2 justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>บันทึกข้อมูลการสมัครและการ์ดนักวิ่งดิจิทัลเรียบร้อยแล้ว</span>
            </p>
          </div>
        </div>

        {/* 2D Clean Card Presentation */}
        <div className="w-full flex justify-center py-2">
          <GhostCardView card={card} compact={false} />
        </div>

        {/* Finish Close Button */}
        <div className="pt-4 border-t border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            เสร็จสิ้น / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
