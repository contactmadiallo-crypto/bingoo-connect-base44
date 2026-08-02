-- Bingoo Connect 3.0: profile foundation
-- Raw profile tables are private. Anonymous visitors can only execute the
-- allowlisted get_public_profile() function defined at the end of this file.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  legacy_base44_id text unique,
  username citext not null unique,
  display_name text not null,
  profile_type text not null default 'professional'
    check (profile_type in ('personal', 'professional', 'business', 'salon', 'lawfirm', 'corporate', 'creative')),
  job_title text,
  company_name text,
  company_logo text,
  bio text,
  profile_photo text,
  cover_photo text,
  cover_color text not null default '#0A1F52'
    check (cover_color ~ '^#[0-9A-Fa-f]{6}$'),
  theme_background_color text
    check (theme_background_color is null or theme_background_color ~ '^#[0-9A-Fa-f]{6}$'),
  layout text not null default 'classic',
  profile_layout text not null default 'default',
  profile_theme text not null default 'modern',
  bg_style text not null default 'clean',
  button_style text not null default 'pill',
  phone text,
  whatsapp_number text,
  email text,
  website text,
  location text,
  show_location boolean not null default true,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  linkedin_url text,
  youtube_url text,
  google_review_url text,
  booking_enabled boolean not null default false,
  whatsapp_booking_message text,
  privacy_settings jsonb not null default '{}'::jsonb
    check (jsonb_typeof(privacy_settings) = 'object'),
  plan_name text not null default 'free'
    check (plan_name in ('free', 'professional', 'pro', 'salon', 'restaurant', 'lawfirm', 'business', 'corporate')),
  is_verified boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username::text = lower(username::text)
    and username::text ~ '^[a-z0-9][a-z0-9_-]{2,29}$'
  )
);

create table public.profile_access (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  legacy_base44_id text unique,
  access_status text not null default 'active'
    check (access_status in ('active', 'trial_locked', 'archived')),
  is_primary boolean not null default false,
  created_during_trial boolean not null default false,
  locked_at timestamptz,
  lock_reason text,
  subscription_id text,
  plan_name text
    check (plan_name is null or plan_name in ('free', 'professional', 'pro', 'salon', 'restaurant', 'lawfirm', 'business', 'corporate')),
  entitlement_id text,
  expires_at timestamptz,
  access_source text not null default 'legacy'
    check (access_source in ('stripe', 'trial', 'admin_override', 'legacy')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  legacy_base44_id text,
  title text not null check (char_length(title) between 1 and 60),
  url text not null check (
    char_length(url) between 1 and 2048
    and url ~* '^(https?://|mailto:|tel:)'
  ),
  icon text,
  link_type text not null default 'other'
    check (link_type in ('website', 'instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'email', 'phone', 'other')),
  description text check (description is null or char_length(description) <= 1000),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  click_count bigint not null default 0 check (click_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, legacy_base44_id)
);

create index profiles_owner_id_idx on public.profiles(owner_id);
create index profile_access_owner_id_idx on public.profile_access(owner_id);
create index profile_links_profile_order_idx on public.profile_links(profile_id, sort_order, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger profile_access_set_updated_at
before update on public.profile_access
for each row execute function public.set_updated_at();

create trigger profile_links_set_updated_at
before update on public.profile_links
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_access enable row level security;
alter table public.profile_links enable row level security;

create policy profiles_owner_select
on public.profiles for select to authenticated
using (owner_id = (select auth.uid()));

create policy profiles_owner_insert
on public.profiles for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy profiles_owner_update
on public.profiles for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy profiles_owner_delete
on public.profiles for delete to authenticated
using (owner_id = (select auth.uid()));

create policy profile_access_owner_select
on public.profile_access for select to authenticated
using (owner_id = (select auth.uid()));

create policy profile_links_owner_select
on public.profile_links for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_links.profile_id
      and p.owner_id = (select auth.uid())
  )
);

create policy profile_links_owner_insert
on public.profile_links for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_links.profile_id
      and p.owner_id = (select auth.uid())
  )
);

create policy profile_links_owner_update
on public.profile_links for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_links.profile_id
      and p.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_links.profile_id
      and p.owner_id = (select auth.uid())
  )
);

