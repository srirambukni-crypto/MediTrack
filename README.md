# MediTrack — Medicine Reminder & Adherence Tracker

> A patient-first medication tracking application with real-time dose evaluation, multi-tone Web Audio chimes, 7-day SVG radial adherence rings, prescription inventory tracking, and clinical PDF report generation.

---

## 🔗 Live Application & Resource Links

- **🚀 Live Application (Web App)**: [https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app](https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app)
- **📋 Patient Medication & Adherence Report (PDF)**: [https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app/meditrack-medication-report.pdf](https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app/meditrack-medication-report.pdf)
- **📖 System Architecture & UI/UX User Manual (PDF)**: [https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app/meditrack-system-documentation.pdf](https://ais-pre-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app/meditrack-system-documentation.pdf)
- **🛠️ Development Preview**: [https://ais-dev-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app](https://ais-dev-kqmqhoej6zps77uf3xufo5-486917597009.asia-east1.run.app)

---

## ✨ Key Features

- **Today's Dose Schedule**:
  - Live dose states: `Upcoming`, `Due Now`, `Snoozed`, `Taken`, `Missed` (2-hr grace period), `Skipped`.
  - Accessible $\ge 44\text{px}$ touch hitboxes with tactile feedback.
  - Multi-person filter tabs (`All`, `Me`, `Mom`, `Dad`, etc.) and status toggles.
  - Instant `[✓ Taken]`, `[Skip]`, `[Snooze 10m]`, and `[Undo]` actions.

- **7-Day Visual Adherence Rings**:
  - Interactive SVG radial progress rings displaying percentage, day, date, and `K/T` ratio.
  - One-tap date drill-down to review or edit previous logs.
  - Active streak tracking and compliance scoring.

- **Harmonic Web Audio Alerts**:
  - Calm, melodic tri-tone synthesizer chime (C5 → E5 → G5 arpeggio) via the Web Audio API.
  - Browser notifications support via the Notifications API.

- **Medicine Cabinet & Stock Refills**:
  - Form factors: Tablets, Capsules, Liquids, Drops, Inhalers, Injections.
  - Stock tracking with low-inventory warnings and 1-click `+30 Refill`.

- **Clinical PDF Export**:
  - In-app 1-click export of clinical-grade vector PDF medical reports (`jsPDF` + `autoTable`).
  - Print-ready stylesheet for standard browser print (`Ctrl+P`).

- **Interactive UI/UX Simulator**:
  - Built-in time travel toolbar to fast-forward hours, trigger morning/noon/night presets, and test alert chimes instantly.

- **Privacy & Data Portability**:
  - 100% private in-browser storage (LocalStorage).
  - Single-click JSON backup export and import.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Audio Engine**: Native Web Audio API

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
git clone <your-github-repo-url>
cd meditrack
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License

Apache-2.0 License.
