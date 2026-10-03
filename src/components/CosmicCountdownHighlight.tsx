import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

interface CountdownProps {
  targetDateStr?: string; // defaults to '2026-10-31T18:30:00+07:00'
}

export const CosmicCountdownHighlight: React.FC<CountdownProps> = ({
  targetDateStr = '2026-10-31T18:30:00+07:00',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();

    const calculateTime = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0d0907] border border-orange-500/25 p-5 sm:p-7 shadow-xl shadow-orange-950/20 text-center">
      {/* Subtle eerie background glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-orange-600/15 blur-3xl pointer-events-none" />

      {/* Header Label */}
      <div className="relative z-10 flex items-center justify-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        <span className="text-xs sm:text-sm font-black tracking-widest text-orange-400 uppercase">
          นับถอยหลังสู่วันปล่อยตัว &middot; 31 ตุลาคม 2569
        </span>
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
      </div>

      {/* Countdown Numbers Only */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
        {/* Days */}
        <div className="flex-1 rounded-2xl bg-black/60 border border-orange-500/30 p-3 sm:p-4 text-center shadow-md">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-orange-400">
            {pad(timeLeft.days)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-orange-200/60 mt-1">วัน</div>
        </div>

        <span className="text-xl sm:text-3xl font-black text-orange-500/50 pb-5">:</span>

        {/* Hours */}
        <div className="flex-1 rounded-2xl bg-black/60 border border-orange-500/30 p-3 sm:p-4 text-center shadow-md">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-amber-400">
            {pad(timeLeft.hours)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-orange-200/60 mt-1">ชั่วโมง</div>
        </div>

        <span className="text-xl sm:text-3xl font-black text-orange-500/50 pb-5">:</span>

        {/* Minutes */}
        <div className="flex-1 rounded-2xl bg-black/60 border border-orange-500/30 p-3 sm:p-4 text-center shadow-md">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-amber-400">
            {pad(timeLeft.minutes)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-orange-200/60 mt-1">นาที</div>
        </div>

        <span className="text-xl sm:text-3xl font-black text-orange-500/50 pb-5">:</span>

        {/* Seconds */}
        <div className="flex-1 rounded-2xl bg-black/60 border border-red-500/40 p-3 sm:p-4 text-center shadow-md">
          <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-red-500 animate-pulse">
            {pad(timeLeft.seconds)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-red-300/70 mt-1">วินาที</div>
        </div>
      </div>
    </div>
  );
};
