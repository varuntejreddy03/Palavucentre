import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../../user-frontend/src/index.css'
import AdminApp from './AdminApp'

createRoot(document.getElementById('admin-root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
