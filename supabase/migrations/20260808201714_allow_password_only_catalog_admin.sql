create or replace function private.is_prime_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = (select auth.uid())
      and lower(email) = 'info@primeyachtrental.com'
      and email_confirmed_at is not null
  );
$$;

revoke all on function private.is_prime_catalog_admin()
  from public, anon;

grant execute on function private.is_prime_catalog_admin()
  to authenticated;
