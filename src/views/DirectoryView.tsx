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

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-mono shadow-sm">
            ผู้สมัครทั้งหมด: <b className="text-[#DC2626] font-bold">{runners.length}</b> คน
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-mono flex items-center gap-1.5 shadow-sm">
            <Shirt className="w-3.5 h-3.5 text-amber-600" />
            <span>
              สั่งเสื้อ: <b className="text-slate-900 font-bold">{runnersWithShirt.length}</b> คน ({totalShirtsCount} ตัว)
            </span>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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
              <option value="ordered">👕 สั่งเสื้อแล้ว ({runnersWithShirt.length} คน)</option>
              <option value="not_ordered">ไม่ได้สั่งเสื้อ (วิ่งฟรี)</option>
              <option value="paid">✓ ชำระเงินแล้ว</option>
              <option value="pending">รอตรวจสอบสลิป</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">สถานะเช็กอินวันงาน</label>
            <select
              value={filterCheckin}
              onChange={(e) => setFilterCheckin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">เช็กอินทั้งหมด</option>
              <option value="checked_in">เช็กอินแล้ว ✓</option>
              <option value="not_checked_in">ยังไม่เช็กอิน</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ระดับของการ์ดผี</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              <option value="all">ทุกระดับการ์ด</option>
              <option value="1">LV.1 วิญญาณตื่น</option>
              <option value="2">LV.2 ปลดผนึกพลัง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="fastwork-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 text-xs font-bold">
              <tr>
                <th className="py-3.5 px-4">BIB / รหัส</th>
                <th className="py-3.5 px-4">ชื่อนักวิ่ง</th>
                <th className="py-3.5 px-4">ผีประจำตัว</th>
                <th className="py-3.5 px-4">Card ID</th>
                <th className="py-3.5 px-4">ข้อมูลสั่งเสื้อ</th>
                <th className="py-3.5 px-4">ระดับการ์ด</th>
                <th className="py-3.5 px-4">เช็กอิน</th>
                <th className="py-3.5 px-4 text-center">ดูการ์ด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRunners.length > 0 ? (
                filteredRunners.map((runner) => {
                  const card = cards.find((c) => c.cardId === runner.cardId);
                  const species = card ? THAI_GHOSTS[card.speciesId] : null;
                  const order = getRunnerOrder(runner);

                  return (
                    <tr key={runner.regId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] whitespace-nowrap">
                        {runner.bibNumber || (
                          <span className="text-slate-400 font-normal">ซื้อเสื้อ</span>
                        )}
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

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {card ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                              card.level === 3
                                ? 'bg-amber-100 text-amber-800'
                                : card.level === 2
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
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
                          <span className="text-[#00B67A] font-semibold flex items-center gap-1 text-xs">
                            <CheckCircle className="w-3.5 h-3.5" /> เช็กอินแล้ว
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5" /> ยังไม่เช็กอิน
                          </span>
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
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
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
                  <span className="font-mono text-slate-900">{previewOrder.phone}</span>
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

              {previewOrder.slipImage && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    สลิปหลักฐานการโอนเงิน:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-60 bg-slate-50 flex items-center justify-center p-2">
                    <img
                      src={previewOrder.slipImage}
                      alt="Slip"
                      className="max-h-56 object-contain rounded"
                    />
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
                  BIB: <b className="text-[#DC2626] font-mono">{previewRunner.bibNumber || '-'}</b> &middot; Card ID: <b className="font-mono">{previewRunner.cardId}</b>
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
                  <span className="text-slate-500 block text-xs">สถานะเช็กอิน:</span>
                  <span className={`font-bold ${previewRunner.checkedIn ? 'text-[#00B67A]' : 'text-slate-500'}`}>
                    {previewRunner.checkedIn ? '✓ เช็กอินแล้ว' : 'ยังไม่เช็กอิน'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Card Modal */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">การ์ดผี {previewCard.cardId}</h3>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GhostCardView card={previewCard} compact={true} />
          </div>
        </div>
      )}
    </div>
  );
};
