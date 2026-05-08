create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

drop table if exists public.device_heartbeats cascade;
drop table if exists public.sensor_data cascade;

create table if not exists public.sensor_data (
  id bigint generated always as identity primary key,
  ph numeric(6,3) not null,
  temperature numeric(6,3) not null,
  predicted_ph numeric(6,3) not null,
  predicted_temperature numeric(6,3) not null,
  filtered_ph numeric(6,3) not null,
  filtered_temperature numeric(6,3) not null,
  residual_ph numeric(6,3) not null,
  residual_temperature numeric(6,3) not null,
  kalman_gain_ph numeric(6,4) not null,
  kalman_gain_temperature numeric(6,4) not null,
  adaptive_process_noise_ph numeric(10,6) not null,
  adaptive_measurement_noise_ph numeric(10,6) not null,
  adaptive_process_noise_temperature numeric(10,6) not null,
  adaptive_measurement_noise_temperature numeric(10,6) not null,
  status text not null check (status in ('NORMAL', 'SENSOR_FAULT', 'CONTAMINATION', 'CRITICAL')),
  expected_status text check (expected_status in ('NORMAL', 'SENSOR_FAULT', 'CONTAMINATION', 'CRITICAL')),
  classification_reason text,
  confidence_score numeric(5,2),
  source_type text not null default 'LIVE' check (source_type in ('LIVE', 'SIMULATED')),
  simulation_mode text,
  created_at timestamptz not null default now()
);

create table if not exists public.device_heartbeats (
  id bigint generated always as identity primary key,
  device_id text not null,
  status text not null default 'ONLINE' check (status in ('ONLINE', 'OFFLINE')),
  firmware_version text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_sensor_data_created_at on public.sensor_data(created_at desc);
create index if not exists idx_sensor_data_status on public.sensor_data(status);
create index if not exists idx_device_heartbeats_created_at on public.device_heartbeats(created_at desc);
