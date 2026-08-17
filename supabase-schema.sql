create table if not exists public.repfuel_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age integer,
  sex text,
  height_cm numeric,
  weight_kg numeric,
  body_fat_percent numeric,
  training_level text not null default 'beginner'
    check (training_level in ('beginner','intermediate','pro')),
  consent boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.repfuel_workouts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  profile jsonb not null default '{}'::jsonb,
  exercises jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists repfuel_workouts_user_ended_idx
  on public.repfuel_workouts(user_id, ended_at desc);

alter table public.repfuel_profiles enable row level security;
alter table public.repfuel_workouts enable row level security;

drop policy if exists "RepFuel profiles own rows" on public.repfuel_profiles;
create policy "RepFuel profiles own rows" on public.repfuel_profiles
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "RepFuel workouts own rows" on public.repfuel_workouts;
create policy "RepFuel workouts own rows" on public.repfuel_workouts
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.repfuel_profiles to authenticated;
grant select, insert, update, delete on public.repfuel_workouts to authenticated;
