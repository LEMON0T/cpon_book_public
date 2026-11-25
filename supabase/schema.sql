create extension if not exists "pgcrypto";

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'Általános',
  type text not null default 'unlimited' check (type in ('unlimited','limited','vip','cooldown')),
  total_count int,
  remaining int,
  cooldown_days int,
  icon text default 'Heart',
  last_redeemed_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  desired_date date,
  note text default '',
  status text not null default 'pending' check (status in ('pending','completed')),
  redeemed_at timestamptz default now(),
  completed_at timestamptz,
  rating int check (rating between 1 and 5),
  review text,
  photos text[] default '{}',
  reviewed_at timestamptz
);
create index on public.redemptions(ticket_id);

-- Egyszerűsített RLS: az anon kulcs mindent szabadon olvashat/írhat (csak ketten használjátok)
alter table public.tickets enable row level security;
alter table public.redemptions enable row level security;
create policy "tickets open" on public.tickets for all to anon using (true) with check (true);
create policy "redemptions open" on public.redemptions for all to anon using (true) with check (true);

-- Storage bucket a fotóknak
insert into storage.buckets (id, name, public) values ('memories', 'memories', true) on conflict (id) do nothing;
create policy "memories read" on storage.objects for select to anon using (bucket_id = 'memories');
create policy "memories upload" on storage.objects for insert to anon with check (bucket_id = 'memories');

-- Példa kuponok (opcionális)
insert into public.tickets (title, description, category, type, total_count, remaining, cooldown_days, icon) values
 ('Ingyen hátmasszázs', 'Bármikor, amikor kéred.', 'Kényeztetés', 'unlimited', null, null, null, 'Hand'),
 ('Vacsorafőzés', 'Te választod a menüt, én főzök.', 'Konyha', 'limited', 3, 3, null, 'Utensils'),
 ('Egész napos program', 'Egy nap, amit te tervezel, én csak megyek.', 'Különleges', 'vip', 1, 1, null, 'Sparkles'),
 ('Mozis este', 'Havonta egyszer újra érvényes.', 'Randi', 'cooldown', null, null, 30, 'Film');
