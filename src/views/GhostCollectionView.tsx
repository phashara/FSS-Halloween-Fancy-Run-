import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { GhostSpecies, GhostSpeciesId } from '../types';
import { GhostAvatarSvg } from '../components/GhostAvatarSvg';
import { RealisticGhostPortrait } from '../components/RealisticGhostPortrait';
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
  Eye,
  Sliders,
  CheckCircle2,
  Info,
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
    ghostSpeciesList[0]?.id || 'krasue'
  );
  const [editingGhost, setEditingGhost] = useState<GhostSpecies | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [filterElement, setFilterElement] = useState<string>('all');
  const [viewStyle, setViewStyle] = useState<'3d_card' | 'realistic' | 'avatar'>('3d_card');

  const selectedGhost =
    ghostSpeciesList.find((g) => g.id === selectedGhostId) || ghostSpeciesList[0];

  const elements = Array.from(new Set(ghostSpeciesList.map((g) => g.element)));

  const filteredGhosts = ghostSpeciesList.filter((g) => {
    if (filterElement !== 'all' && g.element !== filterElement) return false;
    return true;
  });

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

  const handleReset = async (id: GhostSpeciesId) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-amber-950/80 border border-amber-500/30 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
          <GhostAvatarSvg speciesId={selectedGhost?.id || 'krasue'} className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            ตำนานความลี้ลับ FSS Ghost Run 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            12 ตำนานผีไทย <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">Thai Ghost Collection</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            เปิดตำนาน 12 วิญญาณไทยประจำเหรียญและเสื้อวิ่ง FSS 2026 พร้อมสถิติพลังแฝง สเตตัสความเร็ว และเรื่องเล่าลี้ลับโบราณ
            {adminUser ? (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/40 text-xs">
                <Shield className="w-3.5 h-3.5" /> โหมดแอดมิน: คุณสามารถคลิกแก้ไขชื่อ สเตตัส และเรื่องเล่าได้โดยตรง
              </span>
            ) : (
              <span className="ml-1 text-slate-400 text-xs">(แอดมินสามารถเข้าสู่ระบบเพื่อแก้ไขข้อมูลได้ตลอดเวลา)</span>
            )}
          </p>

          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-900/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">ธาตุพลัง:</span>
          <button
            onClick={() => setFilterElement('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterElement === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ทั้งหมด (12 ผี)
          </button>
          {elements.map((elem) => (
            <button
              key={elem}
              onClick={() => setFilterElement(elem)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterElement === elem
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {elem}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">โหมดภาพ:</span>
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewStyle('3d_card')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === '3d_card'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              การ์ดเสมือน
            </button>
            <button
              onClick={() => setViewStyle('realistic')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === 'realistic'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ภาพสมจริง
            </button>
            <button
              onClick={() => setViewStyle('avatar')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === 'avatar'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              อวตารเวกเตอร์
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid of 12 Thai Ghosts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGhosts.map((ghost) => {
          const isSelected = selectedGhost?.id === ghost.id;
          return (
            <div
              key={ghost.id}
              onClick={() => setSelectedGhostId(ghost.id)}
              className={`relative rounded-3xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              {/* Element & Badge */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700/80 font-mono text-[11px]">
                  {ghost.element}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  ID: #{ghost.id}
                </span>
              </div>

              {/* Visual Display based on ViewStyle */}
              <div className="py-2 flex items-center justify-center relative min-h-[170px]">
                {viewStyle === 'realistic' ? (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800">
                    <RealisticGhostPortrait
                      speciesId={ghost.id}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative group">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70"
                      style={{ backgroundColor: ghost.primaryColor }}
                    />
                    <GhostAvatarSvg
                      speciesId={ghost.id}
                      className="w-32 h-32 sm:w-36 sm:h-36 relative z-10 transition-transform group-hover:scale-105 duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Ghost Name and Tagline */}
              <div className="space-y-1 mt-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    {ghost.name}
                  </h3>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ghost.primaryColor }}
                  />
                </div>
                <p className="text-xs font-semibold text-amber-400 line-clamp-1">{ghost.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ghost.tagline}
                </p>
              </div>

              {/* Stats Bar Preview */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 px-2 py-1 rounded">
                  <span className="text-slate-400">หลอน:</span>
                  <span className="text-purple-400 font-bold">{ghost.baseStats.spookiness}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 px-2 py-1 rounded">
                  <span className="text-slate-400">ความเร็ว:</span>
                  <span className="text-amber-400 font-bold">{ghost.baseStats.speed}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMyCard(ghost.id);
                  }}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>ดูการ์ด 3D</span>
                </button>

                {adminUser && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(ghost);
                    }}
                    className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs transition-all"
                    title="แก้ไขข้อมูลผีตนนี้"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Ghost Deep Lore & Details Section */}
      {selectedGhost && (
        <div className="rounded-3xl p-6 sm:p-10 bg-slate-900/90 border border-amber-500/40 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Visual Portrait */}
            <div className="w-full sm:w-80 lg:w-96 shrink-0 flex flex-col items-center">
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl relative bg-slate-950">
                <RealisticGhostPortrait
                  speciesId={selectedGhost.id}
                  className="w-full h-full"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 w-full">
                <button
                  onClick={() => handleOpenMyCard(selectedGhost.id)}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>เปิดดูการ์ดผีใบนี้และอัปโหลดรูป</span>
                </button>
                {adminUser && (
                  <button
                    onClick={() => handleStartEdit(selectedGhost)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold rounded-2xl text-sm transition-all flex items-center gap-2"
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-mono mb-2">
                  <Activity className="w-3.5 h-3.5" /> ธาตุ: {selectedGhost.element}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedGhost.name}</h2>
                <p className="text-base text-amber-400 font-semibold mt-1">{selectedGhost.title}</p>
                <p className="text-sm text-slate-400 italic mt-1">"{selectedGhost.tagline}"</p>
              </div>

              {/* Stats Visual Progress Bars */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> สถิติค่าพลัง FSS Ghost Run
                </h4>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">ระดับความหลอน (Spookiness)</span>
                      <span className="text-purple-400 font-bold font-mono">
                        {selectedGhost.baseStats.spookiness} / 100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.spookiness}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">ความเร็วในการวิ่ง (Speed)</span>
                      <span className="text-amber-400 font-bold font-mono">
                        {selectedGhost.baseStats.speed} / 100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.speed}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">พลังกายแฝง (Latent Power)</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {selectedGhost.baseStats.latentPower} / 100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.latentPower}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">การพรางตัว (Stealth)</span>
                      <span className="text-blue-400 font-bold font-mono">
                        {selectedGhost.baseStats.stealth} / 100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.stealth}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">ออร่าความเฮี้ยน (Haunting Aura)</span>
                      <span className="text-rose-400 font-bold font-mono">
                        {selectedGhost.baseStats.hauntingAura} / 100
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.hauntingAura}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lore & Story */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" /> ตำนานและชีวประวัติ
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed space-y-2">
                  <p>{selectedGhost.description}</p>
                  <p className="text-amber-200/90 text-xs font-medium border-t border-slate-800/80 pt-2">
                    📖 <strong className="text-amber-400">เรื่องเล่าขาน:</strong> {selectedGhost.lore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingGhost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                <Edit3 className="w-5 h-5" />
                <span>แก้ไขข้อมูล: {editingGhost.name}</span>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ชื่อผี</label>
                  <input
                    type="text"
                    value={editingGhost.name}
                    onChange={(e) => setEditingGhost({ ...editingGhost, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ฉายา (Title)</label>
                  <input
                    type="text"
                    value={editingGhost.title}
                    onChange={(e) => setEditingGhost({ ...editingGhost, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">คำโปรย (Tagline)</label>
                  <input
                    type="text"
                    value={editingGhost.tagline}
                    onChange={(e) => setEditingGhost({ ...editingGhost, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ธาตุพลัง (Element)</label>
                  <input
                    type="text"
                    value={editingGhost.element}
                    onChange={(e) => setEditingGhost({ ...editingGhost, element: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">คำบรรยายลักษณะ</label>
                <textarea
                  rows={3}
                  value={editingGhost.description}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">เรื่องเล่าขาน (Lore)</label>
                <textarea
                  rows={2}
                  value={editingGhost.lore}
                  onChange={(e) => setEditingGhost({ ...editingGhost, lore: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Stats Sliders */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" /> ปรับสถิติค่าพลัง (0-100)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>ความหลอน:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {editingGhost.baseStats.spookiness}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={editingGhost.baseStats.spookiness}
                      onChange={(e) =>
                        setEditingGhost({
                          ...editingGhost,
                          baseStats: {
                            ...editingGhost.baseStats,
                            spookiness: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>ความเร็ว:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {editingGhost.baseStats.speed}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={editingGhost.baseStats.speed}
                      onChange={(e) =>
                        setEditingGhost({
                          ...editingGhost,
                          baseStats: {
                            ...editingGhost.baseStats,
                            speed: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>พลังกายแฝง:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {editingGhost.baseStats.latentPower}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={editingGhost.baseStats.latentPower}
                      onChange={(e) =>
                        setEditingGhost({
                          ...editingGhost,
                          baseStats: {
                            ...editingGhost.baseStats,
                            latentPower: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>การพรางตัว:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {editingGhost.baseStats.stealth}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={editingGhost.baseStats.stealth}
                      onChange={(e) =>
                        setEditingGhost({
                          ...editingGhost,
                          baseStats: {
                            ...editingGhost.baseStats,
                            stealth: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Color Styling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">สีหลัก (Primary)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingGhost.primaryColor}
                      onChange={(e) =>
                        setEditingGhost({ ...editingGhost, primaryColor: e.target.value })
                      }
                      className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingGhost.primaryColor}
                      onChange={(e) =>
                        setEditingGhost({ ...editingGhost, primaryColor: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">สีรอง (Accent)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingGhost.accentColor}
                      onChange={(e) =>
                        setEditingGhost({ ...editingGhost, accentColor: e.target.value })
                      }
                      className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingGhost.accentColor}
                      onChange={(e) =>
                        setEditingGhost({ ...editingGhost, accentColor: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => handleReset(editingGhost.id)}
                className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
