import React from 'react';
import fssLogoAsset from '../assets/fss_logo.svg';

interface Props {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const SIZE_MAP = {
  xs: 'w-7 h-7',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

export const FssLogo: React.FC<Props> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeClass = SIZE_MAP[size] || size;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 ${sizeClass} rounded-full shadow-md overflow-hidden bg-black flex items-center justify-center`}>
        <img
          src={fssLogoAsset}
          alt="FSS Halloween Fancy Run 2026 Official Logo"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-black text-slate-900 leading-tight tracking-tight text-base sm:text-lg">
            <span>FSS HALLOWEEN</span>
            <span className="px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold">
              2026
            </span>
          </div>
          <span className="text-[11px] font-semibold text-red-600 tracking-wide">
            FANCY RUN • คณะสังคมศาสตร์ ม.นเรศวร
          </span>
        </div>
      )}
    </div>
  );
};
