import { DOW, MON, pretty, prettyShort } from '../lib/calendar'

export default function ResultPanel({ result }) {
  if (result.state === 'wait') {
    return (
      <div className="result-wait">
        Enter both ZIP codes to see an estimate.
      </div>
    )
  }

  if (result.state === 'nozip') {
    return (
      <div className="banner">
        Couldn't locate the {result.which} ZIP — double-check it, or enable the transit
        override to set days manually.
      </div>
    )
  }

  const {
    svc, dist, transit, isGround,
    readyD, leadMin, leadMax, supplierName,
    shipEarliestD, shipLatestD, shipIsWindow,
    arriveEarliestD, arriveLatestD, isWindow,
    skipped,
  } = result

  const hasLead = leadMin > 0 || leadMax > 0

  // Stable animation key: changes whenever the arrival dates change
  const animKey = prettyShort(arriveEarliestD) + '-' + prettyShort(arriveLatestD)

  return (
    <div key={animKey} className="animate-rise">

      {/* Hero card */}
      <div className="result-hero">
        <div className="result-eyebrow">
          {isWindow ? 'Estimated delivery window' : 'Estimated delivery'}
        </div>

        {isWindow ? (
          <div className="result-date-row">
            <span className="result-date sm">{prettyShort(arriveEarliestD)}</span>
            <span className="result-sep">–</span>
            <span className="result-date sm">{prettyShort(arriveLatestD)}</span>
          </div>
        ) : (
          <div className="result-date-row">
            <span className="result-date">{prettyShort(arriveEarliestD)}</span>
            <span className="result-dow">{DOW[arriveEarliestD.getDay()]}</span>
          </div>
        )}

        <div className="result-tags">
          <Tag>{svc.name.replace('®', '®')}</Tag>
          <Tag>{transit} transit {transit === 1 ? 'day' : 'days'}</Tag>
          {isGround && dist > 0 && <Tag>~{dist.toLocaleString()} mi</Tag>}
          {hasLead && leadMin === leadMax && (
            <Tag>+{leadMin} {supplierName ? 'day lead' : 'handling'}</Tag>
          )}
          {hasLead && leadMin !== leadMax && (
            <Tag>{leadMin}–{leadMax} day lead</Tag>
          )}
          {supplierName && <Tag>{supplierName}</Tag>}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        <TlRow
          label="Order ready"
          sub={DOW[readyD.getDay()]}
          val={pretty(readyD)}
        />
        <TlRow
          label={`Ships · ${
            leadMin === leadMax
              ? `${leadMin} biz day${leadMin === 1 ? '' : 's'} lead`
              : `${leadMin}–${leadMax} biz days lead`
          }`}
          sub={svc.name.replace('®', '')}
          val={shipIsWindow
            ? `${prettyShort(shipEarliestD)} – ${prettyShort(shipLatestD)}`
            : pretty(shipEarliestD)}
          small={shipIsWindow}
        />
        <TlRow
          label={`Arrives · ${transit} biz day${transit === 1 ? '' : 's'} transit`}
          val={isWindow
            ? `${prettyShort(arriveEarliestD)} – ${prettyShort(arriveLatestD)}`
            : pretty(arriveEarliestD)}
          small={isWindow}
          accent
          last
        />
      </div>

      {/* Skipped holidays */}
      {skipped.length > 0 && (
        <div className="skipped-note">
          <strong>Skipped:</strong>{' '}
          {skipped.map((h, i) => (
            <span key={h.name}>
              {h.name} ({MON[h.d.getMonth()]} {h.d.getDate()})
              {i < skipped.length - 1 ? ', ' : ''}
            </span>
          ))}
          {' '}— UPS doesn't move on these.
        </div>
      )}
    </div>
  )
}

function Tag({ children }) {
  return <span className="tag">{children}</span>
}

function TlRow({ label, sub, val, accent, last, small }) {
  return (
    <div className="tl-row">
      <span className={`tl-dot ${accent ? 'accent' : ''}`} />
      <div className="tl-body">
        <div className="tl-label">{label}</div>
        {sub && <div className="tl-sub">{sub}</div>}
      </div>
      <div className={`tl-val ${accent ? 'accent' : ''} ${small ? 'sm' : ''}`}>
        {val}
      </div>
    </div>
  )
}
