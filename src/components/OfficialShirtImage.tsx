import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  ZoomIn,
  X,
  RefreshCw,
  Sparkles,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Link as LinkIcon,
  Eye,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import officialShirtAsset from '../assets/official_shirt.svg';
import { useEventContext } from '../context/EventContext';
import { compressImage } from '../lib/imageCompressor';
import { AdminLoginModal } from './AdminLoginModal';

interface Props {
  className?: string;
  allowUpload?: boolean;
}

export const OfficialShirtImage: React.FC<Props> = ({
  className = '',
  allowUpload = true,
}) => {
  const { customShirtImage, setCustomShirtImage, adminUser } = useEventContext();
  const isAdmin = !!adminUser;

  // Mode: 'custom' (if exists) or 'original'
  const [viewMode, setViewMode] = useState<'custom' | 'original'>('custom');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync viewMode if custom image changes
  useEffect(() => {
    if (customShirtImage) {
      setViewMode('custom');
      setImageLoadError(false);
    }
  }, [customShirtImage]);

  // Determine which image source to display
  const activeImageSrc =
    viewMode === 'custom' && customShirtImage && !imageLoadError
      ? customShirtImage
      : officialShirtAsset;

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setImageLoadError(false);

    try {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|svg|gif|avif|bmp|heic)$/i)) {
        throw new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, JPEG, WebP, SVG, AVIF)');
      }

      // Check file size (max 25MB before compression)
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('ขนาดไฟล์ใหญ่เกิน 25MB กรุณาเลือกภาพที่มีขนาดเล็กลง');
      }

      // Compress and optimize down to max 1200x1200px ~120KB
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.88);

      // Save to EventContext (which syncs to localStorage and Firestore)
      await setCustomShirtImage(compressedDataUrl);

      setViewMode('custom');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      console.error('Shirt upload processing failed:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setImageLoadError(false);

    try {
      // Test loading URL in memory
      await new Promise((resolve, reject) => {
        const testImg = new Image();
        testImg.onload = () => resolve(true);
        testImg.onerror = () => reject(new Error('ไม่สามารถโหลดภาพจาก URL ที่ระบุได้ กรุณาตรวจสอบลิงก์อีกครั้ง'));
        testImg.src = trimmed;
      });

      // Save valid URL
      await setCustomShirtImage(trimmed);
      setViewMode('custom');
      setShowUrlInput(false);
      setUrlInput('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'ลิงก์รูปภาพไม่ถูกต้อง');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetImage = async () => {
    if (!isAdmin) {
      setErrorMessage('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถรีเซ็ตรูปเสื้อได้');
      setIsAdminModalOpen(true);
      return;
    }

    if (confirm('คุณต้องการรีเซ็ตกลับเป็นรูปเสื้อดีไซน์ต้นฉบับใช่หรือไม่?')) {
      try {
        await setCustomShirtImage(null);
        setViewMode('original');
        setImageLoadError(false);
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรูปเสื้อ');
      }
    }
  };

  const handleImageError = () => {
    console.warn('Custom shirt image failed to render, falling back to official asset');
    setImageLoadError(true);
    setErrorMessage('ไม่สามารถแสดงผลรูปภาพที่อัปโหลดได้ (ไฟล์อาจเสียหาย) ระบบได้แสดงภาพต้นฉบับแทนแล้ว');
  };

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Real Image Container Frame */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 border transition-all shadow-2xl group ${
          isDragging ? 'border-amber-400 ring-4 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
        }`}
        onDragOver={(e) => {
          if (!allowUpload || !isAdmin) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isAdmin) {
            setErrorMessage('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนรูปเสื้อทางการได้');
            setIsAdminModalOpen(true);
            return;
          }
          if (!allowUpload) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleProcessFile(file);
        }}
      >
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">กำลังประมวลผลและบันทึกรูปภาพเสื้อ...</span>
          </div>
        )}

        {/* Display Image */}
        <div className="w-full flex items-center justify-center p-2 min-h-[300px] sm:min-h-[380px] bg-gradient-to-b from-slate-900/50 to-slate-950">
          <img
            src={activeImageSrc}
            alt="FSS Halloween Fancy Run 2026 Official Jersey"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-auto max-h-[480px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
          {customShirtImage && viewMode === 'custom' && !imageLoadError ? (
            <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[11px] font-bold text-emerald-300 backdrop-blur-sm flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-emerald-400" /> รูปเสื้อจริงที่อัปโหลด
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-slate-950/85 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-400 backdrop-blur-sm flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" /> OFFICIAL 2D DESIGN
            </span>
          )}

          {isAdmin && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300 backdrop-blur-sm flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> แอดมิน: {adminUser?.displayName || adminUser?.username || 'phasharak'}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/50 text-[11px] font-bold text-red-200 backdrop-blur-sm shadow-md">
            ฿300 บาท
          </span>
        </div>

        {/* View Switcher Pill (if custom image exists) */}
        {customShirtImage && !imageLoadError && (
          <div className="absolute top-3 right-3 z-10 flex items-center rounded-xl bg-slate-950/90 border border-slate-800 p-1 backdrop-blur-sm shadow-lg text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode('custom')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รูปที่อัปโหลด
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'original'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รูปต้นฉบับ
            </button>
          </div>
        )}

        {/* Bottom Action Controls Overlay */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-wrap items-center gap-2">
          {/* Zoom Lightbox Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="p-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold"
            title="ดูภาพขนาดใหญ่"
          >
            <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ขยายดูภาพ</span>
          </button>

          {/* Upload and Control Buttons */}
          {allowUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.avif,.heic"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                }}
              />

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="p-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border border-amber-500/30 backdrop-blur-sm transition-all shadow-lg flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                title="อัปโหลดภาพเสื้อจริง"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>บันทึกรูปเสื้อแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{customShirtImage ? 'เปลี่ยนรูปเสื้อ' : 'อัปโหลดรูปเสื้อจริง'}</span>
                  </>
                )}
              </button>

              {/* Link URL Button */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 backdrop-blur-sm transition-all shadow-md text-xs"
                title="ใส่ลิงก์รูปภาพเสื้อ (Image URL)"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              {/* Reset Button */}
              {customShirtImage && (
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 backdrop-blur-sm transition-all shadow-md text-xs"
                  title="รีเซ็ตเป็นภาพตั้งต้น 2D"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* URL Input Bar (Collapsible) */}
      {showUrlInput && allowUpload && (
        <form
          onSubmit={handleUrlSubmit}
          className="mt-3 w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl flex items-center gap-2 animate-fadeIn"
        >
          <LinkIcon className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="วางลิงก์รูปภาพเสื้อ เช่น https://example.com/shirt.jpg"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isProcessing || !urlInput.trim()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition-colors disabled:opacity-50"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Error Message Notice */}
      {errorMessage && (
        <div className="mt-2.5 w-full p-3 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-900/50 rounded-lg text-rose-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Caption & Specs */}
      <div className="mt-3 w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <span>ผ้าระบายอากาศ Micro Dry-Tech 100% ลาย 12 ผีไทยเรืองแสง Glow in the dark</span>
        <span className="text-amber-400 font-medium">
          {customShirtImage && viewMode === 'custom' ? (
            <span className="text-emerald-400 font-bold">✓ กำลังแสดงภาพเสื้อจริง (สามารถกดปุ่มเพื่อเปลี่ยนหรืออัปโหลดใหม่ได้)</span>
          ) : (
            'กดปุ่ม "อัปโหลดรูปเสื้อจริง" หรือคลิกลิงก์เพื่อเปลี่ยนภาพได้ทันที'
          )}
        </span>
      </div>

      {/* Zoom / Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {customShirtImage && viewMode === 'custom'
                    ? 'รูปเสื้อจริงของงาน (Official Jersey Photo)'
                    : 'ภาพแบบเสื้อวิ่ง FSS Halloween Fancy Run 2026 (Official 2D Jersey)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-slate-950 p-2">
              <img
                src={activeImageSrc}
                alt="FSS Official Jersey Full View"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร • ราคา 300 บาท (รับที่การจัดงานเท่านั้น)
              </span>
              <div className="flex items-center gap-2">
                {customShirtImage && (
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'custom' ? 'original' : 'custom')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{viewMode === 'custom' ? 'สลับดูภาพแบบ 2D ต้นฉบับ' : 'สลับดูรูปจริง'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal trigger if non-admin clicks to manage */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdminModalOpen(false);
          setErrorMessage(null);
        }}
      />
    </div>
  );
};
