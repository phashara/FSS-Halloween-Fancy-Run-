import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  Users,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  Lock,
  CreditCard,
  Ghost,
  Eye,
  X,
  Shirt,
  Package,
  FileText,
  AlertTriangle,
  DollarSign,
  Truck,
  User,
  GraduationCap,
  Building2,
  Phone,
  Calendar,
  HeartPulse,
  Share2,
  Download,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard, RunnerRegistration, ShirtOrder } from '../types';
import { GhostCardView } from '../components/GhostCardView';
import { EditableText } from '../components/EditableText';
import { REALISTIC_GHOST_ASSETS } from '../components/RealisticGhostPortrait';

export const DirectoryView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { runners, cards, orders, ghostSpeciesList, adminUser } = useEventContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'runners' | 'orders'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterShirt, setFilterShirt] = useState<string>('all');
  const [previewCard, setPreviewCard] = useState<GhostCard | null>(null);
  const [previewOrder, setPreviewOrder] = useState<ShirtOrder | null>(null);
  const [previewRunner, setPreviewRunner] = useState<RunnerRegistration | null>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState<boolean>(false);

  // Mask phone number for public privacy
  const maskPhone = (phone: string) => {
    if (!phone) return '-';
    if (adminUser?.isLoggedIn) return phone;
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `${clean.slice(0, 3)}-xxx-${clean.slice(7)}`;
    }
    if (clean.length >= 7) {
      return `${clean.slice(0, 3)}***${clean.slice(-3)}`;
    }
    return phone;
  };

  // High-Resolution 9:16 Vertical Card Download Generator (1080x1920 Full HD Mobile/Story)
  const handleDownloadCard = async (card: GhostCard) => {
    setIsDownloadingCard(true);
    try {
      const species =
        ghostSpeciesList?.find((g) => g?.id === card?.speciesId) ||
        THAI_GHOSTS[card?.speciesId] ||
        THAI_GHOSTS.pret;

      const ghostHeadline =
        (species?.name || '').startsWith('ผี') || (species?.name || '').startsWith('นาง')
          ? `คุณคือ${species?.name || 'ผีไทย'}`
          : `คุณคือผี${species?.name || 'ไทย'}`;

      let qrDataUrl = '';
      if (card.qrPayload) {
        try {
          qrDataUrl = await QRCode.toDataURL(card.qrPayload, {
            width: 240,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (qrErr) {
          console.warn('QR code generation notice:', qrErr);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 1. Background Gradient (Dark Fantasy Cinema)
        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, '#1c132b');
        grad.addColorStop(0.35, '#100a1c');
        grad.addColorStop(1, '#07040d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. Ambient Glow & Outer 9:16 Border
        const borderColor =
          card.rarity === 'Legendary'
            ? '#f59e0b'
            : card.rarity === 'Epic'
            ? '#a855f7'
            : card.rarity === 'Rare'
            ? '#3b82f6'
            : '#64748b';

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(25, 25, 1030, 1870);

        // Subtle inner framing line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(38, 38, 1004, 1844);

        // 3. Top Banner (Full Width Header)
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 28px "Sarabun", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🎃 FSS HALLOWEEN RUN 2026', 60, 85);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px "Sarabun", sans-serif';
        ctx.fillText('THAI GHOST COLLECTION • 9:16 EDITION', 60, 115);

        // Rarity Tag on Top Right
        ctx.textAlign = 'right';
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 24px "Sarabun", sans-serif';
        ctx.fillText(`[ ${card.rarity.toUpperCase()} ]`, 1020, 95);

        // 4. Ghost Portrait Frame (Large 9:16 Centered Frame)
        const frameX = 60;
        const frameY = 145;
        const frameW = 960;
        const frameH = 960;

        ctx.fillStyle = '#0b0614';
        ctx.fillRect(frameX, frameY, frameW, frameH);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(frameX, frameY, frameW, frameH);

        const activeImgUrl =
          card.customImageUrl ||
          species.customImageUrl ||
          REALISTIC_GHOST_ASSETS[card.speciesId]?.photoUrl;

        if (activeImgUrl) {
          try {
            const ghostImg = new Image();
            ghostImg.crossOrigin = 'anonymous';
            ghostImg.src = activeImgUrl;
            await new Promise((resolve) => {
              ghostImg.onload = resolve;
              ghostImg.onerror = resolve;
            });

            if (ghostImg.complete && ghostImg.naturalWidth > 0) {
              const imgW = ghostImg.naturalWidth;
              const imgH = ghostImg.naturalHeight;
              const imgRatio = imgW / imgH;
              const frameRatio = frameW / frameH;

              let drawW = frameW;
              let drawH = frameH;
              let drawX = frameX;
              let drawY = frameY;

              // Exact contain calculation: 100% of the uploaded file is visible without cutting off any edges
              if (imgRatio > frameRatio) {
                drawW = frameW;
                drawH = frameW / imgRatio;
                drawX = frameX;
                drawY = frameY + (frameH - drawH) / 2;
              } else {
                drawH = frameH;
                drawW = frameH * imgRatio;
                drawX = frameX + (frameW - drawW) / 2;
                drawY = frameY;
              }

              ctx.drawImage(ghostImg, 0, 0, imgW, imgH, drawX, drawY, drawW, drawH);
            }
          } catch (imgErr) {
            console.warn('Canvas ghost image draw error:', imgErr);
          }
        }

        // Species Label at bottom of image
        ctx.fillStyle = 'rgba(11, 6, 20, 0.88)';
        ctx.fillRect(frameX, frameY + frameH - 90, frameW, 90);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 34px "Sarabun", sans-serif';
        ctx.fillText(species.name, frameX + frameW / 2, frameY + frameH - 48);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '18px "Sarabun", sans-serif';
        ctx.fillText(`ธาตุประจำตัว: ${species.element}`, frameX + frameW / 2, frameY + frameH - 18);

        // 5. Middle: Ghost Headline & Lore
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 20px "Sarabun", sans-serif';
        ctx.fillText('⚡ ผีประจำตัวของคุณ', 540, 1150);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 50px "Sarabun", sans-serif';
        ctx.fillText(ghostHeadline, 540, 1210);

        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 28px "Sarabun", sans-serif';
        ctx.fillText(species.title || '', 540, 1260);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 22px "Sarabun", sans-serif';
        ctx.fillText(`“${species.tagline || ''}”`, 540, 1305);

        // 6. Owner Info Card Container
        const infoBoxX = 60;
        const infoBoxY = 1345;
        const infoBoxW = 960;
        const infoBoxH = 350;

        ctx.fillStyle = '#140c24';
        ctx.fillRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH);

        // Owner Details
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px "Sarabun", sans-serif';
        ctx.fillText('เจ้าของการ์ด:', infoBoxX + 35, infoBoxY + 65);
        ctx.fillText('รหัสการ์ด (Card ID):', infoBoxX + 35, infoBoxY + 130);
        ctx.fillText('ระดับพลัง (Card Level):', infoBoxX + 35, infoBoxY + 195);
        ctx.fillText('สถานะการยืนยัน:', infoBoxX + 35, infoBoxY + 260);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Sarabun", sans-serif';
        ctx.fillText(card.nickname || 'ผู้สมัคร', infoBoxX + 270, infoBoxY + 65);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 30px monospace';
        ctx.fillText(card.cardId, infoBoxX + 270, infoBoxY + 130);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px "Sarabun", sans-serif';
        ctx.fillText(`LV.${card.level || 1} • ปลดผนึกพลังวิญญาณ`, infoBoxX + 270, infoBoxY + 195);

        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 24px "Sarabun", sans-serif';
        ctx.fillText('✓ ลงทะเบียนและออกการ์ดอย่างเป็นทางการ', infoBoxX + 270, infoBoxY + 260);

        // QR Code on right side of info box
        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          await new Promise((res) => {
            qrImg.onload = res;
            qrImg.onerror = res;
          });
          const qrX = infoBoxX + infoBoxW - 200;
          const qrY = infoBoxY + 45;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(qrX - 10, qrY - 10, 180, 180);
          ctx.drawImage(qrImg, qrX, qrY, 160, 160);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px "Sarabun", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Official QR Code', qrX + 80, qrY + 195);
        }

        // Stats summary bar inside info box
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '19px "Sarabun", sans-serif';
        ctx.fillText(`ความเร็ว: ${card.stats?.speed || 85} | ความหลอน: ${card.stats?.spookiness || 85} | พลังแฝง: ${card.stats?.latentPower || 85}`, infoBoxX + 35, infoBoxY + 315);

        // 7. Event Callout Banner (Bottom)
        const eventBoxX = 60;
        const eventBoxY = 1730;
        const eventBoxW = 960;
        const eventBoxH = 130;
        ctx.fillStyle = 'rgba(69, 10, 10, 0.75)';
        ctx.fillRect(eventBoxX, eventBoxY, eventBoxW, eventBoxH);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(eventBoxX, eventBoxY, eventBoxW, eventBoxH);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 36px "Sarabun", sans-serif';
        ctx.fillText('🏁 แล้วพบกันในคืนปล่อยผี 31 ตุลาคม 2569', 540, eventBoxY + 75);

        // Save & Download
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `FSS-Ghost-Card-9x16-${card.cardId}-${species.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloadingCard(false);
    }
  };

  // Helper to find shirt order for a runner
  const getRunnerOrder = (runner: RunnerRegistration): ShirtOrder | undefined => {
    if (runner.shirtOrderId) {
      const found = orders.find((o) => o.orderId === runner.shirtOrderId);
      if (found) return found;
    }
    return orders.find((o) => o.cardId === runner.cardId);
  };

  // Filter runners
  const filteredRunners = runners.filter((runner) => {
    const card = cards.find((c) => c.cardId === runner.cardId);
    const order = getRunnerOrder(runner);
    const searchLower = searchTerm.trim().toLowerCase();

    if (searchLower) {
      const matchName =
        runner.fullName.toLowerCase().includes(searchLower) ||
        (runner.nameThai && runner.nameThai.toLowerCase().includes(searchLower)) ||
        (runner.nameEng && runner.nameEng.toLowerCase().includes(searchLower));
      const matchNickname = runner.nickname.toLowerCase().includes(searchLower);
      const matchBib = runner.bibNumber?.toLowerCase().includes(searchLower);
      const matchCardId = runner.cardId.toLowerCase().includes(searchLower);
      const matchPhoneEnd = runner.phone.endsWith(searchLower);
      const matchOrderId = order?.orderId.toLowerCase().includes(searchLower);
      const matchStudentId = runner.studentId?.toLowerCase().includes(searchLower);
      const matchFaculty = runner.faculty?.toLowerCase().includes(searchLower);
      const matchDept = runner.staffDepartment?.toLowerCase().includes(searchLower);
      if (
        !matchName &&
        !matchNickname &&
        !matchBib &&
        !matchCardId &&
        !matchPhoneEnd &&
        !matchOrderId &&
        !matchStudentId &&
        !matchFaculty &&
        !matchDept
      ) {
        return false;
      }
    }

    if (filterType !== 'all' && runner.regType !== filterType) {
      return false;
    }

    if (filterShirt === 'ordered' && !order) return false;
    if (filterShirt === 'not_ordered' && order) return false;
    if (filterShirt === 'paid' && (!order || (order.status !== 'paid' && order.status !== 'claimed'))) return false;
    if (filterShirt === 'pending' && (!order || order.status !== 'pending_verification')) return false;

    return true;
  });

  // Filter all shirt orders for standalone & runner orders
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (searchLower) {
      const matchName = order.customerName.toLowerCase().includes(searchLower);
      const matchPhone = order.phone.toLowerCase().includes(searchLower) || order.phone.endsWith(searchLower);
      const matchOrderId = order.orderId.toLowerCase().includes(searchLower);
      const matchCardId = order.cardId?.toLowerCase().includes(searchLower);
      const matchEmail = order.email?.toLowerCase().includes(searchLower);
      if (!matchName && !matchPhone && !matchOrderId && !matchCardId && !matchEmail) {
        return false;
      }
    }

    if (filterShirt === 'paid' && order.status !== 'paid' && order.status !== 'claimed') return false;
    if (filterShirt === 'pending' && order.status !== 'pending_verification') return false;

    return true;
  });

  // Calculate runner display name based on preference
  const getRunnerDisplayName = (runner: RunnerRegistration) => {
    switch (runner.displayNameType) {
      case 'nickname':
        return runner.nickname || runner.fullName;
      case 'fullName':
        return runner.fullName;
      case 'teamName':
        return runner.teamName ? `${runner.teamName} (${runner.nickname})` : runner.nickname;
      case 'anonymous':
        return 'วิญญาณนิรนาม 👻';
      default:
        return runner.nickname;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> DIRECTORY & SEARCH
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            <EditableText
              sectionKey="directory"
              field="title"
              fallbackText="ตรวจสอบรายชื่อผู้เข้าร่วมงาน"
            />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            <EditableText
              sectionKey="directory"
              field="subtitle"
              fallbackText="ค้นหารายชื่อ ตรวจสอบสถานะ BIB การ์ดผี และการเช็กอินวันงาน"
            />
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="fastwork-card p-5 bg-white space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วย ชื่อจริง, ชื่อเล่น, BIB, Card ID (FSS26-xxxx), รหัสออเดอร์ (ORD-xxxx), หรือ 4 ตัวท้ายเบอร์โทร..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ประเภทการสมัคร</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">ทุกประเภท</option>
              <option value="RUN_FREE">วิ่งฟรี (RUN_FREE)</option>
              <option value="RUN_AND_SHIRT">วิ่ง + สั่งเสื้อ (RUN_AND_SHIRT)</option>
              <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ข้อมูลการสั่งเสื้อ</label>
            <select
              value={filterShirt}
              onChange={(e) => setFilterShirt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">สถานะสั่งเสื้อทั้งหมด</option>
              <option value="ordered">👕 สั่งเสื้อแล้ว</option>
              <option value="not_ordered">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</option>
              <option value="paid">✓ ชำระเงินแล้ว</option>
              <option value="pending">รอตรวจสอบสลิป</option>
            </select>
          </div>
        </div>
      </div>

      {/* Smart View Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveViewTab('all')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeViewTab === 'all'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ✨ ทั้งหมด ({filteredRunners.length + filteredOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('runners')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewTab === 'runners'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> ผู้สมัครวิ่ง ({filteredRunners.length} คน)
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('orders')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
            activeViewTab === 'orders'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Shirt className="w-4 h-4" /> คำสั่งซื้อเสื้อที่ระลึก ({filteredOrders.length} รายการ)
        </button>
      </div>

      {/* SHIRT ORDERS TABLE (Shown when on 'orders' tab or 'all' tab with orders) */}
      {(activeViewTab === 'orders' || (activeViewTab === 'all' && filteredOrders.length > 0)) && (
        <div className="fastwork-card overflow-hidden bg-white space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#DC2626]" /> รายการสั่งซื้อเสื้อที่ระลึก ({filteredOrders.length} รายการ)
            </h3>
            <span className="text-xs text-slate-500">
              ค้นหาด้วยชื่อ, เบอร์โทร, หรือรหัส Order เพื่อตรวจสอบสถานะสลิป
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 text-xs font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">ผู้สั่งซื้อ</th>
                  <th className="py-3 px-4">จำนวน & ไซซ์</th>
                  <th className="py-3 px-4">ยอดรวม</th>
                  <th className="py-3 px-4">สถานะการชำระเงิน</th>
                  <th className="py-3 px-4 text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] whitespace-nowrap">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {maskPhone(order.phone)} {adminUser?.isLoggedIn && order.email ? `• ${order.email}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900">
                          {order.quantity} ตัว (ไซซ์: {order.sizes && order.sizes.length > 0 ? order.sizes.join(', ') : order.size})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ฿{(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            order.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'claimed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {order.status === 'paid'
                            ? '✓ ชำระเงินเรียบร้อย'
                            : order.status === 'claimed'
                            ? '✓ รับเสื้อแล้ว'
                            : order.status === 'pending_verification'
                            ? 'รอตรวจสอบสลิป'
                            : 'รอชำระเงิน'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#DC2626] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      ไม่พบคำสั่งซื้อเสื้อที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Directory Table (Runners) */}
      {(activeViewTab === 'runners' || activeViewTab === 'all') && (
        <div className="fastwork-card overflow-hidden bg-white space-y-3 p-5">
          {activeViewTab === 'all' && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#DC2626]" /> รายชื่อผู้สมัครวิ่ง ({filteredRunners.length} คน)
              </h3>
              <span className="text-xs text-slate-500">
                ข้อมูล BIB, การ์ดผี, และสถานะการสมัคร
              </span>
            </div>
          )}

          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-xs sm:text-sm text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 text-xs font-bold">
                <tr>
                  <th className="py-3.5 px-4">รหัสลงทะเบียน</th>
                  <th className="py-3.5 px-4">ชื่อนักวิ่ง</th>
                  <th className="py-3.5 px-4">ผีประจำตัว</th>
                  <th className="py-3.5 px-4">Card ID</th>
                  <th className="py-3.5 px-4">ข้อมูลสั่งเสื้อ</th>
                  <th className="py-3.5 px-4 text-center">ดูการ์ด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRunners.length > 0 ? (
                  filteredRunners.map((runner) => {
                    const card = cards.find((c) => c.cardId === runner.cardId);
                    const species = card ? (THAI_GHOSTS[card.speciesId] || THAI_GHOSTS.pret) : null;
                    const order = getRunnerOrder(runner);

                    return (
                      <tr key={runner.regId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] whitespace-nowrap">
                          {runner.regId}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setPreviewRunner(runner)}
                            className="text-left group hover:text-[#DC2626] transition-colors"
                            title="คลิกเพื่อดูข้อมูลผู้สมัคร"
                          >
                            <div className="font-bold text-slate-900 group-hover:text-[#DC2626] flex items-center gap-2">
                              <span>{getRunnerDisplayName(runner)}</span>
                              {runner.nickname && runner.displayNameType !== 'nickname' && (
                                <span className="text-xs text-slate-500 font-medium">
                                  ({runner.nickname})
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {runner.participantCategory && (
                                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                  {runner.participantCategory === 'student'
                                    ? `นิสิตปี ${runner.studentYear || '-'}`
                                    : runner.participantCategory === 'alumni'
                                    ? 'ศิษย์เก่า'
                                    : runner.participantCategory === 'staff'
                                    ? 'บุคลากร'
                                    : 'บุคคลทั่วไป'}
                                </span>
                              )}
                              {runner.organization && (
                                <span className="text-xs text-slate-500">
                                  {runner.organization}
                                </span>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {species ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-900 text-xs sm:text-sm">
                              <span>👻</span>
                              <span>{species.name}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap text-xs">
                          {runner.cardId}
                        </td>

                        {/* Shirt Order Info Column */}
                        <td className="py-3.5 px-4 min-w-[200px]">
                          {order ? (
                            <button
                              type="button"
                              onClick={() => setPreviewOrder(order)}
                              className="text-left w-full hover:bg-slate-100 p-2 rounded-xl border border-slate-200 bg-slate-50 transition-all cursor-pointer"
                              title="คลิกเพื่อดูรายละเอียดคำสั่งซื้อและสลิป"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1">
                                  <Shirt className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                                  <span>ไซซ์ {order.size}</span>
                                  <span className="text-slate-500">({order.quantity} ตัว)</span>
                                </span>
                                <span className="text-xs font-mono text-[#DC2626] font-bold">
                                  ฿{order.totalAmount}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    order.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : order.status === 'claimed'
                                      ? 'bg-red-100 text-red-800'
                                      : order.status === 'pending_verification'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {order.status === 'paid'
                                    ? '✓ ชำระแล้ว'
                                    : order.status === 'claimed'
                                    ? '✓ รับแล้ว'
                                    : order.status === 'pending_verification'
                                    ? 'รอตรวจสลิป'
                                    : 'รอชำระ'}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {order.deliveryMethod === 'pickup_event' ? 'รับหน้างาน' : 'จัดส่ง'}
                                </span>
                              </div>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {card && (
                            <button
                              type="button"
                              onClick={() => setPreviewCard(card)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#DC2626] text-slate-700 hover:text-white transition-colors"
                              title="ดูการ์ดผี"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      {runners.length === 0 ? (
                        <div className="space-y-1.5">
                          <p className="font-bold text-slate-700 text-sm">ยังไม่มีข้อมูลผู้สมัครในระบบ</p>
                          <p className="text-slate-400">เมื่อมีผู้สมัครวิ่งหรือสั่งซื้อเสื้อ รายชื่อจะปรากฏที่นี่ทันทีแบบ Real-time</p>
                        </div>
                      ) : (
                        'ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไขการค้นหา'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shirt Order Detail Modal */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewOrder(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    รายละเอียดคำสั่งซื้อ #{previewOrder.orderId}
                  </h3>
                  <p className="text-xs text-slate-500">Card ID: {previewOrder.cardId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-xs">ผู้สั่งซื้อ:</span>
                  <span className="font-bold text-slate-900">{previewOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">เบอร์โทร:</span>
                  <span className="font-mono text-slate-900">{maskPhone(previewOrder.phone)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">จำนวนและไซซ์:</span>
                  <span className="font-bold text-[#DC2626]">
                    {previewOrder.quantity} ตัว (
                    {previewOrder.sizes && previewOrder.sizes.length > 0
                      ? previewOrder.sizes.join(', ')
                      : previewOrder.size}
                    )
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ยอดรวม:</span>
                  <span className="font-bold text-[#DC2626] font-mono text-base">
                    ฿{previewOrder.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Slip Security: Only logged-in Admins can view actual slip image */}
              {adminUser?.isLoggedIn && previewOrder.slipImage ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">
                      สลิปหลักฐานการโอนเงิน (เฉพาะแอดมิน):
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      ADMIN VERIFIED
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50 flex items-center justify-center p-2">
                    <img
                      src={previewOrder.slipImage}
                      alt="Slip"
                      className="max-h-56 object-contain rounded"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      🔒 แนบหลักฐานสลิปโอนเงินเรียบร้อยแล้ว
                    </span>
                    <span className="text-emerald-700 leading-relaxed">
                      เพื่อความปลอดภัยและการคุ้มครองข้อมูลส่วนบุคคล (PDPA) รูปภาพสลิปโอนเงินจะถูกปกป้องและเปิดให้ตรวจสอบเฉพาะเจ้าหน้าที่ฝ่ายการเงินของงานเท่านั้น
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Runner Profile Detail Modal */}
      {previewRunner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewRunner(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 my-8 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {previewRunner.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  รหัสลงทะเบียน: <b className="text-[#DC2626] font-mono">{previewRunner.regId}</b> &middot; Card ID: <b className="font-mono">{previewRunner.cardId}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-xs">ชื่อเล่น:</span>
                  <span className="font-bold text-slate-900">{previewRunner.nickname}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">เพศ / อายุ:</span>
                  <span className="text-slate-900">{previewRunner.gender === 'female' ? 'หญิง' : previewRunner.gender === 'male' ? 'ชาย' : 'ไม่ระบุ'} ({previewRunner.age} ปี)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">สังกัด / คณะ:</span>
                  <span className="text-slate-900 font-medium">{previewRunner.faculty || previewRunner.organization || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ประเภทการสมัคร:</span>
                  <span className="font-bold text-[#DC2626]">
                    {previewRunner.regType === 'RUN_FREE'
                      ? 'วิ่งฟรี'
                      : previewRunner.regType === 'RUN_AND_SHIRT'
                      ? 'วิ่ง + สั่งเสื้อ'
                      : 'สั่งซื้อเสื้ออย่างเดียว'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">เคยร่วมงาน:</span>
                  <span className="font-semibold text-slate-800">
                    {previewRunner.hasAttendedBefore === 'yes' ? 'เคยร่วมงาน' : 'ครั้งแรก (ไม่เคย)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">สไตล์การแต่งกาย:</span>
                  <span className="font-semibold text-slate-800">
                    {previewRunner.costumeStyle === 'ghost' ? 'ชุดผี (แฟนซี)' : 'ชุดกีฬา'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Card Modal (9:16 Story / Mobile Wallpaper E-Card) */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-[440px] bg-gradient-to-b from-[#181328] via-[#100c1e] to-[#0a0714] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-8 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎃</span>
                <div>
                  <h3 className="font-black text-white text-base">
                    การ์ดผีประจำตัวดิจิทัล (9:16)
                  </h3>
                  <p className="text-xs text-slate-400">Card ID: <span className="text-amber-400 font-mono font-bold">{previewCard.cardId}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 9:16 Vertical Card View */}
            <div className="w-full py-1">
              <GhostCardView card={previewCard} compact={false} aspectRatio="9:16" />
            </div>

            {/* Download Button (9:16 Full HD) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDownloadCard(previewCard)}
                disabled={isDownloadingCard}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
              >
                <Download className="w-5 h-5 text-slate-950" />
                <span>{isDownloadingCard ? 'กำลังสร้างภาพความละเอียดสูง 9:16 Full HD...' : '📥 ดาวน์โหลดการ์ดแนวตั้ง 9:16 (1080x1920)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
