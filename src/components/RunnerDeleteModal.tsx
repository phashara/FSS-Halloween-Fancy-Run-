import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Lock } from 'lucide-react';
import { RunnerRegistration } from '../types';

interface RunnerDeleteModalProps {
  isOpen: boolean;
  runner: RunnerRegistration | null;
  onClose: () => void;
  onConfirmDelete: (regId: string, passcode: string) => Promise<void>;
}

export const RunnerDeleteModal: React.FC<RunnerDeleteModalProps> = ({
  isOpen,
  runner,
  onClose,
  onConfirmDelete,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !runner) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (passcode.trim() !== '07011985') {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณากรอกรหัส 07011985 เพื่อยืนยันการลบ');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmDelete(runner.regId, passcode.trim());
      setPasscode('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 border border-rose-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8 text-rose-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-rose-600">
            ยืนยันการลบรายชื่อผู้สมัคร
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            การดำเนินการนี้จะลบข้อมูลผู้สมัครออกจากฐานข้อมูล Cloud อย่างถาวรและไม่สามารถกู้คืนได้
          </p>
        </div>

        {/* Runner Target Card */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">รหัสผู้สมัคร:</span>
            <span className="font-mono font-bold text-rose-700">{runner.regId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">ชื่อ-นามสกุล:</span>
            <span className="font-bold text-slate-900">{runner.fullName} {runner.nickname ? `(${runner.nickname})` : ''}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">หมายเลข BIB:</span>
            <span className="font-mono font-bold text-slate-800">{runner.bibNumber || 'ไม่มี BIB'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">เบอร์โทรศัพท์:</span>
            <span className="font-mono text-slate-700">{runner.phone}</span>
          </div>
        </div>

        {/* Form requiring passcode 07011985 */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600" /> กรอกรหัสความปลอดภัยเพื่อยืนยัน (07011985)
            </label>
            <input
              type="password"
              autoFocus
              required
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="กรอกรหัส 07011985"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-mono tracking-widest text-center outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isDeleting || !passcode}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'กำลังลบข้อมูล...' : 'ยืนยันการลบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
