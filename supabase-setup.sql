begin;
create or replace function public.shopping_family_member() returns boolean
language sql stable security invoker set search_path = '' as $$
 select auth.uid() is not null and lower(coalesce(auth.jwt()->>'email','')) in
 ('grevingcarsten@gmail.com','grevingkathrin@gmail.com','mathildagreving@gmail.com','mariettegreving@gmail.com');
$$;
revoke all on function public.shopping_family_member() from public;
grant execute on function public.shopping_family_member() to authenticated;
create table if not exists public.shopping_lists (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 100),
 note text not null default '' check(length(note)<=1000),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 archived boolean not null default false
);
create table if not exists public.shopping_items (
 id uuid primary key default gen_random_uuid(),
 list_id uuid not null references public.shopping_lists(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 150),
 quantity text not null default '1' check(length(quantity)<=60),
 note text not null default '' check(length(note)<=1000),
 category text not null default 'Sonstiges' check(category in ('Obst & Gemüse','Kühlregal','Brot & Backwaren','Vorrat','Getränke','Haushalt','Sonstiges')),
 checked boolean not null default false,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists shopping_items_list_idx on public.shopping_items(list_id);
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
revoke all on public.shopping_lists,public.shopping_items from anon,authenticated;
grant select,insert,delete on public.shopping_lists,public.shopping_items to authenticated;
grant update(name,note,archived) on public.shopping_lists to authenticated;
grant update(name,quantity,note,category,checked) on public.shopping_items to authenticated;
drop policy if exists shopping_lists_read on public.shopping_lists;
drop policy if exists shopping_lists_create on public.shopping_lists;
drop policy if exists shopping_lists_update on public.shopping_lists;
drop policy if exists shopping_lists_delete on public.shopping_lists;
create policy shopping_lists_read on public.shopping_lists for select to authenticated using ((select public.shopping_family_member()));
create policy shopping_lists_create on public.shopping_lists for insert to authenticated with check ((select public.shopping_family_member()) and created_by=(select auth.uid()));
create policy shopping_lists_update on public.shopping_lists for update to authenticated using ((select public.shopping_family_member())) with check ((select public.shopping_family_member()));
create policy shopping_lists_delete on public.shopping_lists for delete to authenticated using ((select public.shopping_family_member()));
drop policy if exists shopping_items_read on public.shopping_items;
drop policy if exists shopping_items_create on public.shopping_items;
drop policy if exists shopping_items_update on public.shopping_items;
drop policy if exists shopping_items_delete on public.shopping_items;
create policy shopping_items_read on public.shopping_items for select to authenticated using ((select public.shopping_family_member()));
create policy shopping_items_create on public.shopping_items for insert to authenticated with check ((select public.shopping_family_member()) and created_by=(select auth.uid()));
create policy shopping_items_update on public.shopping_items for update to authenticated using ((select public.shopping_family_member())) with check ((select public.shopping_family_member()));
create policy shopping_items_delete on public.shopping_items for delete to authenticated using ((select public.shopping_family_member()));
commit;

-- Supabase Realtime nur für die beiden neuen Einkaufslisten-Tabellen aktivieren.
do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='shopping_lists') then
  alter publication supabase_realtime add table public.shopping_lists;
 end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='shopping_items') then
  alter publication supabase_realtime add table public.shopping_items;
 end if;
end $$;
select tablename from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename in ('shopping_lists','shopping_items');

-- Persönliche Einstellungen und automatische Produktkategorien.
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
