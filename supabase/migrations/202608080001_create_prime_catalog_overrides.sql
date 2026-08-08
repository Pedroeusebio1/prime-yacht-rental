create table if not exists public.prime_catalog_overrides (
  card_key text primary key,
  changes jsonb not null default '{}'::jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint prime_catalog_overrides_card_key_length
    check (char_length(card_key) between 1 and 160),
  constraint prime_catalog_overrides_card_key_format
    check (card_key ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$'),
  constraint prime_catalog_overrides_changes_object
    check (jsonb_typeof(changes) = 'object'),
  constraint prime_catalog_overrides_changes_size
    check (pg_column_size(changes) <= 65536)
);

create or replace function public.prime_catalog_set_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

drop trigger if exists prime_catalog_set_audit_fields
  on public.prime_catalog_overrides;

create trigger prime_catalog_set_audit_fields
before insert or update on public.prime_catalog_overrides
for each row execute function public.prime_catalog_set_audit_fields();

alter table public.prime_catalog_overrides enable row level security;

revoke all on table public.prime_catalog_overrides from anon, authenticated;
grant select on table public.prime_catalog_overrides to anon, authenticated;
grant insert, update on table public.prime_catalog_overrides to authenticated;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

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
      and invited_at is not null
      and email_confirmed_at is not null
  );
$$;

revoke all on function private.is_prime_catalog_admin() from public, anon;
grant execute on function private.is_prime_catalog_admin() to authenticated;

drop policy if exists "Prime catalog is publicly readable"
  on public.prime_catalog_overrides;
create policy "Prime catalog is publicly readable"
on public.prime_catalog_overrides
for select
to anon, authenticated
using (true);

drop policy if exists "Prime catalog admin can insert"
  on public.prime_catalog_overrides;
create policy "Prime catalog admin can insert"
on public.prime_catalog_overrides
for insert
to authenticated
with check (
  (select private.is_prime_catalog_admin())
);

drop policy if exists "Prime catalog admin can update"
  on public.prime_catalog_overrides;
create policy "Prime catalog admin can update"
on public.prime_catalog_overrides
for update
to authenticated
using (
  (select private.is_prime_catalog_admin())
)
with check (
  (select private.is_prime_catalog_admin())
);

create or replace function public.save_prime_catalog_override(
  p_card_key text,
  p_changes jsonb,
  p_deleted boolean,
  p_expected_updated_at timestamptz default null
)
returns setof public.prime_catalog_overrides
language plpgsql
security invoker
set search_path = ''
as $$
declare
  normalized_changes jsonb := coalesce(p_changes, '{}'::jsonb);
  lowest_price numeric;
begin
  select min(
    replace(matches.amount_parts[1], ',', '')::numeric
      * case when matches.amount_parts[4] is null then 1 else 1000 end
  )
  into lowest_price
  from jsonb_array_elements(
    case
      when jsonb_typeof(normalized_changes -> 'priceTable') = 'array'
        then normalized_changes -> 'priceTable'
      else '[]'::jsonb
    end
  ) as rates(rate_row)
  cross join lateral regexp_matches(
    coalesce(rates.rate_row ->> 'value', ''),
    '\$[[:space:]]*([0-9]+(,[0-9]{3})*(\.[0-9]+)?)([kK])?',
    'g'
  ) as matches(amount_parts);

  if lowest_price is not null then
    normalized_changes := jsonb_set(
      normalized_changes,
      '{price}',
      to_jsonb('$' || to_char(round(lowest_price), 'FM999,999,999,990')),
      true
    );
  end if;

  if p_expected_updated_at is null then
    return query
      insert into public.prime_catalog_overrides (card_key, changes, deleted)
      values (p_card_key, normalized_changes, p_deleted)
      on conflict (card_key) do nothing
      returning *;
  else
    return query
      update public.prime_catalog_overrides as catalog_row
      set changes = normalized_changes,
          deleted = p_deleted
      where catalog_row.card_key = p_card_key
        and catalog_row.updated_at = p_expected_updated_at
      returning catalog_row.*;
  end if;
end;
$$;

revoke execute on function public.save_prime_catalog_override(text, jsonb, boolean, timestamptz)
  from public, anon;
grant execute on function public.save_prime_catalog_override(text, jsonb, boolean, timestamptz)
  to authenticated;
