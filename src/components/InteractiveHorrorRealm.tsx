import React, { useState } from 'react';
import { HorrorStory, StoryReactions } from '../types';
import { Flame, Ghost, BookOpen, MapPin, Eye, Sparkles, Smile, Compass } from 'lucide-react';

interface Props {
  stories: HorrorStory[];
  onSelectStory: (story: HorrorStory) => void;
  onReact: (storyId: string, reaction: keyof StoryReactions) => void;
}

export const InteractiveHorrorRealm: React.FC<Props> = ({
  stories,
  onSelectStory,
}) => {
  const [hoveredStory, setHoveredStory] = useState<HorrorStory | null>(null);

  // Map elements position calculation based on story index
  const elements = stories.slice(0, 10).map((story, idx) => {
    // Distribute nicely along an eerie night running track path
    const positions = [
      { x: 22, y: 35, type: 'lantern', label: 'โคมไฟโบราณ' },
      { x: 50, y: 22, type: 'tombstone', label: 'ป้ายหลุมศพไม้' },
      { x: 78, y: 32, type: 'spirit_wisp', label: 'ดวงไฟวิญญาณเขียว' },
      { x: 30, y: 65, type: 'haunted_house', label: 'ศาลาริมน้ำร้าง' },
      { x: 68, y: 70, type: 'floating_book', label: 'คัมภีร์เรื่องลี้ลับ' },
      { x: 82, y: 55, type: 'spirit_wisp', label: 'ลูกไฟสีม่วง' },
      { x: 15, y: 78, type: 'tombstone', label: 'หลักกิโลเมตรอาถรรพ์' },
      { x: 45, y: 85, type: 'lantern', label: 'ตะเกียงดวงสุดท้าย' },
    ];
    const pos = positions[idx % positions.length];
    return { ...pos, story };
  });

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#06040d] via-[#100926] to-[#080414] border border-purple-500/30 shadow-2xl p-4 sm:p-6 min-h-[460px] sm:min-h-[540px] flex flex-col justify-between select-none">
      {/* Night Sky with Stars & Moon */}
      <div className="absolute top-4 right-6 flex items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.6)] flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-900/10" />
        </div>
      </div>

      {/* Atmospheric Fog Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950/40 to-black/80 pointer-events-none" />

      {/* Glowing Running Trail Path SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 800 500" fill="none">
        <path
          d="M 100 380 Q 250 150 400 240 T 700 180"
          stroke="#a855f7"
          strokeWidth="24"
          strokeDasharray="8 8"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M 100 380 Q 250 150 400 240 T 700 180"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-70"
        />
      </svg>

      {/* Top Banner Guide */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-purple-500/20">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            แผนที่ป่าช้าและทางวิ่งรัตติกาล (3D Interactive Sanctuary)
          </span>
        </div>
        <span className="text-[11px] text-purple-300 font-medium">
          💡 คลิกที่ดวงไฟ วิญญาณ หรือหลุมศพ เพื่อเปิดอ่านเรื่องสยองขวัญ
        </span>
      </div>

      {/* Interactive Objects Canvas Area */}
      <div className="relative z-10 w-full flex-1 my-6 min-h-[340px]">
        {elements.map((item, idx) => {
          return (
            <div
              key={item.story.id + idx}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
              onMouseEnter={() => setHoveredStory(item.story)}
              onMouseLeave={() => setHoveredStory(null)}
              onClick={() => onSelectStory(item.story)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform duration-300 hover:scale-125 focus:outline-none"
            >
              {/* Interactive Icon based on type */}
              <div className="relative flex flex-col items-center">
                {item.type === 'spirit_wisp' && (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/80 shadow-[0_0_25px_#10b981] flex items-center justify-center text-white text-lg animate-bounce">
                    <Ghost className="w-5 h-5 text-white" />
                  </div>
                )}
                {item.type === 'lantern' && (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/80 shadow-[0_0_30px_#f59e0b] flex items-center justify-center text-white text-lg animate-pulse">
                    <Flame className="w-5 h-5 text-amber-950 fill-amber-300" />
                  </div>
                )}
                {item.type === 'tombstone' && (
                  <div className="w-9 h-11 rounded-t-xl bg-slate-700 border-2 border-slate-500 shadow-[0_0_20px_rgba(203,213,225,0.4)] flex items-center justify-center text-slate-300 font-serif font-black text-xs">
                    RIP
                  </div>
                )}
                {item.type === 'haunted_house' && (
                  <div className="w-11 h-11 rounded-2xl bg-purple-900/90 border border-purple-400 shadow-[0_0_30px_#a855f7] flex items-center justify-center text-xl">
                    🏚️
                  </div>
                )}
                {item.type === 'floating_book' && (
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/90 border border-indigo-400 shadow-[0_0_25px_#6366f1] flex items-center justify-center text-white animate-bounce">
                    <BookOpen className="w-5 h-5 text-amber-200" />
                  </div>
                )}

                {/* Floating Tag */}
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap shadow-md group-hover:border-amber-400 group-hover:text-amber-300 transition-colors">
                  {item.story.title.length > 18
                    ? `${item.story.title.slice(0, 18)}...`
                    : item.story.title}
                </div>
              </div>
            </div>
          );
        })}

        {/* Hover Story Preview Tooltip */}
        {hoveredStory && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 border border-amber-500/60 p-4 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none transition-all">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {hoveredStory.location}
              </span>
              <span className="text-slate-400">เล่าโดย: {hoveredStory.isAnonymous ? 'ไม่เปิดเผยชื่อ' : hoveredStory.authorNickname}</span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">{hoveredStory.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
              {hoveredStory.content}
            </p>
            <div className="mt-2 text-[11px] text-amber-300 font-bold">
              👉 คลิกเพื่ออ่านเรื่องเต็มและกดปฏิกิริยาหลอน
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" /> ทางวิ่งรอบ ม.นเรศวร ระยะทาง 5.0 กม.
        </span>
        <span className="text-slate-300 font-mono">
          เรื่องสยองทั้งหมดในคลัง: <b className="text-amber-400">{stories.length}</b> เรื่อง
        </span>
      </div>
    </div>
  );
};
