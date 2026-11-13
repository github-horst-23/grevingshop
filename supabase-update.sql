begin;
alter table public.shopping_items add column if not exists category_mode text not null default 'auto' check (category_mode in ('auto','manual'));
grant update(category_mode) on public.shopping_items to authenticated;
create table if not exists public.shopping_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 preferences jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint shopping_preferences_object check (jsonb_typeof(preferences)='object'),
 constraint shopping_preferences_keys check (preferences - array['theme','scheme','font','density'] = '{}'::jsonb),
 constraint shopping_preferences_theme check (preferences->>'theme' is null or preferences->>'theme' in ('light','dark')),
 constraint shopping_preferences_scheme check (preferences->>'scheme' is null or preferences->>'scheme' in ('energy','lavender','lagoon','apricot','verdelia','noctara','iriselle','marea','rosavelle')),
 constraint shopping_preferences_font check (preferences->>'font' is null or preferences->>'font' in ('standard','large')),
 constraint shopping_preferences_density check (preferences->>'density' is null or preferences->>'density' in ('comfortable','compact'))
);
alter table public.shopping_preferences enable row level security;
revoke all on public.shopping_preferences from anon,authenticated;
grant select,insert,update on public.shopping_preferences to authenticated;
drop policy if exists shopping_preferences_read on public.shopping_preferences;
drop policy if exists shopping_preferences_create on public.shopping_preferences;
drop policy if exists shopping_preferences_update on public.shopping_preferences;
create policy shopping_preferences_read on public.shopping_preferences for select to authenticated using (user_id=(select auth.uid()) and (select public.shopping_family_member()));
create policy shopping_preferences_create on public.shopping_preferences for insert to authenticated with check (user_id=(select auth.uid()) and (select public.shopping_family_member()));
create policy shopping_preferences_update on public.shopping_preferences for update to authenticated using (user_id=(select auth.uid()) and (select public.shopping_family_member())) with check (user_id=(select auth.uid()) and (select public.shopping_family_member()));
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='shopping_preferences') then
  alter publication supabase_realtime add table public.shopping_preferences;
 end if;
end $$;
commit;
