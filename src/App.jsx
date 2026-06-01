import { lazy, Suspense, useState, useEffect } from 'react'
import { Calculator, Buildings, Sun, Moon } from '@phosphor-icons/react'
import { useSuppliers } from './lib/useSuppliers'
import EstimatorPage from './components/EstimatorPage'

const SuppliersPage = lazy(() => import('./components/SuppliersPage'))

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
    <div id="app" data-view={tab}>
      <a href="#content" className="skip-link">Skip to main content</a>
      <nav id="topnav" aria-label="Main">
        <div className="nav-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Maetor</span>
        </div>

        <div className="nav-center">
          <button
            className={`navtab ${tab === 'estimate' ? 'on' : ''}`}
            onClick={() => setTab('estimate')}
            aria-pressed={tab === 'estimate'}
          >
            <Calculator size={15} weight={tab === 'estimate' ? 'fill' : 'regular'} aria-hidden="true" />
            <span>Estimate</span>
          </button>
          <button
            className={`navtab ${tab === 'suppliers' ? 'on' : ''}`}
            onClick={() => setTab('suppliers')}
            aria-pressed={tab === 'suppliers'}
          >
            <Buildings size={15} weight={tab === 'suppliers' ? 'fill' : 'regular'} aria-hidden="true" />
            <span>Suppliers</span>
          </button>
        </div>

        <button
          className="theme-btn"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
      </nav>

      <main id="content">
        {tab === 'estimate' && (
          <EstimatorPage suppliers={supplierState.suppliers} />
        )}
        <Suspense fallback={null}>
          {tab === 'suppliers' && (
            <SuppliersPage {...supplierState} />
          )}
        </Suspense>
      </main>

      <footer id="site-footer">
        Designed and built by <a href="https://chaudharys1.netlify.app/" target="_blank" rel="noopener noreferrer">SC Design and Consultation</a>
      </footer>
    </div>
  )
}
