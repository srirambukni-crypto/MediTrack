import React, { useState } from 'react';
import {
  Pill,
  Trash2,
  Edit2,
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Package,
  Droplet,
  Wind,
  Syringe,
  CheckCircle,
} from 'lucide-react';
import { Medicine, PillForm } from '../types';
import { DAYS_SHORT, formatTime12h } from '../storage';

interface MedicineCabinetProps {
  meds: Medicine[];
  onOpenAddModal: () => void;
  onEditMedicine: (med: Medicine) => void;
  onDeleteMedicine: (id: string, name: string) => void;
  onRefillStock: (id: string, amount: number) => void;
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

export const MedicineCabinet: React.FC<MedicineCabinetProps> = ({
  meds,
  onOpenAddModal,
  onEditMedicine,
  onDeleteMedicine,
  onRefillStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPerson, setFilterPerson] = useState('All');

  const allPersons = ['All', ...Array.from(new Set(meds.map((m) => m.person).filter(Boolean)))];

  const filteredMeds = meds.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.dose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPerson = filterPerson === 'All' || m.person === filterPerson;
    return matchesSearch && matchesPerson;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Medicine Cabinet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage prescriptions, dosage frequencies, inventory stock, and refills.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Medicine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search medicines, dosage or notes..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Person:</span>
          {allPersons.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPerson(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterPerson === p
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Medications */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No medications found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {meds.length === 0
              ? 'Your medicine cabinet is empty. Add your daily prescriptions or supplements.'
              : 'No medications match your search criteria.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            + Add Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeds.map((med) => {
            const isEveryday = med.days.length === 7;
            const daysLabel = isEveryday
              ? 'Every day'
              : med.days.map((d) => DAYS_SHORT[d]).join(', ');

            const isLowStock =
              med.stock !== undefined &&
              med.refillThreshold !== undefined &&
              med.stock <= med.refillThreshold;

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Title & Pill Form Icon */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                        {getFormIcon(med.form)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {med.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-600">{med.dose}</p>
                      </div>
                    </div>

                    {med.person && (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <User className="w-3 h-3 text-slate-400" />
                        {med.person}
                      </span>
                    )}
                  </div>

                  {/* Schedule times & days */}
                  <div className="space-y-1.5 my-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {med.times.map((t) => formatTime12h(t)).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{daysLabel}</span>
                    </div>
                    {med.notes && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                        Note: {med.notes}
                      </div>
                    )}
                  </div>

                  {/* Stock & Refill Indicator */}
                  {med.stock !== undefined && (
                    <div className="flex items-center justify-between text-xs py-1 px-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">Stock:</span>
                        <strong
                          className={`font-semibold tabular-nums ${
                            isLowStock ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {med.stock} doses left
                        </strong>
                        {isLowStock && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            Refill Soon
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onRefillStock(med.id, 30)}
                        className="text-[11px] font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        +30 Refill
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-slate-400">
                    Started {med.start}
                    {med.end ? ` · Ends ${med.end}` : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditMedicine(med)}
                      aria-label={`Edit ${med.name}`}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMedicine(med.id, med.name)}
                      aria-label={`Delete ${med.name}`}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
