import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle,
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';

export const FaqContactView: React.FC = () => {
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactPhone('');
      setContactMessage('');
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
          OFFICIAL SUPPORT & VENUE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          ติดต่อทีมงาน & สถานที่จัดงาน
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          มีข้อสงสัยเกี่ยวกับการรับเสื้อ การร่วมกิจกรรม หรือต้องการประสานงานกับทีมงาน สามารถติดต่อได้ตามช่องทางด้านล่าง
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Contact Details Card */}
        <div className="fastwork-card p-6 sm:p-8 bg-white space-y-6">
          <div>
            <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              OFFICIAL HOTLINE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ช่องทางการติดต่อ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              สอบถามข้อมูลเพิ่มเติมเรื่องการสมัคร การรับเสื้อ หรือแจ้งปัญหาการใช้งาน
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">สถานที่จัดงาน</h4>
                <p className="text-slate-600 mt-0.5">{EVENT_DETAILS.venue}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{EVENT_DETAILS.locationDetails}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="w-5 h-5 text-[#00B67A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">สายด่วนงานวิ่ง</h4>
                <p className="text-slate-600 mt-0.5">02-999-FSSG (02-999-3774) &middot; ทุกวัน 08:30 – 17:30 น.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900">อีเมลทางการ</h4>
                <p className="text-slate-600 mt-0.5">contact@fss-ghostrun.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Message Form */}
        <div className="fastwork-card p-6 sm:p-8 bg-white">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
            ส่งข้อความถึงทีมงาน
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            กรอกข้อความ ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง
          </p>

          {contactSent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-[#00B67A] mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">ส่งข้อความเรียบร้อยแล้ว!</h4>
              <p className="text-xs text-emerald-700">ทีมงานได้รับข้อความของคุณแล้วและจะติดต่อกลับโดยเร็วที่สุด</p>
              <button
                type="button"
                onClick={() => setContactSent(false)}
                className="mt-3 px-4 py-1.5 bg-[#DC2626] text-white text-xs font-bold rounded-lg"
              >
                ส่งข้อความใหม่
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ชื่อของคุณ</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="เช่น คุณธนกร สุขเจริญ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">เบอร์โทรศัพท์หรืออีเมล</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="08x-xxx-xxxx หรือ email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ข้อความ / คำถาม</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="พิมพ์รายละเอียดที่ต้องการสอบถาม..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ส่งข้อความ</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
