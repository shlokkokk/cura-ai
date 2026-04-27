create extension if not exists "pgcrypto";

-- ─── Users ───

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

-- ─── Sessions ───

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  case_id text not null,
  user_id uuid references public.users(id) on delete set null,
  learner_name text null,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Messages ───

create table if not exists public.session_messages (
  id uuid primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  text text not null,
  created_at timestamptz not null default now()
);

-- ─── Evaluations ───

create table if not exists public.session_evaluations (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  diagnosis_correct boolean not null,
  diagnosis_submitted text,
  reasoning_submitted text,
  likely_diagnosis text,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  expected_learning_focus jsonb not null default '[]'::jsonb,
  asked_coverage jsonb not null default '[]'::jsonb,
  differential_diagnoses jsonb not null default '[]'::jsonb,
  red_flags_addressed jsonb not null default '[]'::jsonb,
  red_flags_missed jsonb not null default '[]'::jsonb,
  expected_questions_covered jsonb not null default '[]'::jsonb,
  expected_questions_missed jsonb not null default '[]'::jsonb,
  recommended_tests jsonb not null default '[]'::jsonb,
  communication_observations jsonb not null default '[]'::jsonb,
  communication_goals jsonb not null default '[]'::jsonb,
  feedback_summary text null,
  provider text not null,
  model text not null,
  created_at timestamptz not null default now()
);

-- ─── Row Level Security (allow service role full access) ───

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.session_messages enable row level security;
alter table public.session_evaluations enable row level security;

create policy "Service role full access on users" on public.users for all using (true) with check (true);
create policy "Service role full access on sessions" on public.sessions for all using (true) with check (true);
create policy "Service role full access on session_messages" on public.session_messages for all using (true) with check (true);
create policy "Service role full access on session_evaluations" on public.session_evaluations for all using (true) with check (true);

-- ─── Indexes ───

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_sessions_case_id on public.sessions(case_id);
create index if not exists idx_sessions_user_id on public.sessions(user_id, created_at desc);
create index if not exists idx_sessions_status on public.sessions(status);
create index if not exists idx_session_messages_session_id on public.session_messages(session_id, created_at);
create index if not exists idx_session_evaluations_session_id on public.session_evaluations(session_id, created_at desc);

-- ─── Migration helper (run this if the table already exists without the new column) ───
-- ALTER TABLE public.session_evaluations ADD COLUMN IF NOT EXISTS communication_goals jsonb NOT NULL DEFAULT '[]'::jsonb;
