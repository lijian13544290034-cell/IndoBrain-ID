-- Apply once to the existing non-production IndoBrain account project.

alter table users drop constraint if exists users_phone_check;
alter table users add constraint users_phone_check check (phone ~ '^\+[1-9][0-9]{6,14}$');

create table if not exists login_attempt_counters (
  phone text primary key,
  failure_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists user_local_data_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_key text not null,
  source_hash text not null,
  payload jsonb not null,
  imported_at timestamptz not null default now(),
  unique (user_id, source_key, source_hash)
);

create or replace function get_login_lock(p_phone text) returns timestamptz language sql security definer set search_path = public as $$
  select locked_until from login_attempt_counters where phone = p_phone and locked_until > now()
$$;

create or replace function register_login_failure(p_phone text) returns timestamptz language plpgsql security definer set search_path = public as $$
declare result timestamptz;
begin
  insert into login_attempt_counters (phone, failure_count, window_started_at, locked_until, updated_at)
  values (p_phone, 1, now(), null, now())
  on conflict (phone) do update set
    failure_count = case when login_attempt_counters.window_started_at < now() - interval '15 minutes' then 1 else login_attempt_counters.failure_count + 1 end,
    window_started_at = case when login_attempt_counters.window_started_at < now() - interval '15 minutes' then now() else login_attempt_counters.window_started_at end,
    locked_until = case when (case when login_attempt_counters.window_started_at < now() - interval '15 minutes' then 1 else login_attempt_counters.failure_count + 1 end) >= 5 then now() + interval '15 minutes' else null end,
    updated_at = now()
  returning locked_until into result;
  return result;
end;
$$;

create or replace function clear_login_failures(p_phone text) returns void language sql security definer set search_path = public as $$
  delete from login_attempt_counters where phone = p_phone
$$;

alter table login_attempt_counters enable row level security;
alter table user_local_data_imports enable row level security;

create table if not exists account_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null check (event_type in ('LEARNING_SECONDS', 'EXPERIENCE_COMPLETED', 'FAVORITE_ADDED')),
  quantity integer not null default 1 check (quantity >= 0),
  occurred_at timestamptz not null default now()
);

create index if not exists account_activity_events_type_occurred_at on account_activity_events(event_type, occurred_at desc);

create table if not exists account_scene_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_import_id uuid references user_local_data_imports(id) on delete set null,
  payload jsonb not null,
  review_status text not null default 'PENDING' check (review_status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create index if not exists account_scene_contributions_status_created_at on account_scene_contributions(review_status, created_at desc);

alter table account_activity_events enable row level security;
alter table account_scene_contributions enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into membership_permissions (membership_code, permission_key, is_allowed) values
  ('BASIC', 'learning.access', true), ('PRO', 'learning.access', true), ('VIP', 'learning.access', true),
  ('ENTERPRISE', 'learning.access', true), ('SVIP', 'learning.access', true)
on conflict (membership_code, permission_key) do nothing;
