const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../sheets-booking.js'), 'utf8');
const url = source.match(/URL: '([^']+)'/)[1];
const key = source.match(/ANON_KEY: '([^']+)'/)[1];
const ctx = { Date, Intl };
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function resolveBookingServiceDate('), source.indexOf('function convertBookingToSchedule(')), ctx);
(async () => {
    const response = await fetch(`${url}/rest/v1/foodcarcalss?select=id,booking_date,service_date,timestamp,created_at&order=service_date.asc`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' }
    });
    if (!response.ok) throw Error(`Date audit HTTP ${response.status}`);
    const rows = await response.json();
    const total = Number(response.headers.get('content-range').split('/')[1]);
    assert.equal(rows.length, total, 'Audit must include every row');
    let previous = '';
    for (const row of rows) {
        assert.ok(row.service_date, `Missing date for row ${row.id}`);
        assert.ok(row.service_date >= previous, 'Database order is not chronological');
        previous = row.service_date;
        const legacy = ctx.resolveBookingServiceDate({ ...row, service_date: null });
        assert.equal(legacy?.toISOString().slice(0, 10), row.service_date, `Backfill mismatch for row ${row.id}`);
    }
    console.log(JSON.stringify({ total, validated: rows.length, first: rows[0]?.service_date, last: rows.at(-1)?.service_date }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
