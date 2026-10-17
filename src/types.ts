export type PillForm = 'tablet' | 'capsule' | 'liquid' | 'drops' | 'inhaler' | 'injection' | 'topical';

export type PillColor = 'teal' | 'blue' | 'indigo' | 'amber' | 'rose' | 'emerald' | 'purple';

export type FoodInstruction = 'after_meal' | 'before_meal' | 'with_meal' | 'empty_stomach' | 'anytime';

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  person: string;
  notes: string;
  times: string[]; // e.g. ["08:00", "20:00"]
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  start: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  form?: PillForm;
  color?: PillColor;
  stock?: number;
  refillThreshold?: number;
  foodInstruction?: FoodInstruction;
}

export type DoseStatus = 'upcoming' | 'due' | 'snoozed' | 'missed' | 'taken' | 'skipped';

export interface DoseItem {
  key: string;
  m: Medicine;
  t: string; // "HH:MM"
  day: string; // "YYYY-MM-DD"
  status: DoseStatus;
  scheduledDateTime: Date;
  snoozedUntil?: number;
  loggedStatus?: 'taken' | 'skipped';
}

export interface DayAdherence {
  date: Date;
  dayString: string;
  weekdayLabel: string;
  totalDue: number;
  taken: number;
  skipped: number;
  missed: number;
  percentage: number;
}

export interface AppDatabase {
  meds: Medicine[];
  log: Record<string, 'taken' | 'skipped'>;
  snooze: Record<string, number>; // key -> timestamp ms
}
