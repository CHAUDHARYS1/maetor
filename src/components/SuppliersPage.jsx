import { useState, useRef } from 'react'
import { Plus, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import SupplierModal from './SupplierModal'

export default function SuppliersPage({ suppliers, add, update, remove, exportJSON, importJSON }) {
  const [editing, setEditing] = useState(null) // null = closed | {} = new | {...} = edit
  const importRef = useRef(null)

  function handleImport(e) {
    if (e.target.files[0]) importJSON(e.target.files[0])
    e.target.value = ''
  }

  return (
    <div className="page-container">
      <div className="page-hdr">
        <h1 className="page-title">Sup<span className="hl">pliers</span></h1>
        <p className="page-sub">Edit lead-time estimates for your dropship suppliers.</p>
      </div>

      {/* Supplier list */}
      <div className="sec">
        <div className="grp">
          {suppliers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">No Suppliers</div>
              <div className="empty-sub">
                Add suppliers to auto-apply lead times when dropshipping.
              </div>
            </div>
          ) : (
            suppliers.map(s => (
              <div
                key={s.id}
                className="supplier-row"
                onClick={() => setEditing(s)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setEditing(s)}
              >
                <div className="supplier-info">
                  <div className="supplier-name">{s.name}</div>
                  <div className="supplier-lead">
                    {s.leadMin === s.leadMax
                      ? `${s.leadMin} biz day${s.leadMin === 1 ? '' : 's'} lead`
                      : `${s.leadMin}–${s.leadMax} biz days lead time`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.alwaysDropship && (
                    <span className="pill pill-yel">Dropship</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sec-ftr">
          Lead times are your own estimates — not vendor commitments. Tap a supplier to edit.
        </div>
      </div>

      {/* Add button */}
      <div style={{ marginTop: 20 }}>
        <button className="btn-full" onClick={() => setEditing({})}>
          Add Supplier
        </button>
      </div>

      {/* Export / Import */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          className="btn-outline"
          style={{ flex: 1 }}
          onClick={exportJSON}
          aria-label="Export suppliers as JSON"
        >
          <DownloadSimple size={16} />
          Export JSON
        </button>

        <label
          className="btn-outline"
          style={{ flex: 1 }}
          aria-label="Import suppliers from JSON"
        >
          <UploadSimple size={16} />
          Import JSON
          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </label>
      </div>

      {/* Edit / Add modal */}
      {editing !== null && (
        <SupplierModal
          supplier={editing}
          onSave={s => {
            if (s.id) update(s)
            else add(s)
            setEditing(null)
          }}
          onDelete={id => {
            remove(id)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
