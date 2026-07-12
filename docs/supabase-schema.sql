create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role_type text not null,
  user_message text not null,
  assistant_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists experience_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  experience_id text not null,
  action text not null check (action in ('viewed', 'copied', 'next_clicked', 'previous_clicked')),
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  experience_id text not null,
  helpful boolean not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists learning_progress (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  module_type text not null,
  experience_id text,
  progress_value integer not null default 0,
  updated_at timestamptz not null default now()
);
