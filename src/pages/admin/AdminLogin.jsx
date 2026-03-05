import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // Simple password check - in production use proper authentication
    if (password === 'palavuadmin2024') {
      localStorage.setItem('adminAuth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-4 pt-20">
      <div className="bg-bg-card p-8 rounded-2xl border border-gold-dim max-w-md w-full">
        <h1 className="text-3xl font-bold text-gold text-center mb-8" style={{fontFamily: 'Playfair Display, serif'}}>Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-section border border-gold-dim focus:border-gold outline-none text-text-primary"
              required
            />
          </div>
          {error && <p className="text-red-urgent text-sm">{error}</p>}
          <button type="submit" className="w-full bg-gold text-bg-page py-3 rounded-full font-semibold hover:bg-gold-bright transition">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
