import React, { useEffect, useRef, useState } from 'react';
import { Ghost, Volume2, VolumeX, Flame, Sparkles, Eye, Compass } from 'lucide-react';

export const ThaiGhost3DAtmosphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLanternMode, setIsLanternMode] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [ghostAlert, setGhostAlert] = useState<string | null>(null);

  // Web Audio ambient synthesizer reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Mouse move tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Canvas rendering loop for Thai Ghost Spirits & Fog
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Spirit Orbs (ลูกไฟพราย/วิญญาณ)
    const orbs = Array.from({ length: 18 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5, // 3D depth scale
      radius: Math.random() * 6 + 3,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8 - 0.2,
      color:
        Math.random() > 0.6
          ? '#10b981' // Green spirit (กระสือ/ผีโพง)
          : Math.random() > 0.3
          ? '#f59e0b' // Amber spirit (โคมผี)
          : '#a855f7', // Purple spirit (วิญญาณแค้น)
      alpha: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    // 3D Floating Krasue (ผีกระสือลอยไปมา)
    let krasueX = width * 0.85;
    let krasueY = height * 0.25;
    let krasueTargetX = width * 0.75;
    let krasueTargetY = height * 0.35;
    let krasueTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Floating Spirit Orbs
      orbs.forEach((orb) => {
        orb.x += orb.speedX * orb.z;
        orb.y += orb.speedY * orb.z;
        orb.pulse += 0.03;

        // Wrap edges
        if (orb.x < -20) orb.x = width + 20;
        if (orb.x > width + 20) orb.x = -20;
        if (orb.y < -20) orb.y = height + 20;
        if (orb.y > height + 20) orb.y = -20;

        const currentRadius = orb.radius * orb.z * (1 + 0.2 * Math.sin(orb.pulse));

        // Radial glow
        const glow = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius * 3.5
        );
        glow.addColorStop(0, orb.color);
        glow.addColorStop(0.4, orb.color + '66');
        glow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(orb.x, orb.y, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(orb.x, orb.y, currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Animate 3D Floating Krasue (ผีกระสือเรืองแสง)
      krasueTime += 0.025;
      krasueX += (krasueTargetX - krasueX) * 0.02 + Math.sin(krasueTime) * 0.8;
      krasueY += (krasueTargetY - krasueY) * 0.02 + Math.cos(krasueTime * 0.8) * 0.6;

      if (Math.abs(krasueX - krasueTargetX) < 30) {
        krasueTargetX = Math.random() * (width * 0.6) + width * 0.2;
        krasueTargetY = Math.random() * (height * 0.4) + height * 0.1;
      }

      // Draw Krasue Entrails & Light Halo
      const krasueGlow = ctx.createRadialGradient(
        krasueX,
        krasueY,
        5,
        krasueX,
        krasueY,
        140
      );
      krasueGlow.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
      krasueGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
      krasueGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.fillStyle = krasueGlow;
      ctx.arc(krasueX, krasueY, 140, 0, Math.PI * 2);
      ctx.fill();

      // Undulating intestines (ไส้กระสือเรืองแสง)
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 15;
      ctx.moveTo(krasueX, krasueY + 15);
      for (let i = 1; i <= 6; i++) {
        const segY = krasueY + 15 + i * 16;
        const waveX = krasueX + Math.sin(krasueTime * 2 + i) * (8 + i * 2);
        ctx.lineTo(waveX, segY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Krasue Head Silhouette & glowing eyes
      ctx.beginPath();
      ctx.fillStyle = '#0a0814';
      ctx.arc(krasueX, krasueY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Glowing green eyes
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(krasueX - 5, krasueY - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(krasueX + 5, krasueY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Lantern Mode (แสงโคมไฟส่องตามเมาส์)
      if (isLanternMode && mousePos.x > 0) {
        const lanternRadius = 240;
        const lanternGlow = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          10,
          mousePos.x,
          mousePos.y,
          lanternRadius
        );
        lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
        lanternGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.12)');
        lanternGlow.addColorStop(0.8, 'rgba(217, 119, 6, 0.04)');
        lanternGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = lanternGlow;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, lanternRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLanternMode, mousePos]);

  // Audio Ambience Synthesis (เสียงลมหวีดหวิว & ฆ้องวิญญาณไทย)
  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Low frequency wind drone
        const windOsc = ctx.createOscillator();
        windOsc.type = 'sine';
        windOsc.frequency.setValueAtTime(65, ctx.currentTime);

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.08, ctx.currentTime);
        windOsc.connect(windGain);
        windGain.connect(masterGain);
        windOsc.start();

        // Modulate wind frequency
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(25, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(windOsc.frequency);
        lfo.start();

        // Distant chime / spirit resonance
        const chimeInterval = setInterval(() => {
          if (!audioCtxRef.current) {
            clearInterval(chimeInterval);
            return;
          }
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'triangle';
          chimeOsc.frequency.setValueAtTime(
            [220, 277, 330, 440, 554][Math.floor(Math.random() * 5)],
            ctx.currentTime
          );
          chimeGain.gain.setValueAtTime(0.04, ctx.currentTime);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(masterGain);
          chimeOsc.start();
          chimeOsc.stop(ctx.currentTime + 3.6);
        }, 5000);

        setIsAudioPlaying(true);
        setGhostAlert('เปิดเสียงบรรยากาศป่าช้าสยองขวัญแล้ว 👻');
        setTimeout(() => setGhostAlert(null), 3500);
      } catch (err) {
        console.warn('Audio setup error:', err);
      }
    }
  };

  return (
    <>
      {/* 3D Atmosphere Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Spooky Thai Atmosphere Floating Controls */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {/* Ghost Alert Banner */}
        {ghostAlert && (
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-purple-500/50 text-purple-200 text-xs shadow-xl animate-in fade-in slide-in-from-right-3">
            {ghostAlert}
          </div>
        )}

        {/* 3D Lantern Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsLanternMode(!isLanternMode);
            setGhostAlert(
              !isLanternMode
                ? 'เปิดโหมดโคมไฟวิญญาณ: ส่องสำรวจเงามืด 🏮'
                : 'ปิดโหมดโคมไฟ'
            );
            setTimeout(() => setGhostAlert(null), 3000);
          }}
          className={`p-3 rounded-full border shadow-xl transition-all flex items-center gap-1.5 ${
            isLanternMode
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30 scale-105'
              : 'bg-slate-900/90 text-amber-400 border-amber-500/30 hover:bg-slate-800'
          }`}
          title="ส่องโคมไฟวิญญาณ 3D"
        >
          <Flame className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">
            {isLanternMode ? 'โคมไฟส่องสว่าง' : 'โคมไฟวิญญาณ'}
          </span>
        </button>

        {/* Spooky Sound Ambient Toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className={`p-3 rounded-full border shadow-xl transition-all flex items-center gap-1.5 ${
            isAudioPlaying
              ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30 animate-pulse'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
          title="เสียงบรรยากาศสยองขวัญ"
        >
          {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline text-xs font-bold">
            {isAudioPlaying ? 'เสียงหลอน ON' : 'เสียงหลอน OFF'}
          </span>
        </button>
      </div>
    </>
  );
};
