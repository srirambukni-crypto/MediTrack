import React from 'react';
import { Plus, Volume2, VolumeX, Sparkles, Activity, FileText } from 'lucide-react';

export type ActiveTab = 'schedule' | 'adherence' | 'cabinet' | 'backup';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onExportPdf: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onToggleSimulator: () => void;
  isSimulatingTime: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onExportPdf,
  audioEnabled,
  onToggleAudio,
  onToggleSimulator,
  isSimulatingTime,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            MediTrack
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onTabChange('schedule')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'schedule'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Today's Schedule
          </button>
          <button
            type="button"
            onClick={() => onTabChange('adherence')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'adherence'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Adherence Rings
          </button>
          <button
            type="button"
            onClick={() => onTabChange('cabinet')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'cabinet'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Medicine Cabinet
          </button>
          <button
            type="button"
            onClick={() => onTabChange('backup')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 border-b-2 ${
              activeTab === 'backup'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Data & Backup
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleAudio}
            title={audioEnabled ? 'Mute alert chimes' : 'Unmute alert chimes'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onToggleSimulator}
            title="Interactive Time & Dose Simulator"
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSimulatingTime
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UI Simulator</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            title="Download PDF Medical Report"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-white">
        <button
          type="button"
          onClick={() => onTabChange('schedule')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'schedule' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Schedule
        </button>
        <button
          type="button"
          onClick={() => onTabChange('adherence')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'adherence' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Adherence
        </button>
        <button
          type="button"
          onClick={() => onTabChange('cabinet')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'cabinet' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Cabinet
        </button>
        <button
          type="button"
          onClick={() => onTabChange('backup')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'backup' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Backup
        </button>
      </div>
    </header>
  );
};
