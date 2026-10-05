import React, { useState, useRef } from 'react';
import { useEventContext } from '../context/EventContext';
import { GhostSpecies, GhostSpeciesId } from '../types';
import { GhostAvatarSvg } from '../components/GhostAvatarSvg';
import { RealisticGhostPortrait, REALISTIC_GHOST_ASSETS } from '../components/RealisticGhostPortrait';
import { AdminLoginModal } from '../components/AdminLoginModal';
import { compressImage } from '../lib/imageCompressor';
import {
  Sparkles,
  Edit3,
  RotateCcw,
  Save,
  X,
  CreditCard,
  Shield,
  Zap,
  Activity,
  CheckCircle2,
  Info,
  ChevronRight,
  Search,
  Upload,
  ZoomIn,
  Download,
  Loader2,
  Lock,
  Flame,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { AppView } from '../components/Navbar';

interface Props {
  onNavigate: (view: AppView) => void;
}

export const GhostCollectionView: React.FC<Props> = ({ onNavigate }) => {
  const {
    ghostSpeciesList,
    updateGhostSpecies,
    resetGhostSpecies,
    adminUser,
    cards,
    setCurrentCardId,
  } = useEventContext();

  const [selectedGhostId, setSelectedGhostId] = useState<GhostSpeciesId>(
    ghostSpeciesList[0]?.id || 'pret'
  );
  const [editingGhost, setEditingGhost] = useState<GhostSpecies | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterElement, setFilterElement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image Uploading State
  const [uploadingGhostId, setUploadingGhostId] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingUploadGhostId, setPendingUploadGhostId] = useState<string | null>(null);
  
  // Lightbox Zoom Modal
  const [zoomedImage, setZoomedImage] = useState<{ src: string; name: string; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeGhostForUpload = useRef<GhostSpecies | null>(null);

  const selectedGhost =
    ghostSpeciesList.find((g) => g.id === selectedGhostId) || ghostSpeciesList[0];

  const elements = Array.from(new Set(ghostSpeciesList.map((g) => g.element)));

  const filteredGhosts = ghostSpeciesList.filter((g) => {
    if (filterElement !== 'all' && g.element !== filterElement) return false;
    if (
      searchQuery.trim() &&
      !g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const customImageCount = ghostSpeciesList.filter((g) => !!g.customImageUrl).length;

  const handleTriggerUpload = (ghost: GhostSpecies) => {
    if (!adminUser) {
      setPendingUploadGhostId(ghost.id);
      setIsAdminModalOpen(true);
      return;
    }
    activeGhostForUpload.current = ghost;
    fileInputRef.current?.click();
  };

  const handleProcessImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const ghost = activeGhostForUpload.current;
    if (!file || !ghost) return;

    setUploadingGhostId(ghost.id);
    setErrorMessage(null);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)');
      }
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('ขนาดไฟล์ใหญ่เกิน 25MB กรุณาเลือกภาพที่มีขนาดเล็กลง');
      }

      // Compress and optimize down to crisp 1200x1600 portrait resolution (~150KB)
      const compressedDataUrl = await compressImage(file, 1200, 1600, 0.88);

      const updated: GhostSpecies = {
        ...ghost,
        customImageUrl: compressedDataUrl,
      };

      await updateGhostSpecies(updated);
      setSaveSuccessNotice(`อัปโหลดรูปภาพใหม่สำหรับ "${ghost.name}" สำเร็จ! ข้อมูลซิงค์ขึ้น Cloud เรียบร้อย`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Ghost image upload failed:', err);
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
    } finally {
      setUploadingGhostId(null);
      activeGhostForUpload.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetImage = async (ghost: GhostSpecies) => {
    if (!adminUser) {
      setIsAdminModalOpen(true);
      return;
    }
    if (window.confirm(`คุณต้องการลบรูปภาพของ "${ghost.name}" และคืนค่ารูปภาพดั้งเดิมใช่หรือไม่?`)) {
      const updated: GhostSpecies = {
        ...ghost,
        customImageUrl: undefined,
      };
      await updateGhostSpecies(updated);
      setSaveSuccessNotice(`คืนค่ารูปภาพตั้งต้นของ "${ghost.name}" แล้ว`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    }
  };

  const handleStartEdit = (ghost: GhostSpecies) => {
    setEditingGhost(JSON.parse(JSON.stringify(ghost)));
  };

  const handleCancelEdit = () => {
    setEditingGhost(null);
  };

  const handleSaveEdit = async () => {
    if (!editingGhost) return;
    await updateGhostSpecies(editingGhost);
    setSaveSuccessNotice(`บันทึกข้อมูล "${editingGhost.name}" สำเร็จเรียบร้อย!`);
    setEditingGhost(null);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleResetAllGhost = async (id: GhostSpeciesId) => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลผีตนนี้กลับสู่ค่าดั้งเดิมใช่หรือไม่?')) {
      await resetGhostSpecies(id);
      setSaveSuccessNotice('รีเซ็ตกลับเป็นค่าเริ่มต้นแล้ว');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    }
  };

  const handleOpenMyCard = (speciesId: GhostSpeciesId) => {
    const targetCard = cards.find((c) => c.speciesId === speciesId);
    if (targetCard) {
      setCurrentCardId(targetCard.cardId);
    }
    onNavigate('mycard');
  };

  return (
    <div className="space-y-8 select-none">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleProcessImageFile}
      />

      {/* Header Banner - Clean 2D Fastwork Style */}
      <div className="rounded-3xl p-6 sm:p-10 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>12 THAI GHOST COLLECTION</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            คลังการ์ด 12 ผีไทยในงานวิ่ง
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            เปิดตำนาน 12 วิญญาณไทยประจำงานวิ่ง FSS 2026 เรียงตามลำดับทางการ พร้อมระบบอัปโหลดรูปภาพการ์ดจริง บันทึกและซิงค์ขึ้น Cloud ให้ทุกคนเปิดดูได้จากทุกที่
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              มีรูปภาพจริงแล้ว: <b className="text-emerald-600">{customImageCount}</b> / 12 ตน
            </span>
            {adminUser ? (
              <span className="px-3 py-1 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-600" /> โหมดแอดมิน: สามารถคลิกอัปโหลดรูปการ์ดได้ทันที
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3 text-slate-500" /> เข้าสู่ระบบแอดมินเพื่ออัปโหลดรูป
              </button>
            )}
          </div>

          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2 mt-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#00B67A] shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 rounded text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผี หรือฉายา..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips by Element */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterElement('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            filterElement === 'all'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          ทั้งหมด (12 ผีไทย)
        </button>
        {elements.map((el) => (
          <button
            key={el}
            type="button"
            onClick={() => setFilterElement(el)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterElement === el
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {el}
          </button>
        ))}
      </div>

      {/* Main Grid of 12 Thai Ghosts (Clean 2D Modern Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGhosts.map((ghost, index) => {
          const isSelected = selectedGhost?.id === ghost.id;
          const isUploadingThis = uploadingGhostId === ghost.id;
          const activeImage = ghost.customImageUrl || REALISTIC_GHOST_ASSETS[ghost.id]?.photoUrl;

          return (
            <div
              key={ghost.id}
              onClick={() => setSelectedGhostId(ghost.id)}
              className={`fastwork-card p-5 cursor-pointer flex flex-col justify-between transition-all rounded-3xl border bg-white ${
                isSelected
                  ? 'ring-2 ring-[#DC2626] border-[#DC2626] shadow-lg bg-red-50/10'
                  : 'border-slate-200 hover:border-red-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Badge: Number & Element */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      #{index + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {ghost.element}
                    </span>
                  </div>

                  {ghost.customImageUrl ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> รูปภาพจริง
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      #{ghost.id}
                    </span>
                  )}
                </div>

                {/* 2D Clean Image Frame */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group/img mb-3.5">
                  {/* Loading Spinner during upload */}
                  {isUploadingThis && (
                    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-red-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">กำลังอัปโหลด...</span>
                    </div>
                  )}

                  {/* Ghost Image Artwork */}
                  <img
                    src={activeImage}
                    alt={ghost.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />

                  {/* Gradient bottom shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Zoom button on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImage({
                        src: activeImage,
                        name: ghost.name,
                        title: ghost.title,
                      });
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all shadow-md text-xs cursor-pointer opacity-90 hover:opacity-100"
                    title="ขยายดูภาพการ์ดขนาดใหญ่"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  {/* Tagline overlay on bottom of image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                    <p className="text-[11px] text-white/90 line-clamp-1 font-medium drop-shadow-md">
                      {ghost.title}
                    </p>
                  </div>
                </div>

                {/* Ghost Name and Tagline */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#DC2626] transition-colors flex items-center justify-between">
                    <span>{ghost.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {ghost.tagline}
                  </p>
                </div>

                {/* Stats Bar Preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="text-slate-500 text-[11px]">ความเร็ว:</span>
                    <span className="text-[#DC2626] font-bold">{ghost.baseStats.speed}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="text-slate-500 text-[11px]">ความหลอน:</span>
                    <span className="text-purple-600 font-bold">{ghost.baseStats.spookiness}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {/* Upload Image Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerUpload(ghost);
                    }}
                    disabled={isUploadingThis}
                    className="flex-1 py-2 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    title="อัปโหลดรูปภาพการ์ดนี้"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{ghost.customImageUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}</span>
                  </button>

                  {/* Reset Image if custom exists */}
                  {ghost.customImageUrl && adminUser && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetImage(ghost);
                      }}
                      className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl text-xs transition-colors cursor-pointer"
                      title="คืนค่ารูปภาพตั้งต้น"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* View Details / MyCard Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGhostId(ghost.id);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
                    title="ดูรายละเอียดเพิ่มเติม"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Ghost Deep Lore & Details Section */}
      {selectedGhost && (
        <div className="rounded-3xl p-6 sm:p-10 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Visual Portrait Card */}
            <div className="w-full sm:w-80 lg:w-96 shrink-0 flex flex-col items-center">
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-950 group">
                <img
                  src={selectedGhost.customImageUrl || REALISTIC_GHOST_ASSETS[selectedGhost.id]?.photoUrl}
                  alt={selectedGhost.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                    {selectedGhost.customImageUrl ? 'รูปภาพจริงของงาน' : 'ภาพจำลองทางการ'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setZoomedImage({
                        src: selectedGhost.customImageUrl || REALISTIC_GHOST_ASSETS[selectedGhost.id]?.photoUrl,
                        name: selectedGhost.name,
                        title: selectedGhost.title,
                      })
                    }
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>ขยายภาพ</span>
                  </button>
                </div>
              </div>

              {/* Action buttons below portrait */}
              <div className="mt-4 flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleTriggerUpload(selectedGhost)}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{selectedGhost.customImageUrl ? 'เปลี่ยนรูปภาพใหม่' : 'อัปโหลดรูปภาพการ์ด'}</span>
                </button>

                {selectedGhost.customImageUrl && adminUser && (
                  <button
                    type="button"
                    onClick={() => handleResetImage(selectedGhost)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                    title="คืนค่าภาพตั้งต้น"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {adminUser && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedGhost)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                    title="แก้ไขข้อความ"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lore and Details */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold mb-2">
                  <Activity className="w-3.5 h-3.5" /> ธาตุ: {selectedGhost.element}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900">{selectedGhost.name}</h2>
                <p className="text-sm sm:text-base text-[#DC2626] font-semibold mt-1">{selectedGhost.title}</p>
                <p className="text-xs sm:text-sm text-slate-500 italic mt-1">&ldquo;{selectedGhost.tagline}&rdquo;</p>
              </div>

              {/* Stats Visual Progress Bars */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#DC2626]" /> สถิติค่าพลังประจำตัว
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 font-medium">
                      <span className="text-slate-600">ความเร็วในการวิ่ง (Speed)</span>
                      <span className="font-mono font-bold text-[#DC2626]">{selectedGhost.baseStats.speed} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-[#DC2626] rounded-full" style={{ width: `${selectedGhost.baseStats.speed}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 font-medium">
                      <span className="text-slate-600">ระดับความหลอน (Spookiness)</span>
                      <span className="font-mono font-bold text-purple-600">{selectedGhost.baseStats.spookiness} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${selectedGhost.baseStats.spookiness}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 font-medium">
                      <span className="text-slate-600">พลังแฝงลี้ลับ (Latent Power)</span>
                      <span className="font-mono font-bold text-amber-600">{selectedGhost.baseStats.latentPower} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedGhost.baseStats.latentPower}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 font-medium">
                      <span className="text-slate-600">ออร่าความเฮี้ยน (Haunting Aura)</span>
                      <span className="font-mono font-bold text-emerald-600">{selectedGhost.baseStats.hauntingAura} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedGhost.baseStats.hauntingAura}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Lore */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500" /> ลักษณะและทักษะพิเศษในสนามวิ่ง
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedGhost.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> ตำนานพื้นบ้านโบราณ (Thai Ghost Lore)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    {selectedGhost.lore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="w-full max-w-4xl flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {zoomedImage.name}
              </h4>
              <p className="text-xs text-slate-400">{zoomedImage.title}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={zoomedImage.src}
                download={`FSS_Ghost_${zoomedImage.name}.jpg`}
                className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">บันทึกรูปภาพ</span>
              </a>

              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative max-w-4xl max-h-[85vh] flex items-center justify-center overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.src}
              alt={zoomedImage.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingGhost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Edit3 className="w-5 h-5 text-red-600" />
                <span>แก้ไขข้อมูลผี: {editingGhost.name}</span>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อผีไทย</label>
                <input
                  type="text"
                  value={editingGhost.name}
                  onChange={(e) => setEditingGhost({ ...editingGhost, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ฉายาทางการ</label>
                <input
                  type="text"
                  value={editingGhost.title}
                  onChange={(e) => setEditingGhost({ ...editingGhost, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สโลแกน / แท็กไลน์</label>
                <input
                  type="text"
                  value={editingGhost.tagline}
                  onChange={(e) => setEditingGhost({ ...editingGhost, tagline: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ธาตุประจำวิญญาณ</label>
                <input
                  type="text"
                  value={editingGhost.element}
                  onChange={(e) => setEditingGhost({ ...editingGhost, element: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดทักษะในสนามวิ่ง</label>
                <textarea
                  rows={3}
                  value={editingGhost.description}
                  onChange={(e) => setEditingGhost({ ...editingGhost, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ตำนานพื้นบ้าน (Lore)</label>
                <textarea
                  rows={3}
                  value={editingGhost.lore}
                  onChange={(e) => setEditingGhost({ ...editingGhost, lore: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleResetAllGhost(editingGhost.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
              >
                คืนค่าดั้งเดิมทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal for Upload */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setPendingUploadGhostId(null);
        }}
        onSuccess={() => {
          setIsAdminModalOpen(false);
          if (pendingUploadGhostId) {
            const ghost = ghostSpeciesList.find((g) => g.id === pendingUploadGhostId);
            if (ghost) {
              activeGhostForUpload.current = ghost;
              setTimeout(() => {
                fileInputRef.current?.click();
              }, 300);
            }
            setPendingUploadGhostId(null);
          }
        }}
      />
    </div>
  );
};
