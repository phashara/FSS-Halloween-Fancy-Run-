import QRCode from 'qrcode';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard } from '../types';
import { REALISTIC_GHOST_ASSETS } from '../components/RealisticGhostPortrait';

export interface StoryGenerateOptions {
  artMode?: 'realistic' | 'talisman';
  isSocialMode?: boolean;
}

/**
 * Loads an image safely with crossOrigin and timeout
 */
const loadImage = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    // Timeout after 3.5s
    setTimeout(() => resolve(null), 3500);
    img.src = url;
  });
};

/**
 * Draws rounded rectangle on Canvas
 */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/**
 * Generates a high-definition 9:16 (1080x1920) Story Canvas
 */
export const generateGhostStoryCanvas = async (
  card: GhostCard,
  options: StoryGenerateOptions = {}
): Promise<HTMLCanvasElement> => {
  const { artMode = 'realistic', isSocialMode = true } = options;
  const species = THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.krasue;
  const asset = REALISTIC_GHOST_ASSETS[card.speciesId];

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  // 1. Atmospheric Deep Horror Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#06030b');
  bgGrad.addColorStop(0.2, '#120820');
  bgGrad.addColorStop(0.5, '#1e0f33');
  bgGrad.addColorStop(0.8, '#10061c');
  bgGrad.addColorStop(1, '#050208');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Eerie Ambient Radial Glows (Species Aura)
  const auraColor = species.primaryColor || '#ef4444';
  const glow1 = ctx.createRadialGradient(540, 680, 50, 540, 680, 500);
  glow1.addColorStop(0, `${auraColor}33`);
  glow1.addColorStop(0.6, `${auraColor}15`);
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 200, 1080, 900);

  const glow2 = ctx.createRadialGradient(200, 1400, 20, 200, 1400, 450);
  glow2.addColorStop(0, `${species.accentColor || '#f59e0b'}25`);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 1000, 1080, 800);

  // 2. Decorative Story Frame Border (Rarity Color)
  const rarityBorderColor =
    card.rarity === 'Legendary'
      ? '#f59e0b'
      : card.rarity === 'Epic'
      ? '#a855f7'
      : card.rarity === 'Rare'
      ? '#3b82f6'
      : '#64748b';

  ctx.save();
  ctx.strokeStyle = rarityBorderColor;
  ctx.lineWidth = 14;
  roundRect(ctx, 40, 40, 1000, 1840, 36);
  ctx.stroke();

  // Subtle inner accent border
  ctx.strokeStyle = `${rarityBorderColor}40`;
  ctx.lineWidth = 2;
  roundRect(ctx, 56, 56, 968, 1808, 28);
  ctx.stroke();
  ctx.restore();

  // Occult corner symbols
  ctx.fillStyle = `${rarityBorderColor}88`;
  ctx.font = '24px serif';
  ctx.fillText('๛ นะ', 70, 95);
  ctx.fillText('โม ๛', 960, 95);
  ctx.fillText('๛ พุท', 70, 1820);
  ctx.fillText('ธา ๛', 960, 1820);

  // 3. Header Section (Event Info)
  // Story safe top spacer (~120px)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 34px Prompt, sans-serif';
  ctx.fillText('🎃 FSS HALLOWEEN FANCY RUN 2026', 540, 135);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '22px Prompt, sans-serif';
  ctx.fillText('คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร • คืนวันฮาโลวีน 31 ต.ค. 2569', 540, 175);

  // Rarity & Level Pill
  ctx.save();
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, 330, 205, 420, 52, 26);
  ctx.fill();
  ctx.strokeStyle = rarityBorderColor;
  ctx.lineWidth = 3;
  roundRect(ctx, 330, 205, 420, 52, 26);
  ctx.stroke();

  ctx.fillStyle = rarityBorderColor;
  ctx.font = 'bold 22px Prompt, sans-serif';
  ctx.fillText(
    `★ ${card.rarity.toUpperCase()} RELIC • LV.${card.level} ★`,
    540,
    240
  );
  ctx.restore();

  // 4. Ghost Portrait Center Artwork Box
  const boxX = 140;
  const boxY = 285;
  const boxW = 800;
  const boxH = 640;

  ctx.save();
  // Frame background
  ctx.fillStyle = '#090514';
  roundRect(ctx, boxX, boxY, boxW, boxH, 30);
  ctx.fill();
  ctx.strokeStyle = `${rarityBorderColor}99`;
  ctx.lineWidth = 4;
  roundRect(ctx, boxX, boxY, boxW, boxH, 30);
  ctx.stroke();

  // Try loading real photo asset if in realistic mode (or card.customImageUrl)
  let photoDrawn = false;
  const imageSource = card.customImageUrl || (artMode === 'realistic' ? asset?.photoUrl : undefined);
  if (imageSource) {
    try {
      const img = await loadImage(imageSource);
      if (img) {
        ctx.save();
        roundRect(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, 26);
        ctx.clip();
        // Draw centered and cover
        const imgRatio = img.width / img.height;
        const boxRatio = (boxW - 12) / (boxH - 12);
        let sW, sH, sX, sY;
        if (imgRatio > boxRatio) {
          sH = img.height;
          sW = img.height * boxRatio;
          sX = (img.width - sW) / 2;
          sY = 0;
        } else {
          sW = img.width;
          sH = img.width / boxRatio;
          sX = 0;
          sY = (img.height - sH) / 2;
        }
        ctx.drawImage(img, sX, sY, sW, sH, boxX + 6, boxY + 6, boxW - 12, boxH - 12);

        // Dark horror vignette overlay
        const vigGrad = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
        vigGrad.addColorStop(0.6, 'rgba(0,0,0,0.1)');
        vigGrad.addColorStop(1, 'rgba(9,5,20,0.85)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.restore();
        photoDrawn = true;
      }
    } catch {
      photoDrawn = false;
    }
  }

  // Fallback / Talisman visual
  if (!photoDrawn) {
    ctx.fillStyle = `${auraColor}20`;
    ctx.fillRect(boxX + 10, boxY + 10, boxW - 20, boxH - 20);

    // Decorative talisman sigil
    ctx.strokeStyle = rarityBorderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(540, boxY + boxH / 2 - 20, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '100px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', 540, boxY + boxH / 2 + 15);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 26px Prompt, sans-serif';
    ctx.fillText('ยันต์มหาเวทย์วิญญาณไทยโบราณ', 540, boxY + boxH / 2 + 90);
  }

  // Element Tag on Photo bottom-left
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, boxX + 24, boxY + boxH - 66, 320, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, boxX + 24, boxY + boxH - 66, 320, 44, 22);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 18px Prompt, sans-serif';
  ctx.fillText(`✨ ${asset?.elementBadge || 'วิญญาณแห่งรัตติกาล'}`, boxX + 42, boxY + boxH - 37);

  // Level Badge top-right
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  roundRect(ctx, boxX + boxW - 170, boxY + 20, 150, 44, 22);
  ctx.fill();
  ctx.strokeStyle = rarityBorderColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, boxX + boxW - 170, boxY + 20, 150, 44, 22);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px Prompt, sans-serif';
  ctx.fillText(card.level === 3 ? 'ULTIMATE' : `LEVEL ${card.level}`, boxX + boxW - 95, boxY + 48);

  ctx.restore();

  // 5. Headline Text: "คุณคือผี..."
  const ghostHeadline =
    species.name.startsWith('ผี') ||
    species.name.startsWith('นาง') ||
    species.name.startsWith('ยาย') ||
    species.name.startsWith('แม่') ||
    species.name.startsWith('กุมาร')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 22px Prompt, sans-serif';
  ctx.fillText('👻 วิญญาณประจำตัวของคุณ (THAI GHOST IDENTITY)', 540, 970);

  // Glowing main ghost headline
  ctx.save();
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 54px Prompt, sans-serif';
  ctx.fillText(ghostHeadline, 540, 1035);
  ctx.restore();

  ctx.fillStyle = '#fdba74';
  ctx.font = '26px Prompt, sans-serif';
  ctx.fillText(species.title, 540, 1078);

  // Quote
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'italic 21px Prompt, sans-serif';
  const quoteText = `"${card.customQuote || species.tagline}"`;
  ctx.fillText(quoteText, 540, 1120);

  // 6. Owner & Card ID Bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  roundRect(ctx, 140, 1150, 800, 68, 20);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  roundRect(ctx, 140, 1150, 800, 68, 20);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px Prompt, sans-serif';
  ctx.fillText('เจ้าของการ์ด:', 170, 1192);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px Prompt, sans-serif';
  const displayedName = isSocialMode ? `${card.nickname.slice(0, 4)}***` : card.nickname;
  ctx.fillText(displayedName, 290, 1192);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px Prompt, sans-serif';
  ctx.fillText('Card ID:', 850, 1192);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(card.cardId, 915, 1192);

  // 7. 5 Stats Display Section
  const statsBoxY = 1235;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  roundRect(ctx, 140, statsBoxY, 800, 230, 24);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  roundRect(ctx, 140, statsBoxY, 800, 230, 24);
  ctx.stroke();

  // Header inside stats
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 20px Prompt, sans-serif';
  ctx.fillText('⚡ สถิติค่าพลังวิญญาณประจำตัว (GHOST STATS)', 175, statsBoxY + 38);

  ctx.textAlign = 'right';
  const totalScore =
    card.stats.spookiness +
    card.stats.speed +
    card.stats.latentPower +
    card.stats.stealth +
    card.stats.hauntingAura;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`TOTAL: ${totalScore} / 500`, 905, statsBoxY + 38);

  // 5 Stats Bars
  const statsList = [
    { label: 'ความหลอน (Spookiness)', val: card.stats.spookiness, color: '#f43f5e' },
    { label: 'ความเร็ว (Speed)', val: card.stats.speed, color: '#fbbf24' },
    { label: 'พลังแฝง (Latent Power)', val: card.stats.latentPower, color: '#c084fc' },
    { label: 'การพรางตัว (Stealth)', val: card.stats.stealth, color: '#34d399' },
    { label: 'ความเฮี้ยน (Haunting Aura)', val: card.stats.hauntingAura, color: '#38bdf8' },
  ];

  statsList.forEach((stat, idx) => {
    const rowY = statsBoxY + 68 + idx * 31;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px Prompt, sans-serif';
    ctx.fillText(stat.label, 175, rowY + 14);

    // Bar background
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, 420, rowY, 410, 16, 8);
    ctx.fill();

    // Bar fill
    const fillWidth = Math.max(16, (stat.val / 100) * 410);
    ctx.fillStyle = stat.color;
    roundRect(ctx, 420, rowY, fillWidth, 16, 8);
    ctx.fill();

    // Value text
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(String(stat.val), 895, rowY + 14);
  });

  // 8. Mission Badges
  const badgeY = 1485;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '17px Prompt, sans-serif';
  ctx.fillText('🎖️ ตราภารกิจ:', 150, badgeY + 25);

  const badges = [
    { name: 'RUNNER AWAKENED', unlocked: true, color: '#10b981' },
    { name: 'SHIRT OWNER', unlocked: card.badges.includes('SHIRT_OWNER'), color: '#f97316' },
    { name: 'STORYTELLER', unlocked: card.badges.includes('STORYTELLER'), color: '#a855f7' },
  ];

  let curBadgeX = 300;
  badges.forEach((b) => {
    ctx.fillStyle = b.unlocked ? `${b.color}25` : '#1e293b55';
    roundRect(ctx, curBadgeX, badgeY, 195, 36, 18);
    ctx.fill();
    ctx.strokeStyle = b.unlocked ? b.color : '#475569';
    ctx.lineWidth = 1.5;
    roundRect(ctx, curBadgeX, badgeY, 195, 36, 18);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = b.unlocked ? '#f8fafc' : '#64748b';
    ctx.font = 'bold 13px Prompt, sans-serif';
    ctx.fillText((b.unlocked ? '✓ ' : '🔒 ') + b.name, curBadgeX + 97, badgeY + 23);
    curBadgeX += 210;
  });

  // 9. Bottom Section: QR Code & Event Call to Action
  const bottomY = 1545;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  roundRect(ctx, 140, bottomY, 800, 245, 26);
  ctx.fill();
  ctx.strokeStyle = `${rarityBorderColor}66`;
  ctx.lineWidth = 2;
  roundRect(ctx, 140, bottomY, 800, 245, 26);
  ctx.stroke();

  // QR Code generation
  const qrData = isSocialMode
    ? `${window.location.origin}/?ref=${card.cardId}`
    : card.qrPayload;

  try {
    const qrUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: { dark: '#0a0512', light: '#ffffff' },
    });
    const qrImg = await loadImage(qrUrl);
    if (qrImg) {
      // White container for QR
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 170, bottomY + 22, 200, 200, 18);
      ctx.fill();
      ctx.drawImage(qrImg, 175, bottomY + 27, 190, 190);
    }
  } catch (err) {
    console.error('QR generation error in story canvas', err);
  }

  // Text next to QR
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px Prompt, sans-serif';
  ctx.fillText('สแกนค้นหาผี & ร่วมวิ่งแฟนซี', 400, bottomY + 62);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '19px Prompt, sans-serif';
  ctx.fillText('• 350 ท่านแรกรับเหรียญ Finisher & คูปองอาหารฟรี', 400, bottomY + 102);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = '18px Prompt, sans-serif';
  ctx.fillText('• คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร จ.พิษณุโลก', 400, bottomY + 138);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 18px Prompt, sans-serif';
  ctx.fillText('✓ วิ่งฟรีไม่มีค่าใช้จ่าย หรือสั่งเสื้อที่ระลึก 300 บาท', 400, bottomY + 174);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px Prompt, sans-serif';
  ctx.fillText('#FSSGhostRun2026  #ThaiGhostCard  #NaresuanUniversity', 400, bottomY + 208);

  // 10. Bottom Disclaimer (Story Safe footer)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px Prompt, sans-serif';
  ctx.fillText('บันทึกรูปภาพเพื่อนำไปลง Instagram / Facebook Stories ได้ทันที', 540, 1835);

  return canvas;
};

