create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  block_count integer not null,
  image_path text,
  pack_path text,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "Users can view their own generations"
on public.generations for select
using (auth.uid() = user_id);

create policy "Users can insert their own generations"
on public.generations for insert
with check (auth.uid() = user_id);
