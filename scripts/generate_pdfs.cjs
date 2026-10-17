const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// -------------------------------------------------------------
// 1. Generate Patient Medication & Adherence Report PDF
// -------------------------------------------------------------
function generatePatientReport() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Primary Brand Colors: Teal #0f766e, Slate #1e293b, Amber #d97706
  const primaryColor = [15, 118, 110]; // #0f766e
  const darkSlate = [30, 41, 59]; // #1e293b
  const mutedGray = [100, 116, 139]; // #64748b

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MEDITRACK · PATIENT MEDICATION & ADHERENCE REPORT', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Generated: ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 14, 20);

  // Patient & Clinical Overview Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 182, 32, 3, 3, 'FD');

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT PROFILE & SUMMARY', 20, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedGray);
  doc.text('Primary Patient: All Family Members (Me, Mom, Dad)', 20, 45);
  doc.text('Active Prescriptions: 4 Medications Registered', 20, 51);
  doc.text('Primary Physician: Dr. E. Bennett, MD (Internal Medicine)', 20, 57);

  doc.text('Overall 7-Day Adherence: 88% Compliance', 110, 45);
  doc.text('Adherence Streak: 5 Consecutive Days', 110, 51);
  doc.text('Status: Good Compliance (Low Risk)', 110, 57);

  // Section 1: Active Prescriptions Table
  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Active Prescription Regimen & Dosage Schedule', 14, 72);

  const medsData = [
    ['Metformin', '500 mg (1 tablet)', 'Me', '08:00 AM, 08:00 PM', 'Every day', 'With breakfast & dinner with water', '24 doses left'],
    ['Atorvastatin', '20 mg (1 tablet)', 'Me', '09:30 PM', 'Every day', 'Take before bedtime', '18 doses left'],
    ['Vitamin D3 & Calcium', '1000 IU (1 softgel)', 'Mom', '01:00 PM', 'Mon - Fri', 'Take after lunch for best absorption', '45 doses left'],
    ['Carboxymethylcellulose', '2 drops per eye', 'Dad', '09:00 AM, 06:00 PM', 'Every day', 'Blink gently, keep bottle tip clean', '12 doses left'],
  ];

  autoTable(doc, {
    startY: 76,
    head: [['Medication', 'Dosage', 'Patient', 'Times', 'Repeat Days', 'Instructions & Notes', 'Inventory']],
    body: medsData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 26 },
      2: { cellWidth: 16 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 42 },
      6: { cellWidth: 18 },
    },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  const adherenceStartY = doc.lastAutoTable.finalY + 12;

  // Section 2: 7-Day Adherence Log
  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. 7-Day Medication Adherence Log', 14, adherenceStartY);

  const adherenceData = [
    ['Oct 11', 'Saturday', '4', '4', '0', '0', '100% (Full Compliance)'],
    ['Oct 12', 'Sunday', '4', '3', '0', '1', '75% (1 missed evening dose)'],
    ['Oct 13', 'Monday', '5', '5', '0', '0', '100% (Full Compliance)'],
    ['Oct 14', 'Tuesday', '5', '4', '1', '0', '80% (1 skipped by choice)'],
    ['Oct 15', 'Wednesday', '5', '5', '0', '0', '100% (Full Compliance)'],
    ['Oct 16', 'Thursday', '5', '5', '0', '0', '100% (Full Compliance)'],
    ['Oct 17', 'Friday (Today)', '5', '4', '0', '0', '80% (1 dose upcoming)'],
  ];

  autoTable(doc, {
    startY: adherenceStartY + 4,
    head: [['Date', 'Day', 'Total Due', 'Taken', 'Skipped', 'Missed', 'Adherence Score']],
    body: adherenceData,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 2.5,
    },
    theme: 'striped',
    margin: { left: 14, right: 14 },
  });

  // Doctor & Pharmacy Sign-Off Section
  const signStartY = doc.lastAutoTable.finalY + 12;

  doc.setDrawColor(203, 213, 225);
  doc.line(14, signStartY, 196, signStartY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkSlate);
  doc.text('3. Clinical Review & Pharmacy Verification', 14, signStartY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedGray);
  doc.text('Physician Signature: _____________________________________   Date: _______________', 14, signStartY + 18);
  doc.text('Clinical Notes / Dose Adjustments: __________________________________________________________________', 14, signStartY + 26);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Notice: MediTrack is an adherence reminder and digital health tracking tool. Follow your prescribing physician\'s instructions.', 14, 285);
  doc.text('Page 1 of 1', 185, 285);

  const outputPath = path.join(publicDir, 'meditrack-medication-report.pdf');
  doc.save(outputPath);
  console.log('Saved patient report to:', outputPath);
}

