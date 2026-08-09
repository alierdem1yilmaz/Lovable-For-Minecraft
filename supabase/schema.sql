create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  structure_name text not null,
  function_id text not null,
  block_count integer not null,
  image_path text,
  pack_path text,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "Users can view their own generations"
on public.generations for select
using (auth.uid() = user_id);


-- Mevcut tabloya sonradan eklenen migration (structure_name, function_id):
-- alter table public.generations add column if not exists structure_name text not null default '';
-- alter table public.generations add column if not exists function_id text not null default '';

-- Image generation + Gaussian Splatting (image-to-asset) pipeline için additive migration:
alter table public.generations add column if not exists glb_url text;
alter table public.generations add column if not exists splat_url text;
alter table public.generations add column if not exists pipeline text not null default 'text';
