-- Table creation statements

create table public.profiles (
  id uuid not null,
  first_name text null,
  last_name text null,
  prn text null,
  email text null,
  course text null,
  gender text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  role text not null default 'user'::text,
  phone_number text null,
  user_type text null default 'student'::text,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.sports (
  id uuid not null default gen_random_uuid (),
  name text not null,
  image_url text null,
  seat_limit integer not null default 20,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint sports_pkey primary key (id)
) TABLESPACE pg_default;

create table public.slots (
  id uuid not null default gen_random_uuid (),
  sport_id uuid null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  gender text not null default 'any'::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  allowed_user_type text null default 'student'::text,
  constraint slots_pkey primary key (id),
  constraint slots_sport_id_fkey foreign KEY (sport_id) references sports (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.bookings (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  sport_id uuid null,
  slot_id uuid null,
  booking_date date not null,
  status text not null default 'booked'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  seat_number integer null,
  checked_in_at timestamp with time zone null,
  checked_out_at timestamp with time zone null,
  constraint bookings_pkey primary key (id),
  constraint unique_seat_booking unique (sport_id, slot_id, booking_date, seat_number),
  constraint bookings_slot_id_fkey foreign KEY (slot_id) references slots (id) on delete CASCADE,
  constraint bookings_sport_id_fkey foreign KEY (sport_id) references sports (id) on delete CASCADE,
  constraint bookings_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.bookings_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  sport_id uuid null,
  slot_id uuid null,
  booking_date date not null,
  seat_number integer null,
  status text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  checked_in_at timestamp with time zone null,
  checked_out_at timestamp with time zone null,
  constraint bookings_history_pkey primary key (id),
  constraint bookings_history_slot_id_fkey foreign KEY (slot_id) references slots (id) on delete CASCADE,
  constraint bookings_history_sport_id_fkey foreign KEY (sport_id) references sports (id) on delete CASCADE,
  constraint bookings_history_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.notifications (
  id uuid not null default gen_random_uuid (),
  title text not null,
  message text not null,
  type text not null default 'general'::text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  created_by uuid null,
  constraint notifications_pkey primary key (id),
  constraint notifications_created_by_fkey foreign KEY (created_by) references profiles (id) on delete set null,
  constraint notifications_type_check check (
    (
      type = any (
        array[
          'general'::text,
          'maintenance'::text,
          'urgent'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.user_feedback (
  id uuid not null default gen_random_uuid (),
  note text not null,
  created_at timestamp with time zone null default now(),
  email text null,
  profile_id uuid null,
  user_name text null,
  user_prn text null,
  constraint user_feedback_pkey primary key (id),
  constraint user_feedback_profile_id_fkey foreign KEY (profile_id) references profiles (id)
) TABLESPACE pg_default;

create table public.super_admins (
  id uuid not null default gen_random_uuid (),
  profile_id uuid not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  prn text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  is_active boolean not null default true,
  permissions jsonb null default '{"all_apps": true}'::jsonb,
  constraint super_admins_pkey primary key (id),
  constraint super_admins_profile_id_key unique (profile_id),
  constraint super_admins_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;
