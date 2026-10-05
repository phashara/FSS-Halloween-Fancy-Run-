import React, { useState } from 'react';
import {
  Menu,
  X,
  Ghost,
  ShieldAlert,
  ShoppingBag,
  Home,
  Search,
  Flame,
  Lock,
  ChevronRight,
  LogOut,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { AdminLoginModal } from './AdminLoginModal';

export type AppView =
  | 'home'
  | 'collection'
  | 'register'
  | 'shirt'
  | 'directory'
  | 'mycard'
  | 'contact'
  | 'admin';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Navbar: React.FC<Props> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const {
    adminUser,
    logoutAdmin,
    isSyncing,
    syncFromCloud,
    connectionStatus,
    quotaErrorMessage,
    pendingRegistrationInfo,
  } = useEventContext();

  const handleSyncClick = async () => {
    const res = await syncFromCloud();
    setSyncToast(res.message);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string; isPrimary?: boolean }[] = [
    { id: 'home', label: 'หน้าแรก', icon: <Home className="w-4 h-4" /> },
    { id: 'register', label: 'สมัครวิ่ง', icon: <Flame className="w-4 h-4" />, badge: 'ฟรี!' },
    { id: 'shirt', label: 'สั่งซื้อเสื้อ', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'directory', label: 'ค้นหารายชื่อ', icon: <Search className="w-4 h-4" /> },
    { id: 'collection', label: '12 ตำนานผีไทย', icon: <Ghost className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Admin Bar if logged in */}
        {adminUser?.isLoggedIn && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-[11px] font-black">ADMIN</span>
                แอดมิน: {adminUser.username}
              </span>
              <span className="hidden sm:inline text-red-100">
                (สิทธิ์จัดการผู้สมัคร • ตรวจสอบและอนุมัติสลิปโอนเงิน • สรุปสต็อกเสื้อ)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className="px-3 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 font-bold text-xs transition-colors shadow-sm"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  if (currentView === 'admin') {
                    onNavigate('home');
                  }
                }}
                className="px-3 py-1 rounded-lg bg-red-800/90 hover:bg-red-950 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                title="ออกจากระบบแอดมิน"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}

        {/* Cloud Status / Pending Registration Notification Banner */}
        {connectionStatus === 'quota_exhausted' && (
          <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-2 shadow-inner">
            <span>⚠️ Cloud Read Quota Full (กำลังใช้งานข้อมูลสำรองในเครื่อง - ข้อมูลของคุณไม่สูญหาย)</span>
            <span className="text-[10px] bg-amber-900/20 px-2 py-0.5 rounded font-mono">OFFLINE MODE</span>
          </div>
        )}

        {pendingRegistrationInfo && (
          <div className="bg-blue-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-2 shadow-inner">
            <span>⏳ มีรายการสมัครค้างส่งของคุณ ({pendingRegistrationInfo.fullName}) - ระบบจะนำส่งข้อมูลชุดเดิมเมื่อกดส่งอีกครั้ง</span>
            <button
              type="button"
              onClick={() => handleNavClick('register')}
              className="underline hover:text-blue-100 text-xs font-bold cursor-pointer"
            >
              ไปที่หน้าสมัคร
            </button>
          </div>
        )}

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Mark */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                <Ghost className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-red-600 tracking-tight">
                    FSS RUN
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900">
                    2026
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] tracking-wide ml-1">
                    HALLOWEEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Thai Ghost Fancy Run &middot; ม.นเรศวร
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Cloud Direct Sync Button */}
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
                title="ดึงข้อมูลและรูปภาพล่าสุดจาก Cloud ทันที"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                <span className="hidden xl:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Cloud'}</span>
              </button>

              {/* Admin Button */}
              {adminUser?.isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-white transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>แอดมิน ({adminUser.username})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      if (currentView === 'admin') {
                        onNavigate('home');
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    title="ออกจากระบบแอดมิน"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
                  title="เข้าสู่ระบบผู้ดูแล"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}

              {/* Red Primary CTA Button */}
              <button
                type="button"
                onClick={() => handleNavClick('register')}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>สมัครวิ่งทันที</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sync Toast */}
        {syncToast && (
          <div className="bg-emerald-600 text-white py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{syncToast}</span>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-red-50 text-red-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-500">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                <span>{isSyncing ? 'กำลังซิงค์ข้อมูล Cloud...' : '🔄 ซิงค์ข้อมูลและรูปภาพล่าสุดจาก Cloud'}</span>
              </button>

              {adminUser?.isLoggedIn ? (
                <div className="w-full flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-red-600 font-bold text-xs"
                  >
                    <ShieldAlert className="w-4 h-4" /> แดชบอร์ด ({adminUser.username})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      setMobileMenuOpen(false);
                      if (currentView === 'admin') {
                        onNavigate('home');
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-red-600 text-xs font-semibold"
                >
                  <Lock className="w-4 h-4 text-slate-400" /> เข้าสู่ระบบแอดมิน
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => handleNavClick('admin')}
      />
    </>
  );
};
