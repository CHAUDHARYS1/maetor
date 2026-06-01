import { useState } from 'react'
import { Copy, Check } from '@phosphor-icons/react'
import { pretty } from '../lib/calendar'

function buildText(result) {
  const { svc, shipEarliestD, shipLatestD, shipIsWindow,
          arriveEarliestD, arriveLatestD, isWindow } = result

  const shipPart = shipIsWindow
    ? `between ${pretty(shipEarliestD)} and ${pretty(shipLatestD)}`
    : `on ${pretty(shipEarliestD)}`

  const arrivePart = isWindow
    ? `between ${pretty(arriveEarliestD)} and ${pretty(arriveLatestD)}`
    : `by ${pretty(arriveEarliestD)}`

  const svcName = svc.name.replace('®', '').trim()

  return `Materials shipped ${shipPart} should arrive ${arrivePart} via ${svcName}.`
}

export default function CopySummary({ result }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(buildText(result)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className={`copy-summary${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      aria-label="Copy shipment summary to clipboard"
    >
      {copied
        ? <Check size={13} weight="bold" aria-hidden="true" />
        : <Copy size={13} aria-hidden="true" />
      }
      {copied ? 'Copied!' : 'Copy summary'}
    </button>
  )
}
