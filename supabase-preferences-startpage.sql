-- Erlaubt den Startbereich; bestehende Einstellungen und Zugriffsregeln bleiben erhalten.
begin;
alter table public.shopping_preferences
 drop constraint if exists shopping_preferences_keys,
 add constraint shopping_preferences_keys check (
  preferences - array['theme','scheme','font','density','startPage'] = '{}'::jsonb
 );
alter table public.shopping_preferences
 drop constraint if exists shopping_preferences_start_page,
 add constraint shopping_preferences_start_page check (
  not (preferences ? 'startPage') or (
   jsonb_typeof(preferences->'startPage') = 'string'
   and preferences->>'startPage' in ('lists','catalog','archive','family')
  )
 );
commit;
