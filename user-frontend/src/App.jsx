import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import { useAccount } from './context/AccountContext'
import Home from './pages/Home'
import MenuPage from './pages/MenuPage'
import OrderPage from './pages/OrderPage'
import GalleryPage from './pages/GalleryPage'
import CateringPage from './pages/CateringPage'
import FranchisePage from './pages/FranchisePage'
import ContactPage from './pages/ContactPage'
import StoryPage from './pages/StoryPage'
import AuthPage from './pages/account/AuthPage'
import ProfilePage from './pages/account/ProfilePage'
import AdminLogin from '../../admin-frontend/src/pages/admin/AdminLogin'
import AdminDashboard from '../../admin-frontend/src/pages/admin/AdminDashboard'
import CartDrawer from './components/CartDrawer'
import {
  ADMIN_SITE_URL,
  ADMIN_DASHBOARD_PATH,
  ADMIN_INDEX_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_STANDALONE,
  LEGACY_ADMIN_BASE_PATH,
  LEGACY_ADMIN_DASHBOARD_PATH,
  LEGACY_ADMIN_LOGIN_PATH,
} from '../../admin-frontend/src/lib/admin-routing'

function RedirectToAdminSite() {
  useEffect(() => {
    window.location.replace(ADMIN_SITE_URL || '/')
  }, [])

  return null
}

function RequireAccountAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAccount()

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-page text-text-secondary">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function AppContent() {
  const showPublicShell = !ADMIN_STANDALONE

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col">
      {showPublicShell && <Navbar />}
      {showPublicShell && <CartDrawer />}
      {showPublicShell && <WhatsAppButton />}
      <main className="flex-grow">
        <Routes>
          {ADMIN_STANDALONE ? (
            <>
              <Route path={ADMIN_INDEX_PATH} element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
              <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
              <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
              <Route path={LEGACY_ADMIN_BASE_PATH} element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
              <Route path={LEGACY_ADMIN_LOGIN_PATH} element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
              <Route path={LEGACY_ADMIN_DASHBOARD_PATH} element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
              <Route path="*" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route
                path="/order"
                element={
                  <RequireAccountAuth>
                    <OrderPage />
                  </RequireAccountAuth>
                }
              />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/catering" element={<CateringPage />} />
              <Route path="/franchise" element={<FranchisePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/track-order"
                element={
                  <RequireAccountAuth>
                    <Navigate to="/profile?tab=orders" replace />
                  </RequireAccountAuth>
                }
              />
              <Route path="/story" element={<StoryPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route
                path="/profile"
                element={
                  <RequireAccountAuth>
                    <ProfilePage />
                  </RequireAccountAuth>
                }
              />
              <Route path="/admin/*" element={<RedirectToAdminSite />} />
            </>
          )}
        </Routes>
      </main>
      {showPublicShell && <Footer />}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
