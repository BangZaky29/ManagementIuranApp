create table public.profiles (
  id uuid not null,
  full_name text not null,
  email text not null,
  phone text null,
  role public.user_role not null default 'warga'::user_role,
  address text null,
  rt_rw text null default '005/003'::text,
  avatar_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_timestamp ();