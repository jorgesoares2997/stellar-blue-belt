create extension if not exists pgcrypto;

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  mission_title text not null,
  image_url text not null,
  prompt text not null,
  metadata_uri text not null,
  minted boolean not null default false,
  tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists badges_wallet_address_idx
  on public.badges (wallet_address);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists badges_set_updated_at on public.badges;
create trigger badges_set_updated_at
before update on public.badges
for each row
execute function public.set_updated_at();

alter table public.badges enable row level security;

-- Service-role calls from Next.js API routes bypass RLS.
-- Keep client-side direct table access blocked by default.
