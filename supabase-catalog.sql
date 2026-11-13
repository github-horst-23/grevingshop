-- VOR AUSFÜHRUNG: Platzhalter-Adressen im SQL Editor durch freigegebene Konten ersetzen. Echte Adressen nicht öffentlich hochladen.
begin;
alter table public.shopping_lists add column if not exists updated_at timestamptz;
alter table public.shopping_lists add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.shopping_lists add column if not exists updated_by_name text;
update public.shopping_lists set updated_at=created_at where updated_at is null;
alter table public.shopping_lists alter column updated_at set default now();
create or replace function public.shopping_actor_name() returns text language sql stable security invoker set search_path='' as $$
 select case lower(coalesce(auth.jwt()->>'email','')) when 'carsten@example.invalid' then 'Carsten' when 'kathrin@example.invalid' then 'Kathrin' when 'mathilda@example.invalid' then 'Mathilda' when 'mariette@example.invalid' then 'Mariette' else 'Unbekannt' end;
$$;
revoke all on function public.shopping_actor_name() from public;
grant execute on function public.shopping_actor_name() to authenticated;
create or replace function public.shopping_stamp_list() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=clock_timestamp();new.updated_by=auth.uid();new.updated_by_name=public.shopping_actor_name();return new;end $$;
drop trigger if exists shopping_stamp_list on public.shopping_lists;
create trigger shopping_stamp_list before insert or update on public.shopping_lists for each row execute function public.shopping_stamp_list();
create or replace function public.shopping_touch_parent() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='DELETE' then update public.shopping_lists set updated_at=clock_timestamp() where id=old.list_id;return old;end if;
 update public.shopping_lists set updated_at=clock_timestamp() where id=new.list_id;
 if TG_OP='UPDATE' and old.list_id<>new.list_id then update public.shopping_lists set updated_at=clock_timestamp() where id=old.list_id;end if;
 return new;
end $$;
revoke all on function public.shopping_touch_parent() from public,anon,authenticated;
drop trigger if exists shopping_touch_parent on public.shopping_items;
create trigger shopping_touch_parent after insert or update or delete on public.shopping_items for each row execute function public.shopping_touch_parent();
create table if not exists public.shopping_catalog (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 150),
 normalized_name text generated always as (lower(regexp_replace(btrim(name),'\s+',' ','g'))) stored unique,
 quantity text not null default '1' check(length(quantity)<=60),
 note text not null default '' check(length(note)<=1000),
 category text not null default 'Sonstiges' check(category in ('Obst & Gemüse','Brot & Backwaren','Vorrat','Kühlregal','Getränke','Haushalt','Sonstiges')),
 category_mode text not null default 'auto' check(category_mode in ('auto','manual')),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.shopping_catalog enable row level security;
revoke all on public.shopping_catalog from anon,authenticated;
grant select,insert,delete on public.shopping_catalog to authenticated;
grant update(name,quantity,note,category,category_mode) on public.shopping_catalog to authenticated;
drop policy if exists shopping_catalog_read on public.shopping_catalog;
drop policy if exists shopping_catalog_create on public.shopping_catalog;
drop policy if exists shopping_catalog_update on public.shopping_catalog;
drop policy if exists shopping_catalog_delete on public.shopping_catalog;
create policy shopping_catalog_read on public.shopping_catalog for select to authenticated using ((select public.shopping_family_member()));
create policy shopping_catalog_create on public.shopping_catalog for insert to authenticated with check ((select public.shopping_family_member()) and created_by=(select auth.uid()));
create policy shopping_catalog_update on public.shopping_catalog for update to authenticated using ((select public.shopping_family_member())) with check ((select public.shopping_family_member()));
create policy shopping_catalog_delete on public.shopping_catalog for delete to authenticated using ((select public.shopping_family_member()));
create or replace function public.shopping_add_item(p_list_id uuid,p_name text,p_quantity text,p_note text,p_category text,p_category_mode text,p_save_to_catalog boolean default false)
returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 insert into public.shopping_items(list_id,name,quantity,note,category,category_mode) values(p_list_id,btrim(p_name),p_quantity,p_note,p_category,p_category_mode) returning id into result;
 if p_save_to_catalog then
  insert into public.shopping_catalog(name,quantity,note,category,category_mode) values(btrim(p_name),p_quantity,p_note,p_category,p_category_mode)
  on conflict(normalized_name) do update set quantity=excluded.quantity,note=excluded.note,category=excluded.category,category_mode=excluded.category_mode;
 end if;
 return result;
end $$;
revoke all on function public.shopping_add_item(uuid,text,text,text,text,text,boolean) from public,anon;
grant execute on function public.shopping_add_item(uuid,text,text,text,text,text,boolean) to authenticated;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='shopping_catalog') then
  alter publication supabase_realtime add table public.shopping_catalog;
 end if;
end $$;
commit;

create or replace function public.shopping_family_profiles()
returns table(display_name text,email text) language sql stable security invoker set search_path='' as $$
 select names.display_name,names.email from (values
 ('Carsten','carsten@example.invalid'),('Kathrin','kathrin@example.invalid'),('Mathilda','mathilda@example.invalid'),('Mariette','mariette@example.invalid')
 ) as names(display_name,email) where (select public.shopping_family_member());
$$;
revoke all on function public.shopping_family_profiles() from public,anon;
grant execute on function public.shopping_family_profiles() to authenticated;
