import React, { useState, useRef, useEffect } from 'react';
import { Upload, ZoomIn, X, RefreshCw, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import officialShirtAsset from '../assets/official_shirt.svg';

interface Props {
  className?: string;
  allowUpload?: boolean;
}

const STORAGE_KEY = 'fss_custom_shirt_image';

export const OfficialShirtImage: React.FC<Props> = ({
  className = '',
  allowUpload = true,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || officialShirtAsset;
    } catch {
      return officialShirtAsset;
    }
  });

  const [isZoomed, setIsZoomed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageSrc(result);
        try {
          localStorage.setItem(STORAGE_KEY, result);
        } catch {
          console.warn('Storage quota exceeded for custom shirt image');
        }
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setImageSrc(officialShirtAsset);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* 2D Real Image Frame */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-800 shadow-xl group">
        <img
          src={imageSrc}
          alt="FSS Halloween Fancy Run 2026 Official Jersey"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[460px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Action Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* Zoom Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold"
            title="ดูภาพขนาดใหญ่"
          >
            <ZoomIn className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">ขยายภาพ</span>
          </button>

          {/* Upload Button */}
          {allowUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border border-amber-500/30 backdrop-blur-sm transition-all shadow-lg flex items-center gap-1.5 text-xs font-bold"
                title="อัปโหลดภาพเสื้อจริงจากเครื่องของคุณ"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>อัปเดตรูปแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>ใส่รูปเสื้อของคุณ</span>
                  </>
                )}
              </button>

              {imageSrc !== officialShirtAsset && (
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 backdrop-blur-sm transition-all shadow-md text-xs"
                  title="รีเซ็ตเป็นภาพตั้งต้น"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-950/85 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-400 backdrop-blur-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> OFFICIAL 2D JERSEY
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-[11px] font-bold text-red-200 backdrop-blur-sm">
            ฿300 บาท
          </span>
        </div>
      </div>

      {/* Caption & Specs */}
      <div className="mt-3 w-full flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <span>ผ้าระบายอากาศ Micro Dry-Tech 100% สกรีนลายเรืองแสง</span>
        <span className="text-amber-400 font-medium">ด้านหน้า (อกซ้ายยันต์ FSS) / ด้านหลัง (ลาย 2026)</span>
      </div>

      {/* Zoom / Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
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
                  ภาพเสื้อวิ่งที่ระลึก FSS Halloween Fancy Run 2026 (Official Jersey)
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
                src={imageSrc}
                alt="FSS Official Jersey Full View"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>ภาพดีไซน์ลิขสิทธิ์แท้ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร • ราคา 300 บาท</span>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
