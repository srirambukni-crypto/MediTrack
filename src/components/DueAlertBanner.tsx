import React from 'react';
import { AlertCircle, Bell, Check, Clock, Volume2, X } from 'lucide-react';
import { DoseItem } from '../types';
import { formatTime12h } from '../storage';

interface DueAlertBannerProps {
  dueDoses: DoseItem[];
  onMarkTaken: (key: string) => void;
  onSnooze: (key: string, minutes: number) => void;
  onDismiss: () => void;
  onPlayChime: () => void;
}

export const DueAlertBanner: React.FC<DueAlertBannerProps> = ({
  dueDoses,
  onMarkTaken,
  onSnooze,
  onDismiss,
  onPlayChime,
}) => {
  if (dueDoses.length === 0) return null;

  const primaryDose = dueDoses[0];
  const moreCount = dueDoses.length - 1;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-3 sm:px-6 rounded-2xl shadow-lg border border-amber-400 mb-6 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-600/30 rounded-xl shrink-0 mt-0.5 text-slate-950">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base tracking-tight">
                Medication Reminder: {primaryDose.m.name}
              </span>
              <span className="text-xs bg-amber-600/30 px-2 py-0.5 rounded font-semibold tabular-nums">
                {formatTime12h(primaryDose.t)}
              </span>
              {moreCount > 0 && (
                <span className="text-xs font-semibold bg-amber-600/20 px-2 py-0.5 rounded">
                  +{moreCount} more due
                </span>
              )}
            </div>
            <p className="text-xs text-amber-950 font-medium mt-0.5">
              {[
                primaryDose.m.dose,
                primaryDose.m.person ? `For ${primaryDose.m.person}` : '',
                primaryDose.m.notes,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onPlayChime}
            title="Replay alert chime"
            className="p-2 text-amber-950 hover:bg-amber-400/40 rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSnooze(primaryDose.key, 10)}
            className="px-3 py-1.5 text-xs font-semibold bg-white/80 hover:bg-white text-amber-950 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            Snooze 10m
          </button>

          <button
            type="button"
            onClick={() => onMarkTaken(primaryDose.key)}
            className="px-3.5 py-1.5 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Taken
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="p-1.5 text-amber-950/70 hover:text-amber-950 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
