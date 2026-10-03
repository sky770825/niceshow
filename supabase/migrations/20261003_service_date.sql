-- Add full calendar dates without replacing legacy display text or existing policies.
begin;

alter table public.foodcarcalss add column if not exists service_date date;
create schema if not exists niceshow_migrations;
revoke all on schema niceshow_migrations from public, anon, authenticated;
create table if not exists niceshow_migrations.dates_before_20261003 as
select id, booking_date, service_date from public.foodcarcalss;
alter table niceshow_migrations.dates_before_20261003 enable row level security;

create or replace function public.resolve_foodcar_service_date(raw text, anchor timestamptz)
returns date language plpgsql stable set search_path = pg_catalog as $$
declare
  parts text[];
  y integer;
  candidate date;
  matches date[] := '{}';
begin
  parts := regexp_match(trim(raw), '^([0-9]{4})[年/-]([0-9]{1,2})[月/-]([0-9]{1,2})(日|$|[ T(（])');
  if parts is not null then
    begin
      return make_date(parts[1]::integer, parts[2]::integer, parts[3]::integer);
    exception when datetime_field_overflow then return null;
    end;
  end if;
  parts := regexp_match(trim(raw), '^([0-9]{1,2})月([0-9]{1,2})日[(（]星期([日一二三四五六])[)）]$');
  if parts is null or anchor is null then return null; end if;
  for y in extract(year from anchor at time zone 'Asia/Taipei')::integer - 1
        .. extract(year from anchor at time zone 'Asia/Taipei')::integer + 1 loop
    begin
      candidate := make_date(y, parts[1]::integer, parts[2]::integer);
      if extract(dow from candidate)::integer = strpos('日一二三四五六', parts[3]) - 1 then
        matches := array_append(matches, candidate);
      end if;
    exception when datetime_field_overflow then null;
    end;
  end loop;
  if cardinality(matches) = 1 then return matches[1]; end if;
  return null;
end;
$$;

update public.foodcarcalss
set service_date = public.resolve_foodcar_service_date(
  booking_date, coalesce(timestamp, created_at))
where service_date is null;

-- Fail the complete transaction rather than silently leave unresolved production rows.
do $$
begin
  if exists (select 1 from public.foodcarcalss where service_date is null) then
    raise exception 'Unresolved dates remain; migration rolled back. Confirm explicit years first.';
  end if;
  if public.resolve_foodcar_service_date('1月2日(星期六)', '2026-12-01T00:00:00Z') is distinct from date '2027-01-02'
    or public.resolve_foodcar_service_date('1月5日(星期一)', '2026-02-01T00:00:00Z') is distinct from date '2026-01-05'
    or public.resolve_foodcar_service_date('2028-02-29', null) is distinct from date '2028-02-29'
    or public.resolve_foodcar_service_date('2027-02-29', null) is not null then
    raise exception 'Date resolver validation failed';
  end if;
end;
$$;

create or replace function public.set_foodcar_service_date()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'INSERT' then
    if new.service_date is null then
      new.service_date := public.resolve_foodcar_service_date(
        new.booking_date, coalesce(new.timestamp, new.created_at, now()));
    end if;
  elsif new.booking_date is distinct from old.booking_date
        and new.service_date is not distinct from old.service_date then
    new.service_date := public.resolve_foodcar_service_date(
      new.booking_date, coalesce(new.timestamp, new.created_at));
  end if;
  if new.service_date is null then
    raise exception 'Provide an explicit service_date in YYYY-MM-DD format';
  end if;
  return new;
end;
$$;

create or replace trigger foodcar_service_date before insert or update on public.foodcarcalss
for each row execute function public.set_foodcar_service_date();
alter table public.foodcarcalss alter column service_date set not null;
create index if not exists foodcarcalss_service_date_idx on public.foodcarcalss(service_date);
notify pgrst, 'reload schema';
commit;

select count(*) as total_rows, count(service_date) as dated_rows,
  min(service_date) as first_date, max(service_date) as last_date
from public.foodcarcalss;
