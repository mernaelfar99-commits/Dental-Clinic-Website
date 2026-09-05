begin;

insert into storage.buckets (id, name, public)
values ('clinic-media', 'clinic-media', false)
on conflict (id) do update set public = false;

drop policy if exists clinic_media_admin_select on storage.objects;
drop policy if exists clinic_media_admin_insert on storage.objects;
drop policy if exists clinic_media_admin_update on storage.objects;
drop policy if exists clinic_media_admin_delete on storage.objects;

create policy clinic_media_admin_select
on storage.objects
for select
to authenticated
using (bucket_id = 'clinic-media' and public.is_admin());

create policy clinic_media_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'clinic-media' and public.is_admin());

create policy clinic_media_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'clinic-media' and public.is_admin())
with check (bucket_id = 'clinic-media' and public.is_admin());

create policy clinic_media_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'clinic-media' and public.is_admin());

commit;
