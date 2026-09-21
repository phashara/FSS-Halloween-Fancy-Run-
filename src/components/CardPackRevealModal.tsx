import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GhostCard } from '../types';
import { GhostCardView } from './GhostCardView';
import { Sparkles, Shirt, MessageSquare, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  card: GhostCard | null;
  onClose: () => void;
  onGoToOrderShirt?: () => void;
  onGoToShareStory?: () => void;
  onGoToMyCard?: () => void;
  onGoToStorySanctuary?: () => void;
}

export const CardPackRevealModal: React.FC<Props> = ({
  isOpen = true,
  card,
  onClose,
  onGoToOrderShirt = onClose,
  onGoToShareStory = onClose,
  onGoToMyCard = onClose,
  onGoToStorySanctuary = onClose,
}) => {
  // Reveal animation stages:
  // 0: Face down & mist
  // 1: Shaking & building energy
  // 2: Burst of colored rarity light
  // 3: Card flipped & revealed!
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!card || !isOpen) {
      setStage(0);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2400);
    const t3 = setTimeout(() => {
      setStage(3);
      // Fire celebratory confetti matching card rarity
      const colors =
        card.rarity === 'Legendary'
          ? ['#f59e0b', '#ef4444', '#fde047']
          : card.rarity === 'Epic'
          ? ['#a855f7', '#ec4899', '#8b5cf6']
          : ['#3b82f6', '#06b6d4', '#10b981'];

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [card?.rarity, isOpen]);

  if (!isOpen || !card) return null;

  const rarityColorGlow = {
    Common: 'rgba(148, 163, 184, 0.4)',
    Rare: 'rgba(59, 130, 246, 0.6)',
    Epic: 'rgba(168, 85, 247, 0.8)',
    Legendary: 'rgba(245, 158, 11, 0.9)',
  }[card.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181328] via-[#100c1e] to-[#0a0714] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl my-8 text-center text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> ลงทะเบียนสำเร็จเรียบร้อย
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            🎃 ปลุกวิญญาณนักวิ่งในตัวคุณ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ค้นพบแล้วว่า... &ldquo;คุณคือผีอะไรใน 12 ผีไทยคอลเลกชัน!&rdquo;
          </p>
        </div>

        {/* Card Stage / Reveal Container */}
        <div className="relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center my-4 overflow-hidden rounded-2xl bg-black/40 border border-slate-800 p-4">
          {stage < 3 ? (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Unopened Mystical Card Box */}
              <div
                style={{
                  boxShadow: stage >= 2 ? `0 0 60px ${rarityColorGlow}` : 'none',
                }}
                className={`relative w-48 sm:w-56 h-72 sm:h-80 rounded-2xl bg-gradient-to-br from-[#2a1b4e] via-[#1e1438] to-[#120a24] border-4 border-amber-400/60 p-4 flex flex-col items-center justify-between shadow-2xl transition-all duration-700 ${
                  stage === 1 ? 'animate-bounce' : ''
                } ${stage === 2 ? 'scale-110 rotate-3' : ''}`}
              >
                <span className="text-4xl animate-pulse">🔮</span>
                <div className="text-center">
                  <p className="text-amber-400 font-normal text-lg sm:text-xl tracking-wider font-horror drop-shadow-[1px_2px_0px_rgba(0,0,0,0.9)]">
                    FSS GHOST PACK
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {stage === 0 && 'หมอกวิญญาณเริ่มก่อตัว...'}
                    {stage === 1 && 'การ์ดกำลังสั่นสะเทือน!'}
                    {stage === 2 && `ออร่าระดับ ${card.rarity.toUpperCase()} ระเบิดออก!`}
                  </p>
                </div>
                <div className="w-full bg-amber-500/20 py-1 rounded text-center text-amber-300 text-xs font-mono">
                  TAP TO UNSEAL
                </div>
              </div>

              {/* Fog/Mist indicators */}
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-300/80 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                กำลังปลดผนึกวิญญาณประจำตัวของคุณ...
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center py-2 animate-in fade-in zoom-in duration-500">
              <GhostCardView card={card} showModeToggle={true} />
            </div>
          )}
        </div>

        {/* Mission / Upsell prompt (Section 11) */}
        {stage === 3 && (
          <div className="space-y-4 pt-2">
            {/* Horror Story Prompt Card */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👻</span>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-purple-200">
                    มีประสบการณ์สยองอยากเล่าหรือไม่?
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    แบ่งปันเรื่องหลอน เรื่องขำ หรือเหตุการณ์ที่ยังหาคำตอบไม่ได้ เมื่อผ่านการอนุมัติจะได้รับตรา <b>STORYTELLER</b> และอัปเกรดการ์ดเป็น <b>LV.2</b> หรือ <b>LV.3</b> ทันที!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={onGoToShareStory}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      เล่าเรื่องตอนนี้เลย!
                    </button>
                    <button
                      type="button"
                      onClick={onGoToStorySanctuary}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      อ่านเรื่องของคนอื่น
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <button
                type="button"
                onClick={onGoToOrderShirt}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                <Shirt className="w-4 h-4" /> สั่งเสื้อเพื่ออัป Level
              </button>
              <button
                type="button"
                onClick={onGoToMyCard}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                ดูการ์ดของฉัน <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
