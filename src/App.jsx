import { useState, useEffect } from 'react'
import { Calculator, Buildings, Sun, Moon } from '@phosphor-icons/react'
import { useSuppliers } from './lib/useSuppliers'
import EstimatorPage from './components/EstimatorPage'
import SuppliersPage from './components/SuppliersPage'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('maetor_theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  return 'light'
}

export default function App() {
  const [tab, setTab] = useState('estimate')
  const [theme, setTheme] = useState(getInitialTheme)
  const supplierState = useSuppliers()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    try { localStorage.setItem('maetor_theme', theme) } catch {}
  }, [theme])

  return (
    <div id="app">
      <nav id="topnav">
        <div className="nav-brand">
          <span className="brand-dot" />
          <span>maetor</span>
        </div>

        <div className="nav-center">
          <button
            className={`navtab ${tab === 'estimate' ? 'on' : ''}`}
            onClick={() => setTab('estimate')}
            aria-label="Estimator"
          >
            <Calculator size={16} weight={tab === 'estimate' ? 'fill' : 'regular'} />
            <span>Estimate</span>
          </button>
          <button
            className={`navtab ${tab === 'suppliers' ? 'on' : ''}`}
            onClick={() => setTab('suppliers')}
            aria-label="Suppliers"
          >
            <Buildings size={16} weight={tab === 'suppliers' ? 'fill' : 'regular'} />
            <span>Suppliers</span>
          </button>
        </div>

        <button
          className="theme-btn"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>

      <main id="content">
        {tab === 'estimate' && (
          <EstimatorPage suppliers={supplierState.suppliers} />
        )}
        {tab === 'suppliers' && (
          <SuppliersPage {...supplierState} />
        )}
      </main>
    </div>
  )
}
