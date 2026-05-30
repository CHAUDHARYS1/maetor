import { useState, useMemo } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { SERVICES } from '../lib/transit'
import { toISO } from '../lib/calendar'
import { compute } from '../lib/estimate'
import ResultPanel from './ResultPanel'

export default function EstimatorPage({ suppliers }) {
  const today = toISO(new Date())

  const [origin,     setOrigin]     = useState('')
  const [dest,       setDest]       = useState('')
  const [service,    setService]    = useState('ground')
  const [source,     setSource]     = useState('warehouse')
  const [ready,      setReady]      = useState(today)
  const [handling,   setHandling]   = useState(1)
  const [supplierId, setSupplierId] = useState('')
  const [override,   setOverride]   = useState(false)
  const [ovDays,     setOvDays]     = useState(2)

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

  const result = useMemo(() => compute({
    origin, dest, service, source, supplierId, suppliers,
    ready, handling, override, ovDays,
  }), [origin, dest, service, source, supplierId, suppliers, ready, handling, override, ovDays])

  const leadLabel = selectedSupplier
    ? (selectedSupplier.leadMin === selectedSupplier.leadMax
        ? `${selectedSupplier.leadMin} biz day${selectedSupplier.leadMin === 1 ? '' : 's'}`
        : `${selectedSupplier.leadMin}–${selectedSupplier.leadMax} biz days`)
    : null

  return (
    <div className="page-container">
      <div className="page-hdr">
        <h1 className="page-title">Arrival <span className="hl">Estimator</span></h1>
        <p className="page-sub">UPS transit estimate — warehouse or dropship origin.</p>
      </div>

      <div className="estimator-layout">
        {/* ── Left: form ─────────────────────────────── */}
        <div className="form-col">

          <div className="sec" style={{ marginTop: 0 }}>
            <div className="sec-hdr">Shipping from</div>
            <div className="seg">
              <button
                className={source === 'warehouse' ? 'on' : ''}
                onClick={() => pickSource('warehouse')}
              >
                Our Warehouse
              </button>
              <button
                className={source === 'dropship' ? 'on' : ''}
                onClick={() => pickSource('dropship')}
              >
                Dropship Supplier
              </button>
            </div>
          </div>

          <div className="sec">
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

              <div className="form-field">
                <label className="field-lbl" htmlFor="origin-zip">Origin ZIP</label>
                <input
                  id="origin-zip"
                  className="field-inp"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="60601"
                />
              </div>

              <div className="form-field">
                <label className="field-lbl" htmlFor="dest-zip">Destination ZIP</label>
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

          <div className="sec">
            <div className="sec-hdr">Shipment</div>
            <div className="form-grp">

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

              {selectedSupplier ? (
                <div className="form-field">
                  <div style={{ flex: 1 }}>
                    <div className="field-lbl">Lead time</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-4)', marginTop: 2 }}>
                      {selectedSupplier.name} · your estimate
                    </div>
                  </div>
                  <span className="row-val accent" style={{ fontSize: 'var(--text-md)' }}>
                    {leadLabel}
                  </span>
                </div>
              ) : (
                <div className="form-field">
                  <label className="field-lbl" htmlFor="handling-input">
                    {source === 'dropship' ? 'Lead time (biz days)' : 'Handling (biz days)'}
                  </label>
                  <input
                    id="handling-input"
                    className="field-inp"
                    type="number"
                    min={0}
                    max={120}
                    value={handling}
                    onChange={e => setHandling(e.target.value)}
                  />
                </div>
              )}

              <div className="form-field">
                <div style={{ flex: 1 }}>
                  <div className="field-lbl">Transit override</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-4)', marginTop: 2 }}>
                    For routes you've already clocked
                  </div>
                </div>
                <button
                  className={`toggle ${override ? 'on' : ''}`}
                  onClick={() => setOverride(o => !o)}
                  aria-label={override ? 'Disable transit override' : 'Enable transit override'}
                />
              </div>

              {override && (
                <div className="form-field">
                  <label className="field-lbl" htmlFor="ov-days">Transit (biz days)</label>
                  <input
                    id="ov-days"
                    className="field-inp"
                    type="number"
                    min={1}
                    max={20}
                    value={ovDays}
                    onChange={e => setOvDays(e.target.value)}
                  />
                </div>
              )}
            </div>

            {selectedSupplier && (
              <div className="sec-ftr">
                Lead times are your own estimates — edit them on the Suppliers tab.
              </div>
            )}
          </div>

          <div className="disclaimer" style={{ marginTop: 'var(--space-7)' }}>
            Estimate only. Not a guaranteed commitment. Ground transit is distance-approximated
            from ZIP-prefix centroids and may differ from UPS's exact zone map. Supplier lead
            times are your own editable estimates.
          </div>
        </div>

        {/* ── Right: result ───────────────────────────── */}
        <div className="result-col">
          <ResultPanel result={result} />
        </div>
      </div>
    </div>
  )
}
