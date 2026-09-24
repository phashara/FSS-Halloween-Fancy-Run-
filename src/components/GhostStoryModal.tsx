import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Smartphone,
  Loader2,
  AlertCircle,
  Instagram,
} from 'lucide-react';
import { GhostCard } from '../types';
import { THAI_GHOSTS } from '../data/ghosts';
import {
  generateGhostStoryCanvas,
  shareToStoryDirectly,
} from '../utils/storyCanvasGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  card: GhostCard;
  artMode?: 'realistic' | 'talisman';
}

export const GhostStoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  card,
  artMode = 'realistic',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const species = THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.krasue;
  const ghostHeadline =
    species.name.startsWith('ผี') || species.name.startsWith('นาง')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`;

  const storyCaption = `🎃 ${ghostHeadline} (ระดับ ${card.rarity} - LV.${card.level})\nในงาน FSS Halloween Fancy Run 2026!\n31 ต.ค. 2569 ณ มหาวิทยาลัยนเรศวร • ค้นหาผีประจำตัวคุณได้ที่ ${window.location.origin}\n#FSSGhostRun2026 #FSSHalloween2026`;

  // Generate 9:16 Story Preview on open
  useEffect(() => {
    if (!isOpen) {
      setPreviewDataUrl(null);
      setStatusMessage(null);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    generateGhostStoryCanvas(card, { artMode, isSocialMode: true })
      .then((canvas) => {
        if (isMounted) {
          setPreviewDataUrl(canvas.toDataURL('image/png'));
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate story preview:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, card, artMode]);

  if (!isOpen) return null;

  const handleShareStory = async () => {
    setIsSharing(true);
    setStatusMessage(null);
    try {
      const res = await shareToStoryDirectly(card, { artMode, isSocialMode: true });
      if (res.success) {
        if (res.method === 'web-share') {
          setStatusMessage({
            type: 'success',
            text: 'เปิดแผงแชร์เรียบร้อยแล้ว! หากใช้มือถือ เลือก Instagram Stories หรือ Facebook Stories ได้เลย',
          });
        } else {
          setStatusMessage({
            type: 'success',
            text: res.message || 'บันทึกรูปขนาด 9:16 ลงเครื่องและคัดลอกข้อความแล้ว พร้อมนำไปโพสต์ลงสตอรี่!',
          });
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'info',
        text: 'กำลังดาวน์โหลดรูปภาพ 9:16 สำรองให้คุณแทน...',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadDirect = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateGhostStoryCanvas(card, { artMode, isSocialMode: true });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `FSS-Story-9x16-${card.cardId}-${species.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatusMessage({
        type: 'success',
        text: 'ดาวน์โหลดรูปขนาด 9:16 (1080×1920 HD) สำเร็จแล้ว!',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(storyCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/', '_blank');
  };

  const openFacebook = () => {
    window.open('https://www.facebook.com/', '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 font-serif">
                <span>แชร์การ์ดผีลงสตอรี่ (Story 9:16)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold border border-purple-500/30">
                  9:16 HD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                สัดส่วน 9:16 พอดีหน้าจอโทรศัพท์ สำหรับ Instagram, Facebook & TikTok Stories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status alert banner */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="p-1 hover:bg-emerald-900/50 rounded-lg text-emerald-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content: 9:16 Story Preview & Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: 9:16 Phone Mockup Preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[270px] sm:max-w-[290px] aspect-[9/16] rounded-[32px] overflow-hidden bg-slate-950 border-4 border-slate-700 shadow-2xl shadow-purple-950/50 flex items-center justify-center">
              {/* Simulated Story Top UI (Bars & Header) */}
              <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                {/* Story progress bars */}
                <div className="flex gap-1 mb-2">
                  <div className="h-0.5 flex-1 bg-white rounded-full opacity-95" />
                  <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
                </div>
                {/* Profile header */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[10px]">
                      👻
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-none">FSS Ghost Run</p>
                      <p className="text-[9px] text-slate-300 leading-none mt-0.5">31 Oct 2026</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">
                    9:16
                  </span>
                </div>
              </div>

              {/* Story Image / Loading */}
              {isGenerating || !previewDataUrl ? (
                <div className="flex flex-col items-center justify-center gap-3 text-amber-400 p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-bold font-mono">กำลังประมวลผลการ์ด 9:16 HD...</span>
                </div>
              ) : (
                <img
                  src={previewDataUrl}
                  alt="Ghost Card 9:16 Story Preview"
                  className="w-full h-full object-contain select-none"
                />
              )}

              {/* Bottom sticker watermark hint */}
              <div className="absolute bottom-2.5 inset-x-3 z-20 py-1 px-2.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-center pointer-events-none">
                <span className="text-[10px] text-white/90 font-medium">
                  ✨ ขนาดพอดีหน้าจอสตอรี่ 100%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              สัดส่วนจริง 1080 × 1920 พิกเซล (พร้อมแถบปลอดภัยบน-ล่าง)
            </p>
          </div>

          {/* Right Column: Share Actions & Story Tips */}
          <div className="md:col-span-6 space-y-4">
            {/* Primary Action: Share to Story */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">แชร์ไปยังโซเชียลมีเดีย</h3>
              </div>
              <p className="text-xs text-slate-300">
                กดปุ่มด้านล่างเพื่อเปิดระบบแชร์ของโทรศัพท์ และเลือกส่งต่อไปยัง <b>Instagram Stories</b>, <b>Facebook Stories</b>, <b>Line</b> หรือ <b>TikTok</b> ได้ทันที
              </p>

              <button
                type="button"
                onClick={handleShareStory}
                disabled={isSharing || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังเปิดระบบแชร์...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>แชร์ไปสตอรี่ทันที (Share to Story)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadDirect}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>บันทึกรูป 9:16 HD</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>คัดลอกแคปชัน</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Open App Links */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                เปิดแอปเพื่อลงสตอรี่
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openInstagram}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 border border-pink-500/40 text-pink-200 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>เปิด Instagram</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={openFacebook}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>เปิด Facebook</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Practical Mobile Story Tips */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>คำแนะนำการแชร์บนอุปกรณ์:</span>
              </div>
              <p>
                • <b>บนมือถือ (iOS / Android):</b> กดปุ่มแชร์แล้วเลือก <i>Instagram Stories</i> หรือ <i>Facebook Stories</i> ภาพขนาด 9:16 จะถูกส่งเข้าไปยังหน้าสร้างสตอรี่ทันที
              </p>
              <p>
                • <b>บนคอมพิวเตอร์:</b> กดปุ่ม <i>บันทึกรูป 9:16 HD</i> เพื่อดาวน์โหลดไฟล์เข้าเครื่อง จากนั้นเปิด Instagram / Facebook เว็บไซต์เพื่อโพสต์สตอรี่ได้ทันที
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
