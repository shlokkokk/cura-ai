-- ═══════════════════════════════════════════════════════════════════
-- Run this migration in the Supabase SQL Editor to bring your
-- existing database in sync with the latest schema.
-- If setting up for the first time, run schema.sql instead.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Create users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  institution text,
  role text not null default 'student' check (role in ('student', 'faculty', 'admin')),
  year_of_study text,
  specialization text,
  avatar_color text default '#43d9ad',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Add user_id column to sessions (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Add status column to sessions (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.sessions ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'));
  END IF;
END $$;

-- 4. Add missing columns to session_evaluations
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS diagnosis_submitted text;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS reasoning_submitted text;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS likely_diagnosis text;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS differential_diagnoses jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS red_flags_addressed jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS red_flags_missed jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS expected_questions_covered jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS expected_questions_missed jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS recommended_tests jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS communication_observations jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS communication_goals jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 5. Create indexes (safe to re-run)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);

-- 6. Enable RLS and add permissive policies for service role
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop-and-recreate to avoid "already exists" errors on re-run
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on sessions" ON public.sessions;
CREATE POLICY "Service role full access on sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on session_messages" ON public.session_messages;
CREATE POLICY "Service role full access on session_messages" ON public.session_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on session_evaluations" ON public.session_evaluations;
CREATE POLICY "Service role full access on session_evaluations" ON public.session_evaluations FOR ALL USING (true) WITH CHECK (true);

-- Done! Your database is now fully up to date.
