import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      // Clear potentially corrupted or quota-exceeding local cache
      localStorage.removeItem('fss_custom_shirt_image');
      localStorage.removeItem('fss_custom_medal_image');
      localStorage.removeItem('fss2026_site_content');
      localStorage.removeItem('fss2026_ghost_species');
      localStorage.removeItem('fss2026_cards');
      localStorage.removeItem('fss2026_runners');
      localStorage.removeItem('fss2026_orders');
      localStorage.removeItem('fss2026_current_card_id');
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] text-slate-900 font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                พบข้อผิดพลาดในการโหลดหน้าเว็บ
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ระบบตรวจพบข้อขัดข้องชั่วคราวในการประมวลผลข้อมูล กรุณากดปุ่มด้านล่างเพื่อเริ่มการทำงานใหม่
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[11px] text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>โหลดหน้าเว็บใหม่</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ล้างแคชและโหลดใหม่</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
