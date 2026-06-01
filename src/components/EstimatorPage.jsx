import { useState, useMemo, useRef, useEffect } from 'react'
import { CaretDown, Gear } from '@phosphor-icons/react'
import { SERVICES, coords } from '../lib/transit'
import { toISO } from '../lib/calendar'
import { compute } from '../lib/estimate'
import { recommend } from '../lib/recommend'
import ResultPanel from './ResultPanel'
import RecommendPanel from './RecommendPanel'
import GlobePreview from './GlobePreview'
import PromptCard from './PromptCard'
import CopySummary from './CopySummary'

export default function EstimatorPage({ suppliers }) {
  const today = toISO(new Date())

  const [origin,      setOrigin]      = useState('')
  const [dest,        setDest]        = useState('')
  const [service,     setService]     = useState('ground')
  const [source,      setSource]      = useState('warehouse')
  const [ready,       setReady]       = useState(today)
  const [handling,    setHandling]    = useState(1)
  const [supplierId,  setSupplierId]  = useState('')
  const [override,    setOverride]    = useState(false)
  const [ovDays,      setOvDays]      = useState(2)
  const [showOptions, setShowOptions] = useState(false)
  const [mode,        setMode]        = useState('estimate')   // 'estimate' | 'recommend'
  const [needBy,      setNeedBy]      = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return toISO(d)
  })

  const originRef = useRef()
  useEffect(() => { originRef.current?.focus() }, [])

  function pickSource(s) {
    setSource(s)
    if (s === 'warehouse') {
      setSupplierId('')
      setHandling(1)
    } else {
      const first = suppliers.find(x => x.alwaysDropship) ?? suppliers[0]
      setSupplierId(first ? first.id : 'other')
      setHandling(0)
    }
  }

  const selectedSupplier = useMemo(() => {
    if (source !== 'dropship' || !supplierId || supplierId === 'other') return null
    return suppliers.find(s => s.id === supplierId) ?? null
  }, [source, supplierId, suppliers])

  const originCoords = useMemo(() => coords(origin), [origin])
  const destCoords   = useMemo(() => coords(dest), [dest])

  const result = useMemo(() => compute({
    origin, dest, service, source, supplierId, suppliers,
    ready, handling, override, ovDays,
  }), [origin, dest, service, source, supplierId, suppliers, ready, handling, override, ovDays])

  const rec = useMemo(() => recommend({
    origin, dest, ready, handling, needBy, source, supplierId, suppliers,
  }), [origin, dest, ready, handling, needBy, source, supplierId, suppliers])

  const leadLabel = selectedSupplier
    ? (selectedSupplier.leadMin === selectedSupplier.leadMax
        ? `${selectedSupplier.leadMin} biz day${selectedSupplier.leadMin === 1 ? '' : 's'}`
        : `${selectedSupplier.leadMin}–${selectedSupplier.leadMax} biz days`)
    : null

  const hasOrigin = origin.length >= 5
  const hasDest   = dest.length >= 5

  return (
    <>
      <div className="globe-fullscreen">
        <GlobePreview
          originCoords={originCoords}
          destCoords={destCoords}
          service={service}
          origin={origin}
          dest={dest}
          routeInfo={result.state === 'ok' ? {
            dist:    result.dist,
            transit: result.transit,
            svcName: result.svc.name,
          } : null}
        />
      </div>

      {/* ── Top-right floating result / prompt ── */}
      <div className="result-overlay" aria-live="polite">
        {mode === 'estimate' ? (
          <>
            {result.state === 'wait'
              ? <PromptCard hasOrigin={hasOrigin} hasDest={hasDest} />
              : <ResultPanel result={result} />
            }
            {result.state === 'ok' && <CopySummary result={result} />}
          </>
        ) : (
          <>
            {rec.state === 'wait'
              ? <PromptCard hasOrigin={hasOrigin} hasDest={hasDest} />
              : <RecommendPanel rec={rec} />
            }
          </>
        )}
      </div>

      {/* ── Top-left floating form ── */}
      <div className="form-overlay" role="region" aria-label="Estimator form">

        <div className="seg">
          <button
            className={source === 'warehouse' ? 'on' : ''}
            onClick={() => pickSource('warehouse')}
            aria-pressed={source === 'warehouse'}
          >
            Our Warehouse
          </button>
          <button
            className={source === 'dropship' ? 'on' : ''}
            onClick={() => pickSource('dropship')}
            aria-pressed={source === 'dropship'}
          >
            Dropship Supplier
          </button>
        </div>

        {/* Route card */}
        <div className="overlay-card">
          <div className="sec-hdr">Route</div>
          <div className="form-grp">
            {source === 'dropship' && (
              <div className="form-field">
                <label className="field-lbl" htmlFor="supplier-select">Supplier</label>
                <div className="select-wrap">
                  <select
                    id="supplier-select"
                    className="field-select"
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                  >
                    {suppliers.length === 0 && (
                      <option value="other">Other / Manual</option>
                    )}
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="other">Other / Manual</option>
                  </select>
                  <CaretDown size={12} className="select-caret" />
                </div>
              </div>
            )}
            <div className={`form-field${!hasOrigin ? ' field-start' : ''}`}>
              <label className="field-lbl" htmlFor="origin-zip">From ZIP</label>
              <input
                ref={originRef}
                id="origin-zip"
                className="field-inp"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                inputMode="numeric"
                maxLength={5}
                placeholder="60601"
              />
            </div>
            <div className={`form-field${hasOrigin && !hasDest ? ' field-start' : ''}`}>
              <label className="field-lbl" htmlFor="dest-zip">To ZIP</label>
              <input
                id="dest-zip"
                className="field-inp"
                value={dest}
                onChange={e => setDest(e.target.value)}
                inputMode="numeric"
                maxLength={5}
                placeholder="90001"
              />
            </div>
          </div>
        </div>

        {/* Shipment card */}
        <div className="overlay-card">
          <div className="sec-hdr">
            Shipment
            <button
              className="mode-pill"
              onClick={() => setMode(m => m === 'estimate' ? 'recommend' : 'estimate')}
            >
              {mode === 'estimate' ? 'Need it by a date?' : '← Pick a service'}
            </button>
          </div>
          <div className="form-grp">
            {mode === 'estimate' ? (
              <div className="form-field">
                <label className="field-lbl" htmlFor="service-select">Service</label>
                <div className="select-wrap">
                  <select
                    id="service-select"
                    className="field-select"
                    value={service}
                    onChange={e => setService(e.target.value)}
                  >
                    {SERVICES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <CaretDown size={12} className="select-caret" />
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label className="field-lbl" htmlFor="need-by">Need by</label>
                <input
                  id="need-by"
                  className="field-inp"
                  type="date"
                  value={needBy}
                  onChange={e => setNeedBy(e.target.value)}
                  style={{ textAlign: 'right' }}
                />
              </div>
            )}

            <div className="form-field">
              <label className="field-lbl" htmlFor="ready-date">Ready date</label>
              <input
                id="ready-date"
                className="field-inp"
                type="date"
                value={ready}
                onChange={e => setReady(e.target.value)}
                style={{ textAlign: 'right' }}
              />
            </div>

            {showOptions && (
              <>
                {selectedSupplier ? (
                  <div className="form-field">
                    <div style={{ flex: 1 }}>
                      <div className="field-lbl">Lead time</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-4)', marginTop: 2 }}>
                        {selectedSupplier.name}
                      </div>
                    </div>
                    <span className="row-val accent" style={{ fontSize: 'var(--text-md)' }}>
                      {leadLabel}
                    </span>
                  </div>
                ) : (
                  <div className="form-field">
                    <label className="field-lbl" htmlFor="handling-input">
                      {source === 'dropship' ? 'Lead time' : 'Handling days'}
                    </label>
                    <input
                      id="handling-input"
                      className="field-inp"
                      type="number"
                      min={0}
                      max={120}
                      value={handling}
                      onChange={e => setHandling(Number(e.target.value))}
                    />
                  </div>
                )}
                <div className="form-field">
                  <div style={{ flex: 1 }}>
                    <div className="field-lbl">Override transit</div>
                  </div>
                  <button
                    className={`toggle ${override ? 'on' : ''}`}
                    onClick={() => setOverride(o => !o)}
                    aria-label={override ? 'Disable transit override' : 'Enable transit override'}
                    aria-pressed={override}
                  />
                </div>
                {override && (
                  <div className="form-field">
                    <label className="field-lbl" htmlFor="ov-days">Transit days</label>
                    <input
                      id="ov-days"
                      className="field-inp"
                      type="number"
                      min={1}
                      max={20}
                      value={ovDays}
                      onChange={e => setOvDays(Number(e.target.value))}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className={`options-toggle${showOptions ? ' open' : ''}`}
            onClick={() => setShowOptions(o => !o)}
            aria-expanded={showOptions}
          >
            <Gear size={11} weight="bold" aria-hidden="true" />
            {showOptions ? 'Fewer options' : 'More options'}
          </button>

          {selectedSupplier && showOptions && (
            <div className="sec-ftr">
              Lead times are your own estimates — edit on Suppliers tab.
            </div>
          )}
        </div>

      </div>
    </>
  )
}
