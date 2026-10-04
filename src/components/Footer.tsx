import React from 'react';
import { Ghost, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';
import { EditableText } from './EditableText';

export const Footer: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-100">
          {/* Col 1: About & Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-sm flex items-center justify-center shrink-0">
                <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg font-black text-slate-900">
                <EditableText
                  sectionKey="footer"
                  field="title"
                  fallbackText="FSS HALLOWEEN RUN 2026"
                />
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              <EditableText
                sectionKey="footer"
                field="description"
                fallbackText="โครงการวิ่งแฟนซีฮาโลวีน คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร สะสมการ์ดผีไทย 12 ชนิด พร้อมเสื้อที่ระลึก Glow-in-the-dark"
              />
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                #FSSGhostRun2026
              </span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                #ThaiGhost12
              </span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="text-[11px] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                สำหรับเจ้าหน้าที่ / ผู้ดูแลระบบ
              </button>
            </div>
          </div>

          {/* Col 2: Event Information */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ข้อมูลงานวิ่ง
            </h4>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{EVENT_DETAILS.date} (เริ่มเวลา {EVENT_DETAILS.time})</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{EVENT_DETAILS.venue}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>ระยะทาง 5.0 KM &middot; ปล่อยตัว 18:30 น.</span>
              </p>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              บริการ & ระบบ
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('collection')}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  คลังการ์ด 12 ผีไทย (Ghost Collection)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  ลงทะเบียนสมัครวิ่งฟรี (Free Run)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shirt')}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  สั่งซื้อเสื้อที่ระลึก Glow-in-the-dark
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('directory')}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  ตรวจสอบรายชื่อนักวิ่งและสถานะ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('mycard')}
                  className="text-slate-600 hover:text-red-600 transition-colors"
                >
                  การ์ดผีของฉัน & QR Code เช็กอิน
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            <EditableText
              sectionKey="footer"
              field="copyright"
              fallbackText="© 2026 FSS Halloween Fancy Run. สงวนลิขสิทธิ์ทุกประการ &middot; คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร"
            />
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>การ์ดผี 1 ใบ</span>
            <span>&middot;</span>
            <span>1 หมายเลข BIB</span>
            <span>&middot;</span>
            <span>QR Code ตลอดทั้งงาน</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
