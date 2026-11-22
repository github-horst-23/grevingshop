-- GrevingShop: private lists. Run once in the existing shared Supabase project.
-- Idempotent. Existing lists remain shared. No contacts or credentials required.
begin;
lock table public.shopping_lists, public.shopping_items in share row exclusive mode;
alter table public.shopping_lists add column if not exists visibility text not null default 'shared';
alter table public.shopping_lists drop constraint if exists shopping_lists_visibility;
alter table public.shopping_lists add constraint shopping_lists_visibility check (visibility in ('shared','private'));
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
-- These restrictive policies also constrain existing or additional permissive policies.
drop policy if exists shopping_lists_visibility_guard on public.shopping_lists;
create policy shopping_lists_visibility_guard on public.shopping_lists as restrictive for all to authenticated
 using ((select public.shopping_family_member()) and (visibility='shared' or created_by=(select auth.uid())))
 with check ((select public.shopping_family_member()) and (visibility='shared' or created_by=(select auth.uid())));
drop policy if exists shopping_items_visibility_guard on public.shopping_items;
create policy shopping_items_visibility_guard on public.shopping_items as restrictive for all to authenticated
 using ((select public.shopping_family_member()) and exists(select 1 from public.shopping_lists l where l.id=list_id))
 with check ((select public.shopping_family_member()) and exists(select 1 from public.shopping_lists l where l.id=list_id));
-- Explicitly keep anonymous access disabled, including when other permissive policies exist.
drop policy if exists shopping_lists_no_anonymous on public.shopping_lists;
create policy shopping_lists_no_anonymous on public.shopping_lists as restrictive for all to anon using(false) with check(false);
drop policy if exists shopping_items_no_anonymous on public.shopping_items;
create policy shopping_items_no_anonymous on public.shopping_items as restrictive for all to anon using(false) with check(false);
-- Owner, identity and visibility cannot be changed via a row update.
create or replace function public.shopping_keep_list_privacy() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  if auth.uid() is not null then new.created_by=auth.uid();end if;
 elsif new.created_by is distinct from old.created_by or new.visibility is distinct from old.visibility or new.id is distinct from old.id then
  raise exception 'List owner and visibility cannot be changed' using errcode='42501';
 end if;
 return new;
end;
$$;
revoke all on function public.shopping_keep_list_privacy() from public,anon,authenticated;
drop trigger if exists shopping_keep_list_privacy on public.shopping_lists;
create trigger shopping_keep_list_privacy before insert or update on public.shopping_lists for each row execute function public.shopping_keep_list_privacy();
-- Only primary keys may appear in delete events, never old private names/notes.
alter table public.shopping_lists replica identity default;
alter table public.shopping_items replica identity default;
create or replace function public.shopping_privacy_version() returns integer language sql stable security invoker set search_path='' as $$ select 1; $$;
revoke all on function public.shopping_privacy_version() from public,anon;
grant execute on function public.shopping_privacy_version() to authenticated;
notify pgrst, 'reload schema';
commit;
