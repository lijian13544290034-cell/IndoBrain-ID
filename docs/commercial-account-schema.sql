-- IndoBrain V2 Commercial Account Foundation
-- Apply this migration in Supabase SQL Editor before enabling account routes.

create extension if not exists pgcrypto;

create type membership_code as enum ('BASIC', 'PRO', 'VIP', 'ENTERPRISE', 'SVIP');
create type learning_direction as enum ('ZH_TO_ID', 'ID_TO_ZH');
create type account_status as enum ('ACTIVE', 'SUSPENDED');
create type account_role as enum ('SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'USER');
create type login_status as enum ('SUCCESS', 'FAILED');
create sequence if not exists user_public_id_seq start 1;

create table membership_plans (
  code membership_code primary key,
  name text not null,
  sort_order integer not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table membership_permissions (
  membership_code membership_code not null references membership_plans(code),
  permission_key text not null,
  is_allowed boolean not null default true,
  primary key (membership_code, permission_key)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique default ('IB' || lpad((nextval('user_public_id_seq'))::text, 6, '0')),
  phone text not null unique check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  password_hash text not null,
  membership_code membership_code not null default 'BASIC' references membership_plans(code),
  learning_direction learning_direction not null default 'ZH_TO_ID',
  account_status account_status not null default 'ACTIVE',
  expires_at timestamptz,
  device_id text,
  last_login_at timestamptz,
  consecutive_learning_days integer not null default 0,
  completed_experiences integer not null default 0,
  favorites_count integer not null default 0,
  scene_contributions integer not null default 0,
  register_source text,
  referrer_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  device_id text not null,
  device_label text,
  last_seen_at timestamptz not null default now(),
  unbound_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create unique index one_active_device_per_user on user_devices(user_id) where unbound_at is null;

create table account_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  device_id text,
  browser text,
  operating_system text,
  ip_address inet,
  country text,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index account_sessions_active_lookup on account_sessions(token_hash) where revoked_at is null;

create table account_learning_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  learning_direction learning_direction not null default 'ZH_TO_ID',
  total_learning_seconds bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_status account_status not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  primary key (organization_id, user_id)
);

create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references users(id),
  target_user_id uuid references users(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table roles (
  code account_role primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table role_permissions (
  role_code account_role not null references roles(code),
  permission_key text not null,
  is_allowed boolean not null default true,
  primary key (role_code, permission_key)
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_code account_role not null references roles(code),
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_code)
);

create table login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  phone text not null,
  session_id uuid references account_sessions(id) on delete set null,
  login_at timestamptz not null default now(),
  logout_at timestamptz,
  session_duration_seconds integer,
  device_id text,
  browser text,
  operating_system text,
  ip_address inet,
  country text,
  login_status login_status not null,
  failure_reason text
);

create index login_history_user_login_at on login_history(user_id, login_at desc);
create index account_sessions_online on account_sessions(last_seen_at desc) where revoked_at is null;

create table login_attempt_counters (
  phone text primary key,
  failure_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table user_local_data_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_key text not null,
  source_hash text not null,
  payload jsonb not null,
  imported_at timestamptz not null default now(),
  unique (user_id, source_key, source_hash)
);

-- Account activity is separate from learning content. It makes commercial
-- dashboard metrics database-backed without changing existing lesson data.
create table account_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null check (event_type in ('LEARNING_SECONDS', 'EXPERIENCE_COMPLETED', 'FAVORITE_ADDED')),
  quantity integer not null default 1 check (quantity >= 0),
  occurred_at timestamptz not null default now()
);

create index account_activity_events_type_occurred_at on account_activity_events(event_type, occurred_at desc);

create table account_scene_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source_import_id uuid references user_local_data_imports(id) on delete set null,
  payload jsonb not null,
  review_status text not null default 'PENDING' check (review_status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create index account_scene_contributions_status_created_at on account_scene_contributions(review_status, created_at desc);

create or replace function get_login_lock(p_phone text)
returns timestamptz
language sql
security definer
set search_path = public
as $$
  select locked_until from login_attempt_counters
  where phone = p_phone and locked_until > now()
$$;

create or replace function register_login_failure(p_phone text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
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

create or replace function clear_login_failures(p_phone text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from login_attempt_counters where phone = p_phone
$$;

insert into membership_plans (code, name, sort_order) values
  ('BASIC', 'Basic', 1), ('PRO', 'Pro', 2), ('VIP', 'VIP', 3),
  ('ENTERPRISE', 'Enterprise', 4), ('SVIP', 'SVIP', 5)
on conflict (code) do nothing;

insert into roles (code, name) values
  ('SUPER_ADMIN', 'Super Administrator'), ('ADMIN', 'Administrator'),
  ('REVIEWER', 'Content Reviewer'), ('USER', 'User')
on conflict (code) do nothing;

-- Permission decisions live in the database, never in browser code.
insert into role_permissions (role_code, permission_key) values
  ('SUPER_ADMIN', 'admin.dashboard.view'), ('SUPER_ADMIN', 'users.create'),
  ('SUPER_ADMIN', 'users.manage'), ('SUPER_ADMIN', 'roles.assign'),
  ('ADMIN', 'admin.dashboard.view'), ('ADMIN', 'users.create'), ('ADMIN', 'users.manage'),
  ('REVIEWER', 'reviews.manage')
on conflict (role_code, permission_key) do nothing;

insert into membership_permissions (membership_code, permission_key, is_allowed) values
  ('BASIC', 'learning.access', true), ('PRO', 'learning.access', true),
  ('VIP', 'learning.access', true), ('ENTERPRISE', 'learning.access', true),
  ('SVIP', 'learning.access', true)
on conflict (membership_code, permission_key) do nothing;

-- This product accesses account data only through server routes using the
-- service role. Keep direct browser access disabled.
alter table users enable row level security;
alter table user_devices enable row level security;
alter table account_sessions enable row level security;
alter table account_learning_profiles enable row level security;
alter table membership_plans enable row level security;
alter table membership_permissions enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table admin_audit_logs enable row level security;
alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;
alter table login_history enable row level security;
alter table login_attempt_counters enable row level security;
alter table user_local_data_imports enable row level security;
alter table account_activity_events enable row level security;
alter table account_scene_contributions enable row level security;

-- Server-side Route Handlers use the Supabase secret/service role. RLS still
-- blocks browser clients; these grants do not expose account data to clients.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
