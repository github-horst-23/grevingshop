-- GrevingShop: original item creators. No contacts or credentials required.
-- Prerequisite: existing shopping tables and protected family profile functions.
begin;
-- Returns only the already approved family accounts' names and IDs, never emails.
-- auth.uid()/auth.jwt() still refer to the calling user under SECURITY DEFINER.
create or replace function public.shopping_user_names()
returns table(user_id uuid,display_name text)
language sql stable security definer set search_path='' as $$
 select u.id, p.display_name
 from auth.users u
 join public.shopping_family_profiles() p on lower(u.email)=lower(p.email)
 where (select public.shopping_family_member());
$$;
revoke all on function public.shopping_user_names() from public,anon;
grant execute on function public.shopping_user_names() to authenticated;
-- Record the actual signed-in creator and keep that identity for the item's life.
create or replace function public.shopping_keep_item_creator()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  if auth.uid() is not null then new.created_by=auth.uid();end if;
 elsif new.created_by is distinct from old.created_by then
  raise exception 'Original item creator cannot be changed' using errcode='42501';
 end if;
 return new;
end;
$$;
revoke all on function public.shopping_keep_item_creator() from public,anon,authenticated;
drop trigger if exists shopping_keep_item_creator on public.shopping_items;
create trigger shopping_keep_item_creator before insert or update on public.shopping_items
 for each row execute function public.shopping_keep_item_creator();
notify pgrst, 'reload schema';
commit;
