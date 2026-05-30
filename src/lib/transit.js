import { ZIP3 } from "../data/zip3.js";

export const SERVICES = [
  { id: "ground",   name: "UPS® Ground",              transit: null },
  { id: "3day",     name: "UPS 3 Day Select®",        transit: 3 },
  { id: "2day",     name: "UPS 2nd Day Air®",         transit: 2 },
  { id: "2dayam",   name: "UPS 2nd Day Air® A.M.",    transit: 2 },
  { id: "ndsaver",  name: "UPS Next Day Air Saver®",  transit: 1 },
  { id: "nda",      name: "UPS Next Day Air®",        transit: 1 },
  { id: "ndaearly", name: "UPS Next Day Air® Early",  transit: 1 },
];

export function haversine(a, b) {
  const R = 3958.8;
  const [la1, lo1] = a, [la2, lo2] = b;
  const p1 = la1 * Math.PI / 180, p2 = la2 * Math.PI / 180;
  const dp = (la2 - la1) * Math.PI / 180, dl = (lo2 - lo1) * Math.PI / 180;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(x));
}

export function groundDays(mi) {
  if (mi < 250)  return 1;
  if (mi < 600)  return 2;
  if (mi < 1000) return 3;
  if (mi < 1500) return 4;
  return 5;
}

export function coords(zip) {
  const p = (zip || "").slice(0, 3);
  const c = ZIP3[p];
  if (!c || (c[0] === 0 && c[1] === 0)) return null;
  return c;
}
