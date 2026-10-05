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
  Navigation,
  ExternalLink,
  MapPin,
  Maximize2,
  Download,
  RotateCcw,
} from 'lucide-react';
import officialRouteMapAsset from '../assets/official_route_map.svg';
import { useEventContext } from '../context/EventContext';
import { compressImage } from '../lib/imageCompressor';
import { AdminLoginModal } from './AdminLoginModal';

interface Props {
  className?: string;
  allowUpload?: boolean;
}

export const OfficialRouteMapImage: React.FC<Props> = ({
  className = '',
  allowUpload = true,
}) => {
  const { customMapImage, setCustomMapImage, adminUser } = useEventContext();
  const isAdmin = !!adminUser;

  // View mode
  const [viewMode, setViewMode] = useState<'custom' | 'original'>('custom');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync viewMode if custom image changes from Firestore
  useEffect(() => {
    if (customMapImage) {
      setViewMode('custom');
      setImageLoadError(false);
    }
  }, [customMapImage]);

  // Determine active image source
  const activeImageSrc =
    viewMode === 'custom' && customMapImage && !imageLoadError
      ? customMapImage
      : officialRouteMapAsset;

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

      // Compress and optimize down to max 1920x1440px ~200KB for crystal-clear map text
      const compressedDataUrl = await compressImage(file, 1920, 1440, 0.86);

      // Save to EventContext (syncs to Cloud Firestore in realtime for all devices)
      await setCustomMapImage(compressedDataUrl);

      setViewMode('custom');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      console.error('Route map upload processing failed:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageError = () => {
    console.warn('Custom map image failed to render, falling back to official SVG asset');
    setImageLoadError(true);
    setErrorMessage('ไม่สามารถแสดงผลรูปภาพแผนที่ที่อัปโหลดได้ ระบบได้แสดงภาพแผนที่แบบทางการแทนแล้ว');
  };

  const handleResetToDefault = async () => {
    if (!isAdmin) {
      setIsAdminModalOpen(true);
      return;
    }
    if (window.confirm('คุณต้องการรีเซ็ตรูปแผนที่กลับเป็นค่าเริ่มต้นทางการหรือไม่?')) {
      setIsProcessing(true);
      setErrorMessage(null);
      try {
        await setCustomMapImage(null);
        setViewMode('original');
        setImageLoadError(false);
      } catch (err: any) {
        console.error('Map reset failed:', err);
        setErrorMessage(err?.message || 'ไม่สามารถรีเซ็ตเป็นแผนที่เดิมได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Route Header Info Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide uppercase mb-1.5">
            <Navigation className="w-3.5 h-3.5 text-red-600" />
            <span>NARESUAN UNIVERSITY OFFICIAL 5.0 KM ROUTE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>แผนที่เส้นทางการวิ่งทางการ 5.0 KM</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ปล่อยตัวและเข้าเส้นชัย ณ คณะสังคมศาสตร์ ผ่านสนามกีฬากลาง • คณะวิทยาศาสตร์ • สระน้ำ • ประตู 4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://maps.google.com/?q=16.7431,100.1925"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>พิกัด ม.นเรศวร (Google Maps)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Map Card Frame */}
      <div
        className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 border transition-all shadow-xl group ${
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
            <span className="text-xs font-bold font-mono">กำลังประมวลผลและบันทึกรูปแผนที่ขึ้น Cloud...</span>
          </div>
        )}

        {/* Display Image Container */}
        <div className="w-full flex items-center justify-center p-2 min-h-[320px] sm:min-h-[460px] lg:min-h-[520px] bg-gradient-to-b from-slate-900/60 to-slate-950 cursor-pointer"
             onClick={() => setIsZoomed(true)}
             title="คลิกเพื่อขยายดูภาพแผนที่ขนาดใหญ่">
          <img
            src={activeImageSrc}
            alt="FSS Halloween Fancy Run 2026 Official Route Map"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-auto max-h-[580px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-950/85 border border-red-500/40 text-[11px] font-mono font-bold text-red-400 backdrop-blur-sm flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> OFFICIAL ROUTE MAP
          </span>

          {isAdmin && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-bold text-red-300 backdrop-blur-sm flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" /> แอดมิน: {adminUser?.displayName || adminUser?.username || 'phasharak'}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] font-bold text-slate-300 backdrop-blur-sm shadow-md">
            ระยะทาง 5.0 KM
          </span>
        </div>

        {/* Bottom Action Controls Overlay */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-wrap items-center gap-2">
          {/* Zoom Lightbox Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="p-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="ดูภาพแผนที่ขนาดใหญ่"
          >
            <ZoomIn className="w-3.5 h-3.5 text-red-400" />
            <span>ขยายดูแผนที่</span>
          </button>

          {/* Admin Upload Trigger (Only accessible by admin) */}
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
                title="เปลี่ยนรูปภาพแผนที่ใหม่ (สำหรับแอดมิน)"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>บันทึกรูปแผนที่แล้ว!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>เปลี่ยนรูปภาพใหม่</span>
                  </>
                )}
              </button>

              {customMapImage && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="p-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 backdrop-blur-sm transition-all shadow-md text-xs font-medium cursor-pointer"
                  title="คืนค่ารูปภาพแผนที่ตั้งต้น"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Success Feedback Banner */}
      {uploadSuccess && (
        <div className="mt-3 w-full p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>บันทึกรูปภาพแผนที่ขึ้นระบบ Cloud สำเร็จ! ผู้ชมทุกเครื่องจะเห็นรูปภาพนี้แบบ Realtime ทันที</span>
        </div>
      )}

      {/* Error Message Feedback */}
      {errorMessage && (
        <div className="mt-3 w-full p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-red-500/20 rounded text-red-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Key Route Landmarks Grid (Clean and fast loading) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 font-mono font-black text-xs">
            0K
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">คณะสังคมศาสตร์</p>
            <p className="text-[11px] text-slate-500 mt-0.5">จุดปล่อยตัว &amp; เส้นชัย 5.0 KM</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-mono font-black text-xs">
            0.6K
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">สนามกีฬากลาง</p>
            <p className="text-[11px] text-slate-500 mt-0.5">วิ่งผ่านเลียบสนามกีฬา</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-mono font-black text-xs">
            2.3K
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">คณะวิทยาศาสตร์</p>
            <p className="text-[11px] text-slate-500 mt-0.5">จุดเลี้ยวโค้ง &amp; จุดให้น้ำ 1</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-mono font-black text-xs">
            4.3K
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">ประตู 4 ม.นเรศวร</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ทางตรงเร่งสปีดเข้าเส้นชัย</p>
          </div>
        </div>
      </div>

      {/* Zoom / Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
          onClick={() => setIsZoomed(false)}
        >
          {/* Top Bar inside modal */}
          <div
            className="w-full max-w-5xl flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-red-600/20 text-red-400">
                <Navigation className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  แผนที่เส้นทางวิ่ง FSS Halloween Fancy Run 2026 (5.0 KM)
                </h4>
                <p className="text-[11px] text-slate-400">
                  {customMapImage && viewMode === 'custom' && !imageLoadError
                    ? 'รูปภาพแผนที่จริงของงานที่บันทึกบน Cloud'
                    : 'ภาพแบบแผนที่ทางการ 100%'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeImageSrc}
                download="FSS_Halloween_Fancy_Run_2026_RouteMap.jpg"
                className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ดาวน์โหลดภาพแผนที่"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">ดาวน์โหลดภาพ</span>
              </a>

              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Image */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center overflow-auto rounded-2xl bg-slate-900/60 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImageSrc}
              alt="FSS Halloween Fancy Run 2026 Official Route Map Zoomed"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Admin Login Modal for Upload Permission */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdminModalOpen(false);
          // Automatically open file picker after successful login
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 300);
        }}
      />
    </div>
  );
};
