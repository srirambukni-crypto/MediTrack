import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppDatabase, DayAdherence } from './types';
import { computeWeeklyAdherence, DAYS_SHORT, formatTime12h, ymd } from './storage';

/**
 * Generate and trigger download of a live Patient Medication & Adherence PDF report
 */
export function generateLivePdfReport(
  db: AppDatabase,
  now: Date,
  selectedPerson = 'All'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 118, 110]; // #0f766e
  const darkSlate = [30, 41, 59]; // #1e293b
  const mutedGray = [100, 116, 139]; // #64748b

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MEDITRACK · PATIENT MEDICATION & ADHERENCE REPORT', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Generated on ${now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    14,
    20
  );

  // Compute 7-day metrics
  const weeklyData: DayAdherence[] = computeWeeklyAdherence(db, now);
  const totalDueWeek = weeklyData.reduce((acc, curr) => acc + curr.totalDue, 0);
  const totalTakenWeek = weeklyData.reduce((acc, curr) => acc + curr.taken, 0);
  const adherenceRate =
    totalDueWeek > 0 ? Math.round((totalTakenWeek / totalDueWeek) * 100) : 100;

  // Filter medicines by person if applicable
  const targetMeds = db.meds.filter(
    (m) => selectedPerson === 'All' || m.person === selectedPerson
  );

  // Patient Profile Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 30, 182, 32, 3, 3, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT PROFILE & SUMMARY', 20, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`Patient Profile: ${selectedPerson}`, 20, 45);
  doc.text(`Active Medications: ${targetMeds.length} items registered`, 20, 51);
  doc.text(`Tracking Period: Past 7 Days (${weeklyData[0]?.dayString} to ${weeklyData[6]?.dayString})`, 20, 57);

  doc.text(`Overall 7-Day Adherence: ${adherenceRate}% Compliance`, 115, 45);
  doc.text(`Completed Doses: ${totalTakenWeek} of ${totalDueWeek} Doses`, 115, 51);
  doc.text(`Adherence Tier: ${adherenceRate >= 80 ? 'High Adherence' : 'Action Required'}`, 115, 57);

  // Table 1: Active Prescriptions
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Active Prescription Regimen & Administration Schedule', 14, 71);

  const tableRows = targetMeds.map((med) => {
    const isEveryday = med.days.length === 7;
    const daysStr = isEveryday ? 'Every day' : med.days.map((d) => DAYS_SHORT[d]).join(', ');
    const timesStr = med.times.map((t) => formatTime12h(t)).join(', ');
    const stockStr = med.stock !== undefined ? `${med.stock} doses left` : 'Unspecified';

    return [
      med.name,
      med.dose || '—',
      med.person || 'Me',
      timesStr,
      daysStr,
      med.notes || 'None',
      stockStr,
    ];
  });

  autoTable(doc, {
    startY: 75,
    head: [['Medication', 'Dosage', 'Patient', 'Times', 'Repeat Days', 'Notes / Instructions', 'Inventory']],
    body: tableRows.length > 0 ? tableRows : [['No medications registered.', '', '', '', '', '', '']],
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [darkSlate[0], darkSlate[1], darkSlate[2]],
      fontSize: 8,
      cellPadding: 2.8,
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

  // Table 2: 7-Day Adherence Breakdown
  const adherenceStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. 7-Day Adherence Log & Outcome History', 14, adherenceStartY);

  const adherenceRows = weeklyData.map((d) => {
    return [
      d.dayString,
      d.weekdayLabel,
      String(d.totalDue),
      String(d.taken),
      String(d.skipped),
      String(d.missed),
      d.totalDue > 0 ? `${d.percentage}% Compliance` : 'No doses scheduled',
    ];
  });

  autoTable(doc, {
    startY: adherenceStartY + 4,
    head: [['Date', 'Day', 'Scheduled', 'Taken', 'Skipped', 'Missed', 'Adherence Outcome']],
    body: adherenceRows,
    headStyles: {
      fillColor: [darkSlate[0], darkSlate[1], darkSlate[2]],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [darkSlate[0], darkSlate[1], darkSlate[2]],
      fontSize: 8,
      cellPadding: 2.5,
    },
    theme: 'striped',
    margin: { left: 14, right: 14 },
  });

  // Clinical Sign-Off Section
  const signY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (signY < 255) {
    doc.setDrawColor(203, 213, 225);
    doc.line(14, signY, 196, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('3. Physician / Pharmacist Verification & Sign-Off', 14, signY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('Physician Signature: _____________________________________   Date: _______________', 14, signY + 16);
    doc.text('Clinical Observations: __________________________________________________________________', 14, signY + 23);
  }

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'MediTrack Digital Healthcare Companion · Formatted for clinical review & patient records.',
    14,
    286
  );
  doc.text('Page 1 of 1', 185, 286);

  // Trigger browser download
  const filename = `meditrack-report-${ymd(now)}.pdf`;
  doc.save(filename);
}
