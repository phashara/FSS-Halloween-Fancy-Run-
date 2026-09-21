import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  QrCode,
  CheckCircle,
  Clock,
  Shirt,
  Flame,
  Search,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Eye,
  FileText,
  Award,
  Edit3,
  Cloud,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { OfficerRole, ShirtOrder, HorrorStory, RunnerRegistration } from '../types';
import { THAI_GHOSTS } from '../data/ghosts';
import { TextEditModal } from '../components/TextEditModal';
import { SiteContentSection } from '../types/cms';

export const AdminDashboardView: React.FC<{ onNavigate: (view: any) => void }> = ({
  onNavigate,
}) => {
  const {
    runners,
    cards,
    orders,
    stories,
    activeOfficerRole,
    setActiveOfficerRole,
    approveShirtPayment,
    rejectShirtPayment,
    markShirtClaimed,
    refundShirtOrder,
    approveHorrorStory,
    rejectHorrorStory,
    toggleFeatureStory,
    checkInRunner,
    claimMedal,
    resetToDefaults,
    adminUser,
    isLiveEditMode,
    setIsLiveEditMode,
    siteContent,
    isFirebaseConnected,
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'metrics' | 'checkin' | 'finance' | 'stories' | 'cms'>('checkin');
  const [editingSection, setEditingSection] = useState<SiteContentSection | null>(null);

  // Scanner state
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    runner?: RunnerRegistration;
  } | null>(null);

  // Officer name
  const [officerName, setOfficerName] = useState('เจ้าหน้าที่ FSS-01');

  // Slip preview modal
  const [viewingSlip, setViewingSlip] = useState<string | null>(null);
  const [viewingStory, setViewingStory] = useState<HorrorStory | null>(null);

  // Statistics calculation
  const totalRunners = runners.length;
  const checkedInCount = runners.filter((r) => r.checkedIn).length;
  const checkInRate = totalRunners > 0 ? Math.round((checkedInCount / totalRunners) * 100) : 0;

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'claimed');
  const pendingOrders = orders.filter((o) => o.status === 'pending_verification');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingStories = stories.filter((s) => s.status === 'pending');
  const approvedStories = stories.filter((s) => s.status === 'approved');

  // Handle QR Checkin scan
  const handlePerformCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const res = checkInRunner(scanInput.trim(), officerName);
    setScanResult(res);
    setScanInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Bar: Admin Identity & Role Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white text-2xl shadow-lg">
            🛡️
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              EVENT MANAGEMENT & OPERATIONS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white font-serif">
              Dashboard ผู้ดูแลระบบและเจ้าหน้าที่หน้างาน
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 mb-0.5">สลับบทบาทเจ้าหน้าที่</label>
            <select
              value={activeOfficerRole}
              onChange={(e) => setActiveOfficerRole(e.target.value as OfficerRole)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none"
            >
              <option value="SUPER_ADMIN">👑 Super Admin (ทุกสิทธิ์)</option>
              <option value="OFFICER_REGISTRATION">📋 จุดลงทะเบียน & สแกนเช็กอิน</option>
              <option value="OFFICER_FINANCE">💰 จุดการเงิน & ตรวจสอบสลิป</option>
              <option value="OFFICER_HORROR">👻 ฝ่ายคัดกรองเรื่องสยองขวัญ</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นสำหรับสาธิตใช่หรือไม่?')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูล
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'checkin'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" /> สแกนเช็กอินหน้างาน & จ่ายเสื้อ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'finance'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> ตรวจสอบสลิปค่าเสื้อ
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'stories'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" /> คัดกรองเรื่องสยอง
          {pendingStories.length > 0 && (
            <span className="px-1.5 py-0.2 bg-purple-600 text-white rounded-full text-[10px] font-bold">
              {pendingStories.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> สถิติและภาพรวมกิจกรรม
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'cms'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md'
              : 'text-amber-300 hover:text-white bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          <Edit3 className="w-4 h-4" /> CMS จัดการตัวหนังสือ (Firebase Cloud)
        </button>
      </div>

      {/* TAB 1: CHECK-IN & MERCH SCANNER (Section 16.3) */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Input & Action Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" /> สแกน QR Code หรือกรอก Card ID
                </h3>
                <span className="text-xs text-emerald-400 font-medium">● ระบบพร้อมสแกน</span>
              </div>

              <form onSubmit={handlePerformCheckin} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="สแกนด้วยเครื่องอ่านบาร์โค้ด หรือพิมพ์ เช่น FSS26-00872..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-sm uppercase focus:border-amber-400 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md"
                  >
                    ตรวจสอบ & ยืนยันเช็กอิน
                  </button>

                  {/* Quick sample pickers */}
                  <button
                    type="button"
                    onClick={() => setScanInput('FSS26-00872')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                  >
                    ตัวอย่าง 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanInput('FSS26-00104')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                  >
                    ตัวอย่าง 2
                  </button>
                </div>
              </form>

              {/* Scan Feedback banner */}
              {scanResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 animate-in fade-in ${
                    scanResult.success
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                  }`}
                >
                  {scanResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{scanResult.message}</span>
                    {scanResult.runner && (
                      <span className="text-xs text-slate-300 mt-1 block">
                        ผู้สมัคร: {scanResult.runner.fullName} (BIB: {scanResult.runner.bibNumber || '-'}) | ติดต่อ: {scanResult.runner.phone}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Officer Settings */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>ชื่อเจ้าหน้าที่ประจำจุด:</span>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Quick List of Runners for Checkin & Merch Claim */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>รายชื่อนักวิ่งล่าสุด & สถานะการรับของ</span>
                <span className="text-xs text-amber-400 font-mono">
                  เช็กอินแล้ว: {checkedInCount} / {totalRunners}
                </span>
              </h3>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {runners.map((r) => {
                  const card = cards.find((c) => c.cardId === r.cardId);
                  const order = orders.find((o) => o.orderId === r.shirtOrderId || o.cardId === r.cardId);

                  return (
                    <div
                      key={r.regId}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">
                            {r.bibNumber || 'เสื้ออย่างเดียว'}
                          </span>
                          <span className="font-semibold text-white">{r.fullName}</span>
                          <span className="text-slate-400 font-mono">({r.cardId})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          ประเภท: {r.regType} | ผี: {card ? THAI_GHOSTS[card.speciesId].name : '-'} (LV.{card?.level})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Check-in toggle */}
                        {!r.checkedIn && r.regType !== 'SHIRT_ONLY' ? (
                          <button
                            type="button"
                            onClick={() => checkInRunner(r.cardId, officerName)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                          >
                            เช็กอิน
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">
                            ✓ เช็กอินแล้ว
                          </span>
                        )}

                        {/* Shirt Claim */}
                        {order && (
                          r.shirtClaimed ? (
                            <span className="px-2 py-0.5 bg-blue-950 text-blue-300 rounded text-[10px] font-bold">
                              ✓ รับเสื้อแล้ว
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markShirtClaimed(order.orderId)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Shirt className="w-3 h-3" /> จ่ายเสื้อ
                            </button>
                          )
                        )}

                        {/* Medal Claim */}
                        {r.medalClaimed ? (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded text-[10px] font-bold">
                            ✓ รับเหรียญแล้ว
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => claimMedal(r.regId)}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-[10px] font-bold"
                          >
                            เหรียญ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCE & SLIP VERIFICATION (Section 16.4) */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" /> ตรวจสอบสลิปและคำสั่งซื้อเสื้อ
                </h3>
                <p className="text-xs text-slate-400">
                  เมื่อกด &ldquo;อนุมัติ&rdquo; ระบบจะเพิ่มตรา <b>SHIRT OWNER</b> และอัปเกรด Level การ์ดผีของผู้ซื้อทันที!
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-300">
                  รอตรวจสอบ: <b className="text-amber-400 font-bold">{pendingOrders.length}</b>
                </span>
                <span className="text-slate-300">
                  รายรับรวม: <b className="text-emerald-400 font-bold">฿{totalRevenue.toLocaleString()}</b>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">ลูกค้า</th>
                    <th className="py-2.5 px-3">Card ID</th>
                    <th className="py-2.5 px-3">รายการ</th>
                    <th className="py-2.5 px-3">ยอดชำระ</th>
                    <th className="py-2.5 px-3">สลิป</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{ord.orderId}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500">{ord.phone}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{ord.cardId}</td>
                      <td className="py-3 px-3">
                        ไซซ์ {ord.size} ({ord.quantity} ตัว)
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ฿{ord.totalAmount}
                      </td>
                      <td className="py-3 px-3">
                        {ord.slipImage ? (
                          <button
                            type="button"
                            onClick={() => setViewingSlip(ord.slipImage || null)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> ดูสลิป
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">ไม่มีสลิป</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300'
                              : ord.status === 'claimed'
                              ? 'bg-blue-950 text-blue-300'
                              : ord.status === 'pending_verification'
                              ? 'bg-amber-950 text-amber-300 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status === 'pending_verification' && (
                            <>
                              <button
                                type="button"
                                onClick={() => approveShirtPayment(ord.orderId, officerName)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                              >
                                อนุมัติ & อัป Level
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectShirtPayment(ord.orderId)}
                                className="px-2 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10px]"
                              >
                                ปฏิเสธ
                              </button>
                            </>
                          )}
                          {ord.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => markShirtClaimed(ord.orderId)}
                              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-[10px]"
                            >
                              มอบเสื้อแล้ว
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HORROR STORIES MODERATION (Section 16.5) */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-purple-400" /> ตรวจสอบและอนุมัติเรื่องสยองขวัญ
                </h3>
                <p className="text-xs text-slate-400">
                  เมื่อกด &ldquo;อนุมัติ&rdquo; เรื่องจะแสดงในคลัง 3D และเจ้าของการ์ดจะได้รับตรา <b>STORYTELLER</b> พร้อมอัปเกรด Level ทันที!
                </p>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold">
                รออนุมัติ: {pendingStories.length} เรื่อง
              </span>
            </div>

            <div className="space-y-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{story.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        Card ID: {story.cardId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          story.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : story.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 animate-pulse'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-2">{story.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>เล่าโดย: {story.isAnonymous ? 'วิญญาณนิรนาม' : story.authorNickname}</span>
                      <span>หมวด: {story.category}</span>
                      <span>สถานที่: {story.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingStory(story)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> อ่านฉบับเต็ม
                    </button>

                    {story.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => approveHorrorStory(story.id, officerName)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
                        >
                          อนุมัติ & ให้ตรา
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectHorrorStory(story.id)}
                          className="px-2.5 py-1.5 bg-rose-950 text-rose-300 rounded-xl text-xs"
                        >
                          ปฏิเสธ
                        </button>
                      </>
                    )}

                    {story.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => toggleFeatureStory(story.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
                          story.featuredOnHome
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        ★ {story.featuredOnHome ? 'ปักหมุดแล้ว' : 'ปักหมุด'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS & ANALYTICS (Section 16.2) */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">ยอดผู้สมัครทั้งหมด</span>
              <p className="text-3xl font-black text-white font-mono">{totalRunners}</p>
              <span className="text-[10px] text-emerald-400">เป้าหมาย: 1,000 คน</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">เช็กอินหน้างานแล้ว</span>
              <p className="text-3xl font-black text-amber-400 font-mono">{checkedInCount}</p>
              <span className="text-[10px] text-slate-400">คิดเป็น {checkInRate}%</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">ยอดสั่งเสื้อ</span>
              <p className="text-3xl font-black text-orange-400 font-mono">{totalOrders}</p>
              <span className="text-[10px] text-slate-400">ชำระแล้ว: {paidOrders.length}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">รายรับจากเสื้อ</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">฿{totalRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400">300฿ ต่อตัว</span>
            </div>
          </div>

          {/* Ghost Distribution Overview */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              สถิติการกระจายของ 12 ผีไทยในหมู่นักวิ่ง
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {(Object.keys(THAI_GHOSTS) as Array<keyof typeof THAI_GHOSTS>).map((spId) => {
                const count = cards.filter((c) => c.speciesId === spId).length;
                return (
                  <div
                    key={spId}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1"
                  >
                    <span className="text-lg">👻</span>
                    <p className="text-xs font-bold text-slate-200">{THAI_GHOSTS[spId].name}</p>
                    <p className="text-sm font-mono font-bold text-amber-400">{count} คน</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CMS TEXT EDITOR & FIREBASE CLOUD MANAGEMENT */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          {/* Status & Control Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" /> FIREBASE FIRESTORE CLOUD CMS
                </span>
                <h3 className="text-xl font-black text-white font-serif mt-1">
                  จัดการตัวหนังสือและเนื้อหาเว็บไซต์แบบเรียลไทม์
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  แอดมินสามารถแก้ไขข้อความ หัวข้อ คำโปรย และประกาศสำคัญได้ทุกส่วน ข้อมูลจะถูกบันทึกขึ้นคลาวด์ Firebase Firestore และอัปเดตหน้าเว็บทันที
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLiveEditMode(!isLiveEditMode)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isLiveEditMode
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isLiveEditMode ? 'โหมดแก้ไขสด: เปิดใช้งาน (ON)' : 'โหมดแก้ไขสด: ปิด (OFF)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                >
                  ไปหน้าหลักเพื่อแก้ไขสด ↗
                </button>
              </div>
            </div>

            {/* Cloud Status Indicator */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-medium">
                  {isFirebaseConnected ? 'Firebase Firestore เชื่อมต่อแล้ว (Connected)' : 'เชื่อมต่อฐานข้อมูลคลาวด์ Firebase สำเร็จ'}
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                สิทธิ์แอดมิน: <code className="text-amber-300 bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">phasharak</code> (Super Admin)
              </div>
            </div>
          </div>

          {/* CMS Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {Object.values(siteContent).map((section) => (
              <div
                key={section.sectionKey}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {section.sectionKey}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      อัปเดต: {section.updatedAt ? new Date(section.updatedAt).toLocaleTimeString('th-TH') : 'เริ่มต้น'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white font-serif">{section.title}</h4>

                  {/* Fields preview */}
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/60 text-xs">
                    {section.subtitle && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">subtitle:</span>
                        <p className="text-slate-200 line-clamp-2 font-sans font-medium">{section.subtitle}</p>
                      </div>
                    )}
                    {section.tagline && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">tagline:</span>
                        <p className="text-slate-200 line-clamp-2 font-sans font-medium">{section.tagline}</p>
                      </div>
                    )}
                    {section.announcement && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">announcement:</span>
                        <p className="text-slate-200 line-clamp-2 font-sans font-medium">{section.announcement}</p>
                      </div>
                    )}
                    {section.description && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">description:</span>
                        <p className="text-slate-200 line-clamp-2 font-sans font-medium">{section.description}</p>
                      </div>
                    )}
                    {section.details && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">details:</span>
                        <p className="text-slate-200 line-clamp-2 font-sans font-medium">{section.details}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSection(section)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> แก้ไขตัวหนังสือส่วนนี้
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CMS Edit Modal */}
      {editingSection && (
        <TextEditModal
          isOpen={!!editingSection}
          section={editingSection}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* Slip Modal View */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl p-4 text-center">
            <button
              type="button"
              onClick={() => setViewingSlip(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3">รูปสลิปการโอนเงิน</h4>
            <div className="max-h-96 overflow-hidden rounded-xl border border-slate-800">
              <img src={viewingSlip} alt="Payment Slip" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Story Full Modal View */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-left space-y-3">
            <button
              type="button"
              onClick={() => setViewingStory(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs text-amber-400 font-mono">Card ID: {viewingStory.cardId}</span>
            <h3 className="text-lg font-bold text-white">{viewingStory.title}</h3>
            <div className="p-4 rounded-2xl bg-slate-950 text-xs text-slate-200 max-h-72 overflow-y-auto leading-relaxed whitespace-pre-line">
              {viewingStory.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
