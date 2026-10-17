import { AppDatabase, DayAdherence, DoseItem, DoseStatus, Medicine } from './types';

const STORAGE_KEY = 'meditrack_v2';
const LEGACY_STORAGE_KEY = 'meditrack';

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const pad = (n: number): string => String(n).padStart(2, '0');

export const ymd = (d: Date): string => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const parseYmd = (ymdStr: string): Date => {
  const [y, m, d] = ymdStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatTime12h = (t24: string): string => {
  const [hStr, mStr] = t24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

export const SAMPLE_MEDS: Medicine[] = [
  {
    id: 'sample-1',
    name: 'Metformin',
    dose: '500 mg (1 tablet)',
    person: 'Me',
    notes: 'Take with breakfast and plenty of water',
    times: ['08:00', '20:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    start: ymd(new Date(Date.now() - 14 * 86400000)),
    form: 'tablet',
    color: 'teal',
    stock: 24,
    refillThreshold: 8,
    foodInstruction: 'with_meal',
  },
  {
    id: 'sample-2',
    name: 'Atorvastatin',
    dose: '20 mg (1 tablet)',
    person: 'Me',
    notes: 'Take before bedtime',
    times: ['21:30'],
    days: [0, 1, 2, 3, 4, 5, 6],
    start: ymd(new Date(Date.now() - 30 * 86400000)),
    form: 'capsule',
    color: 'blue',
    stock: 18,
    refillThreshold: 7,
    foodInstruction: 'anytime',
  },
  {
    id: 'sample-3',
    name: 'Vitamin D3 & Calcium',
    dose: '1000 IU (1 softgel)',
    person: 'Mom',
    notes: 'Take after lunch for best absorption',
    times: ['13:00'],
    days: [1, 2, 3, 4, 5],
    start: ymd(new Date(Date.now() - 7 * 86400000)),
    form: 'capsule',
    color: 'amber',
    stock: 45,
    refillThreshold: 10,
    foodInstruction: 'after_meal',
  },
  {
    id: 'sample-4',
    name: 'Carboxymethylcellulose Eye Drops',
    dose: '2 drops per eye',
    person: 'Dad',
    notes: 'Keep bottle tip clean, blink gently',
    times: ['09:00', '18:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    start: ymd(new Date(Date.now() - 5 * 86400000)),
    form: 'drops',
    color: 'emerald',
    stock: 12,
    refillThreshold: 5,
    foodInstruction: 'anytime',
  },
];

export const createBlankDatabase = (): AppDatabase => ({
  meds: [],
  log: {},
  snooze: {},
});

export const loadDatabase = (): AppDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.meds)) {
        return {
          meds: parsed.meds,
          log: parsed.log || {},
          snooze: parsed.snooze || {},
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse saved database:', err);
  }

  // Seed with sample medicines and mock past 6 days history for a rich initial experience
  const initial = createBlankDatabase();
  initial.meds = SAMPLE_MEDS;

  // Pre-seed some taken logs for previous days so the 7-day adherence rings demonstrate value immediately
  const now = new Date();
  for (let i = 1; i <= 6; i++) {
    const pastDate = new Date(now.getTime() - i * 86400000);
    const pastDay = ymd(pastDate);
    const pastDayOfWeek = pastDate.getDay();

    SAMPLE_MEDS.forEach((med) => {
      if (med.days.includes(pastDayOfWeek)) {
        med.times.forEach((t, idx) => {
          const key = `${pastDay}|${med.id}|${t}`;
          // 85% adherence pattern
          if (idx === 0 || i % 4 !== 0) {
            initial.log[key] = 'taken';
          } else {
            initial.log[key] = 'skipped';
          }
        });
      }
    });
  }

  saveDatabase(initial);
  return initial;
};

export const saveDatabase = (db: AppDatabase): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

/**
 * Get all doses scheduled for a given date
 */
export function getDosesFor(d: Date, db: AppDatabase): { m: Medicine; t: string; day: string; key: string }[] {
  const day = ymd(d);
  const dayOfWeek = d.getDay();
  const out: { m: Medicine; t: string; day: string; key: string }[] = [];

  for (const m of db.meds) {
    if (!m.days.includes(dayOfWeek)) continue;
    if (day < m.start) continue;
    if (m.end && day > m.end) continue;

    for (const t of m.times) {
      out.push({
        m,
        t,
        day,
        key: `${day}|${m.id}|${t}`,
      });
    }
  }

  return out.sort((a, b) => a.t.localeCompare(b.t));
}

/**
 * Determine current status of a dose item relative to the provided current time
 */
export function getDoseStatus(
  item: { m: Medicine; t: string; day: string; key: string },
  db: AppDatabase,
  now: Date
): DoseStatus {
  if (db.log[item.key]) {
    return db.log[item.key];
  }

  const [hh, mm] = item.t.split(':');
  const [yearStr, monthStr, dateStr] = item.day.split('-');
  const scheduled = new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dateStr, 10),
    parseInt(hh, 10),
    parseInt(mm, 10),
    0,
    0
  );

  const snoozeTimestamp = db.snooze[item.key];
  if (snoozeTimestamp && now.getTime() < snoozeTimestamp) {
    return 'snoozed';
  }

  if (now < scheduled) {
    return 'upcoming';
  }

  // Grace period before marking missed: 2 hours (2 * 3600 * 1000 ms)
  const missedThresholdMs = 2 * 60 * 60 * 1000;
  if (now.getTime() - scheduled.getTime() > missedThresholdMs) {
    return 'missed';
  }

  return 'due';
}

/**
 * Get full hydrated dose items with status for a specific date
 */
export function getHydratedDoses(d: Date, db: AppDatabase, now: Date): DoseItem[] {
  const rawList = getDosesFor(d, db);
  return rawList.map((raw) => {
    const [hh, mm] = raw.t.split(':');
    const [yearStr, monthStr, dateStr] = raw.day.split('-');
    const scheduledDateTime = new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dateStr, 10),
      parseInt(hh, 10),
      parseInt(mm, 10)
    );

    const status = getDoseStatus(raw, db, now);
    return {
      ...raw,
      status,
      scheduledDateTime,
      snoozedUntil: db.snooze[raw.key],
      loggedStatus: db.log[raw.key],
    };
  });
}

/**
 * Compute 7-day adherence metrics
 */
export function computeWeeklyAdherence(db: AppDatabase, now: Date): DayAdherence[] {
  const results: DayAdherence[] = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dayString = ymd(targetDate);
    const weekdayLabel = DAYS_SHORT[targetDate.getDay()];

    const doses = getDosesFor(targetDate, db);
    let totalDue = 0;
    let taken = 0;
    let skipped = 0;
    let missed = 0;

    doses.forEach((raw) => {
      const s = getDoseStatus(raw, db, now);
      // Only count doses that are already reached (not upcoming or currently snoozed if not today)
      if (s === 'taken') {
        taken++;
        totalDue++;
      } else if (s === 'skipped') {
        skipped++;
        totalDue++;
      } else if (s === 'missed') {
        missed++;
        totalDue++;
      } else if (s === 'due') {
        totalDue++;
      }
    });

    const percentage = totalDue > 0 ? Math.round((taken / totalDue) * 100) : 100;

    results.push({
      date: targetDate,
      dayString,
      weekdayLabel,
      totalDue,
      taken,
      skipped,
      missed,
      percentage: totalDue === 0 ? 0 : percentage,
    });
  }

  return results;
}
