import React from 'react';
import { Ghost, MapPin, Calendar, Mail, Phone, ExternalLink } from 'lucide-react';
import { EVENT_DETAILS } from '../data/initialData';
import { EditableText } from './EditableText';

export const Footer: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#090611] text-slate-400 border-t border-slate-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎃</span>
            <span className="text-xl font-normal text-amber-400 font-horror tracking-wider drop-shadow-[1px_2px_0px_rgba(0,0,0,0.9)]">
              <EditableText
                sectionKey="footer"
                field="title"
                fallbackText="FSS HALLOWEEN 2026"
              />
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            <EditableText
              sectionKey="footer"
              field="description"
              fallbackText="งานวิ่งแฟนซีผีไทยสุดมันส์ รวม 12 คอลเลกชันผีในตำนาน การ์ดประจำตัว 1 ใบพัฒนาได้ 3 Level"
            />
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-amber-400">
            <span className="bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
              #FSSGhostRun2026
            </span>
            <span className="bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 text-purple-300">
              #ThaiGhostCollection
            </span>
          </div>
        </div>

        {/* Col 2: Event Info */}
        <div className="space-y-2.5 text-xs">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-amber-400">
            ข้อมูลกิจกรรม
          </h4>
          <p className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{EVENT_DETAILS.date} (เวลา {EVENT_DETAILS.time})</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{EVENT_DETAILS.venue}</span>
          </p>
          <p className="flex items-center gap-2">
            <Ghost className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ระยะทาง 5.0 กิโลเมตร (ปล่อยตัว 19:00 น.)</span>
          </p>
        </div>

        {/* Col 3: Quick Links */}
        <div className="space-y-2 text-xs">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-amber-400">
            เมนูลัด
          </h4>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('collection')}
                className="hover:text-amber-300 transition-colors"
              >
                • 12 ตำนานผีไทย (Thai Ghost Collection)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="hover:text-amber-300 transition-colors"
              >
                • สมัครวิ่งฟรี & ตอบคำถามค้นหาผี
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('shirt')}
                className="hover:text-amber-300 transition-colors"
              >
                • สั่งซื้อเสื้อที่ระลึก Glow-in-the-dark
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('directory')}
                className="hover:text-amber-300 transition-colors"
              >
                • ตรวจสอบรายชื่อนักวิ่ง
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('horror')}
                className="hover:text-amber-300 transition-colors"
              >
                • คลังประสบการณ์สยอง 3D
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('mycard')}
                className="hover:text-amber-300 transition-colors"
              >
                • การ์ดผีของฉัน & QR เช็กอิน
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Hotline */}
        <div className="space-y-2.5 text-xs">
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-amber-400">
            ติดต่อสอบถาม
          </h4>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>สายด่วนทีมงาน: 02-999-FSSG (02-999-3774)</span>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>อีเมล: info@fss-ghostrun2026.com</span>
          </p>
          <p className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-blue-400" />
            <span>LINE Official: @FSSGhostRun</span>
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
            >
              🔒 สำหรับเจ้าหน้าที่และผู้ดูแลระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <p>
          <EditableText
            sectionKey="footer"
            field="copyright"
            fallbackText="© 2026 FSS Halloween Fancy Run. สงวนลิขสิทธิ์ทุกประการ ภายใต้แนวคิด Thai Ghost Collection."
          />
        </p>
        <p className="text-slate-400">การ์ดผี 1 ใบ • 1 หมายเลข • QR Code เดียวตลอดทั้งงาน</p>
      </div>
    </footer>
  );
};
