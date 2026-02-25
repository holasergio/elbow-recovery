import Dexie, { type EntityTable, type Table } from 'dexie';

// ─── Entity Interfaces ──────────────────────────────────────────────

export interface ExerciseSession {
  id?: number;
  exerciseId: string;
  sessionSlot: number; // 1–5
  date: string; // YYYY-MM-DD
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  completedSets: number;
  completedReps: number;
  painBefore?: number; // 0–10
  painAfter?: number; // 0–10
  notes?: string;
}

export interface ROMMeasurement {
  id?: number;
  date: string; // YYYY-MM-DD
  flexion: number; // degrees
  extensionDeficit: number; // degrees
  pronation?: number; // degrees
  supination?: number; // degrees
  arc: number; // computed: flexion - extensionDeficit
  photoFlexion?: string; // base64 or blob URL
  photoExtension?: string; // base64 or blob URL
  measuredBy: 'self' | 'physio';
  notes?: string;
  aiMeasuredFlexion?: number;
  aiMeasuredExtension?: number;
}

export interface PainEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  level: number; // 0–10
  locations: string[];
  character: string[];
  triggers: string[];
  crepitation: 'none' | 'mild' | 'moderate' | 'severe';
  numbness45: boolean;
  notes?: string;
}

export interface SupplementLog {
  id?: number;
  supplementId: string;
  date: string; // YYYY-MM-DD
  slot: 'fasting' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime';
  taken: boolean;
  takenAt?: string; // ISO 8601
  skippedReason?: string;
}

export interface CustomSupplement {
  id?: number
  supplementId: string // e.g. 'custom_1707123456789'
  name: string
  dose: string
  timing: string
  slot: 'fasting' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime'
  priority: 1 | 2 | 3
  category: 'mineral' | 'vitamin' | 'protein' | 'fatty_acid' | 'compound' | 'herb' | 'aminoacid'
  reason: string
  createdAt: string // ISO 8601
}

export interface SleepLog {
  id?: number;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:MM or ISO
  wakeTime: string; // HH:MM or ISO
  totalHours: number;
  quality: number; // 1–5
  wakeUps: number;
  notes?: string;
}

export interface Appointment {
  id?: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: 'ct' | 'doctor' | 'bloodTest' | 'physio' | 'other';
  title: string;
  location?: string;
  notes?: string;
  completed: boolean;
}

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  hangingHours: number;
  fineMotor: string[];
  sessionsCompleted: number;
  notes?: string;
}

export interface SkippedSession {
  id?: number;
  sessionSlot: number; // 1–5 matching DailySession.id
  date: string; // YYYY-MM-DD
  reason: string; // user's comment
  skippedAt: string; // ISO 8601
}

export interface MoodEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  mood: number; // 1–5 (1=very bad, 5=great)
  energy: number; // 1–5
  note?: string;
  createdAt: string; // ISO 8601
}

export interface JournalEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO 8601
}

// ─── Database ────────────────────────────────────────────────────────

class RecoveryDatabase extends Dexie {
  exerciseSessions!: EntityTable<ExerciseSession, 'id'>;
  romMeasurements!: EntityTable<ROMMeasurement, 'id'>;
  painEntries!: EntityTable<PainEntry, 'id'>;
  supplementLogs!: EntityTable<SupplementLog, 'id'>;
  sleepLogs!: EntityTable<SleepLog, 'id'>;
  appointments!: EntityTable<Appointment, 'id'>;
  dailyLogs!: EntityTable<DailyLog, 'id'>;
  skippedSessions!: Table<SkippedSession>;
  moodEntries!: EntityTable<MoodEntry, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  customSupplements!: EntityTable<CustomSupplement, 'id'>;

  constructor() {
    super('RecoveryDB');

    this.version(1).stores({
      exerciseSessions: '++id, date, exerciseId, sessionSlot, [date+sessionSlot]',
      romMeasurements: '++id, date',
      painEntries: '++id, date',
      supplementLogs: '++id, date, supplementId, [date+slot]',
      sleepLogs: '++id, &date',
      appointments: '++id, date, type',
      dailyLogs: '++id, &date',
    });

    this.version(2).stores({
      exerciseSessions: '++id, date, exerciseId, sessionSlot, [date+sessionSlot]',
      romMeasurements: '++id, date',
      painEntries: '++id, date',
      supplementLogs: '++id, date, supplementId, [date+slot]',
      sleepLogs: '++id, &date',
      appointments: '++id, date, type',
      dailyLogs: '++id, &date',
      skippedSessions: '++id, date, sessionSlot',
    });

    this.version(3).stores({
      exerciseSessions: '++id, date, exerciseId, sessionSlot, [date+sessionSlot]',
      romMeasurements: '++id, date',
      painEntries: '++id, date',
      supplementLogs: '++id, date, supplementId, [date+slot]',
      sleepLogs: '++id, &date',
      appointments: '++id, date, type',
      dailyLogs: '++id, &date',
      skippedSessions: '++id, date, sessionSlot',
      moodEntries: '++id, &date',
      journalEntries: '++id, date',
    });

    this.version(4).stores({
      exerciseSessions: '++id, date, exerciseId, sessionSlot, [date+sessionSlot]',
      romMeasurements: '++id, date',
      painEntries: '++id, date',
      supplementLogs: '++id, date, supplementId, [date+slot]',
      sleepLogs: '++id, &date',
      appointments: '++id, date, type',
      dailyLogs: '++id, &date',
      skippedSessions: '++id, date, sessionSlot',
      moodEntries: '++id, &date',
      journalEntries: '++id, date',
      customSupplements: '++id, &supplementId, slot',
    });
  }
}

export const db = new RecoveryDatabase();
