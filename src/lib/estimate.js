import { SERVICES, haversine, groundDays, coords } from "./transit.js";
import { buildHolidays, parseDate, addBiz, nextBiz, key } from "./calendar.js";

export function compute({ origin, dest, service, source, supplierId, suppliers, ready, handling, override, ovDays }) {
  const oZip = origin.replace(/\D/g, "");
  const dZip = dest.replace(/\D/g, "");
  if (oZip.length < 5 || dZip.length < 5) return { state: "wait" };

  const oc = coords(oZip), dc = coords(dZip);
  if (!oc || !dc) return { state: "nozip", which: !oc ? "origin" : "destination" };

  const svc = SERVICES.find(s => s.id === service);
  const dist = Math.round(haversine(oc, dc));

  let transit;
  if (override) transit = Math.max(1, Number(ovDays) || 1);
  else transit = svc.transit != null ? svc.transit : groundDays(dist);

  let leadMin, leadMax, supplierName = null;
  if (source === "dropship" && supplierId && supplierId !== "other") {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      leadMin = supplier.leadMin;
      leadMax = supplier.leadMax;
      supplierName = supplier.name;
    } else {
      leadMin = leadMax = Math.max(0, Number(handling) || 0);
    }
  } else {
    leadMin = leadMax = Math.max(0, Number(handling) || 0);
  }

  const readyD = parseDate(ready);
  const hol = buildHolidays(readyD.getFullYear());

  const shipEarliestD = addBiz(readyD, leadMin, hol);
  const shipLatestD   = addBiz(readyD, leadMax, hol);
  const arriveEarliestD = addBiz(shipEarliestD, transit, hol);
  const arriveLatestD   = addBiz(shipLatestD,   transit, hol);

  const skipped = [];
  const seen = new Set();
  const cur = new Date(nextBiz(readyD, hol));
  while (cur <= arriveLatestD) {
    const nm = hol[key(cur)];
    if (nm && !seen.has(nm)) { seen.add(nm); skipped.push({ name: nm, d: new Date(cur) }); }
    cur.setDate(cur.getDate() + 1);
  }

  const isWindow = arriveEarliestD.getTime() !== arriveLatestD.getTime();
  const shipIsWindow = shipEarliestD.getTime() !== shipLatestD.getTime();

  return {
    state: "ok",
    svc, dist, transit,
    isGround: svc.transit == null && !override,
    readyD, leadMin, leadMax, supplierName,
    shipEarliestD, shipLatestD, shipIsWindow,
    arriveEarliestD, arriveLatestD, isWindow,
    skipped,
  };
}
