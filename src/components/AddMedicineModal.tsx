import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, Plus, Trash } from 'lucide-react';
import { Medicine, PillForm } from '../types';
import { DAYS_SHORT, pad, ymd } from '../storage';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (med: Medicine) => void;
  editingMed?: Medicine | null;
  existingPersons: string[];
}

const TIME_PRESETS = [
  { label: 'Morning (08:00)', time: '08:00' },
  { label: 'Noon (12:30)', time: '12:30' },
  { label: 'Evening (18:00)', time: '18:00' },
  { label: 'Night (21:30)', time: '21:30' },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMed,
  existingPersons,
}) => {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [person, setPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [form, setForm] = useState<PillForm>('tablet');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [start, setStart] = useState(ymd(new Date()));
  const [end, setEnd] = useState('');
  const [stock, setStock] = useState<string>('30');
  const [refillThreshold, setRefillThreshold] = useState<string>('5');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingMed) {
      setName(editingMed.name);
      setDose(editingMed.dose || '');
      setPerson(editingMed.person || '');
      setNotes(editingMed.notes || '');
      setForm(editingMed.form || 'tablet');
      setTimes(editingMed.times.length ? [...editingMed.times] : ['08:00']);
      setDays(editingMed.days.length ? [...editingMed.days] : [0, 1, 2, 3, 4, 5, 6]);
      setStart(editingMed.start || ymd(new Date()));
      setEnd(editingMed.end || '');
      setStock(editingMed.stock !== undefined ? String(editingMed.stock) : '30');
      setRefillThreshold(editingMed.refillThreshold !== undefined ? String(editingMed.refillThreshold) : '5');
    } else {
      setName('');
      setDose('');
      setPerson('Me');
      setNotes('');
      setForm('tablet');
      setTimes(['08:00', '20:00']);
      setDays([0, 1, 2, 3, 4, 5, 6]);
      setStart(ymd(new Date()));
      setEnd('');
      setStock('30');
      setRefillThreshold('5');
    }
    setErrorMsg('');
  }, [editingMed, isOpen]);

  if (!isOpen) return null;

  const handleToggleDay = (dayIdx: number) => {
    if (days.includes(dayIdx)) {
      setDays(days.filter((d) => d !== dayIdx));
    } else {
      setDays([...days, dayIdx].sort());
    }
  };

  const handleAddPresetTime = (timeStr: string) => {
    if (!times.includes(timeStr)) {
      setTimes([...times, timeStr].sort());
    }
  };

  const handleAddCustomTime = () => {
    const clean = customTimeInput.trim();
    if (!clean) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clean)) {
      setErrorMsg('Enter time in 24-hour format HH:MM (e.g. 09:30 or 14:15)');
      return;
    }
    if (!times.includes(clean)) {
      setTimes([...times, clean].sort());
    }
    setCustomTimeInput('');
    setErrorMsg('');
  };

  const handleRemoveTime = (t: string) => {
    if (times.length <= 1) {
      setErrorMsg('Medication must have at least one scheduled time.');
      return;
    }
    setTimes(times.filter((item) => item !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter medicine name.');
      return;
    }

    if (times.length === 0) {
      setErrorMsg('Please specify at least one time of day.');
      return;
    }

    if (days.length === 0) {
      setErrorMsg('Please pick at least one day of the week.');
      return;
    }

    if (end && end < start) {
      setErrorMsg('End date cannot be earlier than start date.');
      return;
    }

    const medData: Medicine = {
      id: editingMed ? editingMed.id : Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: cleanName,
      dose: dose.trim(),
      person: person.trim() || 'Me',
      notes: notes.trim(),
      form,
      times: [...times].sort(),
      days: [...days].sort(),
      start,
      end: end.trim() || undefined,
      stock: stock ? parseInt(stock, 10) : undefined,
      refillThreshold: refillThreshold ? parseInt(refillThreshold, 10) : 5,
    };

    onSave(medData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingMed ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure dose schedule, reminder times, and instructions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name & Dose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name *
              </label>
              <input
                id="med-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin, Lisinopril"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-dose" className="block text-xs font-semibold text-slate-700 mb-1">
                Dosage
              </label>
              <input
                id="med-dose"
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 500 mg, 1 tablet, 2 puffs"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Person & Form Factor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-person" className="block text-xs font-semibold text-slate-700 mb-1">
                For Person
              </label>
              <input
                id="med-person"
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Me, Mom, Dad, Child"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
              {existingPersons.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick:</span>
                  {existingPersons.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPerson(p)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600 cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="med-form" className="block text-xs font-semibold text-slate-700 mb-1">
                Form Factor
              </label>
              <select
                id="med-form"
                value={form}
                onChange={(e) => setForm(e.target.value as PillForm)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              >
                <option value="tablet">Tablet / Pill</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid / Syrup</option>
                <option value="drops">Eye / Ear Drops</option>
                <option value="inhaler">Inhaler / Spray</option>
                <option value="injection">Injection</option>
                <option value="topical">Cream / Topical</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="med-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions / Notes
            </label>
            <input
              id="med-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. After food with water, Before sleep"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Times of Day */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-800">
              Scheduled Times (24-Hour Format) *
            </label>

            {/* Current Active Times Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(t)}
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Preset Time Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => handleAddPresetTime(preset.time)}
                  className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                  +{preset.label}
                </button>
              ))}
            </div>

            {/* Add Custom Time Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="time"
                value={customTimeInput}
                onChange={(e) => setCustomTimeInput(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleAddCustomTime}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer"
              >
                Add Time
              </button>
            </div>
          </div>

          {/* Days of the Week */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Repeat Days *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
                  className="text-teal-700 hover:underline cursor-pointer"
                >
                  All Days
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setDays([1, 2, 3, 4, 5])}
                  className="text-teal-700 hover:underline cursor-pointer"
                >
                  Weekdays
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setDays([0, 6])}
                  className="text-teal-700 hover:underline cursor-pointer"
                >
                  Weekends
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const isSelected = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleToggleDay(d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 border-teal-700 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {DAYS_SHORT[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-start" className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                id="med-start"
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-end" className="block text-xs font-semibold text-slate-700 mb-1">
                End Date (Optional)
              </label>
              <input
                id="med-end"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Stock Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-stock" className="block text-xs font-semibold text-slate-700 mb-1">
                Current Inventory (Doses Left)
              </label>
              <input
                id="med-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 30"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-refill" className="block text-xs font-semibold text-slate-700 mb-1">
                Refill Alert When Below
              </label>
              <input
                id="med-refill"
                type="number"
                min="1"
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(e.target.value)}
                placeholder="e.g. 5"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              {editingMed ? 'Save Changes' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
