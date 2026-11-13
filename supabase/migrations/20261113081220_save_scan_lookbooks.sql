create table public.scan_lookbooks (
  member_id uuid primary key references public.waitlist(id) on delete cascade,
  pack_signature text not null unique,
  lookbook jsonb not null check (jsonb_typeof(lookbook) = 'object'),
  face_data jsonb not null check (jsonb_typeof(face_data) = 'object'),
  email text,
  beard text,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scan_lookbooks enable row level security;
revoke all on public.scan_lookbooks from public, anon, authenticated;
grant select, insert, update on public.scan_lookbooks to service_role;
