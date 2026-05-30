const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function nthWeekday(year, month, weekday, n) {
  const d = new Date(year, month, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) { count++; if (count === n) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
}

function lastWeekday(year, month, weekday) {
  const d = new Date(year, month + 1, 0);
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return new Date(d);
}

function holidaysForYear(y) {
  return [
    { d: new Date(y, 0, 1),           name: "New Year’s Day" },
    { d: lastWeekday(y, 4, 1),         name: "Memorial Day" },
    { d: new Date(y, 6, 4),            name: "Independence Day" },
    { d: nthWeekday(y, 8, 1, 1),       name: "Labor Day" },
    { d: nthWeekday(y, 10, 4, 4),      name: "Thanksgiving" },
    { d: new Date(y, 11, 25),          name: "Christmas Day" },
  ];
}

export function key(d) {
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

export function buildHolidays(year) {
  const map = {};
  [year - 1, year, year + 1].forEach(y =>
    holidaysForYear(y).forEach(h => { map[key(h.d)] = h.name; })
  );
  return map;
}

export function isBiz(d, hol) {
  const wd = d.getDay();
  if (wd === 0 || wd === 6) return false;
  if (hol[key(d)]) return false;
  return true;
}

export function nextBiz(date, hol) {
  const d = new Date(date);
  while (!isBiz(d, hol)) d.setDate(d.getDate() + 1);
  return d;
}

export function addBiz(date, n, hol) {
  let d = nextBiz(date, hol);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (isBiz(d, hol)) added++;
  }
  return d;
}

export function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(d) {
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function pretty(d) {
  return DOW[d.getDay()].slice(0, 3) + ", " + MON[d.getMonth()] + " " + d.getDate();
}

export function prettyShort(d) {
  return MON[d.getMonth()] + " " + d.getDate();
}

export { DOW, MON };
