import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { TextEditModal } from './TextEditModal';
import { SiteContentSection } from '../types/cms';

interface Props {
  sectionKey: string;
  field?: string;
  fallbackText?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'li';
}

export const EditableText: React.FC<Props> = ({
  sectionKey,
  field = 'title',
  fallbackText = '',
  className = '',
  as: Component = 'span',
}) => {
  const { siteContent, isLiveEditMode, adminUser } = useEventContext();
  const [modalOpen, setModalOpen] = useState(false);

  const section = siteContent[sectionKey];
  const textValue = (section && section[field] !== undefined) ? section[field] : fallbackText;

  const canEdit = Boolean(adminUser?.isLoggedIn && isLiveEditMode);

  // Active section to pass into modal (fallback if not registered yet)
  const modalSection: SiteContentSection = section || {
    sectionKey,
    title: field === 'title' ? (textValue || 'ส่วนข้อความ') : 'ข้อความเว็บไซต์',
    [field]: textValue,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.username || 'admin',
  };

  return (
    <>
      <span
        className={`relative inline-block transition-all ${
          canEdit
            ? 'outline-dashed outline-1 outline-amber-400/50 hover:outline-amber-400 bg-amber-500/5 hover:bg-amber-500/15 rounded px-1 py-0.5 cursor-pointer select-none group'
            : ''
        }`}
        onClick={canEdit ? (e) => { e.stopPropagation(); setModalOpen(true); } : undefined}
        title={canEdit ? `คลิกเพื่อแก้ไข [${sectionKey}.${field}]` : undefined}
      >
        <Component className={className}>{textValue}</Component>

        {canEdit && (
          <span
            className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold font-sans shadow-md hover:bg-amber-400 transition-transform active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            <Edit3 className="w-2.5 h-2.5" /> แก้ไข
          </span>
        )}
      </span>

      {modalOpen && (
        <TextEditModal
          isOpen={modalOpen}
          section={modalSection}
          focusedField={field}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
