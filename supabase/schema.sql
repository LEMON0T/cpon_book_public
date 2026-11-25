create extension if not exists "pgcrypto";

-- 1. Kuponfüzetek (párok) táblája
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Kuponfüzet',
  invite_code text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid references auth.users(id) on delete set null,
  discord_webhook text,
  created_at timestamptz default now()
);

-- 2. Kuponok táblája (book_id-hoz kötve, megtartva minden eredeti oszlopot)
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
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

-- 3. Beváltások táblája (book_id-hoz kötve, megtartva minden eredeti oszlopot)
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
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

create index on public.tickets(book_id);
create index on public.redemptions(book_id);
create index on public.redemptions(ticket_id);

-- 4. RLS bekapcsolása (minden pár csak a saját füzetét látja)
alter table public.books enable row level security;
alter table public.tickets enable row level security;
alter table public.redemptions enable row level security;

create policy "books_select" on public.books for select to authenticated
  using (auth.uid() = owner_id or auth.uid() = partner_id or partner_id is null);

create policy "books_insert" on public.books for insert to authenticated
  with check (auth.uid() = owner_id);

create policy "books_update" on public.books for update to authenticated
  using (auth.uid() = owner_id or auth.uid() = partner_id or partner_id is null);

create policy "books_delete" on public.books for delete to authenticated
  using (auth.uid() = owner_id);

create policy "tickets_access" on public.tickets for all to authenticated
  using (exists (
    select 1 from public.books b
    where b.id = tickets.book_id and (b.owner_id = auth.uid() or b.partner_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.books b
    where b.id = tickets.book_id and (b.owner_id = auth.uid() or b.partner_id = auth.uid())
  ));

create policy "redemptions_access" on public.redemptions for all to authenticated
  using (exists (
    select 1 from public.books b
    where b.id = redemptions.book_id and (b.owner_id = auth.uid() or b.partner_id = auth.uid())
  ))
  with check (exists (
    select 1 from public.books b
    where b.id = redemptions.book_id and (b.owner_id = auth.uid() or b.partner_id = auth.uid())
  ));

-- 5. Storage bucket és jogosultságok a fotóknak
insert into storage.buckets (id, name, public) values ('memories', 'memories', true) on conflict (id) do nothing;

create policy "memories read" on storage.objects for select
  using (bucket_id = 'memories');

create policy "memories upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'memories');

create policy "memories delete" on storage.objects for delete to authenticated
  using (bucket_id = 'memories');