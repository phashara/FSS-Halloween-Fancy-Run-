import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Sparkles,
  Award,
  CheckCircle2,
  QrCode as QrIcon,
} from 'lucide-react';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard } from '../types';
import { useEventContext } from '../context/EventContext';
import { RealisticGhostPortrait, REALISTIC_GHOST_ASSETS } from './RealisticGhostPortrait';

interface Props {
  card: GhostCard;
  isOwner?: boolean;
  showModeToggle?: boolean;
  compact?: boolean;
}

export const GhostCardView: React.FC<Props> = ({
  card,
  compact = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // High-Resolution 2D Card Download Generator
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 920;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 1. Background
        const grad = ctx.createLinearGradient(0, 0, 0, 920);
        grad.addColorStop(0, '#1a1226');
        grad.addColorStop(0.5, '#100c1e');
        grad.addColorStop(1, '#080511');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 920);

        // 2. Outer Border & Glow
        ctx.strokeStyle =
          card.rarity === 'Legendary'
            ? '#f59e0b'
            : card.rarity === 'Epic'
            ? '#a855f7'
            : card.rarity === 'Rare'
            ? '#3b82f6'
            : '#64748b';
        ctx.lineWidth = 8;
        ctx.strokeRect(16, 16, 608, 888);

        // 3. Header Text
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px "Sarabun", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🎃 FSS HALLOWEEN RUN 2026', 40, 60);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px "Sarabun", sans-serif';
        ctx.fillText('THAI GHOST COLLECTION', 40, 84);

        // Rarity Badge on Canvas
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 18px "Sarabun", sans-serif';
        ctx.fillText(`[ ${card.rarity.toUpperCase()} ]`, 600, 65);

        // 4. Ghost Headline & Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Sarabun", sans-serif';
        ctx.fillText(ghostHeadline, 320, 160);

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 20px "Sarabun", sans-serif';
        ctx.fillText(species.title || '', 320, 195);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 16px "Sarabun", sans-serif';
        ctx.fillText(`“${species.tagline || ''}”`, 320, 230);

        // 5. Ghost Artwork Box & Image
        ctx.fillStyle = '#0f091a';
        ctx.fillRect(60, 260, 520, 380);
        ctx.strokeStyle = '#332352';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 260, 520, 380);

        const activeImgUrl =
          card.customImageUrl ||
          species.customImageUrl ||
          REALISTIC_GHOST_ASSETS[card.speciesId]?.photoUrl;

        if (activeImgUrl) {
          try {
            const ghostImg = new Image();
            ghostImg.crossOrigin = 'anonymous';
            ghostImg.src = activeImgUrl;
            await new Promise((resolve) => {
              ghostImg.onload = resolve;
              ghostImg.onerror = resolve;
            });

            if (ghostImg.complete && ghostImg.naturalWidth > 0) {
              ctx.save();
              ctx.beginPath();
              ctx.rect(60, 260, 520, 380);
              ctx.clip();

              const imgRatio = ghostImg.naturalWidth / ghostImg.naturalHeight;
              const targetRatio = 520 / 380;
              let sW = ghostImg.naturalWidth;
              let sH = ghostImg.naturalHeight;
              let sX = 0;
              let sY = 0;

              if (imgRatio > targetRatio) {
                sH = ghostImg.naturalHeight;
                sW = ghostImg.naturalHeight * targetRatio;
                sX = (ghostImg.naturalWidth - sW) / 2;
                sY = 0;
              } else {
                sW = ghostImg.naturalWidth;
                sH = ghostImg.naturalWidth / targetRatio;
                sX = 0;
                sY = (ghostImg.naturalHeight - sH) / 2;
              }

              ctx.drawImage(ghostImg, sX, sY, sW, sH, 60, 260, 520, 380);
              ctx.restore();
            }
          } catch (imgErr) {
            console.warn('Canvas ghost image draw error:', imgErr);
          }
        }

        // 6. Owner & Info Box
        ctx.fillStyle = '#18122c';
        ctx.fillRect(60, 660, 520, 120);
        ctx.strokeStyle = '#432f6b';
        ctx.strokeRect(60, 660, 520, 120);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px "Sarabun", sans-serif';
        ctx.fillText('เจ้าของการ์ด:', 85, 705);
        ctx.fillText('รหัสการ์ด (Card ID):', 85, 745);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 22px "Sarabun", sans-serif';
        ctx.fillText(card.nickname || 'ผู้สมัคร', 200, 705);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(card.cardId, 250, 745);

        // 7. QR Code
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          await new Promise((res) => {
            qrImg.onload = res;
            qrImg.onerror = res;
          });
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(455, 675, 90, 90);
          ctx.drawImage(qrImg, 460, 680, 80, 80);
        }

        // 8. Event Date Callout
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px "Sarabun", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 แล้วพบกัน 31 ตุลาคม 2569', 320, 825);

        // 9. Footer
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Sarabun", sans-serif';
        ctx.fillText('#FSSGhostRun2026 • มหาวิทยาลัยนเรศวร', 320, 870);

        // Save & Download
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `FSS-Ghost-Card-${card.cardId}-${species.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* 2D Flat Official Ghost Card */}
      <div
        ref={cardRef}
        className={`relative w-full ${
          compact ? 'max-w-xs' : 'max-w-sm sm:max-w-md'
        } rounded-3xl overflow-hidden bg-gradient-to-b from-[#191129] via-[#100a1c] to-[#090512] border-2 ${
          rarityTheme.border
        } ${rarityTheme.glow} p-5 select-none transition-all`}
      >
        {/* Top Header: Event & Rarity */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎃</span>
            <div className="text-left">
              <p className="text-xs font-bold tracking-wider text-amber-400 uppercase font-horror">
                FSS HALLOWEEN RUN 2026
              </p>
              <p className="text-[10px] text-slate-400">THAI GHOST COLLECTION</p>
            </div>
          </div>
          <span
            className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${rarityTheme.badge}`}
          >
            {card.rarity}
          </span>
        </div>

        {/* Hero Artwork Frame */}
        <div className="my-4 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 to-[#120a1f] border border-slate-800 p-2 flex flex-col items-center justify-center shadow-inner">
          <RealisticGhostPortrait
            speciesId={card.speciesId}
            customImageUrl={card.customImageUrl || species.customImageUrl}
            className="w-48 h-60 sm:w-56 sm:h-68 object-cover rounded-xl"
          />
        </div>

        {/* Ghost Title & Lore */}
        <div className="text-center space-y-1 my-3">
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
        <div className="mt-4 p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-1 text-left">
            <div>
              <span className="text-[10px] text-slate-400 block">เจ้าของการ์ด</span>
              <span className="font-bold text-white text-sm">{card.nickname}</span>
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
        <div className="mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-red-950/80 via-orange-950/80 to-amber-950/80 border border-orange-500/40 text-center shadow-inner">
          <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide drop-shadow-sm flex items-center justify-center gap-1.5">
            <span>🏁</span>
            <span>แล้วพบกัน 31 ตุลาคม 2569</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div className="mt-4 w-full max-w-sm sm:max-w-md">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer transform active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isDownloading ? 'กำลังสร้างภาพความละเอียดสูง...' : 'ดาวน์โหลดการ์ดลงเครื่อง'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
