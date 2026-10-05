import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GhostCard } from '../types';
import { GhostCardView } from './GhostCardView';
import { Sparkles, Shirt, ArrowRight, X } from 'lucide-react';

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
  onGoToOrderShirt = onClose,
  onGoToMyCard = onClose,
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
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ลงทะเบียนสำเร็จเรียบร้อย
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            🎃 การ์ดผีประจำตัวของคุณ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            บันทึกข้อมูลการสมัครและการ์ดนักวิ่งดิจิทัลเรียบร้อยแล้ว
          </p>
        </div>

        {/* 2D Clean Card Presentation */}
        <div className="w-full flex justify-center py-2">
          <GhostCardView card={card} compact={false} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80 mt-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
            <button
              type="button"
              onClick={onGoToOrderShirt}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-md transition-all text-center cursor-pointer"
            >
              <Shirt className="w-4 h-4 shrink-0" /> สั่งซื้อเสื้อที่ระลึก
            </button>
            <button
              type="button"
              onClick={onGoToMyCard}
              className="flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors text-center cursor-pointer"
            >
              ดูการ์ดของฉัน <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
