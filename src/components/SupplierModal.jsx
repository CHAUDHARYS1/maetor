import { useState } from 'react'

export default function SupplierModal({ supplier, onSave, onDelete, onClose }) {
  const isNew = !supplier.id

  const [name,           setName]           = useState(supplier.name          ?? '')
  const [alwaysDropship, setAlwaysDropship] = useState(supplier.alwaysDropship ?? true)
  const [leadMin,        setLeadMin]        = useState(supplier.leadMin        ?? 5)
  const [leadMax,        setLeadMax]        = useState(supplier.leadMax        ?? 10)

  const nameValid = name.trim().length > 0

  function handleSave() {
    if (!nameValid) return
    const min = Math.max(0, parseInt(leadMin, 10) || 0)
    const max = Math.max(min, parseInt(leadMax, 10) || min)
    onSave({ ...supplier, name: name.trim(), alwaysDropship, leadMin: min, leadMax: max })
  }

  function handleDelete() {
    if (window.confirm(`Delete "${supplier.name}"?`)) {
      onDelete(supplier.id)
    }
  }

  return (
    <div className="overlay open">
      <div className="sheet" role="dialog" aria-modal="true" aria-label={isNew ? 'Add Supplier' : 'Edit Supplier'}>
        <div className="handle-bar"><div className="handle" /></div>

        <div className="sheet-hdr">
          <button className="sheet-cancel" onClick={onClose}>Cancel</button>
          <span className="sheet-ttl">{isNew ? 'Add Supplier' : 'Edit Supplier'}</span>
          <button
            className="sheet-save"
            onClick={handleSave}
            disabled={!nameValid}
            style={{ opacity: nameValid ? 1 : 0.4 }}
          >
            Save
          </button>
        </div>

        {/* Details section */}
        <div className="sec" style={{ marginTop: 20 }}>
          <div className="sec-hdr">Details</div>
          <div className="form-grp">
            <div className="form-field">
              <label className="field-lbl" htmlFor="s-name">Name</label>
              <input
                id="s-name"
                className="field-inp"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Panduit"
                autoFocus
              />
            </div>
            <div className="form-field">
              <div style={{ flex: 1 }}>
                <div className="field-lbl">Always dropship</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-4)', marginTop: 2 }}>
                  Auto-sets dropship source when selected
                </div>
              </div>
              <button
                className={`toggle ${alwaysDropship ? 'on' : ''}`}
                onClick={() => setAlwaysDropship(v => !v)}
                aria-label={alwaysDropship ? 'Disable always dropship' : 'Enable always dropship'}
              />
            </div>
          </div>
        </div>

        {/* Lead time section */}
        <div className="sec" style={{ marginTop: 20 }}>
          <div className="sec-hdr">Lead time estimate (business days)</div>
          <div className="form-grp">
            <div className="form-field">
              <label className="field-lbl" htmlFor="s-lead-min">Minimum</label>
              <input
                id="s-lead-min"
                className="field-inp"
                type="number"
                min={0}
                max={250}
                value={leadMin}
                onChange={e => setLeadMin(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-lbl" htmlFor="s-lead-max">Maximum</label>
              <input
                id="s-lead-max"
                className="field-inp"
                type="number"
                min={0}
                max={250}
                value={leadMax}
                onChange={e => setLeadMax(e.target.value)}
              />
            </div>
          </div>
          <div className="sec-ftr">
            Your own estimate from order history. Not a vendor commitment — adjust any time.
          </div>
        </div>

        {/* Delete */}
        {!isNew && (
          <div style={{ margin: '24px 16px 8px' }}>
            <button
              onClick={handleDelete}
              style={{
                width: '100%',
                minHeight: 44,
                padding: '12px',
                background: 'var(--red-tint)',
                color: 'var(--red)',
                borderRadius: 'var(--radius)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-lg)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Delete Supplier
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
