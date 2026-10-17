import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Bell,
  Volume2,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { AppDatabase } from '../types';
import { ymd } from '../storage';
import { getNotificationPermission, requestNotificationPermission } from '../notifications';

interface DataBackupViewProps {
  db: AppDatabase;
  onImportDatabase: (importedDb: AppDatabase) => void;
  onResetDatabase: () => void;
  onLoadSampleData: () => void;
  onTestChime: () => void;
  onExportPdf: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const DataBackupView: React.FC<DataBackupViewProps> = ({
  db,
  onImportDatabase,
  onResetDatabase,
  onLoadSampleData,
  onTestChime,
  onExportPdf,
  audioEnabled,
  onToggleAudio,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifState, setNotifState] = useState<NotificationPermission>(getNotificationPermission());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(db, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditrack-backup-${ymd(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.meds) || typeof parsed.log !== 'object') {
        throw new Error('Invalid file format');
      }

      onImportDatabase({
        meds: parsed.meds,
        log: parsed.log || {},
        snooze: parsed.snooze || {},
      });
      setStatusMessage({ type: 'success', text: 'Backup restored successfully!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'That file is not a valid MediTrack backup file.' });
    }
    e.target.value = '';
  };

  const handleRequestNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifState(perm);
    if (perm === 'granted') {
      setStatusMessage({ type: 'success', text: 'Push notifications enabled.' });
    } else {
      setStatusMessage({ type: 'error', text: 'Notification permission was not granted.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Data, Backups & Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          MediTrack stores your medication records locally in this browser. Export backups to prevent data loss.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-teal-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PDF Export & Documentation Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">
            PDF Medical Reports & System Documentation
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Generate high-resolution printable PDF documents for physician visits, pharmacy consultations, or offline health records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Dynamic Live PDF */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">
                Patient Medical Report
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Generates a live vector PDF of your active prescriptions, dosage instructions, and 7-day adherence history.
              </p>
            </div>
            <button
              type="button"
              onClick={onExportPdf}
              className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Live PDF
            </button>
          </div>

          {/* Card 2: System Documentation PDF */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">
                Website Architecture Guide
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Download the technical specification and UI/UX user manual detailing the dose state machine and audio engine.
              </p>
            </div>
            <a
              href="/meditrack-system-documentation.pdf"
              download="meditrack-system-documentation.pdf"
              className="w-full py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              Download Guide (PDF)
            </a>
          </div>

          {/* Card 3: Browser Print to PDF */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1">
                Print / Save as PDF
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                Trigger clean browser print dialog formatted with clinical print-ready styles and high contrast.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print Page (Ctrl+P)
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">JSON Backup & Restore</h3>
        <p className="text-xs text-slate-500 mb-4">
          Save your database as a portable JSON file or restore from a previously exported backup.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Backup (.json)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Backup (.json)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={onLoadSampleData}
            className="px-4 py-2.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Load Sample Prescription Data
          </button>
        </div>
      </div>

      {/* Audio & Alerts Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Chimes & Device Notifications
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Configure how MediTrack alerts you when a scheduled dose is due.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sound Chimes */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-teal-700 shadow-2xs">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Sound Chimes</span>
                <span className="text-[11px] text-slate-500">
                  {audioEnabled ? 'Audible chimes active' : 'Muted'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTestChime}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Test Sound
              </button>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  audioEnabled
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {audioEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-amber-700 shadow-2xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Desktop Notifications
                </span>
                <span className="text-[11px] text-slate-500 capitalize">
                  Status: {notifState}
                </span>
              </div>
            </div>

            {notifState !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotif}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
              >
                Enable
              </button>
            ) : (
              <span className="text-xs font-semibold text-teal-700 bg-teal-100/60 px-2 py-1 rounded">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone: Wipe Data */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-rose-900 mb-0.5">Danger Zone</h3>
            <p className="text-xs text-rose-700">
              Permanently delete all registered medicines, schedules, and logging history from this browser.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWipeConfirm(true)}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete All Medication Data?
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will permanently delete all {db.meds.length} medications and your logged adherence history. This action cannot be undone. Consider downloading an export backup first.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowWipeConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setShowWipeConfirm(false);
                  setStatusMessage({ type: 'success', text: 'All data has been wiped.' });
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed text-center">
        MediTrack is a digital reminder tool and adherence visualizer, not medical advice. Always consult your physician or pharmacist regarding medication schedules, adverse reactions, and dosages.
      </div>
    </div>
  );
};
