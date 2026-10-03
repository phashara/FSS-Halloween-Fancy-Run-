import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';
import { EditableText } from '../components/EditableText';

export const FaqContactView: React.FC<{ initialTab?: 'faq' | 'contact' }> = ({
  initialTab = 'faq',
}) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSent, setContactSent] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const faqs = [
    {
      q: 'ไม่เคยวิ่งมาก่อน สามารถเข้าร่วมกิจกรรมได้หรือไม่?',
      a: 'สามารถร่วมได้ทุกคนแน่นอน! ระยะทาง 5.0 กิโลเมตร เป็นการวิ่งเพื่อความสนุกสนาน (Fun Run) ไม่จำกัดเวลาคัทออฟ สามารถเดิน วิ่ง ถ่ายรูป หรือแต่งชุดแฟนซีผีมาร่วมสร้างสีสันได้เต็มที่',
    },
    {
      q: 'การ์ดผีประจำตัวสามารถเปลี่ยนชนิดผีได้หรือไม่?',
      a: 'ไม่สามารถเปลี่ยนชนิดผีได้ การ์ดผีจะยึดตามผลการวิเคราะห์จากแบบทดสอบตอนสมัคร เพื่อสะท้อนตัวตนของคุณอย่างแท้จริง แต่คุณสามารถ “อัปเกรด Level” จาก LV.1 เป็น LV.2 และ LV.3 ได้ผ่านการสั่งซื้อเสื้อที่ระลึกและเช็กอินร่วมวิ่งวันงาน',
    },
    {
      q: 'สั่งซื้อเสื้อแล้ว การ์ดผีจะอัปเกรดเลเวลเมื่อใด?',
      a: 'ระบบจะอัปเกรดให้โดยอัตโนมัติทันทีที่เจ้าหน้าที่ตรวจสอบหลักฐานการโอนเงินและอนุมัติ โดยจะได้รับตรา SHIRT OWNER พร้อมพลังความเร็วและพลังแฝงที่เพิ่มขึ้นทันที',
    },
    {
      q: 'จำเป็นต้องแต่งกายแฟนซีผีมาร่วมงานหรือไม่?',
      a: 'ไม่บังคับครับ คุณสามารถสวมชุดวิ่งธรรมดา สวมเสื้อที่ระลึกของงาน หรือจัดเต็มชุดแฟนซีผีไทย/สากลก็ได้ โดยในงานจะมีกิจกรรมประกวดชุดแฟนซียอดเยี่ยมพร้อมของรางวัลพิเศษมากมาย',
    },
    {
      q: 'จุดปล่อยตัวและเส้นทางวิ่งอยู่ที่ใด?',
      a: 'จุดปล่อยตัวและเส้นชัยอยู่ที่ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร จ.พิษณุโลก เส้นทางวิ่งวนรอบมหาวิทยาลัยนเรศวร ผ่านคณะเกษตรศาสตร์ฯ ประตู 4 เลียบอ่างเก็บน้ำสระสุริโยทัย ผ่านคณะวิทยาศาสตร์ และโรงพยาบาลมหาวิทยาลัยนเรศวร รวมระยะทาง 5.0 กิโลเมตร มีไฟส่องสว่าง จุดบริการน้ำดื่ม 2 จุด และทีมแพทย์ดูแลตลอดเส้นทาง',
    },
    {
      q: 'มีเหรียญรางวัลและอาหารสำหรับผู้เข้าร่วมงานหรือไม่?',
      a: 'มีครับ! พิเศษสุดสำหรับ 350 ท่านแรกที่วิ่งเข้าเส้นชัย จะได้รับเหรียญรางวัล Finisher Medal ลายผีไทยลิขสิทธิ์เฉพาะ และคูปองอาหารมื้อพิเศษสำหรับรับประทาน ณ ลานกิจกรรมคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร',
    },
    {
      q: 'หากสั่งเสื้อแบบรับหน้างาน ต้องไปรับที่ไหนและกี่โมง?',
      a: 'สามารถนำ QR Code จากหน้าการ์ดผีของคุณมาสแกนรับได้ที่ "ซุ้มรับของที่ระลึกและเสื้อวิ่ง" ณ บริเวณหน้าคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ในวันงาน (31 ต.ค. 2569) ตั้งแต่เวลา 17:00 – 18:00 น.',
    },
  ];

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            คำถามที่พบบ่อย (FAQ)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'contact'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ติดต่อทีมงาน & แผนที่
          </button>
        </div>
      </div>

      {/* FAQ TAB */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
              HELP & SUPPORT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              <EditableText
                sectionKey="faq"
                field="title"
                fallbackText="คำถามที่พบบ่อยเกี่ยวกับงานวิ่ง"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              <EditableText
                sectionKey="faq"
                field="subtitle"
                fallbackText="ข้อสงสัย กฎกติกา การรับของที่ระลึก และระบบการ์ดผี"
              />
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="fastwork-card overflow-hidden bg-white border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#FEF2F2] text-[#DC2626] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#DC2626]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTACT TAB */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งข้อความ</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
