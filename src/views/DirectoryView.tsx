import React, { useState } from 'react';
import {
  Search,
  Users,
  Filter,
  CheckCircle,
  Clock,
  Shield,
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
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { THAI_GHOSTS } from '../data/ghosts';
import { GhostCard, RunnerRegistration, ShirtOrder } from '../types';
import { GhostCardView } from '../components/GhostCardView';
import { EditableText } from '../components/EditableText';

export const DirectoryView: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const { runners, cards, orders } = useEventContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCheckin, setFilterCheckin] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterShirt, setFilterShirt] = useState<string>('all');
  const [previewCard, setPreviewCard] = useState<GhostCard | null>(null);
  const [previewOrder, setPreviewOrder] = useState<ShirtOrder | null>(null);
  const [previewRunner, setPreviewRunner] = useState<RunnerRegistration | null>(null);

  // Helper to find shirt order for a runner
  const getRunnerOrder = (runner: RunnerRegistration): ShirtOrder | undefined => {
    if (runner.shirtOrderId) {
      const found = orders.find((o) => o.orderId === runner.shirtOrderId);
      if (found) return found;
    }
    return orders.find((o) => o.cardId === runner.cardId);
  };

  // Aggregations for top badges
  const runnersWithShirt = runners.filter((r) => !!getRunnerOrder(r));
  const totalShirtsCount = runnersWithShirt.reduce((sum, r) => {
    const o = getRunnerOrder(r);
    return sum + (o?.quantity || 1);
  }, 0);

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

    if (filterCheckin === 'checked_in' && !runner.checkedIn) return false;
    if (filterCheckin === 'not_checked_in' && runner.checkedIn) return false;

    if (filterLevel !== 'all' && card && String(card.level) !== filterLevel) {
      return false;
    }

    if (filterShirt === 'ordered' && !order) return false;
    if (filterShirt === 'not_ordered' && order) return false;
    if (filterShirt === 'paid' && (!order || (order.status !== 'paid' && order.status !== 'claimed'))) return false;
    if (filterShirt === 'pending' && (!order || order.status !== 'pending_verification')) return false;

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> RUNNER DIRECTORY & VERIFICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
            <EditableText
              sectionKey="directory"
              field="title"
              fallbackText="ตรวจสอบรายชื่อผู้เข้าร่วมงาน"
            />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            <EditableText
              sectionKey="directory"
              field="subtitle"
              fallbackText="ค้นหารายชื่อ ตรวจสอบสถานะ BIB การ์ดผี และการเช็กอินวันงาน"
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            ผู้สมัครทั้งหมด: <b className="text-amber-400 font-bold">{runners.length}</b> คน
          </div>
          <div className="px-3.5 py-1.5 rounded-2xl bg-orange-950/40 border border-orange-500/30 text-xs text-orange-300 font-mono flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-orange-400" />
            <span>
              สั่งเสื้อ: <b className="text-white font-bold">{runnersWithShirt.length}</b> คน ({totalShirtsCount} ตัว)
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วย ชื่อจริง, ชื่อเล่น, BIB, Card ID (FSS26-xxxx), รหัสออเดอร์ (ORD-xxxx), หรือ 4 ตัวท้ายเบอร์โทร..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ประเภทการสมัคร</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">ทุกประเภท</option>
              <option value="RUN_FREE">วิ่งฟรี (RUN_FREE)</option>
              <option value="RUN_AND_SHIRT">วิ่ง + สั่งเสื้อ (RUN_AND_SHIRT)</option>
              <option value="SHIRT_ONLY">ซื้อเสื้ออย่างเดียว (SHIRT_ONLY)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ข้อมูลการสั่งเสื้อ</label>
            <select
              value={filterShirt}
              onChange={(e) => setFilterShirt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">สถานะสั่งเสื้อทั้งหมด</option>
              <option value="ordered">👕 สั่งเสื้อแล้ว ({runnersWithShirt.length} คน)</option>
              <option value="not_ordered">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</option>
              <option value="paid">✓ ชำระเงินแล้ว</option>
              <option value="pending">รอตรวจสอบสลิป</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">สถานะเช็กอินวันงาน</label>
            <select
              value={filterCheckin}
              onChange={(e) => setFilterCheckin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">เช็กอินทั้งหมด</option>
              <option value="checked_in">เช็กอินแล้ว ✓</option>
              <option value="not_checked_in">ยังไม่เช็กอิน</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ระดับของการ์ดผี</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">ทุกระดับการ์ด</option>
              <option value="1">LV.1 วิญญาณตื่น</option>
              <option value="2">LV.2 ปลดผนึกพลัง</option>
              <option value="3">LV.3 ตำนานสยอง (Ultimate)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">BIB / รหัส</th>
                <th className="py-3 px-4">ชื่อนักวิ่ง</th>
                <th className="py-3 px-4">ผีประจำตัว</th>
                <th className="py-3 px-4">Card ID</th>
                <th className="py-3 px-4">ข้อมูลสั่งเสื้อ (Shirt Order)</th>
                <th className="py-3 px-4">ระดับการ์ด</th>
                <th className="py-3 px-4">เช็กอิน</th>
                <th className="py-3 px-4 text-center">ดูการ์ด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRunners.length > 0 ? (
                filteredRunners.map((runner) => {
                  const card = cards.find((c) => c.cardId === runner.cardId);
                  const species = card ? THAI_GHOSTS[card.speciesId] : null;
                  const order = getRunnerOrder(runner);

                  return (
                    <tr key={runner.regId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {runner.bibNumber || (
                          <span className="text-slate-500 font-normal">ซื้อเสื้อ</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setPreviewRunner(runner)}
                          className="text-left group/name hover:text-amber-400 transition-colors"
                          title="คลิกเพื่อดูข้อมูลผู้สมัครฉบับเต็ม"
                        >
                          <div className="font-semibold text-white group-hover/name:text-amber-400 flex items-center gap-1.5">
                            <span>{getRunnerDisplayName(runner)}</span>
                            {runner.nickname && runner.displayNameType !== 'nickname' && (
                              <span className="text-[11px] text-amber-400/80 font-normal">
                                ({runner.nickname})
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {runner.participantCategory && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
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
                              <span className="text-[10px] text-slate-400">
                                {runner.organization}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {species ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <span>👻</span>
                            <span>{species.name}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">{runner.cardId}</td>
                      
                      {/* Shirt Order Info Column */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        {order ? (
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            className="text-left w-full group/order hover:bg-slate-800/80 p-2 rounded-xl border border-orange-500/20 bg-orange-950/10 transition-all"
                            title="คลิกเพื่อดูรายละเอียดคำสั่งซื้อและสลิป"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-orange-400 text-xs flex items-center gap-1">
                                <Shirt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>ไซซ์ {order.size}</span>
                                <span className="text-slate-400 text-[10px]">({order.quantity} ตัว)</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                ฿{order.totalAmount}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  order.status === 'paid'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                    : order.status === 'claimed'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                    : order.status === 'pending_verification'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                                    : 'bg-slate-800 text-slate-400'
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
                              <span className="text-[10px] text-slate-400">
                                {order.deliveryMethod === 'pickup_event' ? '🏢 รับหน้างาน' : '📦 จัดส่ง'}
                              </span>
                              <span className="text-[9px] text-amber-400/80 group-hover/order:text-amber-300 ml-auto underline">
                                ดูบิล ↗
                              </span>
                            </div>
                          </button>
                        ) : (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            <span>ไม่ได้สั่งเสื้อ (วิ่งฟรี)</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {card ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              card.level === 3
                                ? 'bg-amber-950 text-amber-300 border border-amber-500'
                                : card.level === 2
                                ? 'bg-purple-950 text-purple-300 border border-purple-500'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            LV.{card.level} ({card.rarity})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {runner.checkedIn ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> เช็กอินแล้ว
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> ยังไม่เช็กอิน
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {card && (
                          <button
                            type="button"
                            onClick={() => setPreviewCard(card)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition-colors"
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
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                    ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shirt Order Detail Modal */}
      {previewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewOrder(null)}
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-orange-500/40 rounded-3xl p-6 shadow-2xl space-y-5 my-8 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    รายละเอียดคำสั่งซื้อ #{previewOrder.orderId}
                  </h3>
                  <p className="text-[11px] text-slate-400">Card ID: {previewOrder.cardId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">ผู้สั่งซื้อ</span>
                <p className="font-bold text-white">{previewOrder.customerName}</p>
                <p className="text-slate-400 font-mono">{previewOrder.phone || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">ยอดรวมคำสั่งซื้อ</span>
                <p className="text-lg font-black text-emerald-400 font-mono">
                  ฿{previewOrder.totalAmount?.toLocaleString()}
                </p>
                <p className="text-slate-400">
                  ไซซ์ {previewOrder.size} ({previewOrder.quantity} ตัว)
                </p>
              </div>
            </div>

            {/* Delivery & Status Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> รูปแบบการรับเสื้อ:
                </span>
                <span className="font-bold text-white">
                  {previewOrder.deliveryMethod === 'pickup_event'
                    ? '🏢 รับหน้างาน คณะสังคมศาสตร์ ม.นเรศวร (31 ต.ค. 2569)'
                    : '📦 จัดส่งพัสดุถึงบ้าน'}
                </span>
              </div>
              {previewOrder.shippingAddress && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-0.5">ที่อยู่จัดส่ง:</span>
                  <p className="text-slate-300 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    {previewOrder.shippingAddress}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">สถานะคำสั่งซื้อ:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    previewOrder.status === 'paid'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : previewOrder.status === 'claimed'
                      ? 'bg-blue-950 text-blue-300 border border-blue-600'
                      : previewOrder.status === 'pending_verification'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {previewOrder.status === 'paid'
                    ? '✓ ชำระเงินแล้ว (การ์ดอัปเกรดแล้ว)'
                    : previewOrder.status === 'claimed'
                    ? '✓ รับเสื้อแล้ว'
                    : previewOrder.status === 'pending_verification'
                    ? 'รอตรวจสอบสลิป'
                    : 'รอชำระเงิน'}
                </span>
              </div>
            </div>

            {/* Slip Image (if available) */}
            {previewOrder.slipImage && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">หลักฐานการโอนเงิน (สลิป):</span>
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 max-h-64">
                  <img
                    src={previewOrder.slipImage}
                    alt="สลิปโอนเงิน"
                    className="max-h-60 object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl my-8 text-center">
            <button
              type="button"
              onClick={() => setPreviewCard(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center pt-2">
              <GhostCardView card={previewCard} showModeToggle={false} />
            </div>
          </div>
        </div>
      )}

      {/* Runner Profile Detail Modal */}
      {previewRunner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewRunner(null)}
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 my-8 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    ข้อมูลผู้สมัคร #{previewRunner.bibNumber || previewRunner.cardId}
                  </h3>
                  <p className="text-[11px] text-slate-400">Card ID: {previewRunner.cardId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-4 text-xs">
              {/* 1 - 5 Personal Information */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold block text-[11px]">
                  ข้อมูลส่วนบุคคล (1 - 5)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">1. ชื่อภาษาไทย:</span>
                    <span className="font-bold text-white">{previewRunner.nameThai || previewRunner.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">2. ชื่อภาษาอังกฤษ:</span>
                    <span className="font-medium text-slate-200">{previewRunner.nameEng || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">3. ชื่อเล่น:</span>
                    <span className="font-bold text-amber-300">"{previewRunner.nickname}"</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">4. เพศ:</span>
                    <span>
                      {previewRunner.gender === 'female'
                        ? 'หญิง'
                        : previewRunner.gender === 'male'
                        ? 'ชาย'
                        : 'ไม่ระบุเพศ'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">5. วันเกิด & อายุ:</span>
                    <span className="font-mono text-amber-300">
                      {previewRunner.birthDate || `${previewRunner.birthDay || '-'}/${previewRunner.birthMonth || '-'}/${previewRunner.birthYear || '-'}`}
                    </span>
                    <span className="text-slate-400 ml-2">({previewRunner.age} ปี)</span>
                  </div>
                </div>
              </div>

              {/* 6 Category & Affiliation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold block text-[11px]">
                  6. ประเภทผู้สมัคร & สังกัด
                </span>
                <div className="text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">ประเภท:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                      {previewRunner.participantCategory === 'student'
                        ? 'นิสิต มหาวิทยาลัยนเรศวร'
                        : previewRunner.participantCategory === 'alumni'
                        ? 'ศิษย์เก่า มหาวิทยาลัยนเรศวร'
                        : previewRunner.participantCategory === 'staff'
                        ? 'บุคลากร มหาวิทยาลัยนเรศวร'
                        : 'บุคคลทั่วไป'}
                    </span>
                  </div>
                  {previewRunner.participantCategory === 'student' && (
                    <>
                      <p>
                        <span className="text-slate-500">ชั้นปี:</span>{' '}
                        <span className="font-bold text-white">ปี {previewRunner.studentYear}</span>
                        <span className="text-slate-500 ml-3">รหัสนิสิต:</span>{' '}
                        <span className="font-mono text-amber-300">{previewRunner.studentId || '-'}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">คณะ:</span>{' '}
                        <span className="text-white">{previewRunner.faculty || '-'}</span>
                      </p>
                    </>
                  )}
                  {previewRunner.participantCategory === 'alumni' && (
                    <>
                      <p>
                        <span className="text-slate-500">รหัสนิสิตเดิม:</span>{' '}
                        <span className="font-mono text-amber-300">{previewRunner.studentId || '-'}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">คณะที่จบ:</span>{' '}
                        <span className="text-white">{previewRunner.faculty || '-'}</span>
                      </p>
                    </>
                  )}
                  {previewRunner.participantCategory === 'staff' && (
                    <p>
                      <span className="text-slate-500">สังกัด/หน่วยงาน:</span>{' '}
                      <span className="text-white font-medium">{previewRunner.staffDepartment || '-'}</span>
                    </p>
                  )}
                  {previewRunner.participantCategory === 'general' && (
                    <p>
                      <span className="text-slate-500">หน่วยงาน/จังหวัด:</span>{' '}
                      <span className="text-white">{previewRunner.organization || previewRunner.province || '-'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 7 - 8 Contact & Emergency */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-rose-400 font-bold block text-[11px]">
                  ข้อมูลติดต่อ & กรณีฉุกเฉิน (7 - 8)
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">7. เบอร์โทรผู้สมัคร:</span>
                    <span className="font-mono font-bold text-white">{previewRunner.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">อีเมล:</span>
                    <span className="text-slate-300">{previewRunner.email || '-'}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">8. ผู้ติดต่อฉุกเฉิน:</span>
                    <p className="font-medium text-white">
                      {previewRunner.emergencyContactName} ({previewRunner.emergencyContactRelation || 'ผู้ติดต่อฉุกเฉิน'})
                    </p>
                    <p className="font-mono text-rose-300">{previewRunner.emergencyContactPhone}</p>
                  </div>
                </div>
              </div>

              {/* 9 - 10 Marketing & Shirt */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block">9. รับรู้ข่าวสารจาก:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-bold text-[11px] border border-blue-700">
                    {previewRunner.infoSource || 'Facebook'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block">10. สั่งซื้อเสื้อไหม:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                      previewRunner.interestedInShirt === 'yes' || previewRunner.shirtOrderId
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {previewRunner.interestedInShirt === 'yes' || previewRunner.shirtOrderId
                      ? '⭕ yes (สั่งซื้อเสื้อ)'
                      : '⭕ No (วิ่งฟรี)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewRunner(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
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
