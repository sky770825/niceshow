-- Exercise production trigger functions on isolated temporary rows; retain no test data.
begin;
create temporary table date_trigger_test (
  id bigint, timestamp timestamptz, created_at timestamptz,
  booking_date text, service_date date, status text
);
alter table date_trigger_test enable row level security;
create trigger date_trigger_test before insert or update on date_trigger_test
for each row execute function public.set_foodcar_service_date();

do $$
declare actual date;
begin
  insert into date_trigger_test(id, timestamp, booking_date)
  values (1, '2026-12-01T00:00:00Z', '1月2日(星期六)')
  returning service_date into actual;
  if actual is distinct from date '2027-01-02' then raise exception 'Legacy insert failed'; end if;

  update date_trigger_test set booking_date='2028-02-29' where id=1
  returning service_date into actual;
  if actual is distinct from date '2028-02-29' then raise exception 'Date update failed'; end if;

  update date_trigger_test set status='己排班' where id=1
  returning service_date into actual;
  if actual is distinct from date '2028-02-29' then raise exception 'Status update changed date'; end if;

  insert into date_trigger_test(id, booking_date, service_date)
  values (2, '1月5日(星期二)', date '2027-01-05')
  returning service_date into actual;
  if actual is distinct from date '2027-01-05' then raise exception 'Explicit date failed'; end if;

  begin
    insert into date_trigger_test(id, booking_date) values (3, '2027-02-29');
    raise exception 'Invalid date accepted';
  exception when raise_exception then
    if sqlerrm = 'Invalid date accepted' then raise; end if;
    if sqlerrm <> 'Provide an explicit service_date in YYYY-MM-DD format' then raise; end if;
  end;
end;
$$;
rollback;

select 'PASS: insert, update, status preservation, explicit year, invalid date rejection' as result;
