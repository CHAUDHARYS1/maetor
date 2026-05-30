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
  return 'dark'
}

export default function App() {
  const [tab, setTab] = useState('estimate')
  const [theme, setTheme] = useState(getInitialTheme)
  const supplierState = useSuppliers()

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    try { localStorage.setItem('maetor_theme', theme) } catch {}
  }, [theme])

  return (
    <div id="app">
      <nav id="topnav">
        <div className="nav-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Maetor</span>
        </div>

        <div className="nav-center">
          <button
            className={`navtab ${tab === 'estimate' ? 'on' : ''}`}
            onClick={() => setTab('estimate')}
            aria-label="Estimator"
          >
            <Calculator size={15} weight={tab === 'estimate' ? 'fill' : 'regular'} />
            <span>Estimate</span>
          </button>
          <button
            className={`navtab ${tab === 'suppliers' ? 'on' : ''}`}
            onClick={() => setTab('suppliers')}
            aria-label="Suppliers"
          >
            <Buildings size={15} weight={tab === 'suppliers' ? 'fill' : 'regular'} />
            <span>Suppliers</span>
          </button>
        </div>

        <button
          className="theme-btn"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
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