// -------------------------------------------------------------
// 2. Generate Website Architecture & User Guide PDF
// -------------------------------------------------------------
function generateWebsiteGuide() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 118, 110];
  const darkSlate = [30, 41, 59];
  const mutedGray = [100, 116, 139];

  // Cover / Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MediTrack · System Architecture & UI/UX User Guide', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Complete Operational Specification & Technical Reference', 14, 27);

  // Section 1: Overview
  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Product Overview & Core Design Goals', 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkSlate);
  const overviewText = doc.splitTextToSize(
    'MediTrack is a high-reliability medication reminder and adherence tracking web application designed with health ergonomics, multi-person family support, and responsive touch-first design. The system operates on zero external database dependency by default, leveraging browser-isolated LocalStorage with instant JSON backup export/import and Web Audio synthesizer chimes for alert generation.',
    182
  );
  doc.text(overviewText, 14, 55);

  // Section 2: Key System Capabilities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Key UI/UX Modules & Capabilities', 14, 75);

  const capabilities = [
    ['Today\'s Schedule', 'Real-time timeline displaying all scheduled doses grouped chronologically. Features quick status indicators (Due Now, Upcoming, Taken, Snoozed, Skipped, Missed).'],
    ['7-Day Adherence Rings', 'Visual radial rings displaying day-by-day compliance rates (K/T). Clicking any ring opens that day\'s complete medication checklist.'],
    ['Web Audio Chimes', 'Gentle harmonic multi-tone synthesizer (C5, E5, G5 arpeggio) built on the Web Audio API with exponential gain release to ensure alerts are audible yet pleasant.'],
    ['Dose State Machine', 'Dynamic status resolver accounting for scheduled times, 2-hour grace period for missed doses, custom snooze timers, and instant undo capabilities.'],
    ['Medicine Cabinet', 'Comprehensive prescription management with pill form factors (tablets, capsules, liquids, drops, inhalers), food instructions, and stock countdown with 1-click refill.'],
    ['Simulation Console', 'Interactive UI test toolbar allowing reviewers and clinicians to fast-forward hours, jump to morning/afternoon/night, and test alert banners immediately.'],
    ['Data Portability & PDF', 'Full JSON database export/import and clinical-grade vector PDF export for doctor consultations and pharmacy refills.'],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Module', 'Functional Description & Ergonomics']],
    body: capabilities,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 137 },
    },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  // Section 3: Dose State Lifecycle
  const lifecycleY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Dose Lifecycle State Diagram', 14, lifecycleY);

  const states = [
    ['UPCOMING', 'Current time is earlier than the scheduled dose timestamp. Shows scheduled time in HH:MM.'],
    ['DUE NOW', 'Current time reaches scheduled timestamp. Audio chime triggers, banner rings, vibration/push alerted.'],
    ['SNOOZED', 'User requested 10-minute postponement. Mutes alert and sets countdown timer.'],
    ['TAKEN', 'User confirmed dose ingestion. Stock decrements by 1; adherence score increases; success tone plays.'],
    ['MISSED', 'Current time exceeds scheduled time by more than 2 hours without confirmation.'],
    ['SKIPPED', 'User intentionally deferred or declined dose (e.g. physician advised fasting). Recorded separately from missed.'],
  ];

  autoTable(doc, {
    startY: lifecycleY + 4,
    head: [['State', 'Behavioral Trigger & State Actions']],
    body: states,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: darkSlate,
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 147 },
    },
    theme: 'striped',
    margin: { left: 14, right: 14 },
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('MediTrack Documentation · Version 2.0.0 · AI Studio Build', 14, 285);
  doc.text('Page 1 of 1', 185, 285);

  const outputPath = path.join(publicDir, 'meditrack-system-documentation.pdf');
  doc.save(outputPath);
  console.log('Saved system documentation to:', outputPath);
}

generatePatientReport();
generateWebsiteGuide();
