import { useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { pretty, prettyShort } from '../lib/calendar'

function svcLabel(name) {
  return name.replace('®', '').trim()
}

function buildCopyText({ best, needByD }) {
  const name     = svcLabel(best.svc.name)
  const shipDate = best.result.shipIsWindow
    ? `between ${pretty(best.result.shipEarliestD)} and ${pretty(best.result.shipLatestD)}`
    : `by ${pretty(best.result.shipEarliestD)}`
  const arriveDate = best.result.isWindow
    ? `between ${pretty(best.result.arriveEarliestD)} and ${pretty(best.result.arriveLatestD)}`
    : `by ${pretty(best.result.arriveEarliestD)}`
  return `Materials need to arrive by ${pretty(needByD)}. Recommended service: ${name} — ship ${shipDate}, arrives ${arriveDate}.`
}

function CopyBtn({ rec }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(buildCopyText(rec)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      className={`copy-summary${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      aria-label="Copy recommendation to clipboard"
    >
      {copied ? <Check size={13} weight="bold" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? 'Copied!' : 'Copy summary'}
    </button>
  )
}

export default function RecommendPanel({ rec }) {
  if (rec.state === 'nozip') {
    return (
      <div className="banner">
        Couldn't locate the {rec.which} ZIP — double-check it or enable the transit override.
      </div>
    )
  }

  if (rec.state === 'impossible') {
    const { fastest, needByD } = rec
    const earliestISO = prettyShort(fastest.result.arriveEarliestD)
    return (
      <div className="rec-card rec-card--impossible">
        <div className="rec-hero">
          <div className="rec-eyebrow">No service meets the deadline</div>
          <div className="rec-service">Deadline: {prettyShort(needByD)}</div>
          <div className="rec-meta">
            Earliest possible via {svcLabel(fastest.svc.name)} is {earliestISO}
          </div>
        </div>
      </div>
    )
  }

  const { best, alternatives, notViable } = rec

  const shipDate = best.result.shipIsWindow
    ? `${prettyShort(best.result.shipEarliestD)} – ${prettyShort(best.result.shipLatestD)}`
    : prettyShort(best.result.shipEarliestD)

  const arriveDate = best.result.isWindow
    ? `${prettyShort(best.result.arriveEarliestD)} – ${prettyShort(best.result.arriveLatestD)}`
    : prettyShort(best.result.arriveEarliestD)

  return (
    <>
      <div className="rec-card">
        <div className="rec-hero">
          <div className="rec-eyebrow">Best option</div>
          <div className="rec-service">{svcLabel(best.svc.name)}</div>
          <div className="rec-meta">
            <span>Ship by {shipDate}</span>
            <span className="rec-dot" />
            <span>Arrives {arriveDate}</span>
          </div>
        </div>

        {alternatives.length > 0 && (
          <div className="rec-row">
            <span className="rec-row-label">Also works</span>
            <div className="rec-tags">
              {alternatives.map(a => (
                <span key={a.svc.id} className="tag">{svcLabel(a.svc.name)}</span>
              ))}
            </div>
          </div>
        )}

        {notViable.length > 0 && (
          <div className="rec-row rec-row--muted">
            <span className="rec-row-label">Too slow</span>
            <div className="rec-tags">
              {notViable.map(n => (
                <span key={n.svc.id} className="tag tag--muted">{svcLabel(n.svc.name)}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <CopyBtn rec={rec} />
    </>
  )
}
