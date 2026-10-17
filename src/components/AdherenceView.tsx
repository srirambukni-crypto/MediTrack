import React from 'react';
import { Award, CheckCircle2, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { DayAdherence, DoseItem } from '../types';
import { ymd } from '../storage';

interface AdherenceViewProps {
  weeklyData: DayAdherence[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onGoToSchedule: () => void;
}

export const AdherenceView: React.FC<AdherenceViewProps> = ({
  weeklyData,
  selectedDate,
  onSelectDate,
  onGoToSchedule,
}) => {
  // Aggregate 7-day metrics
  const totalDueWeek = weeklyData.reduce((acc, curr) => acc + curr.totalDue, 0);
  const totalTakenWeek = weeklyData.reduce((acc, curr) => acc + curr.taken, 0);
  const totalMissedWeek = weeklyData.reduce((acc, curr) => acc + curr.missed, 0);
  const totalSkippedWeek = weeklyData.reduce((acc, curr) => acc + curr.skipped, 0);

  const averageAdherence =
    totalDueWeek > 0 ? Math.round((totalTakenWeek / totalDueWeek) * 100) : 100;

  // Calculate current adherence streak (days with > 70% or all taken)
  let streak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    const day = weeklyData[i];
    if (day.totalDue > 0 && day.taken / day.totalDue >= 0.75) {
      streak++;
    } else if (day.totalDue > 0) {
      break;
    }
  }

  const selectedDayString = ymd(selectedDate);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adherence Rate Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              7-Day Adherence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {averageAdherence}%
              </span>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {totalTakenWeek}/{totalDueWeek} Doses
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {averageAdherence >= 80
                ? 'Excellent routine! Keep it up.'
                : 'Aim to take every scheduled dose on time.'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Adherence Streak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Adherence Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consecutive days meeting adherence goals
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="w-full">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dose Outcomes
            </span>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-slate-100 text-center">
              <div>
                <span className="block text-lg font-bold text-teal-800 tabular-nums">
                  {totalTakenWeek}
                </span>
                <span className="text-[11px] text-slate-500">Taken</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-rose-700 tabular-nums">
                  {totalMissedWeek}
                </span>
                <span className="text-[11px] text-slate-500">Missed</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-600 tabular-nums">
                  {totalSkippedWeek}
                </span>
                <span className="text-[11px] text-slate-500">Skipped</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Adherence Rings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              7-Day Visual Adherence Rings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any ring to inspect or modify doses for that day.
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToSchedule}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            Open Day View
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
          {weeklyData.map((day) => {
            const isSelected = day.dayString === selectedDayString;
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset =
              circumference - (day.percentage / 100) * circumference;

            return (
              <button
                key={day.dayString}
                type="button"
                onClick={() => {
                  onSelectDate(day.date);
                  onGoToSchedule();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {/* SVG Radial Ring */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 54 54">
                    {/* Background circle track */}
                    <circle
                      cx="27"
                      cy="27"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Animated progress circle */}
                    <circle
                      cx="27"
                      cy="27"
                      r={radius}
                      className={`${
                        day.totalDue === 0
                          ? 'text-slate-200'
                          : day.percentage >= 80
                          ? 'text-teal-600'
                          : day.percentage >= 50
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      } transition-all duration-500 ease-out`}
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[11px] sm:text-xs font-bold text-slate-800 tabular-nums">
                    {day.totalDue > 0 ? `${day.percentage}%` : '—'}
                  </span>
                </div>

                {/* Day of Week */}
                <span className="text-xs font-bold text-slate-800 mt-1">
                  {day.weekdayLabel}
                </span>

                {/* Date number */}
                <span className="text-[11px] text-slate-400">
                  {day.date.getDate()}
                </span>

                {/* Taken vs Total Count */}
                <span className="text-[10px] font-semibold text-slate-600 mt-1.5 tabular-nums">
                  {day.totalDue > 0 ? `${day.taken}/${day.totalDue}` : 'None'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
