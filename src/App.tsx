import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppDatabase,
  DayAdherence,
  DoseItem,
  Medicine,
} from './types';
import {
  computeWeeklyAdherence,
  createBlankDatabase,
  getHydratedDoses,
  loadDatabase,
  SAMPLE_MEDS,
  saveDatabase,
  ymd,
} from './storage';
import { playChime, playSuccessSound } from './audio';
import { sendDoseNotification } from './notifications';
import { generateLivePdfReport } from './pdfGenerator';
import { Navbar, ActiveTab } from './components/Navbar';
import { DueAlertBanner } from './components/DueAlertBanner';
import { TodaySchedule } from './components/TodaySchedule';
import { AdherenceView } from './components/AdherenceView';
import { MedicineCabinet } from './components/MedicineCabinet';
import { DataBackupView } from './components/DataBackupView';
import { AddMedicineModal } from './components/AddMedicineModal';
import { SimulationBar } from './components/SimulationBar';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(loadDatabase);
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPerson, setSelectedPerson] = useState<string>('All');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('meditrack_audio') !== 'false';
  });

  // Time simulation offset for interactive UI/UX testing
  const [virtualOffsetMinutes, setVirtualOffsetMinutes] = useState<number>(0);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [realClock, setRealClock] = useState<Date>(new Date());

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  // Track which doses have already chimed during this session
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(new Set());
  const [dismissedBannerKey, setDismissedBannerKey] = useState<string | null>(null);

  // Keep real clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRealClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute effective "current time" (real time + virtual offset)
  const currentSimulatedTime = useMemo(() => {
    return new Date(realClock.getTime() + virtualOffsetMinutes * 60000);
  }, [realClock, virtualOffsetMinutes]);

  // Save database updates
  const updateDb = useCallback((newDb: AppDatabase) => {
    setDb(newDb);
    saveDatabase(newDb);
  }, []);

  // Today string based on simulated time
  const simulatedTodayString = useMemo(() => ymd(currentSimulatedTime), [currentSimulatedTime]);
  const isSelectedDateToday = ymd(selectedDate) === simulatedTodayString;

  // Doses for the currently selected date
  const selectedDateDoses = useMemo(() => {
    return getHydratedDoses(selectedDate, db, currentSimulatedTime);
  }, [selectedDate, db, currentSimulatedTime]);

  // Doses for the simulated today (for alerts)
  const todayDoses = useMemo(() => {
    return getHydratedDoses(currentSimulatedTime, db, currentSimulatedTime);
  }, [db, currentSimulatedTime]);

  // Doses that are currently Due or Snoozed for the alert banner
  const dueDoses = useMemo(() => {
    return todayDoses.filter(
      (d) =>
        (d.status === 'due' || d.status === 'snoozed') &&
        d.key !== dismissedBannerKey
    );
  }, [todayDoses, dismissedBannerKey]);

  // Sound chime trigger for due medications
  useEffect(() => {
    todayDoses.forEach((dose) => {
      if (dose.status === 'due' && !notifiedKeys.has(dose.key)) {
        setNotifiedKeys((prev) => new Set(prev).add(dose.key));
        if (audioEnabled) {
          playChime(0.6);
        }
        sendDoseNotification(dose);
      }
    });
  }, [todayDoses, audioEnabled, notifiedKeys]);

  // Unique list of persons from registered medicines
  const allPersons = useMemo(() => {
    const persons = Array.from(new Set(db.meds.map((m) => m.person).filter(Boolean)));
    return ['All', ...persons];
  }, [db.meds]);

  // 7-Day Adherence data
  const weeklyAdherenceData = useMemo<DayAdherence[]>(() => {
    return computeWeeklyAdherence(db, currentSimulatedTime);
  }, [db, currentSimulatedTime]);

  // Handlers for Dose Actions
  const handleMarkTaken = useCallback(
    (key: string) => {
      const nextLog = { ...db.log, [key]: 'taken' as const };
      const nextSnooze = { ...db.snooze };
      delete nextSnooze[key];

      // If medicine has stock, decrement by 1
      const medId = key.split('|')[1];
      const nextMeds = db.meds.map((m) => {
        if (m.id === medId && m.stock !== undefined && m.stock > 0) {
          return { ...m, stock: m.stock - 1 };
        }
        return m;
      });

      updateDb({
        ...db,
        meds: nextMeds,
        log: nextLog,
        snooze: nextSnooze,
      });

      playSuccessSound();
    },
    [db, updateDb]
  );

  const handleMarkSkipped = useCallback(
    (key: string) => {
      const nextLog = { ...db.log, [key]: 'skipped' as const };
      const nextSnooze = { ...db.snooze };
      delete nextSnooze[key];

      updateDb({
        ...db,
        log: nextLog,
        snooze: nextSnooze,
      });
    },
    [db, updateDb]
  );

  const handleSnooze = useCallback(
    (key: string, minutes: number) => {
      const snoozeUntil = currentSimulatedTime.getTime() + minutes * 60000;
      const nextSnooze = { ...db.snooze, [key]: snoozeUntil };

      // Remove from notified so it can alert again when snooze expires
      setNotifiedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      updateDb({
        ...db,
        snooze: nextSnooze,
      });
    },
    [db, currentSimulatedTime, updateDb]
  );

  const handleUndo = useCallback(
    (key: string) => {
      const nextLog = { ...db.log };
      const prevStatus = nextLog[key];
      delete nextLog[key];

      // Restore stock if undoing 'taken'
      const medId = key.split('|')[1];
      const nextMeds = db.meds.map((m) => {
        if (m.id === medId && prevStatus === 'taken' && m.stock !== undefined) {
          return { ...m, stock: m.stock + 1 };
        }
        return m;
      });

      updateDb({
        ...db,
        meds: nextMeds,
        log: nextLog,
      });
    },
    [db, updateDb]
  );

  // Medicine Management Handlers
  const handleSaveMedicine = useCallback(
    (med: Medicine) => {
      const exists = db.meds.some((m) => m.id === med.id);
      let updatedMeds: Medicine[];
      if (exists) {
        updatedMeds = db.meds.map((m) => (m.id === med.id ? med : m));
      } else {
        updatedMeds = [...db.meds, med];
      }
      updateDb({ ...db, meds: updatedMeds });
    },
    [db, updateDb]
  );

  const handleDeleteMedicine = useCallback(
    (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to delete ${name}?`)) {
        const updatedMeds = db.meds.filter((m) => m.id !== id);
        updateDb({ ...db, meds: updatedMeds });
      }
    },
    [db, updateDb]
  );

  const handleRefillStock = useCallback(
    (id: string, amount: number) => {
      const updatedMeds = db.meds.map((m) => {
        if (m.id === id) {
          const currentStock = m.stock || 0;
          return { ...m, stock: currentStock + amount };
        }
        return m;
      });
      updateDb({ ...db, meds: updatedMeds });
    },
    [db, updateDb]
  );

  // Toggle Audio
  const handleToggleAudio = () => {
    const nextVal = !audioEnabled;
    setAudioEnabled(nextVal);
    localStorage.setItem('meditrack_audio', String(nextVal));
    if (nextVal) {
      playChime(0.5);
    }
  };

  // UI Simulation Time controls
  const handleFastForwardHours = (hours: number) => {
    setVirtualOffsetMinutes((prev) => prev + hours * 60);
  };

  const handleJumpToTime = (hh: number, mm: number) => {
    const target = new Date(realClock);
    target.setHours(hh, mm, 0, 0);
    const diffMs = target.getTime() - realClock.getTime();
    setVirtualOffsetMinutes(Math.round(diffMs / 60000));
  };

  const handleResetTime = () => {
    setVirtualOffsetMinutes(0);
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date(currentSimulatedTime));
  };

  const handleExportPdf = useCallback(() => {
    generateLivePdfReport(db, currentSimulatedTime, selectedPerson);
  }, [db, currentSimulatedTime, selectedPerson]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Simulation Console Drawer */}
      {showSimulator && (
        <SimulationBar
          currentSimulatedTime={currentSimulatedTime}
          realTime={realClock}
          virtualOffsetMinutes={virtualOffsetMinutes}
          onSetOffsetMinutes={setVirtualOffsetMinutes}
          onFastForwardHours={handleFastForwardHours}
          onJumpToTime={handleJumpToTime}
          onResetTime={handleResetTime}
          onTestChime={() => playChime(0.6)}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {/* Main Top Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setEditingMed(null);
          setIsAddModalOpen(true);
        }}
        onExportPdf={handleExportPdf}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleSimulator={() => setShowSimulator((prev) => !prev)}
        isSimulatingTime={virtualOffsetMinutes !== 0}
      />

      {/* Page Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Urgent Medication Reminder Banner */}
        <DueAlertBanner
          dueDoses={dueDoses}
          onMarkTaken={handleMarkTaken}
          onSnooze={handleSnooze}
          onDismiss={() => {
            if (dueDoses[0]) setDismissedBannerKey(dueDoses[0].key);
          }}
          onPlayChime={() => playChime(0.7)}
        />

        {/* View Switching */}
        {activeTab === 'schedule' && (
          <TodaySchedule
            doses={selectedDateDoses}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onResetToToday={handleResetToToday}
            isToday={isSelectedDateToday}
            onMarkTaken={handleMarkTaken}
            onMarkSkipped={handleMarkSkipped}
            onSnooze={handleSnooze}
            onUndo={handleUndo}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            allPersons={allPersons}
            onOpenAddModal={() => {
              setEditingMed(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {activeTab === 'adherence' && (
          <AdherenceView
            weeklyData={weeklyAdherenceData}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onGoToSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'cabinet' && (
          <MedicineCabinet
            meds={db.meds}
            onOpenAddModal={() => {
              setEditingMed(null);
              setIsAddModalOpen(true);
            }}
            onEditMedicine={(med) => {
              setEditingMed(med);
              setIsAddModalOpen(true);
            }}
            onDeleteMedicine={handleDeleteMedicine}
            onRefillStock={handleRefillStock}
          />
        )}

        {activeTab === 'backup' && (
          <DataBackupView
            db={db}
            onImportDatabase={updateDb}
            onResetDatabase={() => {
              const blank = createBlankDatabase();
              updateDb(blank);
            }}
            onLoadSampleData={() => {
              const sampleDb: AppDatabase = {
                meds: SAMPLE_MEDS,
                log: {},
                snooze: {},
              };
              updateDb(sampleDb);
            }}
            onTestChime={() => playChime(0.7)}
            onExportPdf={handleExportPdf}
            audioEnabled={audioEnabled}
            onToggleAudio={handleToggleAudio}
          />
        )}
      </main>

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMed(null);
        }}
        onSave={handleSaveMedicine}
        editingMed={editingMed}
        existingPersons={allPersons.filter((p) => p !== 'All')}
      />

      {/* Subtle, accessible footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediTrack · Medicine Reminder & Adherence System</span>
          <span className="text-[11px] text-slate-400">
            Reminders run in this browser. Keep tab active for audible chimes.
          </span>
        </div>
      </footer>
    </div>
  );
}
