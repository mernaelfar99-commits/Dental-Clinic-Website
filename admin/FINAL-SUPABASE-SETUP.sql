begin;

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.admin_users (user_id)
select id from auth.users
where lower(email) = lower('ab.m.dent.clinic@gmail.com')
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
set row_security = off
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql security invoker
set search_path = public, pg_temp
as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  price numeric(12,2) check (price is null or price >= 0),
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_name text not null,
  phone text not null,
  email text,
  service text,
  preferred_date date,
  preferred_time time,
  notes text,
  status text not null default 'new' check (status in ('new','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  title_ar text,
  title_en text,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_profile (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  bio_ar text,
  bio_en text,
  credentials_ar text,
  credentials_en text,
  fellowship_ar text,
  fellowship_en text,
  image_path text,
  instagram_url text,
  website_url text,
  additional_info_ar text,
  additional_info_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  clinic_name_ar text not null,
  clinic_name_en text not null,
  email text,
  whatsapp text,
  phone text,
  google_maps_url text,
  address_ar text,
  address_en text,
  working_hours_ar text,
  working_hours_en text,
  instagram_url text,
  facebook_url text,
  other_social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now()
);

alter table public.appointments add column if not exists appointment_date date;
alter table public.appointments add column if not exists appointment_time time;
alter table public.patients add column if not exists date_of_birth date;
alter table public.services add column if not exists duration integer;
alter table public.services add column if not exists image_url text;
alter table public.services add column if not exists active boolean not null default true;
alter table public.gallery add column if not exists image_url text;
alter table public.gallery add column if not exists display_order integer not null default 0;
alter table public.gallery add column if not exists active boolean not null default true;
alter table public.doctor_profile add column if not exists image_url text;
alter table public.contact_messages add column if not exists subject text;
alter table public.contact_messages add column if not exists read boolean not null default false;

update public.appointments set appointment_date = preferred_date where appointment_date is null;
update public.appointments set appointment_time = preferred_time where appointment_time is null;
update public.services set image_url = image_path where image_url is null;
update public.services set active = is_active;
update public.gallery set image_url = image_path where image_url is null;
update public.gallery set display_order = sort_order;
update public.gallery set active = is_active;
update public.doctor_profile set image_url = image_path where image_url is null;
update public.contact_messages set read = status in ('read','archived');

alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
check (status in ('new','pending','confirmed','completed','cancelled'));

-- Consolidate singleton records before creating unique indexes. The newest
-- record is retained, while missing values are filled from older records.
do $$
declare
  keep_id uuid;
  old_record public.doctor_profile%rowtype;
begin
  select id into keep_id
  from public.doctor_profile
  order by updated_at desc nulls last, created_at desc nulls last, id desc
  limit 1;

  if keep_id is not null then
    for old_record in
      select * from public.doctor_profile where id <> keep_id order by updated_at desc nulls last, created_at desc nulls last, id desc
    loop
      update public.doctor_profile as keep
      set name_ar = coalesce(keep.name_ar, old_record.name_ar),
          name_en = coalesce(keep.name_en, old_record.name_en),
          bio_ar = coalesce(keep.bio_ar, old_record.bio_ar),
          bio_en = coalesce(keep.bio_en, old_record.bio_en),
          credentials_ar = coalesce(keep.credentials_ar, old_record.credentials_ar),
          credentials_en = coalesce(keep.credentials_en, old_record.credentials_en),
          fellowship_ar = coalesce(keep.fellowship_ar, old_record.fellowship_ar),
          fellowship_en = coalesce(keep.fellowship_en, old_record.fellowship_en),
          image_path = coalesce(keep.image_path, old_record.image_path),
          image_url = coalesce(keep.image_url, old_record.image_url),
          instagram_url = coalesce(keep.instagram_url, old_record.instagram_url),
          website_url = coalesce(keep.website_url, old_record.website_url),
          additional_info_ar = coalesce(keep.additional_info_ar, old_record.additional_info_ar),
          additional_info_en = coalesce(keep.additional_info_en, old_record.additional_info_en)
      where keep.id = keep_id;
    end loop;

    delete from public.doctor_profile where id <> keep_id;
  end if;
end;
$$;

do $$
declare
  keep_id uuid;
  old_record public.clinic_settings%rowtype;
begin
  select id into keep_id
  from public.clinic_settings
  order by updated_at desc nulls last, created_at desc nulls last, id desc
  limit 1;

  if keep_id is not null then
    for old_record in
      select * from public.clinic_settings where id <> keep_id order by updated_at desc nulls last, created_at desc nulls last, id desc
    loop
      update public.clinic_settings as keep
      set clinic_name_ar = coalesce(keep.clinic_name_ar, old_record.clinic_name_ar),
          clinic_name_en = coalesce(keep.clinic_name_en, old_record.clinic_name_en),
          email = coalesce(keep.email, old_record.email),
          whatsapp = coalesce(keep.whatsapp, old_record.whatsapp),
          phone = coalesce(keep.phone, old_record.phone),
          google_maps_url = coalesce(keep.google_maps_url, old_record.google_maps_url),
          address_ar = coalesce(keep.address_ar, old_record.address_ar),
          address_en = coalesce(keep.address_en, old_record.address_en),
          working_hours_ar = coalesce(keep.working_hours_ar, old_record.working_hours_ar),
          working_hours_en = coalesce(keep.working_hours_en, old_record.working_hours_en),
          instagram_url = coalesce(keep.instagram_url, old_record.instagram_url),
          facebook_url = coalesce(keep.facebook_url, old_record.facebook_url),
          other_social_links = case
            when keep.other_social_links = '{}'::jsonb then old_record.other_social_links
            else keep.other_social_links
          end
      where keep.id = keep_id;
    end loop;

    delete from public.clinic_settings where id <> keep_id;
  end if;
end;
$$;

create unique index if not exists doctor_profile_singleton_index on public.doctor_profile ((true));
create unique index if not exists clinic_settings_singleton_index on public.clinic_settings ((true));
create index if not exists patients_phone_index on public.patients (phone);
create index if not exists patients_email_index on public.patients (lower(email)) where email is not null;
create index if not exists patients_date_of_birth_index on public.patients (date_of_birth);
create index if not exists appointments_date_index on public.appointments (preferred_date);
create index if not exists appointments_appointment_date_index on public.appointments (appointment_date);
create index if not exists appointments_status_index on public.appointments (status);
create index if not exists appointments_patient_id_index on public.appointments (patient_id);
create index if not exists appointments_created_at_index on public.appointments (created_at desc);
create index if not exists services_active_sort_index on public.services (is_active, sort_order);
create index if not exists services_active_order_index on public.services (active, sort_order);
create index if not exists gallery_active_sort_index on public.gallery (is_active, sort_order);
create index if not exists gallery_active_order_index on public.gallery (active, display_order);
create index if not exists gallery_category_index on public.gallery (category);
create index if not exists contact_messages_status_index on public.contact_messages (status);
create index if not exists contact_messages_created_at_index on public.contact_messages (created_at desc);

create or replace function public.sync_admin_compatibility_fields()
returns trigger language plpgsql security invoker
set search_path = ''
as $$
begin
  if tg_table_name = 'appointments' then
    if tg_op = 'insert' then
      if new.preferred_date is null then new.preferred_date = new.appointment_date; end if;
      if new.appointment_date is null then new.appointment_date = new.preferred_date; end if;
      if new.preferred_time is null then new.preferred_time = new.appointment_time; end if;
      if new.appointment_time is null then new.appointment_time = new.preferred_time; end if;
    end if;
  elsif tg_table_name = 'services' then
    if tg_op = 'insert' then
      if new.image_path is null then new.image_path = new.image_url; end if;
      if new.image_url is null then new.image_url = new.image_path; end if;
      new.active = new.is_active;
    else
      if new.image_path is distinct from old.image_path
         and new.image_url is not distinct from old.image_url then
        new.image_url = new.image_path;
      elsif new.image_url is distinct from old.image_url
            and new.image_path is not distinct from old.image_path then
        new.image_path = new.image_url;
      elsif new.image_path is distinct from old.image_path
            and new.image_url is distinct from old.image_url
            and new.image_path is distinct from new.image_url then
        raise exception 'image_path and image_url changed to different values';
      end if;

      if new.is_active is distinct from old.is_active
         and new.active is not distinct from old.active then
        new.active = new.is_active;
      elsif new.active is distinct from old.active
            and new.is_active is not distinct from old.is_active then
        new.is_active = new.active;
      elsif new.is_active is distinct from old.is_active
            and new.active is distinct from old.active
            and new.is_active is distinct from new.active then
        raise exception 'active and is_active changed to different values';
      end if;
    end if;
  elsif tg_table_name = 'gallery' then
    if tg_op = 'insert' then
      if new.image_path is null then new.image_path = new.image_url; end if;
      if new.image_url is null then new.image_url = new.image_path; end if;
      new.display_order = new.sort_order;
    else
      if new.image_path is distinct from old.image_path
         and new.image_url is not distinct from old.image_url then
        new.image_url = new.image_path;
      elsif new.image_url is distinct from old.image_url
            and new.image_path is not distinct from old.image_path then
        new.image_path = new.image_url;
      elsif new.image_path is distinct from old.image_path
            and new.image_url is distinct from old.image_url
            and new.image_path is distinct from new.image_url then
        raise exception 'image_path and image_url changed to different values';
      end if;

      if new.is_active is distinct from old.is_active
         and new.active is not distinct from old.active then
        new.active = new.is_active;
      elsif new.active is distinct from old.active
            and new.is_active is not distinct from old.is_active then
        new.is_active = new.active;
      elsif new.is_active is distinct from old.is_active
            and new.active is distinct from old.active
            and new.is_active is distinct from new.active then
        raise exception 'active and is_active changed to different values';
      end if;

      if new.sort_order is distinct from old.sort_order
         and new.display_order is not distinct from old.display_order then
        new.display_order = new.sort_order;
      elsif new.display_order is distinct from old.display_order
            and new.sort_order is not distinct from old.sort_order then
        new.sort_order = new.display_order;
      elsif new.sort_order is distinct from old.sort_order
            and new.display_order is distinct from old.display_order
            and new.sort_order is distinct from new.display_order then
        raise exception 'sort_order and display_order changed to different values';
      end if;
    end if;
  elsif tg_table_name = 'doctor_profile' then
    if tg_op = 'insert' then
      if new.image_path is null then new.image_path = new.image_url; end if;
      if new.image_url is null then new.image_url = new.image_path; end if;
    elsif new.image_path is distinct from old.image_path
          and new.image_url is not distinct from old.image_url then
      new.image_url = new.image_path;
    elsif new.image_url is distinct from old.image_url
          and new.image_path is not distinct from old.image_path then
      new.image_path = new.image_url;
    elsif new.image_path is distinct from old.image_path
          and new.image_url is distinct from old.image_url
          and new.image_path is distinct from new.image_url then
      raise exception 'image_path and image_url changed to different values';
    end if;
  elsif tg_table_name = 'contact_messages' then
    if tg_op = 'insert' then
      new.read = new.status in ('read', 'archived');
    elsif new.status is distinct from old.status
          and new.read is not distinct from old.read then
      new.read = new.status in ('read', 'archived');
    elsif new.read is distinct from old.read
          and new.status is not distinct from old.status then
      new.status = case when new.read then 'read' else 'unread' end;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at before update on public.patients for each row execute function public.set_updated_at();
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();
drop trigger if exists gallery_set_updated_at on public.gallery;
create trigger gallery_set_updated_at before update on public.gallery for each row execute function public.set_updated_at();
drop trigger if exists doctor_profile_set_updated_at on public.doctor_profile;
create trigger doctor_profile_set_updated_at before update on public.doctor_profile for each row execute function public.set_updated_at();
drop trigger if exists clinic_settings_set_updated_at on public.clinic_settings;
create trigger clinic_settings_set_updated_at before update on public.clinic_settings for each row execute function public.set_updated_at();

drop trigger if exists appointments_sync_compatibility on public.appointments;
create trigger appointments_sync_compatibility before insert or update on public.appointments for each row execute function public.sync_admin_compatibility_fields();
drop trigger if exists services_sync_compatibility on public.services;
create trigger services_sync_compatibility before insert or update on public.services for each row execute function public.sync_admin_compatibility_fields();
drop trigger if exists gallery_sync_compatibility on public.gallery;
create trigger gallery_sync_compatibility before insert or update on public.gallery for each row execute function public.sync_admin_compatibility_fields();
drop trigger if exists doctor_profile_sync_compatibility on public.doctor_profile;
create trigger doctor_profile_sync_compatibility before insert or update on public.doctor_profile for each row execute function public.sync_admin_compatibility_fields();
drop trigger if exists contact_messages_sync_compatibility on public.contact_messages;
create trigger contact_messages_sync_compatibility before insert or update on public.contact_messages for each row execute function public.sync_admin_compatibility_fields();

alter table public.admin_users enable row level security;
alter table public.appointments enable row level security;
alter table public.patients enable row level security;
alter table public.services enable row level security;
alter table public.gallery enable row level security;
alter table public.doctor_profile enable row level security;
alter table public.clinic_settings enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists admin_users_admin_only on public.admin_users;
drop policy if exists appointments_admin_only on public.appointments;
drop policy if exists patients_admin_only on public.patients;
drop policy if exists services_admin_only on public.services;
drop policy if exists gallery_admin_only on public.gallery;
drop policy if exists doctor_profile_admin_only on public.doctor_profile;
drop policy if exists clinic_settings_admin_only on public.clinic_settings;
drop policy if exists contact_messages_admin_only on public.contact_messages;

create policy admin_users_admin_only on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy appointments_admin_only on public.appointments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy patients_admin_only on public.patients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy services_admin_only on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy gallery_admin_only on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy doctor_profile_admin_only on public.doctor_profile for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy clinic_settings_admin_only on public.clinic_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy contact_messages_admin_only on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on table public.admin_users, public.appointments, public.patients, public.services, public.gallery, public.doctor_profile, public.clinic_settings, public.contact_messages from anon, authenticated;
grant select, insert, update, delete on public.admin_users, public.appointments, public.patients, public.services, public.gallery, public.doctor_profile, public.clinic_settings, public.contact_messages to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.set_updated_at(), public.sync_admin_compatibility_fields() from public, anon, authenticated;

insert into storage.buckets (id, name, public)
values ('clinic-media', 'clinic-media', false)
on conflict (id) do update set public = false;

drop policy if exists clinic_media_admin_select on storage.objects;
drop policy if exists clinic_media_admin_insert on storage.objects;
drop policy if exists clinic_media_admin_update on storage.objects;
drop policy if exists clinic_media_admin_delete on storage.objects;
create policy clinic_media_admin_select on storage.objects for select to authenticated using (bucket_id = 'clinic-media' and public.is_admin());
create policy clinic_media_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'clinic-media' and public.is_admin());
create policy clinic_media_admin_update on storage.objects for update to authenticated using (bucket_id = 'clinic-media' and public.is_admin()) with check (bucket_id = 'clinic-media' and public.is_admin());
create policy clinic_media_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'clinic-media' and public.is_admin());

commit;
