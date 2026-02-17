-- Create a table for players
create table public.players (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  roles text[] not null, -- Array of strings e.g. ['TANK', 'DPS']
  "primary" text[], -- Array of strings e.g. ['TANK']
  skills jsonb not null default '{}'::jsonb, -- JSON object e.g. {"TANK": 3500}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.players enable row level security;

-- Create policy to allow all operations for now (since we don't have auth yet)
-- In a real app, you'd want to restrict this
create policy "Allow all operations for anon" on public.players
  for all using (true) with check (true);
