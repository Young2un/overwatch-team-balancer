-- Add preferred_heroes column to players table
alter table public.players add column preferred_heroes text[] default array[]::text[];

-- Update RLS policy if needed (but 'for all using (true)' covers it)
-- No change needed for policy
