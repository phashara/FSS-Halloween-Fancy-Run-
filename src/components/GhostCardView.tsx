import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  CheckCircle2,
  Download,
  Flame,
  Lock,
  QrCode as QrIcon,
  Share2,
  Shield,
  Shirt,
  Sparkles,
  Zap,
  Smartphone,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { compressImage } from '../lib/imageCompressor';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard } from '../types';
import { GhostAvatarSvg } from './GhostAvatarSvg';
import { RealisticGhostPortrait, REALISTIC_GHOST_ASSETS } from './RealisticGhostPortrait';
import { GhostStoryModal } from './GhostStoryModal';
import { generateGhostStoryCanvas, shareToStoryDirectly } from '../utils/storyCanvasGenerator';

interface Props {
  card: GhostCard;
  isOwner?: boolean;
  onShare?: () => void;
  showModeToggle?: boolean;
  compact?: boolean;
  initialRatio?: 'standard' | 'story916';
}

export const GhostCardView: React.FC<Props> = ({
  card,
  isOwner = true,
  onShare,
  showModeToggle = true,
  compact = false,
  initialRatio = 'standard',
}) => {
  const [displayMode, setDisplayMode] = useState<'private' | 'social'>('private');
  const [artMode, setArtMode] = useState<'realistic' | 'talisman'>('realistic');
  const [cardRatio, setCardRatio] = useState<'standard' | 'story916'>(initialRatio);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateCardCustomImage, adminUser, ghostSpeciesList } = useEventContext();
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
      }
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.88);
      updateCardCustomImage(card.cardId, compressedDataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    updateCardCustomImage(card.cardId, customUrlInput.trim());
    setCustomUrlInput('');
    setShowUrlModal(false);
  };

  const handleResetImage = () => {
    updateCardCustomImage(card.cardId, null);
  };

  const species =
    ghostSpeciesList?.find((g) => g.id === card.speciesId) ||
    THAI_GHOSTS[card.speciesId] ||
    THAI_GHOSTS.krasue;
  const ghostHeadline =
    species.name.startsWith('ผี') || species.name.startsWith('นาง')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`;

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(card.qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [card.qrPayload]);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compact) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Download card snapshot (supports both Standard and 9:16 Story HD)
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (cardRatio === 'story916') {
        const canvas = await generateGhostStoryCanvas(card, {
          artMode,
          isSocialMode: displayMode === 'social',
        });
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `FSS-Story-9x16-${card.cardId}-${species.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Standard card canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 880;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Gradient background
          const grad = ctx.createLinearGradient(0, 0, 600, 880);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(0.5, '#1e1b4b');
          grad.addColorStop(1, '#090514');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 600, 880);

          // Border
          ctx.strokeStyle = card.rarity === 'Legendary' ? '#f59e0b' : card.rarity === 'Epic' ? '#a855f7' : '#3b82f6';
          ctx.lineWidth = 12;
          ctx.strokeRect(20, 20, 560, 840);

          // Text
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 28px Creepster, Prompt, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FSS HALLOWEEN FANCY RUN 2026', 300, 68);

          // Badge: วิญญาณประจำตัวของคุณ
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 16px Prompt, sans-serif';
          ctx.fillText('👻 วิญญาณประจำตัวของคุณ (REALISTIC RELIC)', 300, 100);

          // Headline: คุณคือผี...
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 36px Prompt, sans-serif';
          ctx.fillText(ghostHeadline, 300, 142);

          ctx.fillStyle = '#fb923c';
          ctx.font = '19px Prompt, sans-serif';
          ctx.fillText(species.title, 300, 175);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '20px Prompt, sans-serif';
          ctx.fillText(`เจ้าของการ์ด: ${card.nickname}  |  Card ID: ${card.cardId}`, 300, 215);
          ctx.fillText(`Level: ${card.level} (${card.level === 3 ? 'ULTIMATE' : card.level === 2 ? 'UNLEASHED' : 'AWAKENED'})  |  RARITY: ${card.rarity.toUpperCase()}`, 300, 245);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'italic 17px Prompt, sans-serif';
          ctx.fillText(`"${card.customQuote || species.tagline}"`, 300, 280);

          // Realistic Portrait Badge Box in Canvas
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(160, 310, 280, 260);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(160, 310, 280, 260);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 20px Prompt, sans-serif';
          ctx.fillText('📸 ภาพการ์ดเสมือนจริง 3D', 300, 420);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '15px Prompt, sans-serif';
          ctx.fillText(species.lore.slice(0, 32) + '...', 300, 460);

          // Stats summary
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '19px Prompt, sans-serif';
          ctx.fillText(`ความหลอน: ${card.stats.spookiness}  |  ความเร็ว: ${card.stats.speed}  |  พลังแฝง: ${card.stats.latentPower}`, 300, 615);
          ctx.fillText(`การพรางตัว: ${card.stats.stealth}  |  ความเฮี้ยน: ${card.stats.hauntingAura}`, 300, 650);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 18px Prompt, sans-serif';
          ctx.fillText('รางวัล 350 ท่านแรก: เหรียญที่ระลึก Finisher & คูปองอาหาร', 300, 770);

          ctx.fillStyle = '#64748b';
          ctx.font = '16px Prompt, sans-serif';
          ctx.fillText('31 ตุลาคม 2569 • คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร', 300, 820);

          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `GhostCard-${card.cardId}-${card.nickname}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Rarity Styling
  const rarityConfig = {
    Common: {
      badgeBg: 'bg-slate-700/80 text-slate-200 border-slate-500',
      borderClass: 'border-slate-600/60 shadow-slate-900/40',
      glow: 'shadow-lg',
      textColor: 'text-slate-300',
      ribbonBg: 'from-slate-600 to-slate-800',
    },
    Rare: {
      badgeBg: 'bg-blue-900/80 text-blue-200 border-blue-400',
      borderClass: 'border-blue-500/70 shadow-blue-900/50 shadow-2xl',
      glow: 'ring-1 ring-blue-400/50',
      textColor: 'text-blue-400',
      ribbonBg: 'from-blue-600 to-indigo-800',
    },
    Epic: {
      badgeBg: 'bg-purple-900/80 text-purple-200 border-purple-400',
      borderClass: 'border-purple-500/80 shadow-purple-900/60 shadow-2xl',
      glow: 'ring-2 ring-purple-500/60 animate-pulse',
      textColor: 'text-purple-400',
      ribbonBg: 'from-purple-600 to-fuchsia-800',
    },
    Legendary: {
      badgeBg: 'bg-amber-900/90 text-amber-200 border-amber-400 font-bold',
      borderClass: 'border-amber-400 shadow-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]',
      glow: 'ring-2 ring-amber-400 animate-pulse',
      textColor: 'text-amber-400',
      ribbonBg: 'from-amber-500 via-rose-500 to-amber-600',
    },
  }[card.rarity];

  // Level specific themes
  const levelInfo = {
    1: {
      title: 'LV.1 วิญญาณตื่น',
      sub: 'Awakened Spirit',
      accentBorder: '',
    },
    2: {
      title: 'LV.2 ปลดผนึกพลัง',
      sub: 'Unleashed Power',
      accentBorder: card.badges.includes('SHIRT_OWNER')
        ? 'border-dashed border-orange-500/60'
        : 'border-emerald-500/60',
    },
    3: {
      title: 'LV.3 ตำนานสยอง (ULTIMATE GHOST)',
      sub: 'Ultimate Thai Ghost',
      accentBorder: 'border-amber-400 border-double',
    },
  }[card.level];

  return (
    <div className="flex flex-col items-center">
      {/* Mode & Ratio Switcher Tabs */}
      {showModeToggle && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {/* Aspect Ratio Switcher: Standard Card vs Story 9:16 */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() => setCardRatio('standard')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                cardRatio === 'standard'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎴 การ์ดปกติ</span>
            </button>
            <button
              type="button"
              onClick={() => setCardRatio('story916')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                cardRatio === 'story916'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-300" />
              <span>สตอรี่ 9:16</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-extrabold">
                HD
              </span>
            </button>
          </div>

          {/* Display Mode: Private vs Social */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() => setDisplayMode('private')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                displayMode === 'private'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ส่วนตัว (QR จริง)</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('social')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                displayMode === 'social'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>แชร์โซเชียล</span>
            </button>
          </div>
        </div>
      )}

      {/* 3D Physical Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative w-full ${
          cardRatio === 'story916'
            ? 'aspect-[9/16] max-w-[340px] sm:max-w-[375px] flex flex-col justify-between'
            : compact
            ? 'max-w-xs'
            : 'max-w-sm sm:max-w-md'
        } rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#181329] via-[#0f0b1c] to-[#0a0714] border-2 ${
          rarityConfig.borderClass
        } ${rarityConfig.glow} ${levelInfo.accentBorder} p-3.5 sm:p-5 select-none transition-all duration-300`}
      >
        {/* Story 9:16 Simulated Top Progress Indicators */}
        {cardRatio === 'story916' && (
          <div className="relative z-20 w-full mb-1">
            <div className="flex gap-1 mb-1.5">
              <div className="h-1 flex-1 bg-amber-400/90 rounded-full" />
              <div className="h-1 flex-1 bg-white/30 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 px-0.5">
              <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                <Smartphone className="w-3 h-3" />
                <span>9:16 STORY MODE</span>
              </span>
              <span className="text-[9px] text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/40">
                IG / FB Story Ready
              </span>
            </div>
          </div>
        )}
        {/* Background Atmospheric Watermark and Glow */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: species.primaryColor }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: species.accentColor }}
        />

        {/* Level 3 Aura Particle Effect */}
        {card.level === 3 && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none animate-pulse" />
        )}

        {/* Header Ribbon: Logo & Rarity */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎃</span>
            <div>
              <p className="text-xs font-normal tracking-wider text-amber-400 uppercase font-horror drop-shadow-[1px_1px_0px_rgba(0,0,0,0.9)]">
                FSS HALLOWEEN RUN 2026
              </p>
              <p className="text-[9px] text-slate-400">THAI GHOST COLLECTION</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${rarityConfig.badgeBg}`}
            >
              {card.rarity}
            </span>
            <div className="bg-slate-800/90 text-amber-300 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold border border-slate-700">
              LV.{card.level}
            </div>
          </div>
        </div>

        {/* Level Indicator Banner */}
        <div className="relative z-10 mt-3 mb-2">
          <div
            className={`w-full py-1 px-3 rounded-lg bg-gradient-to-r ${rarityConfig.ribbonBg} text-center shadow-md flex items-center justify-between`}
          >
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {levelInfo.title}
            </span>
            <span className="text-[9px] text-slate-200/90 uppercase font-mono">
              {levelInfo.sub}
            </span>
          </div>
        </div>

        {/* Center Artwork & Visual Frame */}
        <div className="relative z-10 my-3 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-[#140a1c] to-[#0a0512] border border-red-950/80 p-3 flex flex-col items-center justify-center shadow-inner group">
          {/* Eerie Blood Mist & Vignette Effect */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/30 via-transparent to-purple-950/20 pointer-events-none" />

          {/* Thai Occult Corner Talismans (ยันต์มหาเวทย์ 4 มุม) */}
          <span className="absolute top-1.5 left-2 text-[10px] font-mono text-red-500/60 select-none pointer-events-none font-serif">
            ๛ นะ
          </span>
          <span className="absolute top-1.5 right-2 text-[10px] font-mono text-red-500/60 select-none pointer-events-none font-serif">
            โม ๛
          </span>
          <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-red-500/60 select-none pointer-events-none font-serif">
            ๛ พุท
          </span>
          <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-red-500/60 select-none pointer-events-none font-serif">
            ธา ๛
          </span>

          {/* Realism Art Mode Switcher & Custom Image Actions */}
          <div className="relative z-10 flex flex-wrap items-center justify-between w-full px-1 mb-2 gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ภาพการ์ด</span>
              {card.customImageUrl && (
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded-full font-mono">
                  ภาพที่อัปโหลด
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1">
              <div className="inline-flex p-0.5 rounded-lg bg-black/85 border border-slate-700/80 text-[9px] sm:text-[10px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArtMode('realistic');
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    artMode === 'realistic'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📸 เสมือนจริง
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setArtMode('talisman');
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    artMode === 'talisman'
                      ? 'bg-purple-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔮 ยันต์โบราณ
                </button>
              </div>

              {/* Upload image button & URL option */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`card-upload-${card.cardId}`}
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="อัปโหลดรูปภาพจากอุปกรณ์"
                  className="px-2 py-0.5 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Upload className="w-2.5 h-2.5 text-amber-400" />
                  <span>{isUploading ? 'กำลังโหลด...' : 'ใส่รูปแทน'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUrlModal(true);
                  }}
                  title="ใส่ URL ลิงก์รูปภาพโดยตรง"
                  className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[9px] border border-slate-700 transition-colors"
                >
                  <LinkIcon className="w-2.5 h-2.5 text-amber-400" />
                </button>

                {card.customImageUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetImage();
                    }}
                    title="รีเซ็ตเป็นภาพวาดดั้งเดิม"
                    className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[9px] transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* URL Input Modal */}
          {showUrlModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowUrlModal(false)}
            >
              <div
                className="w-full max-w-sm p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-amber-400" />
                    ใส่ URL รูปภาพแทนภาพผี
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleUrlSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      URL ของรูปภาพ (เช่น https://...):
                    </label>
                    <input
                      type="url"
                      required
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowUrlModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
                    >
                      บันทึกรูป
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="relative z-10 w-full mb-2 p-1.5 rounded bg-red-950/90 border border-red-500/60 text-red-200 text-[10px] text-center">
              {uploadError}
            </div>
          )}

          {/* Ghost Realistic Portrait Artwork */}
          <div className="relative py-1 flex items-center justify-center">
            <RealisticGhostPortrait
              speciesId={card.speciesId}
              scaryLevel={card.level}
              mode={artMode}
              customImageUrl={card.customImageUrl}
              className="w-48 h-64 sm:w-56 sm:h-72"
            />

            {card.level >= 2 && card.badges.includes('SHIRT_OWNER') && (
              <div className="absolute top-2 right-2 bg-orange-500/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-orange-300 z-10">
                <Shirt className="w-2.5 h-2.5" /> SHIRT
              </div>
            )}
            {card.level >= 2 && card.badges.includes('STORYTELLER') && (
              <div className="absolute top-2 left-2 bg-purple-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-purple-300 z-10">
                <Flame className="w-2.5 h-2.5" /> STORY
              </div>
            )}
          </div>

          {/* Ghost Headline: บนการ์ดเขียนคุณคือผี... */}
          <div className="text-center w-full mt-2.5 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-[10px] sm:text-[11px] font-bold shadow-md">
              <span className="animate-pulse">👻</span>
              <span>คุณคือผีประจำตัว</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center justify-center gap-1.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)] font-serif">
              <span>{ghostHeadline}</span>
            </h3>

            <p className="text-xs sm:text-sm text-orange-300 font-medium">{species.title}</p>
            <p className="text-[11px] text-slate-300 italic mt-0.5 px-4 leading-snug">
              &ldquo;{card.customQuote || species.tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Owner Name & Card ID */}
        <div className="relative z-10 flex items-center justify-between px-2 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80 mb-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">เจ้าของการ์ด</span>
            <span className="font-semibold text-slate-100">
              {displayMode === 'social' ? `${card.nickname.slice(0, 4)}***` : card.nickname}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Card ID</span>
            <span className="font-mono font-bold text-amber-400">{card.cardId}</span>
          </div>
        </div>

        {/* 5 Stats Display (Section 7) */}
        <div className="relative z-10 space-y-1.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> ค่าพลังประจำตัว (Max 100)
            </span>
            <span className="text-[10px] text-amber-400 font-mono">
              TOTAL: {card.stats.spookiness + card.stats.speed + card.stats.latentPower + card.stats.stealth + card.stats.hauntingAura}/500
            </span>
          </div>

          {/* Stat 1: Spookiness */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>ความหลอน (Spookiness)</span>
              <span className="font-mono font-bold text-rose-400">{card.stats.spookiness}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-red-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${card.stats.spookiness}%` }}
              />
            </div>
          </div>

          {/* Stat 2: Speed */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>ความเร็ว (Speed)</span>
              <span className="font-mono font-bold text-amber-400">{card.stats.speed}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${card.stats.speed}%` }}
              />
            </div>
          </div>

          {/* Stat 3: Latent Power */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>พลังแฝง (Latent Power)</span>
              <span className="font-mono font-bold text-purple-400">{card.stats.latentPower}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${card.stats.latentPower}%` }}
              />
            </div>
          </div>

          {/* Stat 4: Stealth */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>การพรางตัว (Stealth)</span>
              <span className="font-mono font-bold text-emerald-400">{card.stats.stealth}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${card.stats.stealth}%` }}
              />
            </div>
          </div>

          {/* Stat 5: Haunting Aura */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>ความเฮี้ยน (Haunting Aura)</span>
              <span className="font-mono font-bold text-cyan-400">{card.stats.hauntingAura}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${card.stats.hauntingAura}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/80">
          <p className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> ตราภารกิจที่ปลดล็อก:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {/* Base Registration Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/80 border border-emerald-600/60 rounded text-[9px] font-semibold text-emerald-300">
              <CheckCircle2 className="w-2.5 h-2.5" /> RUNNER AWAKENED
            </span>

            {/* Shirt Owner Badge */}
            {card.badges.includes('SHIRT_OWNER') ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-950/80 border border-orange-500/80 rounded text-[9px] font-semibold text-orange-300 animate-pulse">
                <Shirt className="w-2.5 h-2.5" /> SHIRT OWNER
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-500">
                <Lock className="w-2.5 h-2.5" /> สั่งเสื้อเพื่อปลดล็อก
              </span>
            )}

            {/* Storyteller Badge */}
            {card.badges.includes('STORYTELLER') ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/80 border border-purple-500/80 rounded text-[9px] font-semibold text-purple-300 animate-pulse">
                <Flame className="w-2.5 h-2.5" /> STORYTELLER
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-500">
                <Lock className="w-2.5 h-2.5" /> แชร์เรื่องสยองเพื่อปลดล็อก
              </span>
            )}

            {/* Complete Collection Badge */}
            {card.level === 3 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 border border-amber-400 rounded text-[9px] font-bold text-amber-300 shadow-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> COMPLETE COLLECTION
              </span>
            )}
          </div>
        </div>

        {/* QR Section (Private vs Social) */}
        <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-mono uppercase">VERIFICATION QR</p>
            {displayMode === 'private' ? (
              <p className="text-[9px] text-emerald-400 font-medium">
                ● พร้อมสแกนเช็กอินหน้างาน & รับเสื้อ
              </p>
            ) : (
              <p className="text-[9px] text-slate-400 font-medium">
                🔒 โหมดแชร์ (ซ่อน QR และข้อมูลส่วนตัว)
              </p>
            )}
            <p className="text-[8px] text-slate-500 mt-0.5">#FSSGhostRun2026 #ThaiGhostCollection</p>
          </div>

          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg bg-white p-1 shadow-inner flex items-center justify-center">
            {displayMode === 'private' ? (
              qrDataUrl ? (
                <img src={qrDataUrl} alt="Card QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrIcon className="w-8 h-8 text-slate-700" />
              )
            ) : (
              <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-center p-1">
                <span className="text-base">👻</span>
                <span className="text-[7px] text-amber-400 font-bold tracking-tighter">OFFICIAL</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Toolbar Below Card */}
      {!compact && (
        <div className="flex flex-col gap-2 mt-4 w-full max-w-sm sm:max-w-md">
          {/* Real Story Sharing Button (Web Share API + 9:16 HD) */}
          <button
            type="button"
            onClick={() => setIsStoryModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-950/50 border border-purple-400/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] group"
          >
            <Smartphone className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
            <span>แชร์ไปสตอรี่ (Story 9:16)</span>
            <span className="text-[10px] bg-black/40 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              IG • FB • TikTok
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 shadow-md transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>
                {isDownloading
                  ? 'กำลังสร้าง...'
                  : cardRatio === 'story916'
                  ? 'ดาวน์โหลด 9:16 HD'
                  : 'ดาวน์โหลดการ์ด'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDisplayMode('social');
                if (onShare) onShare();
                else {
                  navigator.clipboard?.writeText(
                    `ฉันได้การ์ด "${species.name}" (ระดับ ${card.rarity} - LV.${card.level}) ในงาน FSS Halloween Fancy Run 2026! มาค้นหาผีของคุณกัน: ${window.location.origin}`
                  );
                  alert('คัดลอกข้อความแชร์พร้อมลิงก์เรียบร้อยแล้ว!');
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 shadow-md transition-all"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>แชร์ข้อความ/ลิงก์</span>
            </button>
          </div>
        </div>
      )}

      {/* Story 9:16 Share & Download Modal */}
      <GhostStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        card={card}
        artMode={artMode}
      />
    </div>
  );
};
