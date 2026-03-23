import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@scan-it/features/theme-provider'
import App from './App.tsx'
import TermsPage from './TermsPage.tsx'
import './index.css'

const normalizedPath =
  window.location.pathname.replace(/\/$/, '') || '/'
const isTerms = normalizedPath === '/terms'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {isTerms ? <TermsPage /> : <App />}
    </ThemeProvider>
  </StrictMode>,
)
