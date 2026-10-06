import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useEventContext } from '../context/EventContext';

interface Props { isOpen: boolean; onClose: () => void; onSuccess?: () => void }
export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { adminUser, loginAdmin, logoutAdmin } = useEventContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const login = async () => {
    setBusy(true);
    setError('');
    try {
      if (await loginAdmin()) { onClose(); onSuccess?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่ได้ กรุณาลองอีกครั้ง');
    } finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
    <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-slate-900">
      <button onClick={onClose} disabled={busy} aria-label="ปิด" className="absolute top-4 right-4"><X /></button>
      <ShieldCheck className="mx-auto mb-4 text-blue-600" />
      <h3 className="text-xl font-bold text-center mb-4">เข้าสู่ระบบผู้ดูแลกิจกรรม</h3>
      {error && <p role="alert" className="p-3 mb-4 bg-rose-50 text-rose-700"><AlertCircle className="inline w-4" /> {error}</p>}
      {adminUser?.isLoggedIn ? <div className="space-y-4">
        <p className="text-center">{adminUser.username}</p>
        <button onClick={() => { onClose(); onSuccess?.(); }} className="w-full p-3 bg-blue-600 text-white rounded-xl">ไปยัง Dashboard</button>
        <button onClick={async () => { setError(''); try { await logoutAdmin(); } catch { setError('ออกจากระบบไม่สำเร็จ กรุณาปิดหน้าต่างเว็บ'); } }} className="w-full p-3 bg-slate-100 rounded-xl">ออกจากระบบ</button>
      </div> : <div className="space-y-4">
        <p className="text-sm text-slate-600">ใช้บัญชี Google ที่ได้รับสิทธิ์ผู้ดูแลระบบ</p>
        <button onClick={login} disabled={busy} className="w-full p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบด้วย Google'}</button>
      </div>}
    </div>
  </div>;
};
