import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Sparkles,
  Award,
  CheckCircle2,
  QrCode as QrIcon,
} from 'lucide-react';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard } from '../types';
import { useEventContext } from '../context/EventContext';
import { RealisticGhostPortrait } from './RealisticGhostPortrait';

interface Props {
  card: GhostCard;
  isOwner?: boolean;
  showModeToggle?: boolean;
  compact?: boolean;
  aspectRatio?: '9:16' | '16:9' | 'portrait';
}

export const GhostCardView: React.FC<Props> = ({
  card,
  compact = false,
  aspectRatio = '9:16',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { ghostSpeciesList } = useEventContext();

  const species =
    ghostSpeciesList?.find((g) => g?.id === card?.speciesId) ||
    THAI_GHOSTS[card?.speciesId] ||
    THAI_GHOSTS.pret;

  const ghostHeadline =
    (species?.name || '').startsWith('ผี') || (species?.name || '').startsWith('นาง')
      ? `คุณคือ${species?.name || 'ผีไทย'}`
      : `คุณคือผี${species?.name || 'ไทย'}`;

  // Generate clean QR Code
  useEffect(() => {
    if (!card?.qrPayload) return;
    QRCode.toDataURL(card.qrPayload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [card?.qrPayload]);

  // Rarity theme configuration (2D Flat Premium)
  const rarityTheme = {
    Common: {
      badge: 'bg-slate-800 text-slate-300 border-slate-600',
      border: 'border-slate-700',
      accentText: 'text-slate-300',
      glow: 'shadow-lg shadow-slate-900/50',
    },
    Rare: {
      badge: 'bg-blue-950 text-blue-300 border-blue-500',
      border: 'border-blue-600/70',
      accentText: 'text-blue-400',
      glow: 'shadow-xl shadow-blue-950/50',
    },
    Epic: {
      badge: 'bg-purple-950 text-purple-300 border-purple-500',
      border: 'border-purple-600/80',
      accentText: 'text-purple-400',
      glow: 'shadow-xl shadow-purple-950/60',
    },
    Legendary: {
      badge: 'bg-amber-950 text-amber-300 border-amber-500',
      border: 'border-amber-500/90',
      accentText: 'text-amber-400',
      glow: 'shadow-2xl shadow-amber-950/70',
    },
  }[card.rarity] || {
    badge: 'bg-amber-950 text-amber-300 border-amber-500',
    border: 'border-amber-500/90',
    accentText: 'text-amber-400',
    glow: 'shadow-2xl shadow-amber-950/70',
  };

  // 16:9 Widescreen Presentation
  if (aspectRatio === '16:9') {
    return (
      <div className="flex flex-col items-center w-full">
        <div
          className={`relative w-full max-w-2xl sm:max-w-3xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#191129] via-[#100a1c] to-[#090512] border-2 ${
            rarityTheme.border
          } ${rarityTheme.glow} p-4 sm:p-6 select-none transition-all`}
        >
          {/* Top Bar for 16:9 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎃</span>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold tracking-wider text-amber-400 uppercase font-horror">
                  FSS HALLOWEEN RUN 2026
                </p>
                <p className="text-[10px] text-slate-400">THAI GHOST COLLECTION • WIDESCREEN 16:9 E-CARD</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${rarityTheme.badge}`}
            >
              {card.rarity}
            </span>
          </div>

          {/* 16:9 Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left: Ghost Artwork Frame */}
            <div className="sm:col-span-5 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-[#120a1f] border border-slate-800 p-2 flex flex-col items-center justify-center shadow-inner">
              <RealisticGhostPortrait
                speciesId={card.speciesId}
                customImageUrl={card.customImageUrl || species.customImageUrl}
                className="w-full h-56 sm:h-64 object-cover rounded-xl"
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-amber-400">{species.name}</span>
                <span className="text-[10px] text-slate-400 block">{species.element} Element</span>
              </div>
            </div>

            {/* Right: Info & Stats */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  <span>ผีประจำตัวของคุณ</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight drop-shadow-md">
                  {ghostHeadline}
                </h3>

                <p className="text-xs sm:text-sm text-orange-300 font-semibold">{species.title}</p>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{species.tagline}&rdquo;
                </p>
              </div>

              {/* Owner & QR Box */}
              <div className="p-3 sm:p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 block">เจ้าของการ์ด</span>
                    <span className="font-bold text-white text-sm sm:text-base">{card.nickname || 'ผู้สมัคร'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">รหัสการ์ด (Card ID)</span>
                    <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">{card.cardId}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrIcon className="w-8 h-8 text-slate-700" />
                  )}
                </div>
              </div>

              {/* Event Date Callout */}
              <div className="py-2 px-3 rounded-xl bg-gradient-to-r from-red-950/80 via-orange-950/80 to-amber-950/80 border border-orange-500/40 text-center shadow-inner">
                <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide drop-shadow-sm flex items-center justify-center gap-1.5">
                  <span>🏁</span>
                  <span>แล้วพบกัน 31 ตุลาคม 2569 • มหาวิทยาลัยนเรศวร</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9:16 Vertical Story / Mobile Wallpaper Presentation (Default)
  return (
    <div className="flex flex-col items-center w-full">
      {/* 9:16 Official Ghost Card */}
      <div
        className={`relative w-full ${
          compact ? 'max-w-xs' : 'max-w-sm sm:max-w-[420px]'
        } rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c132b] via-[#100a1c] to-[#07040d] border-2 ${
          rarityTheme.border
        } ${rarityTheme.glow} p-4 sm:p-5 select-none transition-all space-y-3.5`}
      >
        {/* Top Header: Event & Rarity */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎃</span>
            <div className="text-left">
              <p className="text-xs font-bold tracking-wider text-amber-400 uppercase font-horror">
                FSS HALLOWEEN RUN 2026
              </p>
              <p className="text-[10px] text-slate-400">THAI GHOST COLLECTION • 9:16 EDITION</p>
            </div>
          </div>
          <span
            className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${rarityTheme.badge}`}
          >
            {card.rarity}
          </span>
        </div>

        {/* Hero Artwork Frame (9:16 Proportionate) */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-[#120a1f] border border-slate-800/90 p-2 flex flex-col items-center justify-center shadow-inner">
          <RealisticGhostPortrait
            speciesId={card.speciesId}
            customImageUrl={card.customImageUrl || species.customImageUrl}
            className="w-full h-64 sm:h-76 object-cover rounded-xl"
          />
        </div>

        {/* Ghost Title & Lore */}
        <div className="text-center space-y-1 my-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>ผีประจำตัวของคุณ</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight drop-shadow-md">
            {ghostHeadline}
          </h3>

          <p className="text-xs sm:text-sm text-orange-300 font-semibold">{species.title}</p>
          <p className="text-xs text-slate-300 italic px-2 leading-relaxed">
            &ldquo;{species.tagline}&rdquo;
          </p>
        </div>

        {/* Runner & Card Verification Info */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-1 text-left">
            <div>
              <span className="text-[10px] text-slate-400 block">เจ้าของการ์ด</span>
              <span className="font-bold text-white text-sm sm:text-base">{card.nickname || 'ผู้สมัคร'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">รหัสการ์ด (Card ID)</span>
              <span className="font-mono font-bold text-amber-400">{card.cardId}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <QrIcon className="w-8 h-8 text-slate-700" />
            )}
          </div>
        </div>

        {/* Event Date Banner */}
        <div className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-950/90 via-orange-950/90 to-amber-950/90 border border-orange-500/40 text-center shadow-inner">
          <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide drop-shadow-sm flex items-center justify-center gap-1.5">
            <span>🏁</span>
            <span>แล้วพบกัน 31 ตุลาคม 2569 • ม.นเรศวร</span>
          </p>
        </div>
      </div>
    </div>
  );
};
