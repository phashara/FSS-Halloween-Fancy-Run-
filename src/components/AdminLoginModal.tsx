import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, X, CheckCircle } from 'lucide-react';
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
      }, 1000);
    } else {
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mx-auto shadow-xs text-white">
            👑
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            เข้าสู่ระบบผู้ดูแลระบบ (Admin)
          </h3>
          <p className="text-xs text-slate-500">
            สำหรับเจ้าหน้าที่และผู้ดูแลกิจกรรม FSS Halloween Fancy Run 2026
          </p>
        </div>

        {/* If already logged in */}
        {adminUser?.isLoggedIn ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-900">
                คุณเข้าสู่ระบบในชื่อ: {adminUser.username}
              </p>
              <p className="text-slate-600 mt-1">สิทธิ์: ผู้ดูแลระบบสูงสุด (Super Admin)</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                ไปยัง Dashboard
              </button>
              <button
                type="button"
                onClick={() => logoutAdmin()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="phasharak"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> เข้าสู่ระบบผู้ดูแลระบบ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
