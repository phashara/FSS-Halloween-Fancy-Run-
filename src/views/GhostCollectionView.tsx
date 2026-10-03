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
  CheckCircle2,
  Info,
  ChevronRight,
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'3d_card' | 'realistic' | 'avatar'>('3d_card');

  const selectedGhost =
    ghostSpeciesList.find((g) => g.id === selectedGhostId) || ghostSpeciesList[0];

  const elements = Array.from(new Set(ghostSpeciesList.map((g) => g.element)));

  const filteredGhosts = ghostSpeciesList.filter((g) => {
    if (filterElement !== 'all' && g.element !== filterElement) return false;
    if (
      searchQuery.trim() &&
      !g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
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
    <div className="space-y-8">
      {/* Header Banner - Fastwork Clean Style */}
      <div className="rounded-3xl p-6 sm:p-10 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>คลังตำนานผีไทย 12 ชนิด</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            12 ตำนานผีไทย <span className="text-[#DC2626]">Thai Ghost Collection</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            เปิดตำนาน 12 วิญญาณไทยประจำเหรียญและเสื้อวิ่ง FSS 2026 พร้อมสถิติค่าพลังความเร็ว พลังแฝง และเรื่องเล่าลี้ลับโบราณ
          </p>

          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B67A] shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผีไทย..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
          </div>
        </div>
      </div>

      {/* Filter and View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Element Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-1">ธาตุพลัง:</span>
          <button
            onClick={() => setFilterElement('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterElement === 'all'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด (12 ผี)
          </button>
          {elements.map((elem) => (
            <button
              key={elem}
              onClick={() => setFilterElement(elem)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterElement === elem
                  ? 'bg-[#DC2626] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {elem}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">รูปแบบภาพ:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setViewStyle('3d_card')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === '3d_card'
                  ? 'bg-white text-[#DC2626] font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              การ์ดเสมือน
            </button>
            <button
              onClick={() => setViewStyle('realistic')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === 'realistic'
                  ? 'bg-white text-[#DC2626] font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ภาพสมจริง
            </button>
            <button
              onClick={() => setViewStyle('avatar')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewStyle === 'avatar'
                  ? 'bg-white text-[#DC2626] font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              อวตารเวกเตอร์
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid of 12 Thai Ghosts (Fastwork Style Service Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGhosts.map((ghost) => {
          const isSelected = selectedGhost?.id === ghost.id;
          return (
            <div
              key={ghost.id}
              onClick={() => setSelectedGhostId(ghost.id)}
              className={`fastwork-card p-5 cursor-pointer flex flex-col justify-between transition-all ${
                isSelected
                  ? 'ring-2 ring-[#DC2626] border-[#DC2626] shadow-md bg-red-50/20'
                  : 'bg-white hover:border-red-300'
              }`}
            >
              {/* Top Tag & ID */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                  ธาตุ {ghost.element}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  #{ghost.id}
                </span>
              </div>

              {/* Visual Display */}
              <div className="py-2 flex items-center justify-center relative min-h-[160px]">
                {viewStyle === 'realistic' ? (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                    <RealisticGhostPortrait
                      speciesId={ghost.id}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-50 flex items-center justify-center p-2 group-hover:bg-[#FEF2F2] transition-colors">
                    <GhostAvatarSvg
                      speciesId={ghost.id}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              {/* Ghost Name and Tagline */}
              <div className="space-y-1 mt-3">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#DC2626] transition-colors">
                  {ghost.name}
                </h3>
                <p className="text-xs font-semibold text-[#DC2626] line-clamp-1">{ghost.title}</p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {ghost.tagline}
                </p>
              </div>

              {/* Stats Bar Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <span className="text-slate-500 text-[11px]">ความหลอน:</span>
                  <span className="text-purple-600 font-bold">{ghost.baseStats.spookiness}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <span className="text-slate-500 text-[11px]">ความเร็ว:</span>
                  <span className="text-[#DC2626] font-bold">{ghost.baseStats.speed}</span>
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
                  className="flex-1 py-2 px-3 bg-[#FEF2F2] hover:bg-[#E0EDFF] text-[#DC2626] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>ดูการ์ดผี</span>
                </button>

                {adminUser && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(ghost);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-all"
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
        <div className="rounded-3xl p-6 sm:p-10 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Visual Portrait */}
            <div className="w-full sm:w-80 lg:w-96 shrink-0 flex flex-col items-center">
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50">
                <RealisticGhostPortrait
                  speciesId={selectedGhost.id}
                  className="w-full h-full"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 w-full">
                <button
                  onClick={() => handleOpenMyCard(selectedGhost.id)}
                  className="flex-1 py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>เปิดดูการ์ดผีใบนี้</span>
                </button>
                {adminUser && (
                  <button
                    onClick={() => handleStartEdit(selectedGhost)}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-slate-200"
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

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">ระดับความหลอน (Spookiness)</span>
                      <span className="text-purple-700 font-bold font-mono">
                        {selectedGhost.baseStats.spookiness} / 100
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.spookiness}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">ความเร็วในการวิ่ง (Speed)</span>
                      <span className="text-[#DC2626] font-bold font-mono">
                        {selectedGhost.baseStats.speed} / 100
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DC2626] rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.speed}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">พลังกายแฝง (Latent Power)</span>
                      <span className="text-[#00B67A] font-bold font-mono">
                        {selectedGhost.baseStats.latentPower} / 100
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00B67A] rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.latentPower}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">การพรางตัว (Stealth)</span>
                      <span className="text-sky-600 font-bold font-mono">
                        {selectedGhost.baseStats.stealth} / 100
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${selectedGhost.baseStats.stealth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lore & Story */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#DC2626]" /> ตำนานและชีวประวัติ
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                  <p>{selectedGhost.description}</p>
                  <p className="text-slate-600 border-t border-slate-200 pt-2 font-medium">
                    📖 <strong className="text-slate-900">เรื่องเล่าขาน:</strong> {selectedGhost.lore}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingGhost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <Edit3 className="w-5 h-5 text-[#DC2626]" />
                <span>แก้ไขข้อมูล: {editingGhost.name}</span>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ชื่อผีไทย</label>
                <input
                  type="text"
                  value={editingGhost.name}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ฉายา (Title)</label>
                <input
                  type="text"
                  value={editingGhost.title}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">สโลแกน (Tagline)</label>
                <input
                  type="text"
                  value={editingGhost.tagline}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">คำอธิบาย</label>
                <textarea
                  rows={3}
                  value={editingGhost.description}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">เรื่องเล่าขาน (Lore)</label>
                <textarea
                  rows={3}
                  value={editingGhost.lore}
                  onChange={(e) =>
                    setEditingGhost({ ...editingGhost, lore: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Stats Editor */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Spookiness (ความหลอน)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingGhost.baseStats.spookiness}
                    onChange={(e) =>
                      setEditingGhost({
                        ...editingGhost,
                        baseStats: {
                          ...editingGhost.baseStats,
                          spookiness: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Speed (ความเร็ว)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingGhost.baseStats.speed}
                    onChange={(e) =>
                      setEditingGhost({
                        ...editingGhost,
                        baseStats: {
                          ...editingGhost.baseStats,
                          speed: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleReset(editingGhost.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>รีเซ็ตกลับเป็นค่าเริ่มต้น</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md"
                >
                  <Save className="w-4 h-4" />
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
