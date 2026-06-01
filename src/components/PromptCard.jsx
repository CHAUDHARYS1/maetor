export default function PromptCard({ hasOrigin, hasDest }) {
  const fillPct = hasOrigin && hasDest ? 100 : hasOrigin ? 50 : 0

  const step = !hasOrigin
    ? 'Enter the origin ZIP to get started'
    : !hasDest
    ? 'Now enter the destination ZIP'
    : 'Calculating…'

  return (
    <div className="prompt-card">
      <div className="prompt-route">
        <div className={`prompt-dot${hasOrigin ? ' from-lit' : ''}`} />
        <div className="prompt-track">
          <div className="prompt-fill" style={{ width: `${fillPct}%` }} />
        </div>
        <div className={`prompt-dot${hasDest ? ' to-lit' : ''}`} />
      </div>
      <div className="prompt-ends">
        <span className={hasOrigin ? 'prompt-end lit-from' : 'prompt-end'}>FROM</span>
        <span className={hasDest ? 'prompt-end lit-to' : 'prompt-end'}>TO</span>
      </div>
      <p className="prompt-step">{step}</p>
    </div>
  )
}
