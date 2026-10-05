import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  ZoomIn,
  X,
  Sparkles,
  Check,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Lock,
  ShieldCheck,
  RotateCcw,
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
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }

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

  const handleImageError = () => {
    console.warn('Custom shirt image failed to render, falling back to official asset');
    setImageLoadError(true);
    setErrorMessage('ไม่สามารถแสดงผลรูปภาพที่อัปโหลดได้ ระบบได้แสดงภาพแบบเสื้อแทนแล้ว');
  };

  const handleResetToDefault = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await setCustomShirtImage(null);
      setViewMode('original');
      setImageLoadError(false);
    } catch (err: any) {
      console.error('Shirt reset failed:', err);
      setErrorMessage(err?.message || 'ไม่สามารถรีเซ็ตเป็นภาพแบบเสื้อเดิมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Real Image Container Frame */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 border transition-all shadow-2xl group ${
          isDragging ? 'border-red-500 ring-4 ring-red-500/20' : 'border-slate-800 hover:border-slate-700'
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
          if (!allowUpload || !isAdmin) {
            setIsAdminModalOpen(true);
            return;
          }
          const file = e.dataTransfer.files?.[0];
          if (file) handleProcessFile(file);
        }}
      >
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-red-400">
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
          <span className="px-3 py-1 rounded-full bg-slate-950/85 border border-red-500/40 text-[11px] font-mono font-bold text-red-400 backdrop-blur-sm flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> OFFICIAL SHIRT
          </span>

          {isAdmin && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-bold text-red-300 backdrop-blur-sm flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" /> แอดมิน: {adminUser?.displayName || adminUser?.username || 'phasharak'}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/50 text-[11px] font-bold text-red-200 backdrop-blur-sm shadow-md">
            ฿300 บาท
          </span>
        </div>

        {/* Bottom Action Controls Overlay */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-wrap items-center gap-2">
          {/* Zoom Lightbox Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="p-2 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="ดูภาพขนาดใหญ่"
          >
            <ZoomIn className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">ขยายดูภาพ</span>
          </button>

          {/* Admin Upload Trigger (Only visible to admin) */}
          {allowUpload && isAdmin && (
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="p-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white border border-red-500/40 backdrop-blur-sm transition-all shadow-lg flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer"
                title="เปลี่ยนรูปภาพใหม่ (สำหรับแอดมิน)"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>บันทึกรูปเสื้อแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>เปลี่ยนรูปภาพใหม่</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Toolbar Below Image (Only visible to admin) */}
      {allowUpload && isAdmin && (
        <div className="mt-3 w-full flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadSuccess ? 'บันทึกเรียบร้อย!' : 'เปลี่ยนรูปภาพใหม่ (Admin)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
              <span>ขยายดูรูปเต็ม</span>
            </button>
            {customShirtImage && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="คืนค่ารูปภาพตั้งต้น"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">รีเซ็ต</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message Notice */}
      {errorMessage && (
        <div className="mt-2.5 w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                <ImageIcon className="w-5 h-5 text-red-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {customShirtImage && viewMode === 'custom'
                    ? 'รูปเสื้อจริงของงาน (Official Jersey Photo)'
                    : 'ภาพแบบเสื้อวิ่ง FSS Halloween Fancy Run 2026 (Official Jersey)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
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
                คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร • ราคา 300 บาท
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