create policy profile_links_owner_delete
on public.profile_links for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_links.profile_id
      and p.owner_id = (select auth.uid())
  )
);

-- Owners can edit public profile fields, but entitlement and activation fields
-- remain backend-only. profile_access writes are backend-only by design.
revoke all on public.profiles, public.profile_access, public.profile_links from anon, authenticated;
grant select on public.profiles, public.profile_access, public.profile_links to authenticated;
grant insert (
  owner_id, username, display_name, profile_type, job_title,
  company_name, company_logo, bio, profile_photo, cover_photo, cover_color,
  theme_background_color, layout, profile_layout, profile_theme, bg_style,
  button_style, phone, whatsapp_number, email, website, location, show_location,
  facebook_url, instagram_url, tiktok_url, linkedin_url, youtube_url,
  google_review_url, booking_enabled, whatsapp_booking_message, privacy_settings
) on public.profiles to authenticated;
grant update (
  username, display_name, profile_type, job_title, company_name, company_logo,
  bio, profile_photo, cover_photo, cover_color, theme_background_color, layout,
  profile_layout, profile_theme, bg_style, button_style, phone,
  whatsapp_number, email, website, location, show_location, facebook_url,
  instagram_url, tiktok_url, linkedin_url, youtube_url, google_review_url,
  booking_enabled, whatsapp_booking_message, privacy_settings
) on public.profiles to authenticated;
grant delete on public.profiles to authenticated;
grant insert (
  profile_id, title, url, icon, link_type, description, sort_order, is_active
) on public.profile_links to authenticated;
grant update (
  title, url, icon, link_type, description, sort_order, is_active
) on public.profile_links to authenticated;
grant delete on public.profile_links to authenticated;
grant all on public.profiles, public.profile_access, public.profile_links to service_role;

create or replace function public.get_public_profile(p_username text)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_strip_nulls(
    jsonb_build_object(
      'id', p.id,
      'username', p.username::text,
      'display_name', p.display_name,
      'profile_type', p.profile_type,
      'job_title', p.job_title,
      'company_name', p.company_name,
      'company_logo', p.company_logo,
      'bio', p.bio,
      'profile_photo', p.profile_photo,
      'cover_photo', p.cover_photo,
      'cover_color', p.cover_color,
      'theme_background_color', p.theme_background_color,
      'layout', p.layout,
      'profile_layout', p.profile_layout,
      'profile_theme', p.profile_theme,
      'bg_style', p.bg_style,
      'button_style', p.button_style,
      'phone', p.phone,
      'whatsapp_number', p.whatsapp_number,
      'email', case when coalesce((p.privacy_settings ->> 'hide_email')::boolean, false) then null else p.email end,
      'website', p.website,
      'location', case when p.show_location then p.location else null end,
      'show_location', p.show_location,
      'facebook_url', p.facebook_url,
      'instagram_url', p.instagram_url,
      'tiktok_url', p.tiktok_url,
      'linkedin_url', p.linkedin_url,
      'youtube_url', p.youtube_url,
      'google_review_url', p.google_review_url,
      'booking_enabled', p.booking_enabled,
      'whatsapp_booking_message', p.whatsapp_booking_message,
      'plan', coalesce(pa.plan_name, p.plan_name),
      'is_verified', p.is_verified,
      'is_active', p.is_active,
      'links', coalesce(
        (
          select jsonb_agg(
            jsonb_strip_nulls(jsonb_build_object(
              'id', l.id,
              'title', l.title,
              'url', l.url,
              'icon', l.icon,
              'type', l.link_type,
              'description', l.description,
              'order', l.sort_order
            )) order by l.sort_order, l.created_at
          )
          from public.profile_links l
          where l.profile_id = p.id and l.is_active = true
        ),
        '[]'::jsonb
      )
    )
  )
  from public.profiles p
  join public.profile_access pa on pa.profile_id = p.id
  where p.username = lower(trim(p_username))::citext
    and p.is_active = true
    and pa.access_status = 'active'
    and (pa.expires_at is null or pa.expires_at > now())
  limit 1;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated, service_role;

comment on function public.get_public_profile(text) is
  'Returns an allowlisted public profile payload only when the profile and its entitlement are active.';
