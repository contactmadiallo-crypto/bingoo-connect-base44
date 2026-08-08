-- Bingoo Connect 3.0: secure the existing profile foundation and add a
-- sanitized public read model for /p/:username.

create schema if not exists private;

create table if not exists public.public_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  username citext not null unique,
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  is_active boolean not null default false,
  access_status public.profile_access_state not null default 'archived',
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

drop policy if exists "anon read profiles" on public.profiles;
drop policy if exists "anon read" on public.profile_links;
drop policy if exists "auth access" on public.profile_links;

create policy profile_links_owner_select
on public.profile_links for select to authenticated
using (public.can_access_profile(profile_id));

create policy profile_links_owner_insert
on public.profile_links for insert to authenticated
with check (
  public.can_access_profile(
    profile_id,
    array['owner'::public.profile_member_role, 'editor'::public.profile_member_role]
  )
);

create policy profile_links_owner_update
on public.profile_links for update to authenticated
using (
  public.can_access_profile(
    profile_id,
    array['owner'::public.profile_member_role, 'editor'::public.profile_member_role]
  )
)
with check (
  public.can_access_profile(
    profile_id,
    array['owner'::public.profile_member_role, 'editor'::public.profile_member_role]
  )
);

create policy profile_links_owner_delete
on public.profile_links for delete to authenticated
using (
  public.can_access_profile(
    profile_id,
    array['owner'::public.profile_member_role, 'editor'::public.profile_member_role]
  )
);

create policy public_profiles_public_select
on public.public_profiles for select to anon, authenticated
using (
  is_active = true
  and access_status = 'active'::public.profile_access_state
  and (expires_at is null or expires_at > now())
);

revoke all on public.profiles, public.profile_access, public.profile_links from anon;
revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
grant all on public.public_profiles to service_role;

-- Existing imported profiles get an owner access record without changing data.
insert into public.profile_access (
  profile_id, user_id, member_role, access_status, is_primary, source
)
select p.id, p.user_id, 'owner', 'active', true, 'legacy'
from public.profiles p
where p.user_id is not null
on conflict (profile_id, user_id) do nothing;

create or replace function private.refresh_public_profile(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  delete from public.public_profiles where profile_id = p_profile_id;

  insert into public.public_profiles (
    profile_id, username, payload, is_active, access_status, expires_at
  )
  select
    p.id,
    p.username,
    jsonb_strip_nulls(jsonb_build_object(
      'id', p.id,
      'username', p.username::text,
      'display_name', p.display_name,
      'profile_type', coalesce(p.profile_type, p.kind::text),
      'job_title', p.job_title,
      'company_name', coalesce(p.company_name, p.company),
      'bio', p.bio,
      'profile_photo', coalesce(p.avatar_url, p.profile_photo_path),
      'cover_photo', coalesce(p.cover_image_url, p.cover_photo_path),
      'cover_color', p.cover_color,
      'accent_color', p.accent_color,
      'design', p.design,
      'public_contact', p.public_contact,
      'website', p.website,
      'layout', p.layout,
      'button_style', p.button_style,
      'link_display_style', p.link_display_style,
      'profile_font', p.profile_font,
      'is_verified', p.is_verified,
      'links', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', l.id,
          'title', l.label,
          'url', l.url,
          'icon', l.icon,
          'type', l.category,
          'order', l.sort_order
        ) order by l.sort_order, l.created_at)
        from public.profile_links l
        where l.profile_id = p.id and l.active = true
      ), '[]'::jsonb)
    )),
    (p.is_active and coalesce(p.visible, true)),
    pa.access_status,
    pa.expires_at
  from public.profiles p
  join lateral (
    select a.access_status, a.expires_at
    from public.profile_access a
    where a.profile_id = p.id
      and a.member_role = 'owner'::public.profile_member_role
    order by a.is_primary desc, a.created_at
    limit 1
  ) pa on true
  where p.id = p_profile_id;
end;
$$;

revoke all on function private.refresh_public_profile(uuid) from public, anon, authenticated;
grant execute on function private.refresh_public_profile(uuid) to service_role;

create or replace function private.refresh_public_profile_trigger()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  perform private.refresh_public_profile(
    case when tg_op = 'DELETE' then old.profile_id else new.profile_id end
  );
  return coalesce(new, old);
end;
$$;

revoke all on function private.refresh_public_profile_trigger() from public, anon, authenticated;

create or replace function private.refresh_profile_row_trigger()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  perform private.refresh_public_profile(case when tg_op = 'DELETE' then old.id else new.id end);
  return coalesce(new, old);
end;
$$;

revoke all on function private.refresh_profile_row_trigger() from public, anon, authenticated;

drop trigger if exists refresh_public_profile_from_profile on public.profiles;
create trigger refresh_public_profile_from_profile
after insert or update or delete on public.profiles
for each row execute function private.refresh_profile_row_trigger();

drop trigger if exists refresh_public_profile_from_access on public.profile_access;
create trigger refresh_public_profile_from_access
after insert or update or delete on public.profile_access
for each row execute function private.refresh_public_profile_trigger();

drop trigger if exists refresh_public_profile_from_link on public.profile_links;
create trigger refresh_public_profile_from_link
after insert or update or delete on public.profile_links
for each row execute function private.refresh_public_profile_trigger();

drop function if exists public.get_public_profile(text);

create function public.get_public_profile(p_username text)
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select pp.payload
  from public.public_profiles pp
  where pp.username = lower(trim(p_username))::extensions.citext
  limit 1;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated, service_role;

select private.refresh_public_profile(id) from public.profiles;

comment on table public.public_profiles is
  'Sanitized RLS-protected read model used by public profile pages.';
comment on function public.get_public_profile(text) is
  'Returns a sanitized public profile payload filtered by RLS.';
