-- Replace YOUR_OWNER_USER_UUID with the ID of the ONE owner created in Auth.
-- Run once in your own Supabase SQL editor. Never use a service-role key in this app.
begin;
create table public.owner_content (
  id text primary key check (id = 'site'),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 32768),
  revision uuid not null default gen_random_uuid()
);
insert into public.owner_content (id) values ('site');
alter table public.owner_content enable row level security;
revoke all on public.owner_content from anon, authenticated;
grant select on public.owner_content to anon, authenticated;
grant update (content, revision) on public.owner_content to authenticated;
create policy "Published text is public" on public.owner_content for select to anon, authenticated using (id = 'site');
create policy "Only the owner can edit" on public.owner_content for update to authenticated
  using (id = 'site' and (select auth.uid()) = 'YOUR_OWNER_USER_UUID'::uuid)
  with check (id = 'site' and (select auth.uid()) = 'YOUR_OWNER_USER_UUID'::uuid);
commit;
