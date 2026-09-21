import React, { useState } from 'react';
import {
  Flame,
  Ghost,
  Sparkles,
  BookOpen,
  Filter,
  Eye,
  PlusCircle,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  Compass,
  Smile,
  ListFilter,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { HorrorStory, HorrorStoryCategory, StoryReactions } from '../types';
import { InteractiveHorrorRealm } from '../components/InteractiveHorrorRealm';
import { EditableText } from '../components/EditableText';

export const HorrorStoriesView: React.FC<{ onNavigate: (view: any) => void }> = ({
  onNavigate,
}) => {
  const { stories, currentCard, submitHorrorStory, reactToStory } = useEventContext();

  const [viewMode, setViewMode] = useState<'3d' | 'simple'>('3d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStory, setSelectedStory] = useState<HorrorStory | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [cardId, setCardId] = useState(currentCard?.cardId || '');
  const [authorNickname, setAuthorNickname] = useState(currentCard?.nickname || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<HorrorStoryCategory>('running_encounter');
  const [spookinessRating, setSpookinessRating] = useState<number>(3);
  const [location, setLocation] = useState('สวนสาธารณะ');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Filter approved stories for public reading
  const publicStories = stories.filter((s) => s.status === 'approved');

  const filteredStories =
    selectedCategory === 'all'
      ? publicStories
      : publicStories.filter((s) => s.category === selectedCategory);

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!cardId.trim()) {
      setFormError('กรุณาระบุ Card ID เพื่อเชื่อมโยงการอัปเกรดการ์ด');
      return;
    }
    if (!title.trim() || title.length < 5) {
      setFormError('กรุณากรอกชื่อเรื่องอย่างน้อย 5 ตัวอักษร');
      return;
    }
    if (!content.trim() || content.length < 20) {
      setFormError('กรุณาเล่ารายละเอียดอย่างน้อย 20 ตัวอักษร');
      return;
    }

    submitHorrorStory({
      cardId,
      authorNickname: authorNickname.trim() || 'นักวิ่งนิรนาม',
      isAnonymous,
      title,
      content,
      category,
      spookinessRating,
      location,
    });

    setFormSuccess(
      'ส่งเรื่องสยองสำเร็จแล้ว! เจ้าหน้าที่กำลังตรวจสอบ เมื่อผ่านการอนุมัติ คุณจะได้รับตรา STORYTELLER และการ์ดจะอัปเกรดเป็น LV.2 หรือ LV.3 อัตโนมัติ'
    );
    setTitle('');
    setContent('');
    setTimeout(() => {
      setShowSubmitModal(false);
      setFormSuccess('');
    }, 2500);
  };

  const categoriesList: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'ทั้งหมด', icon: '🔮' },
    { id: 'running_encounter', label: 'วิ่งอยู่ดีๆ ก็เจอ', icon: '🏃' },
    { id: 'dark_alley', label: 'หลอนในซอยเปลี่ยว', icon: '🏮' },
    { id: 'sleep_paralysis', label: 'ผีอำ/สัมผัสพิเศษ', icon: '👁️' },
    { id: 'workplace_school', label: 'ที่ทำงาน/มหาวิทยาลัย', icon: '🏫' },
    { id: 'funny_ghost', label: 'ตลกปนหลอน', icon: '🤣' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> THAI GHOST SANCTUARY & COMMUNITY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight flex items-center gap-2.5">
            <EditableText
              sectionKey="horror"
              field="title"
              fallbackText="คลังประสบการณ์สยอง 3D"
            />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            <EditableText
              sectionKey="horror"
              field="subtitle"
              fallbackText="พื้นที่แชร์เรื่องหลอน เรื่องขำ และเหตุการณ์ลี้ลับ พร้อมสะสมตรา STORYTELLER"
            />
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mode Switcher */}
          <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> แผนที่ 3D
            </button>
            <button
              type="button"
              onClick={() => setViewMode('simple')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'simple'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> โหมดอ่านง่าย
            </button>
          </div>

          {/* Submit Story Button */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-purple-950/50 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> เล่าเรื่องสยอง
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              selectedCategory === cat.id
                ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* VIEW: 3D Interactive Map Realm or Simple List */}
      {viewMode === '3d' ? (
        <InteractiveHorrorRealm
          stories={filteredStories}
          onSelectStory={(story) => setSelectedStory(story)}
          onReact={reactToStory}
        />
      ) : (
        /* Simple Cards Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-400">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-rose-400" /> {story.location}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {'⭐'.repeat(story.spookinessRating)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {story.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {story.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  เล่าโดย: {story.isAnonymous ? 'วิญญาณนิรนาม' : story.authorNickname}
                </span>
                <span className="text-purple-400 font-medium">อ่านต่อ & ตอบรับ ➔</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Detail & Reaction Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#18112c] via-[#0f0b1c] to-[#0a0714] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <button
              type="button"
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Story Header */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
                  {selectedStory.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> {selectedStory.location}
                </span>
                <span>• ระดับความเฮี้ยน: {'⭐'.repeat(selectedStory.spookinessRating)}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedStory.title}</h2>
              <p className="text-xs text-slate-400">
                เล่าโดย:{' '}
                <b className="text-slate-200">
                  {selectedStory.isAnonymous ? 'วิญญาณนิรนาม' : selectedStory.authorNickname}
                </b>{' '}
                (Card ID: {selectedStory.cardId})
              </p>
            </div>

            {/* Story Content */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-sm leading-relaxed text-slate-200 max-h-96 overflow-y-auto whitespace-pre-line">
              {selectedStory.content}
            </div>

            {/* Reaction Buttons (Section 12) */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2 font-medium">
                ร่วมแสดงปฏิกิริยาต่อเรื่องเล่านี้:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => reactToStory(selectedStory.id, 'spooky')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 transition-all"
                >
                  <span>😱 หลอนจริง</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedStory.reactions.spooky}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => reactToStory(selectedStory.id, 'funny')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 transition-all"
                >
                  <span>🤣 ขำมากกว่า</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedStory.reactions.funny}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => reactToStory(selectedStory.id, 'flashlight')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 transition-all"
                >
                  <span>🔦 ขอไฟฉาย</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedStory.reactions.flashlight}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => reactToStory(selectedStory.id, 'runAway')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 transition-all"
                >
                  <span>🏃 วิ่งหนีแล้ว</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedStory.reactions.runAway}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => reactToStory(selectedStory.id, 'cannotSleep')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 transition-all col-span-2 sm:col-span-1"
                >
                  <span>☕ นอนไม่หลับ</span>
                  <span className="font-mono font-bold text-amber-400">
                    {selectedStory.reactions.cannotSleep}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Story Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#18112c] to-[#0a0714] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-purple-400" /> แบ่งปันประสบการณ์สยองขวัญ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              เล่าเรื่องหลอนของคุณเพื่อปลดล็อกตรา <b>STORYTELLER</b> และอัปเกรดการ์ดผีเป็น LV.2 หรือ LV.3!
            </p>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleStorySubmit} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    หมายเลขการ์ดผี (Card ID) *
                  </label>
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value.toUpperCase())}
                    placeholder="เช่น FSS26-00872"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xs focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อเล่นผู้เล่า
                  </label>
                  <input
                    type="text"
                    value={authorNickname}
                    disabled={isAnonymous}
                    onChange={(e) => setAuthorNickname(e.target.value)}
                    placeholder="ชื่อเล่น"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-purple-600 bg-slate-950 border-slate-700"
                />
                <span>เล่าแบบไม่ระบุชื่อ (วิญญาณนิรนาม)</span>
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อเรื่อง *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น เงาสีดำใต้ต้นจามจุรี กม. 3"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HorrorStoryCategory)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
                  >
                    <option value="running_encounter">วิ่งอยู่ดีๆ ก็เจอ</option>
                    <option value="dark_alley">หลอนในซอยเปลี่ยว</option>
                    <option value="sleep_paralysis">ผีอำ/สัมผัสพิเศษ</option>
                    <option value="workplace_school">ที่ทำงาน/โรงเรียน</option>
                    <option value="funny_ghost">ตลกปนหลอน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    สถานที่เกิดเหตุ
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น สวนรถไฟ, ทางเดินหอพัก"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ระดับความน่ากลัว (1-5 ดาว): {spookinessRating} ดาว
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={spookinessRating}
                  onChange={(e) => setSpookinessRating(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เรื่องเล่าของคุณ *
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="บรรยายบรรยากาศ เหตุการณ์ที่พบเจอ และความรู้สึกของคุณในตอนนั้น..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                ส่งเรื่องสยองเข้าคลัง
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
