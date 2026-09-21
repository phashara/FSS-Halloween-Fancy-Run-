import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Cloud, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { SiteContentSection } from '../types/cms';
import { useEventContext } from '../context/EventContext';

interface Props {
  isOpen: boolean;
  section: SiteContentSection;
  focusedField?: string;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  title: 'หัวข้อหลัก (Title)',
  subtitle: 'หัวข้อย่อย / คำโปรย (Subtitle)',
  tagline: 'สโลแกน / แท็กไลน์ (Tagline)',
  announcement: 'ข้อความประกาศ (Announcement)',
  description: 'คำอธิบายอย่างละเอียด (Description)',
  details: 'รายละเอียด (Details)',
  buttonText: 'ข้อความบนปุ่มหลัก (Button Text)',
  secondaryButtonText: 'ข้อความบนปุ่มรอง (Secondary Button Text)',
  badgeText: 'ข้อความป้ายกำกับ (Badge Text)',
  price: 'ราคาเสื้อ (Price - บาท)',
  step1_title: 'ขั้นตอนที่ 1 หัวข้อ (Step 1 Title)',
  step1_desc: 'ขั้นตอนที่ 1 รายละเอียด (Step 1 Description)',
  step2_title: 'ขั้นตอนที่ 2 หัวข้อ (Step 2 Title)',
  step2_desc: 'ขั้นตอนที่ 2 รายละเอียด (Step 2 Description)',
  step3_title: 'ขั้นตอนที่ 3 หัวข้อ (Step 3 Title)',
  step3_desc: 'ขั้นตอนที่ 3 รายละเอียด (Step 3 Description)',
  time1: 'กำหนดการที่ 1 (Schedule Time 1)',
  time2: 'กำหนดการที่ 2 (Schedule Time 2)',
  time3: 'กำหนดการที่ 3 (Schedule Time 3)',
  time4: 'กำหนดการที่ 4 (Schedule Time 4)',
  time5: 'กำหนดการที่ 5 (Schedule Time 5)',
  rule1: 'กฎกติกาข้อ 1 (Rule 1)',
  rule2: 'กฎกติกาข้อ 2 (Rule 2)',
  rule3: 'กฎกติกาข้อ 3 (Rule 3)',
  rule4: 'กฎกติกาข้อ 4 (Rule 4)',
  rule5: 'กฎกติกาข้อ 5 (Rule 5)',
  perk1: 'สิทธิประโยชน์ 1 (Perk 1)',
  perk2: 'สิทธิประโยชน์ 2 (Perk 2)',
  perk3: 'สิทธิประโยชน์ 3 (Perk 3)',
  perk4: 'สิทธิประโยชน์ 4 (Perk 4)',
  disclaimerTitle: 'หัวข้อข้อกำหนด/คำเตือน (Disclaimer Title)',
  disclaimerText: 'รายละเอียดข้อกำหนดสุขภาพ (Disclaimer Text)',
  bankName: 'ชื่อธนาคาร (Bank Name)',
  accountNo: 'เลขที่บัญชี (Account Number)',
  accountName: 'ชื่อบัญชี (Account Name)',
  promptPay: 'เบอร์พร้อมเพย์ (PromptPay)',
  searchHint: 'คำแนะนำการค้นหา (Search Hint)',
  note: 'หมายเหตุเพิ่มเติม (Note)',
  rulesTitle: 'หัวข้อกติกาการส่งเรื่อง (Rules Title)',
  emergencyPhone: 'เบอร์โทรฉุกเฉิน (Emergency Phone)',
  staffLine: 'LINE ฝ่ายบริการ (Staff LINE ID)',
  staffEmail: 'อีเมลติดต่อ (Staff Email)',
  organizer: 'ผู้จัดงาน (Organizer)',
  venue: 'สถานที่จัดงาน (Venue)',
  emergencyHotline: 'สายด่วนแพทย์ฉุกเฉิน (Emergency Hotline)',
  copyright: 'ข้อความลิขสิทธิ์ (Copyright)',
};

