import React, { useState } from 'react';
import {
  Menu,
  X,
  Ghost,
  ShieldAlert,
  UserCheck,
  ShoppingBag,
  BookOpen,
  HelpCircle,
  Phone,
  Home,
  CreditCard,
  Search,
  Edit3,
  Flame,
  Cloud,
  Lock,
  Unlock,
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { AdminLoginModal } from './AdminLoginModal';

export type AppView =
  | 'home'
  | 'register'
  | 'shirt'
  | 'directory'
  | 'mycard'
  | 'horror'
  | 'faq'
  | 'contact'
  | 'admin';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Navbar: React.FC<Props> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const {
    currentCard,
    adminUser,
    isLiveEditMode,
    setIsLiveEditMode,
    isFirebaseConnected,
  } = useEventContext();

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-4 h-4" /> },
    { id: 'register', label: 'สมัครวิ่ง', icon: <Ghost className="w-4 h-4" />, badge: 'ฟรี!' },
    { id: 'shirt', label: 'สั่งซื้อเสื้อ', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'directory', label: 'ตรวจสอบรายชื่อ', icon: <Search className="w-4 h-4" /> },
    { id: 'mycard', label: 'การ์ดผีของฉัน', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'horror', label: 'คลังเรื่องสยอง', icon: <BookOpen className="w-4 h-4" />, badge: '3D' },
    { id: 'faq', label: 'คำถามที่พบบ่อย', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'contact', label: 'ติดต่อเรา', icon: <Phone className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0d0a18]/95 backdrop-blur-md border-b border-amber-500/30 shadow-2xl">
        {/* Admin Bar if logged in */}
        {adminUser?.isLoggedIn && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1 font-bold">
                👑 แอดมิน: <code className="bg-black/25 px-1.5 py-0.5 rounded text-amber-200">{adminUser.username}</code>
              </span>
              <span className="hidden sm:inline text-amber-100">
                (สิทธิ์สูงสุด Super Admin • สแกน QR / อนุมัติสลิป / คัดกรองเรื่องหลอน)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLiveEditMode(!isLiveEditMode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isLiveEditMode
                    ? 'bg-amber-300 text-slate-950 shadow-inner'
                    : 'bg-black/40 text-amber-200 hover:bg-black/60'
                }`}
                title="คลิกเพื่อเปิด/ปิดปุ่มแก้ไขข้อความบนหน้าเว็บ"
              >
                <Edit3 className="w-3 h-3" />
                {isLiveEditMode ? 'โหมดแก้ข้อความ: ON ✏️' : 'โหมดแก้ข้อความ: OFF'}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className="px-2.5 py-1 rounded-md bg-slate-950/60 hover:bg-slate-950 text-white font-semibold text-[11px] transition-colors"
              >
                ไปหน้า Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-xl">🎃</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-normal tracking-wider text-amber-400 flex items-center gap-1.5 font-horror drop-shadow-[1px_2px_0px_rgba(0,0,0,0.9)]">
                  FSS HALLOWEEN <span className="text-orange-400">2026</span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Thai Ghost Collection</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-400 font-mono text-[9px]">
                    <Cloud className="w-2.5 h-2.5" /> Firebase Cloud
                  </span>
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentView === item.id
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Action: My Card Shortcut, Admin Dashboard & Prominent Hamburger Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Card Pill */}
              {currentCard && (
                <button
                  type="button"
                  onClick={() => handleNavClick('mycard')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors shadow-inner"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-amber-400 font-bold">{currentCard.cardId}</span>
                  <span className="text-slate-400">LV.{currentCard.level}</span>
                </button>
              )}

              {/* Admin Login / Dashboard Quick Button */}
              {adminUser?.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    currentView === 'admin'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 transition-colors"
                  title="เข้าสู่ระบบ Admin (phasharak)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Login</span>
                </button>
              )}

              {/* Prominent HAMBURGER MENU Button */}
              <button
                type="button"
                id="hamburger-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white bg-gradient-to-r from-purple-900/50 to-slate-900/90 hover:from-purple-800 hover:to-slate-800 border border-purple-500/40 shadow-md transition-all active:scale-95"
                title="เปิดเมนูหลัก (Hamburger Menu)"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-amber-400" />
                ) : (
                  <Menu className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-xs font-bold font-sans tracking-wide">
                  {mobileMenuOpen ? 'ปิด' : 'เมนู'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Supernatural Hamburger Drawer Menu (Smooth overlay accessible across all devices) */}
        {mobileMenuOpen && (
          <div className="bg-[#0b0817]/98 border-b border-amber-500/30 px-4 sm:px-6 pt-3 pb-8 space-y-2 shadow-2xl animate-in slide-in-from-top-3 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏮</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                  เมนูกิจกรรม & แฟนซีรัน 2026
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Cloud className="w-3 h-3" /> Firebase Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    currentView === item.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-slate-800 text-amber-400">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full shadow">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Admin Actions in Drawer */}
            <div className="pt-3 border-t border-slate-800/80 mt-4 flex flex-col sm:flex-row gap-2">
              {adminUser?.isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white text-xs font-bold shadow-lg"
                  >
                    <ShieldAlert className="w-4 h-4" /> แดชบอร์ดผู้ดูแล (แอดมิน: {adminUser.username})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLiveEditMode(!isLiveEditMode)}
                    className="px-4 py-3 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-slate-800"
                  >
                    <Edit3 className="w-4 h-4 inline mr-1" />
                    {isLiveEditMode ? 'ปิดโหมดแก้ไขข้อความ' : 'เปิดโหมดแก้ไขข้อความ ✏️'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                >
                  <Lock className="w-4 h-4 text-amber-400" /> เข้าสู่ระบบผู้ดูแลระบบ (Admin: phasharak)
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

