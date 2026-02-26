import Dexie, { type EntityTable, type Table } from 'dexie';

// ─── Sync metadata ──────────────────────────────────────────────
// _uuid: stable identifier for Supabase sync (generated on creation)
// _synced: false = needs push to Supabase

interface SyncMeta {
  _uuid?: string;
  _synced?: boolean;
}

// ─── Entity Interfaces ──────────────────────────────────────────────

export interface ExerciseSession extends SyncMeta {
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

export interface ROMMeasurement extends SyncMeta {
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

export interface PainEntry extends SyncMeta {
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

export interface SupplementLog extends SyncMeta {
  id?: number;
  supplementId: string;
  date: string; // YYYY-MM-DD
  slot: 'fasting' | 'breakfast' | 'lunch' | 'dinner' | 'bedtime';
  taken: boolean;
  takenAt?: string; // ISO 8601
  skippedReason?: string;
}

export interface CustomSupplement extends SyncMeta {
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

export interface SleepLog extends SyncMeta {
  id?: number;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:MM or ISO
  wakeTime: string; // HH:MM or ISO
  totalHours: number;
  quality: number; // 1–5
  wakeUps: number;
  notes?: string;
}

export interface Appointment extends SyncMeta {
  id?: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: 'ct' | 'doctor' | 'bloodTest' | 'physio' | 'other';
  title: string;
  location?: string;
  notes?: string;
  completed: boolean;
}

export interface DailyLog extends SyncMeta {
  id?: number;
  date: string; // YYYY-MM-DD
  hangingHours: number;
  fineMotor: string[];
  sessionsCompleted: number;
  notes?: string;
}

export interface SkippedSession extends SyncMeta {
  id?: number;
  sessionSlot: number; // 1–5 matching DailySession.id
  date: string; // YYYY-MM-DD
  reason: string; // user's comment
  skippedAt: string; // ISO 8601
}

export interface MoodEntry extends SyncMeta {
  id?: number;
  date: string; // YYYY-MM-DD
  mood: number; // 1–5 (1=very bad, 5=great)
  energy: number; // 1–5
  note?: string;
  createdAt: string; // ISO 8601
}

export interface JournalEntry extends SyncMeta {
  id?: number;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO 8601
}

// ─── Database ────────────────────────────────────────────────────────

const V5_STORES = {
  exerciseSessions: '++id, _uuid, _synced, date, exerciseId, sessionSlot, [date+sessionSlot]',
  romMeasurements: '++id, _uuid, _synced, date',
  painEntries: '++id, _uuid, _synced, date',
  supplementLogs: '++id, _uuid, _synced, date, supplementId, [date+slot]',
  sleepLogs: '++id, _uuid, _synced, &date',
  appointments: '++id, _uuid, _synced, date, type',
  dailyLogs: '++id, _uuid, _synced, &date',
  skippedSessions: '++id, _uuid, _synced, date, sessionSlot',
  moodEntries: '++id, _uuid, _synced, &date',
  journalEntries: '++id, _uuid, _synced, date',
  customSupplements: '++id, _uuid, _synced, &supplementId, slot',
};

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

    // v5: Add _uuid and _synced fields for Supabase sync
    this.version(5).stores(V5_STORES).upgrade(tx => {
      const tables = [
        'exerciseSessions', 'romMeasurements', 'painEntries',
        'supplementLogs', 'sleepLogs', 'appointments', 'dailyLogs',
        'skippedSessions', 'moodEntries', 'journalEntries', 'customSupplements',
      ] as const;

      return Promise.all(
        tables.map(tableName =>
          tx.table(tableName).toCollection().modify(record => {
            if (!record._uuid) {
              record._uuid = crypto.randomUUID();
            }
            if (record._synced === undefined) {
              record._synced = false;
            }
          })
        )
      );
    });
  }
}

export const db = new RecoveryDatabase();
