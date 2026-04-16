import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AccountProvider } from './context/AccountContext.jsx'
import { SiteProvider } from './context/SiteContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </SiteProvider>
  </StrictMode>,
)
