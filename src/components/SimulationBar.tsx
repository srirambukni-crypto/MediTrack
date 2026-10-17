import React from 'react';
import { FastForward, Play, RefreshCw, Volume2, X } from 'lucide-react';
import { formatTime12h, pad } from '../storage';

interface SimulationBarProps {
  currentSimulatedTime: Date;
  realTime: Date;
  virtualOffsetMinutes: number;
  onSetOffsetMinutes: (offset: number) => void;
  onFastForwardHours: (hours: number) => void;
  onJumpToTime: (hh: number, mm: number) => void;
  onResetTime: () => void;
  onTestChime: () => void;
  onClose: () => void;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  currentSimulatedTime,
  realTime,
  virtualOffsetMinutes,
  onFastForwardHours,
  onJumpToTime,
  onResetTime,
  onTestChime,
  onClose,
}) => {
  const isOffset = virtualOffsetMinutes !== 0;
  const timeString = `${pad(currentSimulatedTime.getHours())}:${pad(currentSimulatedTime.getMinutes())}`;

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-3 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>UI UX Simulation Console:</span>
          </div>
          <span className="text-slate-300">
            Simulated Clock:{' '}
            <strong className="text-white font-mono tabular-nums text-sm">
              {formatTime12h(timeString)}
            </strong>{' '}
            ({timeString})
          </span>
          {isOffset && (
            <span className="text-slate-400">
              (Offset: {virtualOffsetMinutes > 0 ? `+${virtualOffsetMinutes}` : virtualOffsetMinutes} min from{' '}
              {formatTime12h(`${pad(realTime.getHours())}:${pad(realTime.getMinutes())}`)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => onJumpToTime(8, 0)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            08:00 AM (Morning)
          </button>
          <button
            type="button"
            onClick={() => onJumpToTime(13, 0)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            01:00 PM (Noon)
          </button>
          <button
            type="button"
            onClick={() => onJumpToTime(21, 30)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            09:30 PM (Night)
          </button>

          <button
            type="button"
            onClick={() => onFastForwardHours(1)}
            className="px-2.5 py-1 rounded bg-teal-900/60 hover:bg-teal-900 text-teal-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            +1 hr
          </button>

          <button
            type="button"
            onClick={onTestChime}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            Test Chime
          </button>

          {isOffset && (
            <button
              type="button"
              onClick={onResetTime}
              className="px-2.5 py-1 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Time
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
