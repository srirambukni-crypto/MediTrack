import React, { useMemo } from 'react';
import {
  Check,
  RotateCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Pill,
  Droplet,
  Sparkles,
  Wind,
  Syringe,
} from 'lucide-react';
import { DoseItem, DoseStatus, PillForm } from '../types';
import { DAYS_FULL, formatTime12h, ymd } from '../storage';

interface TodayScheduleProps {
  doses: DoseItem[];
  selectedDate: Date;
  onChangeDate: (d: Date) => void;
  onResetToToday: () => void;
  isToday: boolean;
  onMarkTaken: (key: string) => void;
  onMarkSkipped: (key: string) => void;
  onSnooze: (key: string, minutes: number) => void;
  onUndo: (key: string) => void;
  selectedPerson: string;
  onSelectPerson: (person: string) => void;
  allPersons: string[];
  onOpenAddModal: () => void;
}

const getFormIcon = (form?: PillForm) => {
  switch (form) {
    case 'drops':
      return <Droplet className="w-4 h-4" />;
    case 'inhaler':
      return <Wind className="w-4 h-4" />;
    case 'injection':
      return <Syringe className="w-4 h-4" />;
    case 'liquid':
      return <Droplet className="w-4 h-4" />;
    default:
      return <Pill className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: DoseStatus, snoozedUntil?: number) => {
  switch (status) {
    case 'due':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Due Now
        </span>
      );
    case 'taken':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
          <Check className="w-3.5 h-3.5 text-teal-600" />
          Taken
        </span>
      );
    case 'missed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Missed
        </span>
      );
    case 'snoozed': {
      const minutesLeft = snoozedUntil
        ? Math.max(1, Math.round((snoozedUntil - Date.now()) / 60000))
        : 10;
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Snoozed ({minutesLeft}m left)
        </span>
      );
    }
    case 'skipped':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          Skipped
        </span>
      );
    case 'upcoming':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Upcoming
        </span>
      );
  }
};

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  doses,
  selectedDate,
  onChangeDate,
  onResetToToday,
  isToday,
  onMarkTaken,
  onMarkSkipped,
  onSnooze,
  onUndo,
  selectedPerson,
  onSelectPerson,
  allPersons,
  onOpenAddModal,
}) => {
  const [filterState, setFilterState] = React.useState<'all' | 'pending' | 'completed'>('all');

  // Filter doses by person and completion state
  const filteredDoses = useMemo(() => {
    return doses.filter((d) => {
      if (selectedPerson !== 'All' && d.m.person !== selectedPerson) {
        return false;
      }
      if (filterState === 'pending') {
        return d.status !== 'taken' && d.status !== 'skipped';
      }
      if (filterState === 'completed') {
        return d.status === 'taken' || d.status === 'skipped';
      }
      return true;
    });
  }, [doses, selectedPerson, filterState]);

  // Daily summary stats
  const totalDoses = doses.length;
  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const completionPercent = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onChangeDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onChangeDate(next);
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation & Headline Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {DAYS_FULL[selectedDate.getDay()]},{' '}
                {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </h1>
              {isToday && (
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your medication doses schedule and real-time reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={onResetToToday}
                className="px-3 py-1.5 text-xs font-semibold border border-teal-200 bg-teal-50 text-teal-800 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
              >
                Go to Today
              </button>
            )}

            <button
              type="button"
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalDoses > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>
                Daily Adherence:{' '}
                <strong className="text-slate-900 font-semibold tabular-nums">
                  {takenCount} of {totalDoses} taken
                </strong>
              </span>
              <span className="font-semibold text-teal-800 tabular-nums">
                {completionPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter and Person Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Person filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 mr-1 shrink-0">Family:</span>
          {allPersons.map((person) => (
            <button
              key={person}
              type="button"
              onClick={() => onSelectPerson(person)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedPerson === person
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {person}
            </button>
          ))}
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterState === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({doses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterState('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterState === 'pending'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({doses.filter((d) => d.status !== 'taken' && d.status !== 'skipped').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterState('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterState === 'completed'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({doses.filter((d) => d.status === 'taken' || d.status === 'skipped').length})
          </button>
        </div>
      </div>

      {/* Doses List */}
      <div className="space-y-3">
        {filteredDoses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No doses found for this day
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {doses.length === 0
                ? 'No medications scheduled for this date. Add a prescription or check start/end dates.'
                : 'No doses match your current filters.'}
            </p>
            {doses.length === 0 && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                + Add Medication
              </button>
            )}
          </div>
        ) : (
          filteredDoses.map((dose) => {
            const isCompleted = dose.status === 'taken' || dose.status === 'skipped';
            const isDueOrSnoozed = dose.status === 'due' || dose.status === 'snoozed';

            return (
              <div
                key={dose.key}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  dose.status === 'due'
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-md'
                    : dose.status === 'taken'
                    ? 'border-slate-200 bg-slate-50/60 opacity-90'
                    : dose.status === 'missed'
                    ? 'border-rose-200'
                    : 'border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Left Side: Time, Icon, Name, Details */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      dose.status === 'taken'
                        ? 'bg-teal-100 text-teal-800'
                        : dose.status === 'due'
                        ? 'bg-amber-100 text-amber-900'
                        : dose.status === 'missed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {getFormIcon(dose.m.form)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                        {formatTime12h(dose.t)}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {dose.m.name}
                      </h3>
                      {getStatusBadge(dose.status, dose.snoozedUntil)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      {dose.m.dose && <span className="font-medium text-slate-700">{dose.m.dose}</span>}
                      {dose.m.person && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                            {dose.m.person}
                          </span>
                        </>
                      )}
                      {dose.m.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic">{dose.m.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Controls with standard min 44px hitbox */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => onUndo(dose.key)}
                      className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo
                    </button>
                  ) : (
                    <>
                      {isDueOrSnoozed && (
                        <button
                          type="button"
                          onClick={() => onSnooze(dose.key, 10)}
                          className="min-h-[44px] px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Snooze 10m
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onMarkSkipped(dose.key)}
                        className="min-h-[44px] px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Skip
                      </button>

                      <button
                        type="button"
                        onClick={() => onMarkTaken(dose.key)}
                        className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Taken
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
