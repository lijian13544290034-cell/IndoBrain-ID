-- IndoBrain Phase 2 commercial administration upgrade.
-- Apply only to the NON-PRODUCTION Supabase project after commercial-account-schema.sql.

alter type account_status add value if not exists 'DELETED';

alter table users
  add column if not exists member_level membership_code generated always as (membership_code) stored,
  add column if not exists expire_at timestamptz generated always as (expires_at) stored,
  add column if not exists created_by uuid references users(id),
  add column if not exists updated_by uuid references users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references users(id);

create index if not exists users_active_created_at on users(created_at desc) where deleted_at is null;
create index if not exists users_expiry_active on users(expires_at) where deleted_at is null and expires_at is not null;

update membership_plans set name = case code
  when 'BASIC' then '基础会员'
  when 'PRO' then 'Pro会员'
  when 'VIP' then 'VIP会员'
  when 'ENTERPRISE' then '企业会员'
  when 'SVIP' then 'SVIP会员'
end;
