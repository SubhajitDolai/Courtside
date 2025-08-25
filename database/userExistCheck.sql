create or replace function user_exists_by_email(input_email text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(input_email)
  );
$$;