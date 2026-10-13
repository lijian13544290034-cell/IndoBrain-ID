-- READ-ONLY audit; run in the intended Supabase project. Performs no writes.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('conversations','experience_events','feedback','learning_progress','account_sessions','users')
order by c.relname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename in ('conversations','experience_events','feedback','learning_progress','account_sessions','users')
order by tablename, policyname;

select table_schema, table_name, grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('conversations','experience_events','feedback','learning_progress','account_sessions','users')
order by table_name, grantee, privilege_type;
