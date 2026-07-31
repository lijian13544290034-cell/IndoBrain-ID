-- IndoBrain V2.0: batch student account management
-- Apply ONLY to the non-production Supabase project used by the development Preview.

alter table users
  add column if not exists display_name text,
  add column if not exists must_change_password boolean not null default false,
  add column if not exists created_by_batch_id uuid,
  add column if not exists initial_password_issued_at timestamptz;

create table if not exists student_import_batches (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references users(id),
  source_file_name text,
  total_rows integer not null check (total_rows >= 0 and total_rows <= 500),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  created_rows integer not null default 0 check (created_rows >= 0),
  failed_rows integer not null default 0 check (failed_rows >= 0),
  skipped_rows integer not null default 0 check (skipped_rows >= 0),
  failure_records jsonb not null default '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users
  add constraint users_created_by_batch_id_fkey
  foreign key (created_by_batch_id) references student_import_batches(id)
  on delete set null;

create index if not exists student_import_batches_actor_created_at on student_import_batches(actor_user_id, created_at desc);
create index if not exists users_created_by_batch_id on users(created_by_batch_id) where created_by_batch_id is not null;

alter table student_import_batches enable row level security;
-- Browser clients have no direct grants. All reads/writes use server-side Service Role routes.