/**
 * Converts canvas to Blob and File
 */
export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  filename: string
): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], filename, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
};

/**
 * Executes real Story sharing via Web Share API with File
 */
export const shareToStoryDirectly = async (
  card: GhostCard,
  options: StoryGenerateOptions = {}
): Promise<{ success: boolean; method: 'web-share' | 'download'; message?: string }> => {
  const species = THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.krasue;
  const ghostHeadline =
    species.name.startsWith('ผี') || species.name.startsWith('นาง')
      ? `คุณคือ${species.name}`
      : `คุณคือผี${species.name}`;

  const canvas = await generateGhostStoryCanvas(card, options);
  const filename = `FSS-Story-9x16-${card.cardId}-${species.name}.png`;
  const file = await canvasToFile(canvas, filename);

  const shareTitle = `${ghostHeadline} (ระดับ ${card.rarity}) - FSS Halloween Run 2026`;
  const shareText = `🎃 ฉันได้การ์ด "${species.name}" (ระดับ ${card.rarity} - LV.${card.level}) ในงาน FSS Halloween Fancy Run 2026! มาร่วมค้นหาผีประจำตัวคุณแล้วเจอกัน 31 ต.ค. นี้ ณ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร: ${window.location.origin}`;

  // Check if Web Share API with files is supported
  const nav = navigator as any;
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: shareTitle,
        text: shareText,
      });
      return { success: true, method: 'web-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'web-share', message: 'ยกเลิกการแชร์' };
      }
      // Fallback to download
    }
  }

  // Fallback: Download file directly
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Copy caption to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
  } catch {
    // Ignore clipboard error
  }

  return {
    success: true,
    method: 'download',
    message: 'บันทึกรูปภาพขนาด 9:16 ลงเครื่องและคัดลอกแคปชันเรียบร้อยแล้ว พร้อมเปิดลง Story ได้ทันที!',
  };
};
