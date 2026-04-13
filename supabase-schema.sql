-- Run these in the Supabase SQL Editor at https://bduazizvarumyrprphwq.supabase.co

-- 1. backoffice_users
create table if not exists public.backoffice_users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  role                  text not null check (role in ('rabbi', 'beauty_pro')),
  linked_entity_id      uuid not null,
  subscription_status   text check (subscription_status in ('active','inactive','trialing','past_due')),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.backoffice_users enable row level security;

create policy "backoffice_users_self_read" on public.backoffice_users
  for select using (auth.uid() = id);

create policy "backoffice_users_self_insert" on public.backoffice_users
  for insert with check (auth.uid() = id);

create policy "backoffice_users_self_update" on public.backoffice_users
  for update using (auth.uid() = id);

-- 2. appointments
create table if not exists public.appointments (
  id                    uuid primary key default uuid_generate_v4(),
  provider_id           uuid not null,
  user_id               uuid not null,
  slot_start            timestamptz not null,
  slot_end              timestamptz not null,
  status                text not null default 'pending'
                        check (status in ('pending','provider_confirmed','user_confirmed','cancelled')),
  provider_confirmed_at timestamptz,
  user_confirmed_at     timestamptz,
  note                  text not null default '',
  created_at            timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "appointments_provider_all" on public.appointments
  for all using (
    exists (
      select 1 from public.backoffice_users b
      where b.id = auth.uid() and b.linked_entity_id = provider_id
    )
  );

-- 3. availability_slots
create table if not exists public.availability_slots (
  id           uuid primary key default uuid_generate_v4(),
  provider_id  uuid not null,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  created_at   timestamptz not null default now(),
  unique (provider_id, day_of_week, start_time)
);

alter table public.availability_slots enable row level security;

create policy "av_slots_public_read" on public.availability_slots
  for select using (true);

create policy "av_slots_provider_write" on public.availability_slots
  for all using (
    exists (
      select 1 from public.backoffice_users b
      where b.id = auth.uid() and b.linked_entity_id = provider_id
    )
  );

-- 4. blocked_dates
create table if not exists public.blocked_dates (
  id           uuid primary key default uuid_generate_v4(),
  provider_id  uuid not null,
  blocked_date date not null,
  reason       text,
  created_at   timestamptz not null default now(),
  unique (provider_id, blocked_date)
);

alter table public.blocked_dates enable row level security;

create policy "blocked_dates_public_read" on public.blocked_dates
  for select using (true);

create policy "blocked_dates_provider_write" on public.blocked_dates
  for all using (
    exists (
      select 1 from public.backoffice_users b
      where b.id = auth.uid() and b.linked_entity_id = provider_id
    )
  );

-- 5. Add user_id to existing tables (if they exist)
alter table public.service_providers add column if not exists user_id uuid references auth.users(id);
alter table public.rabbis add column if not exists user_id uuid references auth.users(id);

-- 6. Enable realtime for appointments
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table chat_messages;
