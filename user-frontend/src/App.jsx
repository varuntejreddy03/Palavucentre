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
import CartBar from './components/CartBar'
import CartDrawer from './components/CartDrawer'
import { ensureCsrfToken } from './lib/csrf'
import { initializeGoogleIdentity } from './lib/google-auth'

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
  const location = useLocation()
  const showPublicShell = true
  const hideWhatsappFab = location.pathname === '/order' || location.pathname.startsWith('/profile')
  const showCartBar = location.pathname === '/menu'

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col">
      {showPublicShell && <Navbar />}
      {showPublicShell && <CartDrawer />}
      {showPublicShell && showCartBar && <CartBar />}
      {showPublicShell && !hideWhatsappFab && <WhatsAppButton />}
      <main className="flex-grow">
        <Routes>
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
        </Routes>
      </main>
      {showPublicShell && <Footer />}
    </div>
  )
}

function App() {
  useEffect(() => {
    ensureCsrfToken().catch(() => null)
    initializeGoogleIdentity().catch(() => null)
  }, [])

  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
