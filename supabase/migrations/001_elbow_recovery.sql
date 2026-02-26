-- ═══════════════════════════════════════════════════════════════
-- Elbow Recovery — Full Schema
-- Project: gzibkuxugnshhnoxklcf
-- Run in: Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Users (auto-created on anonymous auth) ───────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone    TEXT NOT NULL DEFAULT 'Europe/Moscow',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user profile on auth signup (including anonymous)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (auth_id)
  VALUES (NEW.id)
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper: get current user's internal id
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()
$$;

-- ─── Exercise Sessions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id        INTEGER,
  exercise_id     TEXT NOT NULL,
  session_slot    INTEGER NOT NULL CHECK (session_slot BETWEEN 1 AND 5),
  date            DATE NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  completed_sets  INTEGER NOT NULL DEFAULT 0,
  completed_reps  INTEGER NOT NULL DEFAULT 0,
  pain_before     SMALLINT CHECK (pain_before BETWEEN 0 AND 10),
  pain_after      SMALLINT CHECK (pain_after BETWEEN 0 AND 10),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, exercise_id, started_at)
);

CREATE INDEX idx_exercise_sessions_user_date ON exercise_sessions(user_id, date DESC);

-- ─── ROM Measurements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rom_measurements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id              INTEGER,
  date                  DATE NOT NULL,
  flexion               NUMERIC(5,1) NOT NULL,
  extension_deficit     NUMERIC(5,1) NOT NULL,
  pronation             NUMERIC(5,1),
  supination            NUMERIC(5,1),
  arc                   NUMERIC(5,1) NOT NULL,
  photo_flexion         TEXT,
  photo_extension       TEXT,
  measured_by           TEXT NOT NULL CHECK (measured_by IN ('self', 'physio')),
  notes                 TEXT,
  ai_measured_flexion   NUMERIC(5,1),
  ai_measured_extension NUMERIC(5,1),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, measured_by)
);

CREATE INDEX idx_rom_user_date ON rom_measurements(user_id, date DESC);

-- ─── Pain Entries ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pain_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id      INTEGER,
  date          DATE NOT NULL,
  time          TEXT NOT NULL,
  level         SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 10),
  locations     TEXT[] NOT NULL DEFAULT '{}',
  character     TEXT[] NOT NULL DEFAULT '{}',
  triggers      TEXT[] NOT NULL DEFAULT '{}',
  crepitation   TEXT NOT NULL DEFAULT 'none' CHECK (crepitation IN ('none', 'mild', 'moderate', 'severe')),
  numbness45    BOOLEAN NOT NULL DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, time)
);

CREATE INDEX idx_pain_user_date ON pain_entries(user_id, date DESC);

-- ─── Supplement Logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplement_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id        INTEGER,
  supplement_id   TEXT NOT NULL,
  date            DATE NOT NULL,
  slot            TEXT NOT NULL CHECK (slot IN ('fasting', 'breakfast', 'lunch', 'dinner', 'bedtime')),
  taken           BOOLEAN NOT NULL DEFAULT FALSE,
  taken_at        TIMESTAMPTZ,
  skipped_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, supplement_id, slot)
);

CREATE INDEX idx_supplement_logs_user_date ON supplement_logs(user_id, date DESC);

-- ─── Custom Supplements ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_supplements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id        INTEGER,
  supplement_id   TEXT NOT NULL,
  name            TEXT NOT NULL,
  dose            TEXT NOT NULL DEFAULT '',
  timing          TEXT NOT NULL DEFAULT '',
  slot            TEXT NOT NULL CHECK (slot IN ('fasting', 'breakfast', 'lunch', 'dinner', 'bedtime')),
  priority        SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  category        TEXT NOT NULL DEFAULT 'compound' CHECK (category IN (
    'mineral', 'vitamin', 'protein', 'fatty_acid', 'compound', 'herb', 'aminoacid'
  )),
  reason          TEXT NOT NULL DEFAULT '',
  supplement_created_at TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, supplement_id)
);

CREATE INDEX idx_custom_supplements_user ON custom_supplements(user_id);

-- ─── Sleep Logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sleep_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id    INTEGER,
  date        DATE NOT NULL,
  bed_time    TEXT NOT NULL,
  wake_time   TEXT NOT NULL,
  total_hours NUMERIC(4,2) NOT NULL,
  quality     SMALLINT NOT NULL CHECK (quality BETWEEN 1 AND 5),
  wake_ups    INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_sleep_user_date ON sleep_logs(user_id, date DESC);

-- ─── Appointments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id    INTEGER,
  date        DATE NOT NULL,
  time        TEXT,
  type        TEXT NOT NULL CHECK (type IN ('ct', 'doctor', 'bloodTest', 'physio', 'other')),
  title       TEXT NOT NULL,
  location    TEXT,
  notes       TEXT,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_date ON appointments(user_id, date DESC);

-- ─── Daily Logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id            INTEGER,
  date                DATE NOT NULL,
  hanging_hours       NUMERIC(4,2) NOT NULL DEFAULT 0,
  fine_motor          TEXT[] NOT NULL DEFAULT '{}',
  sessions_completed  INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date DESC);

-- ─── Skipped Sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skipped_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id     INTEGER,
  session_slot INTEGER NOT NULL CHECK (session_slot BETWEEN 1 AND 5),
  date         DATE NOT NULL,
  reason       TEXT NOT NULL DEFAULT '',
  skipped_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, session_slot)
);

CREATE INDEX idx_skipped_user_date ON skipped_sessions(user_id, date DESC);

-- ─── Mood Entries ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id    INTEGER,
  date        DATE NOT NULL,
  mood        SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  energy      SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  note        TEXT,
  mood_created_at TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_mood_user_date ON mood_entries(user_id, date DESC);

-- ─── Journal Entries ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id        INTEGER,
  date            DATE NOT NULL,
  title           TEXT,
  content         TEXT NOT NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  entry_created_at TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, entry_created_at)
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, date DESC);

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rom_measurements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_supplements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE skipped_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries     ENABLE ROW LEVEL SECURITY;

-- RLS Policies — each user sees only their own data
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth_id = auth.uid());

CREATE POLICY "exercise_sessions_own" ON exercise_sessions
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "rom_measurements_own" ON rom_measurements
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "pain_entries_own" ON pain_entries
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "supplement_logs_own" ON supplement_logs
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "custom_supplements_own" ON custom_supplements
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "sleep_logs_own" ON sleep_logs
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "appointments_own" ON appointments
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "daily_logs_own" ON daily_logs
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "skipped_sessions_own" ON skipped_sessions
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "mood_entries_own" ON mood_entries
  FOR ALL USING (user_id = current_user_id());

CREATE POLICY "journal_entries_own" ON journal_entries
  FOR ALL USING (user_id = current_user_id());
