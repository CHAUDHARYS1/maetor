import { SERVICES } from './transit.js'
import { parseDate, toISO } from './calendar.js'
import { compute } from './estimate.js'

export function recommend({ origin, dest, ready, handling, needBy, source, supplierId, suppliers }) {
  if (!origin || !dest || origin.length < 5 || dest.length < 5 || !needBy) {
    return { state: 'wait' }
  }

  const needByD = parseDate(needBy)
  if (!needByD) return { state: 'wait' }
  const needByISO = toISO(needByD)

  // Run compute() for every service, keeping ZIP/handling/source constant
  const tested = SERVICES.map(svc => {
    const r = compute({
      origin, dest, service: svc.id, source, supplierId, suppliers,
      ready, handling, override: false, ovDays: 1,
    })
    if (r.state === 'nozip') return { state: 'nozip', which: r.which }
    if (r.state !== 'ok') return null

    // Use latest possible arrival for conservative comparison
    const arriveISO = toISO(r.isWindow ? r.arriveLatestD : r.arriveEarliestD)
    return { svc, result: r, canMeet: arriveISO <= needByISO }
  }).filter(Boolean)

  if (!tested.length) return { state: 'wait' }
  if (tested[0].state === 'nozip') return tested[0]

  const viable    = tested.filter(t => t.canMeet)
  const notViable = tested.filter(t => !t.canMeet)

  if (!viable.length) {
    // Nothing makes the deadline — surface the fastest option
    return { state: 'impossible', fastest: tested.at(-1), notViable: tested, needByD }
  }

  return {
    state: 'ok',
    best: viable[0],          // slowest (cheapest) service that meets deadline
    alternatives: viable.slice(1),
    notViable,
    needByD,
  }
}
