const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../sheets-booking.js'), 'utf8');
class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-03T04:00:00Z'])); }
}
const ctx = { Date: FixedDate, Intl, console, extractAddress: value => value };
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function resolveBookingServiceDate('), source.indexOf('function generateWeekTitle(')), ctx);
const resolve = (date, timestamp) => ctx.resolveBookingServiceDate({ bookingDate: date, timestamp })?.toISOString().slice(0, 10) || null;
assert.equal(resolve('1月2日(星期六)', '2026-12-01T00:00:00Z'), '2027-01-02');
assert.equal(resolve('1月5日(星期一)', '2026-02-01T00:00:00Z'), '2026-01-05');
assert.equal(resolve('1月1日(星期四)', '2025-12-31T16:00:00Z'), '2026-01-01');
assert.equal(resolve('2028-02-29'), '2028-02-29');
assert.equal(resolve('2027-02-29'), null);
assert.equal(resolve('1月2日', '2026-12-01'), null);
assert.equal(resolve('1月2日(星期六)', 'invalid'), null);
assert.equal(ctx.resolveBookingServiceDate({ serviceDate: 'invalid', bookingDate: '2027-01-02' }), null);
const row = date => ({ serviceDate: date, status: '己排班', storeName: date, venue: '' });
const result = ctx.convertBookingToSchedule(['2027-01-02', '2026-12-31', '2027-01-01'].map(row));
assert.deepEqual(Array.from(result.weeks.flatMap(w => w.days.map(d => d.isoDate))), ['2026-12-31', '2027-01-01', '2027-01-02']);
assert.equal(result.weeks.length, 1);
assert.equal(ctx.convertBookingToSchedule(['2027-01-05', '2028-01-05'].map(row)).weeks.length, 2);
console.log('PASS: date validation, Taipei rollover, previous/future year, cross-year week order, distinct years');
