import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_HTML_PATH,
  ADMIN_INDEX_PATH,
  ADMIN_LOGIN_PATH,
  LEGACY_ADMIN_BASE_PATH,
  LEGACY_ADMIN_DASHBOARD_PATH,
  LEGACY_ADMIN_LOGIN_PATH,
} from './lib/admin-routing'

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ADMIN_INDEX_PATH} element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path={ADMIN_HTML_PATH} element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
        <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
        <Route path={LEGACY_ADMIN_BASE_PATH} element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path={LEGACY_ADMIN_LOGIN_PATH} element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path={LEGACY_ADMIN_DASHBOARD_PATH} element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route path="*" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
