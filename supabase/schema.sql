-- Paz - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  language text default 'en' check (language in ('en', 'es')),
  subscription text default 'free' check (subscription in ('free', 'premium', 'premium_plus')),
  subscription_expires_at timestamp with time zone,
  notifications_enabled boolean default true,
  streak integer default 0,
  last_check_in date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mood entries table
create table public.mood_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood integer not null check (mood >= 1 and mood <= 5),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Journal entries table
create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  gratitude text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for better query performance
create index mood_entries_user_id_idx on public.mood_entries(user_id);
create index mood_entries_created_at_idx on public.mood_entries(created_at desc);
create index journal_entries_user_id_idx on public.journal_entries(user_id);
create index journal_entries_created_at_idx on public.journal_entries(created_at desc);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.mood_entries enable row level security;
alter table public.journal_entries enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Mood entries policies
create policy "Users can view own mood entries"
  on public.mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own mood entries"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own mood entries"
  on public.mood_entries for delete
  using (auth.uid() = user_id);

-- Journal entries policies
create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update streak
create or replace function public.update_streak(p_user_id uuid)
returns void as $$
declare
  v_last_check_in date;
  v_current_streak integer;
begin
  select last_check_in, streak into v_last_check_in, v_current_streak
  from public.profiles
  where id = p_user_id;
  
  if v_last_check_in is null or v_last_check_in < current_date - interval '1 day' then
    -- Reset streak if more than 1 day gap
    update public.profiles
    set streak = 1, last_check_in = current_date, updated_at = now()
    where id = p_user_id;
  elsif v_last_check_in = current_date - interval '1 day' then
    -- Increment streak if consecutive day
    update public.profiles
    set streak = v_current_streak + 1, last_check_in = current_date, updated_at = now()
    where id = p_user_id;
  end if;
  -- If last_check_in is today, do nothing (already checked in)
end;
$$ language plpgsql security definer;
