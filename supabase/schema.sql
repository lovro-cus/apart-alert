-- Shema podatkovne baze za apart-alert
-- Zaženi v Supabase: SQL Editor -> New query -> prilepi -> Run.
-- Opomba: backend uporablja service_role ključ, ki obide RLS, zato politik ne rabimo.

-- Metrike uporabe (prijave, registracije, iskanja ...)
create table if not exists public.metrics_log (
  id bigint generated always as identity primary key,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz not null default now()
);

-- Priljubljeni apartmaji uporabnikov
create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  apartment_id integer not null,
  created_at timestamptz not null default now()
);

-- Obvestila (alerti) za nove apartmaje
create table if not exists public.alerts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  location text not null,
  min_price integer,
  max_price integer,
  last_sent timestamptz,
  created_at timestamptz not null default now()
);

-- Dnevnik napak
create table if not exists public.error_logs (
  id bigint generated always as identity primary key,
  error_message text,
  stacktrace text,
  route text,
  created_at timestamptz not null default now()
);
