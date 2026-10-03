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
import { OfficerRole, ShirtOrder, RunnerRegistration } from '../types';
import { THAI_GHOSTS } from '../data/ghosts';
import { TextEditModal } from '../components/TextEditModal';
import { SiteContentSection } from '../types/cms';
import { ShirtDashboard } from '../components/ShirtDashboard';

export const AdminDashboardView: React.FC<{ onNavigate: (view: any) => void }> = ({
  onNavigate,
}) => {
  const {
    runners,
    cards,
    orders,
    activeOfficerRole,
    setActiveOfficerRole,
    approveShirtPayment,
    rejectShirtPayment,
    markShirtClaimed,
    refundShirtOrder,
    checkInRunner,
    claimMedal,
    resetToDefaults,
    adminUser,
    isLiveEditMode,
    setIsLiveEditMode,
    siteContent,
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<
    'metrics' | 'checkin' | 'finance' | 'cms' | 'shirt_dashboard'
  >('checkin');
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

  // Statistics calculation
  const totalRunners = runners.length;
  const checkedInCount = runners.filter((r) => r.checkedIn).length;
  const checkInRate = totalRunners > 0 ? Math.round((checkedInCount / totalRunners) * 100) : 0;

  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'claimed');
  const pendingOrders = orders.filter((o) => o.status === 'pending_verification');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Handle QR Checkin scan
  const handlePerformCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const res = checkInRunner(scanInput.trim(), officerName);
    setScanResult(res);
    setScanInput('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar: Admin Identity & Role Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
              EVENT MANAGEMENT & OPERATIONS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Dashboard ผู้ดูแลระบบและเจ้าหน้าที่หน้างาน
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <select
              value={activeOfficerRole}
              onChange={(e) => setActiveOfficerRole(e.target.value as OfficerRole)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-bold focus:outline-none"
            >
              <option value="SUPER_ADMIN">👑 Super Admin (ทุกสิทธิ์)</option>
              <option value="OFFICER_REGISTRATION">📋 จุดลงทะเบียน & สแกนเช็กอิน</option>
              <option value="OFFICER_FINANCE">💰 จุดการเงิน & ตรวจสอบสลิป</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นสำหรับสาธิตใช่หรือไม่?')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูล
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'checkin'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" /> สแกนเช็กอินหน้างาน & จ่ายเสื้อ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'finance'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'metrics'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> สถิติและภาพรวมกิจกรรม
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shirt_dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'shirt_dashboard'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shirt className="w-4 h-4" /> สรุปยอดสต็อกเสื้อ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'cms'
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'text-[#DC2626] hover:bg-red-50 bg-[#FEF2F2]'
          }`}
        >
          <Edit3 className="w-4 h-4" /> CMS จัดการข้อความ
        </button>
      </div>

      {/* TAB 1: CHECK-IN & MERCH SCANNER */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Input & Action Box */}
          <div className="lg:col-span-6 space-y-4">
            <div className="fastwork-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#DC2626]" /> สแกน QR Code หรือกรอก Card ID
                </h3>
                <span className="text-xs text-[#00B67A] font-semibold">● ระบบพร้อมสแกน</span>
              </div>

              <form onSubmit={handlePerformCheckin} className="space-y-3">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="สแกนบาร์โค้ด หรือพิมพ์ เช่น FSS26-00872..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-sm uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
                  >
                    ตรวจสอบ & ยืนยันเช็กอิน
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanInput('FSS26-00872')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-medium"
                  >
                    ตัวอย่าง 1
                  </button>
                </div>
              </form>

              {/* Scan Feedback banner */}
              {scanResult && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                    scanResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {scanResult.success ? (
                    <CheckCircle className="w-5 h-5 text-[#00B67A] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{scanResult.message}</span>
                    {scanResult.runner && (
                      <span className="text-xs text-slate-600 mt-1 block">
                        ผู้สมัคร: {scanResult.runner.fullName} (BIB: {scanResult.runner.bibNumber || '-'}) | ติดต่อ: {scanResult.runner.phone}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Officer Name Setting */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>ชื่อเจ้าหน้าที่ประจำจุด:</span>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          {/* Quick List of Runners for Checkin */}
          <div className="lg:col-span-6 space-y-4">
            <div className="fastwork-card p-6 bg-white space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center justify-between">
                <span>รายชื่อนักวิ่งล่าสุด & สถานะการรับของ</span>
                <span className="text-xs text-[#DC2626] font-mono font-bold">
                  เช็กอินแล้ว: {checkedInCount} / {totalRunners}
                </span>
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {runners.map((r) => {
                  const card = cards.find((c) => c.cardId === r.cardId);
                  const order = orders.find((o) => o.orderId === r.shirtOrderId || o.cardId === r.cardId);

                  return (
                    <div
                      key={r.regId}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{r.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-500">({r.cardId})</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          BIB: {r.bibNumber || '-'} &middot; {r.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {r.checkedIn ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            ✓ เช็กอินแล้ว
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => checkInRunner(r.cardId, officerName)}
                            className="px-3 py-1 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold shadow-sm"
                          >
                            กดเช็กอิน
                          </button>
                        )}

                        {order && order.status === 'paid' && (
                          <button
                            type="button"
                            onClick={() => markShirtClaimed(order.orderId)}
                            className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200 text-[11px] font-bold"
                          >
                            จ่ายเสื้อ ({order.size})
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

      {/* TAB 2: FINANCE & SLIP APPROVAL */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="fastwork-card p-6 bg-white space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>รายการสั่งซื้อเสื้อทั้งหมด ({orders.length} รายการ)</span>
              <span className="text-xs text-[#DC2626] font-bold">
                รอตรวจสอบ: {pendingOrders.length} รายการ
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">ผู้สั่งซื้อ</th>
                    <th className="py-2.5 px-3">จำนวน/ไซซ์</th>
                    <th className="py-2.5 px-3">ยอดรวม</th>
                    <th className="py-2.5 px-3">สลิป</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.orderId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-[#DC2626]">{ord.orderId}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {ord.customerName}
                        <span className="text-slate-400 block font-normal text-[11px]">{ord.phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        {ord.quantity} ตัว ({ord.sizes?.join(', ') || ord.size})
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#DC2626]">฿{ord.totalAmount}</td>
                      <td className="py-3 px-3">
                        {ord.slipImage ? (
                          <button
                            type="button"
                            onClick={() => setViewingSlip(ord.slipImage || null)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> ดูสลิป
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ไม่มีสลิป</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'claimed'
                              ? 'bg-red-100 text-red-800'
                              : ord.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ord.status === 'paid'
                            ? 'ชำระแล้ว'
                            : ord.status === 'claimed'
                            ? 'รับเสื้อแล้ว'
                            : ord.status === 'pending_verification'
                            ? 'รอตรวจสลิป'
                            : 'รอชำระ'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {ord.status === 'pending_verification' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => approveShirtPayment(ord.orderId)}
                              className="px-2.5 py-1 bg-[#00B67A] hover:bg-emerald-600 text-white rounded text-[11px] font-bold shadow-sm"
                            >
                              อนุมัติ
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectShirtPayment(ord.orderId)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-sm"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ดำเนินการแล้ว</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: METRICS */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="fastwork-card p-5 bg-white space-y-1">
            <span className="text-xs text-slate-500 font-medium">ผู้สมัครวิ่งทั้งหมด</span>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalRunners} คน</p>
          </div>
          <div className="fastwork-card p-5 bg-white space-y-1">
            <span className="text-xs text-slate-500 font-medium">เช็กอินหน้างานแล้ว</span>
            <p className="text-2xl font-black text-[#00B67A] font-mono">{checkedInCount} คน ({checkInRate}%)</p>
          </div>
          <div className="fastwork-card p-5 bg-white space-y-1">
            <span className="text-xs text-slate-500 font-medium">ยอดสั่งซื้อเสื้อทั้งหมด</span>
            <p className="text-2xl font-black text-amber-600 font-mono">{totalOrders} คำสั่งซื้อ</p>
          </div>
          <div className="fastwork-card p-5 bg-white space-y-1">
            <span className="text-xs text-slate-500 font-medium">ยอดเงินชำระสำเร็จ</span>
            <p className="text-2xl font-black text-[#DC2626] font-mono">฿{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* TAB 4: CMS LIVE TEXT EDIT */}
      {activeTab === 'cms' && (
        <div className="fastwork-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">CMS จัดการข้อความเว็บไซต์</h3>
              <p className="text-xs text-slate-500 mt-0.5">แก้ไขข้อความ หัวข้อ คำโปรย และบันทึกลง Firebase</p>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveEditMode(!isLiveEditMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isLiveEditMode
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-[#DC2626] text-white'
              }`}
            >
              {isLiveEditMode ? 'โหมดแก้ไข: ON ✏️' : 'เปิดโหมดแก้ไขหน้าเว็บ'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {siteContent &&
              Object.entries(siteContent).map(([secKey, secVal]) => (
                <button
                  key={secKey}
                  type="button"
                  onClick={() => setEditingSection(secVal)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-900 block">{secVal.sectionName}</span>
                  <span className="text-[11px] text-[#DC2626] font-mono">key: {secKey}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SHIRT INVENTORY & SALES DASHBOARD */}
      {activeTab === 'shirt_dashboard' && (
        <div className="space-y-6">
          <ShirtDashboard orders={orders} />
        </div>
      )}

      {/* Slip Viewer Modal */}
      {viewingSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setViewingSlip(null)}
        >
          <div
            className="relative bg-white p-4 rounded-2xl max-w-md w-full shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">หลักฐานการโอนเงิน (Slip)</h4>
              <button
                type="button"
                onClick={() => setViewingSlip(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              <img src={viewingSlip} alt="Slip" className="max-w-full rounded object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Text Edit Modal */}
      {editingSection && (
        <TextEditModal
          section={editingSection}
          isOpen={true}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};
