import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAccount } from '../../context/AccountContext'
import { getRedirectTarget } from '../../lib/order-flow'
import {
  consumeGoogleAuthSource,
  getGoogleClientId,
  renderGoogleButton,
  setGoogleAuthSource,
  setGoogleCredentialHandler,
} from '../../lib/google-auth'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.7 2.2 2.5 6.5 2.5 11.8S6.7 21.3 12 21.3c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12Z" />
      <path fill="#34A853" d="M2.5 11.8c0 1.7.5 3.3 1.5 4.6l3-2.3c-.3-.6-.5-1.4-.5-2.3s.2-1.6.5-2.3l-3-2.3c-1 1.3-1.5 2.9-1.5 4.6Z" />
      <path fill="#FBBC05" d="M12 21.3c2.5 0 4.7-.8 6.2-2.3l-3-2.4c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-3 2.3c1.6 3.2 4.9 5.4 8.4 5.4Z" />
      <path fill="#4285F4" d="M18.2 19c1.8-1.6 2.9-4.1 2.9-7.2 0-.5 0-.9-.1-1.3H12v3.9h5.4c-.3 1.3-1 2.5-2.2 3.3l3 2.3Z" />
    </svg>
  )
}

function validate(form, isSignup) {
  const e = {}
  if (!form.email.trim()) e.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email'
  if (!form.password) e.password = 'Required'
  if (isSignup) {
    if (!form.name.trim()) e.name = 'Required'
    if (form.password && form.password.length < 8) e.password = 'Min 8 chars'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Doesn\'t match'
  }
  return e
}

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, login, signup, googleLogin } = useAccount()
  const isSignup = mode === 'signup'
  const googleClientId = getGoogleClientId()
  const redirectTo = useMemo(() => getRedirectTarget(location.state, '/profile'), [location.state])
  const authSource = location.state?.authSource || (isSignup ? 'signup' : 'navbar')
  const googleButtonRef = useRef(null)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [gReady, setGReady] = useState(false)

  useEffect(() => { setForm({ name: '', email: '', password: '', confirmPassword: '' }); setErrors({}); setSubmitError(''); setShowPw(false) }, [mode])
  useEffect(() => { if (!isLoading && isAuthenticated && !busy) navigate(redirectTo, { replace: true }) }, [isAuthenticated, isLoading, busy, navigate, redirectTo])

  useEffect(() => {
    if (!googleClientId) { setGReady(false); return }
    let off = false
    const cleanup = setGoogleCredentialHandler(async (r) => {
      if (!r?.credential || off) return
      try { setSubmitError(''); setGLoading(true); await googleLogin({ idToken: r.credential }) }
      catch (e) { if (!off) setSubmitError(e.message || 'Google sign-in failed') }
      finally { if (!off) setGLoading(false) }
    })
    setGoogleAuthSource(authSource)
    renderGoogleButton(googleButtonRef.current, { text: isSignup ? 'signup_with' : 'continue_with', width: 360 })
      .then((ok) => { if (!off) setGReady(Boolean(ok)) })
      .catch(() => { if (!off) setGReady(false) })
    return () => { off = true; cleanup() }
  }, [authSource, googleClientId, googleLogin, isSignup])

  const up = (k, v) => { setForm((c) => ({ ...c, [k]: v })); setErrors((c) => ({ ...c, [k]: undefined })) }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(form, isSignup)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      setBusy(true); setSubmitError('')
      if (isSignup) await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password, confirmPassword: form.confirmPassword })
      else await login({ email: form.email.trim(), password: form.password })
    } catch (err) { setSubmitError(err.message || 'Something went wrong') }
    finally { setBusy(false) }
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-bg-page text-text-secondary">Loading...</div>

  const inputCls = (err) => `h-10 w-full rounded-lg border bg-white/[0.04] pl-9 pr-3 text-[13px] text-[#F8F1DE] placeholder-[#A8977E]/40 outline-none transition focus:bg-white/[0.06] ${err ? 'border-red-500/50' : 'border-white/10 focus:border-gold/40'}`

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg-page px-4 pt-[72px] pb-6">
      <div className="w-full max-w-[380px] space-y-3">

        {/* Title */}
        <div className="text-center">
          <p className="text-[#F8F1DE] font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', lineHeight: 1.2 }}>
            {isSignup ? 'Create account' : 'Sign in'}
          </p>
          <p className="mt-1 text-[11px] text-[#A8977E]">
            {isSignup ? 'Join PalavuCentre to start ordering' : 'Access your orders and favourites'}
          </p>
        </div>

        {/* Google — fastest path, always visible first */}
        <div>
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex min-h-[40px] w-full items-center justify-center" />
          ) : null}
          {(!googleClientId || !gReady) && (
            <button type="button" disabled
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] text-[13px] font-medium text-[#F8F1DE] active:scale-[0.97] disabled:opacity-60">
              <GoogleIcon />
              {gLoading ? 'Connecting...' : isSignup ? 'Sign up with Google' : 'Continue with Google'}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[10px] uppercase tracking-wider text-[#A8977E]/50">or</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {submitError && <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{submitError}</div>}

        {/* Form */}
        <form onSubmit={submit} className="space-y-2">
          {isSignup && (
            <div>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A8977E]/40" />
                <input required value={form.name} onChange={(e) => up('name', e.target.value)} placeholder="Full name" className={inputCls(errors.name)} />
              </div>
              {errors.name && <p className="mt-0.5 text-[10px] text-red-400">{errors.name}</p>}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A8977E]/40" />
              <input type="email" required value={form.email} onChange={(e) => up('email', e.target.value)} placeholder="Email address" className={inputCls(errors.email)} />
            </div>
            {errors.email && <p className="mt-0.5 text-[10px] text-red-400">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A8977E]/40" />
              <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={(e) => up('password', e.target.value)}
                placeholder={isSignup ? 'Password (min 8 chars)' : 'Password'} className={`${inputCls(errors.password)} !pr-9`} />
              <button type="button" onClick={() => setShowPw((c) => !c)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8977E]/40 hover:text-[#A8977E]">
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-0.5 text-[10px] text-red-400">{errors.password}</p>}
          </div>

          {isSignup && (
            <div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A8977E]/40" />
                <input type="password" required value={form.confirmPassword} onChange={(e) => up('confirmPassword', e.target.value)} placeholder="Confirm password" className={inputCls(errors.confirmPassword)} />
              </div>
              {errors.confirmPassword && <p className="mt-0.5 text-[10px] text-red-400">{errors.confirmPassword}</p>}
            </div>
          )}

          <button type="submit" disabled={busy}
            className="!mt-3 h-10 w-full rounded-lg text-[13px] font-bold text-[#120d08] transition active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'var(--gold)' }}>
            {busy ? (isSignup ? 'Creating...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-[12px] text-[#A8977E]">
          {isSignup ? (
            <>Have an account? <Link to="/login" state={location.state} className="font-medium text-gold hover:underline">Sign in</Link></>
          ) : (
            <>New here? <Link to="/signup" state={location.state} className="font-medium text-gold hover:underline">Create account</Link></>
          )}
        </p>
      </div>
    </div>
  )
}
