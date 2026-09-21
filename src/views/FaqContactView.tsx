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
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';
import { EditableText } from '../components/EditableText';

export const FaqContactView: React.FC<{ initialTab?: 'faq' | 'contact' }> = ({
  initialTab = 'faq',
}) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSent, setContactSent] = useState(false);

  const faqs = [
    {
      q: 'ไม่เคยวิ่งมาก่อน สามารถเข้าร่วมกิจกรรมได้หรือไม่?',
      a: 'สามารถร่วมได้ทุกคนแน่นอน! ระยะทาง 5.0 กิโลเมตร เป็นการวิ่งเพื่อความสนุกสนาน (Fun Run) ไม่จำกัดเวลาคัทออฟ สามารถเดิน วิ่ง ถ่ายรูป หรือแต่งชุดแฟนซีผีมาร่วมสร้างสีสันได้เต็มที่',
    },
    {
      q: 'การ์ดผีประจำตัวสามารถเปลี่ยนชนิดผีได้หรือไม่?',
      a: 'ไม่สามารถเปลี่ยนชนิดผีได้ การ์ดผีจะยึดตามผลการวิเคราะห์จากแบบทดสอบตอนสมัคร เพื่อสะท้อนตัวตนของคุณอย่างแท้จริง แต่คุณสามารถ “อัปเกรด Level” จาก LV.1 เป็น LV.2 และ LV.3 ได้ผ่านการสั่งเสื้อและแชร์เรื่องสยองขวัญ',
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Tab Controls */}
      <div className="flex justify-center">
        <div className="bg-slate-900 p-1.5 rounded-full border border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            คำถามที่พบบ่อย (FAQ)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'contact'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ติดต่อทีมงาน & แผนที่
          </button>
        </div>
      </div>

      {/* FAQ TAB */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              <EditableText
                sectionKey="faq"
                field="title"
                fallbackText="คำถามที่พบบ่อยเกี่ยวกับงานวิ่ง"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              <EditableText
                sectionKey="faq"
                field="subtitle"
                fallbackText="ข้อสงสัย กฎกติกา การรับของที่ระลึก และระบบการ์ดผี"
              />
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2.5">
                    <span className="text-amber-400 font-mono">Q{idx + 1}.</span> {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT TAB */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              <EditableText
                sectionKey="contact"
                field="title"
                fallbackText="ติดต่อทีมงานจัดกิจกรรม"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              <EditableText
                sectionKey="contact"
                field="subtitle"
                fallbackText="ทีมงานยินดีให้คำแนะนำและช่วยเหลือผู้เข้าร่วมงานทุกคน"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" /> ช่องทางสื่อสารทางการ
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">สายด่วนนักวิ่ง</span>
                    <span className="font-semibold text-white">
                      <EditableText sectionKey="contact" field="hotline" fallbackText="02-999-FSSG (02-999-3774)" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">LINE Official Account</span>
                    <span className="font-semibold text-emerald-400">
                      <EditableText sectionKey="contact" field="line" fallbackText="@FSSGhostRun" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">อีเมลประสานงาน</span>
                    <span className="font-semibold text-white">
                      <EditableText sectionKey="contact" field="email" fallbackText="contact@fss-ghostrun2026.com" />
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">สถานที่จัดงาน</span>
                    <span className="font-semibold text-white">{EVENT_DETAILS.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send quick inquiry form */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" /> ส่งข้อความถึงทีมงาน
              </h3>
              {contactSent ? (
                <div className="p-6 rounded-2xl bg-emerald-950 border border-emerald-500 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-200">ส่งข้อความเรียบร้อยแล้ว</p>
                  <p className="text-xs text-slate-300">ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSent(true);
                  }}
                  className="space-y-3 text-xs"
                >
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ชื่อผู้ติดต่อ</label>
                    <input
                      type="text"
                      required
                      placeholder="ชื่อ-นามสกุล"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">เบอร์โทรศัพท์ / LINE</label>
                    <input
                      type="text"
                      required
                      placeholder="เบอร์โทรหรือ Line ID"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ข้อความที่ต้องการสอบถาม</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="พิมพ์คำถามหรือข้อสงสัยของคุณ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    ส่งข้อความ
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
