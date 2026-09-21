import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, X, CheckCircle, Sparkles } from 'lucide-react';
import { useEventContext } from '../context/EventContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { adminUser, loginAdmin, logoutAdmin } = useEventContext();
  const [username, setUsername] = useState('phasharak');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const success = loginAdmin(username.trim(), password.trim());
    if (success) {
      setSuccessMsg('เข้าสู่ระบบผู้ดูแลระบบสำเร็จ (ยินดีต้อนรับ คุณ phasharak)!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } else {
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#19112a] via-[#110c1f] to-[#0a0714] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
            👑
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
            เข้าสู่ระบบผู้ดูแลระบบ (Admin)
          </h3>
          <p className="text-xs text-slate-400">
            สำหรับเจ้าหน้าที่และผู้ดูแลกิจกรรม FSS Halloween Fancy Run 2026
          </p>
        </div>

        {/* If already logged in */}
        {adminUser?.isLoggedIn ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-sm text-white">
                คุณเข้าสู่ระบบในชื่อ: {adminUser.username}
              </p>
              <p className="text-slate-300 mt-1">สิทธิ์: ผู้ดูแลระบบสูงสุด (Super Admin)</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                ไปยัง Dashboard
              </button>
              <button
                type="button"
                onClick={() => logoutAdmin()}
                className="px-4 py-3 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 rounded-xl text-xs transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="phasharak"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> เข้าสู่ระบบผู้ดูแลระบบ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