const SYSTEM_KEYS = new Set(['sectionKey', 'updatedAt', 'updatedBy', 'category']);

export const TextEditModal: React.FC<Props> = ({ isOpen, section, focusedField, onClose }) => {
  const { updateSiteContent, resetSiteContentSection } = useEventContext();
  const [formData, setFormData] = useState<SiteContentSection>({ ...section });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New field input
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    setFormData({ ...section });
  }, [section]);

  if (!isOpen) return null;

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRemoveField = (key: string) => {
    if (key === 'title') {
      alert('ไม่สามารถลบหัวข้อหลัก (title) ได้');
      return;
    }
    const updated = { ...formData };
    delete updated[key];
    setFormData(updated);
  };

  const handleAddCustomField = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey) return;
    if (SYSTEM_KEYS.has(trimmedKey)) {
      alert('ชื่อฟิลด์นี้สงวนไว้โดยระบบ');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [trimmedKey]: newVal,
    }));
    setNewKey('');
    setNewVal('');
    setShowAddCustom(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteContent(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to update text in Firebase:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(`คุณต้องการคืนค่าข้อความเริ่มต้นสำหรับส่วน [${section.sectionKey}] ใช่หรือไม่?`)) {
      await resetSiteContentSection(section.sectionKey);
      onClose();
    }
  };

  // Get all editable keys: prioritize focusedField, then known keys, then others
  const allKeys = Object.keys(formData).filter((k) => !SYSTEM_KEYS.has(k));
  if (focusedField && !allKeys.includes(focusedField)) {
    allKeys.unshift(focusedField);
  } else if (focusedField) {
    // move focusedField to top
    const idx = allKeys.indexOf(focusedField);
    if (idx > 0) {
      allKeys.splice(idx, 1);
      allKeys.unshift(focusedField);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#19112e] via-[#120d20] to-[#090614] border border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 my-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                แก้ไขข้อความเว็บไซต์ (Admin CMS)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                Firebase Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ส่วน: <code className="text-amber-300 font-bold">{section.sectionKey}</code> •
              อัปเดตแบบเรียลไทม์ไปยังฐานข้อมูลคลาวด์
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {allKeys.map((key) => {
            const label = FIELD_LABELS[key] || `ฟิลด์: ${key}`;
            const value = formData[key] ?? '';
            const isLong = String(value).length > 80 || key.includes('desc') || key.includes('details') || key.includes('text') || key.includes('rule');
            const isFocused = key === focusedField;

            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition-colors ${
                  isFocused
                    ? 'bg-amber-500/10 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    {isFocused && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                    <span>{label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({key})</span>
                  </label>

                  {key !== 'title' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(key)}
                      className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center gap-0.5 transition-colors"
                      title="ลบฟิลด์นี้"
                    >
                      <Trash2 className="w-3 h-3" /> ลบ
                    </button>
                  )}
                </div>

                {isLong ? (
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-400 focus:outline-none leading-relaxed"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 focus:outline-none"
                    required={key === 'title'}
                  />
                )}
              </div>
            );
          })}

          {/* Add custom field section */}
          {showAddCustom ? (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> เพิ่มฟิลด์ข้อความใหม่ในส่วนนี้
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อฟิลด์ภาษาอังกฤษ เช่น badgeText, note2"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="ข้อความที่ต้องการแสดง"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  disabled={!newKey.trim()}
                  className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  เพิ่มฟิลด์
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="w-full py-2 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-xs text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> เพิ่มฟิลด์ข้อความเพิ่มเติมในส่วนนี้
            </button>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>บันทึกข้อความลง Firebase สำเร็จแล้ว! หน้าเว็บอัปเดตทันที</span>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> คืนค่าเริ่มต้นส่วนนี้
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
              >
                ปิด
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Cloud className="w-4 h-4" />
                {saving ? 'กำลังบันทึกลง Firebase...' : 'บันทึกลง Firebase Cloud'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
