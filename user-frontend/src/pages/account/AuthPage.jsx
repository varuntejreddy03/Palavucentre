import { createElement, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  IndianRupee,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  User,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAccount } from '../../context/AccountContext'
import { useSiteSettings } from '../../context/SiteContext'

const initialForms = {
  login: {
    email: '',
    password: '',
  },
  signup: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
}

const featureChips = [
  {
    label: 'Orders',
    icon: ShoppingBag,
  },
  {
    label: 'Addresses',
    icon: MapPin,
  },
  {
    label: 'Favourites',
    icon: Heart,
  },
]

const loginStats = [
  {
    label: '10,000+ Happy Orders',
    icon: ShoppingBag,
  },
  {
    label: '4.8 Rated',
    icon: Star,
  },
  {
    label: 'Free Delivery over ₹299',
    icon: Truck,
  },
]

const loginHeroImage =
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1400&q=80'

const signupSteps = [
  {
    label: 'Create Account',
    note: 'Save your profile for faster ordering.',
  },
  {
    label: 'Browse Menu',
    note: 'Pick Godavari favourites.',
  },
  {
    label: 'Place Order',
    note: 'Checkout in a few taps.',
  },
]

function validateField(name, value, form, isSignup) {
  const trimmedValue = String(value || '').trim()

  switch (name) {
    case 'name':
      if (isSignup && !trimmedValue) {
        return 'Enter your full name.'
      }
      if (isSignup && trimmedValue.length < 2) {
        return 'Name should be at least 2 characters.'
      }
      return ''
    case 'email':
      if (!trimmedValue) {
        return 'Enter your email address.'
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return 'Enter a valid email address.'
      }
      return ''
    case 'password':
      if (!value) {
        return 'Enter your password.'
      }
      if (isSignup && value.length < 8) {
        return 'Use at least 8 characters.'
      }
      return ''
    case 'confirmPassword':
      if (isSignup && !value) {
        return 'Confirm your password.'
      }
      if (isSignup && value !== form.password) {
        return 'Passwords do not match.'
      }
      return ''
    default:
      return ''
  }
}

function validateForm(form, isSignup) {
  const fields = isSignup ? ['name', 'email', 'password', 'confirmPassword'] : ['email', 'password']

  return fields.reduce((errors, field) => {
    const nextError = validateField(field, form[field], form, isSignup)
    if (nextError) {
      errors[field] = nextError
    }
    return errors
  }, {})
}

function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const palette = [
    { label: 'Weak', color: 'bg-red-500', tone: 'text-red-200' },
    { label: 'Weak', color: 'bg-red-500', tone: 'text-red-200' },
    { label: 'Fair', color: 'bg-orange-400', tone: 'text-orange-200' },
    { label: 'Strong', color: 'bg-yellow-300', tone: 'text-yellow-100' },
    { label: 'Secure', color: 'bg-emerald-400', tone: 'text-emerald-200' },
  ]

  return {
    score,
    ...palette[score],
  }
}

function LoginField({
  index,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  rightAction = null,
  autoComplete,
  autoCapitalize,
  onFocus,
}) {
  return (
    <label className="block animate-fade-lift opacity-0" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="relative">
        {createElement(icon, {
          className: `pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
            error ? 'text-red-200' : 'text-[var(--text-subtle)]'
          }`,
        })}
        <input
          required
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          placeholder=" "
          className={`peer h-[52px] w-full rounded-[12px] border bg-[var(--input-bg)] px-4 pb-2 pl-12 pt-5 font-sans text-[14px] text-[var(--text-primary)] outline-none transition duration-150 ${
            error
              ? 'border-red-400/65 shadow-[0_0_0_4px_rgba(248,113,113,0.12)]'
              : 'border-[var(--input-border)] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_4px_rgba(240,165,0,0.12)]'
          } ${rightAction ? 'pr-14' : 'pr-4'}`}
        />
        <span className="pointer-events-none absolute left-12 top-3 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[14px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-[var(--text-subtle)] peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.08em] peer-focus:text-[var(--gold)]">
          {label}
        </span>
        {rightAction}
      </div>
      {error && <p className="mt-2 pl-1 text-xs text-red-200">{error}</p>}
    </label>
  )
}

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

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { siteSettings } = useSiteSettings()
  const { isAuthenticated, isLoading, login, signup, googleLogin } = useAccount()
  const [form, setForm] = useState(initialForms[mode])
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState('idle')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleSdkReady, setIsGoogleSdkReady] = useState(false)
  const googleButtonRef = useRef(null)

  const isSignup = mode === 'signup'
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
  const redirectTo = useMemo(() => location.state?.from?.pathname || '/profile', [location.state])
  const isOrderRedirect = redirectTo === '/order'
  const passwordStrength = useMemo(() => getPasswordStrength(form.password || ''), [form.password])
  const brandName = siteSettings?.restaurantName || 'RajaMahendravaram PalavuCentre'
  const supportEmail = siteSettings?.contact?.email || 'rajamahendravarampalavu@gmail.com'
  const forgotPasswordHref = `mailto:${supportEmail}?subject=${encodeURIComponent(`${brandName} password reset`)}`
  const signupGreetingName = String(form.name || '').trim().split(/\s+/).filter(Boolean).join(' ')
  const passwordRules = useMemo(
    () => [
      { label: '8+ characters', passed: (form.password || '').length >= 8 },
      { label: 'Uppercase letter', passed: /[A-Z]/.test(form.password || '') },
      { label: 'Number', passed: /[0-9]/.test(form.password || '') },
    ],
    [form.password],
  )
  const passwordSegmentColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-300', 'bg-emerald-400']

  useEffect(() => {
    setForm(initialForms[mode])
    setFieldErrors({})
    setTouched({})
    setSubmitError('')
    setSubmitState('idle')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setStep(1)
    setIsPasswordFocused(false)
  }, [mode])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSubmitting) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, isLoading, isSubmitting, navigate, redirectTo])

  useEffect(() => {
    if (isSignup || !googleClientId) {
      setIsGoogleSdkReady(false)
      return undefined
    }

    let isCancelled = false

    const initializeGoogleIdentity = () => {
      const googleIdentity = window.google?.accounts?.id
      if (!googleIdentity || !googleButtonRef.current) {
        return
      }

      googleIdentity.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (isCancelled) {
            return
          }

          if (!response?.credential) {
            setSubmitError('Google sign-in failed. Please try again.')
            return
          }

          try {
            setSubmitError('')
            setIsGoogleLoading(true)
            await googleLogin({ idToken: response.credential })
            navigate(redirectTo, { replace: true })
          } catch (requestError) {
            setSubmitError(requestError.message || 'Google sign-in failed. Please try again.')
          } finally {
            setIsGoogleLoading(false)
          }
        },
      })

      googleButtonRef.current.innerHTML = ''
      googleIdentity.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 360,
      })
      setIsGoogleSdkReady(true)
    }

    if (window.google?.accounts?.id) {
      initializeGoogleIdentity()
      return () => {
        isCancelled = true
      }
    }

    const existingScript = document.getElementById('google-identity-client')
    const handleScriptLoad = () => {
      if (!isCancelled) {
        initializeGoogleIdentity()
      }
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad)
      return () => {
        isCancelled = true
        existingScript.removeEventListener('load', handleScriptLoad)
      }
    }

    const script = document.createElement('script')
    script.id = 'google-identity-client'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = handleScriptLoad
    script.onerror = () => {
      if (!isCancelled) {
        setSubmitError('Google sign-in could not be loaded in this browser.')
      }
    }

    document.head.appendChild(script)

    return () => {
      isCancelled = true
    }
  }, [googleClientId, googleLogin, isSignup, navigate, redirectTo])

  const updateField = (name, value) => {
    setForm((current) => {
      const nextForm = {
        ...current,
        [name]: value,
      }

      if (touched[name]) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          [name]: validateField(name, value, nextForm, isSignup),
          ...(name === 'password' && isSignup
            ? {
                confirmPassword: touched.confirmPassword
                  ? validateField('confirmPassword', nextForm.confirmPassword, nextForm, true)
                  : currentErrors.confirmPassword,
              }
            : {}),
        }))
      }

      return nextForm
    })
  }

  const handleBlur = (name) => {
    setTouched((current) => ({ ...current, [name]: true }))
    setFieldErrors((current) => ({
      ...current,
      [name]: validateField(name, form[name], form, isSignup),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSignup && step === 1) {
      const stepOneErrors = validateForm(
        {
          name: form.name,
          email: form.email,
        },
        true,
      )

      if (stepOneErrors.name || stepOneErrors.email) {
        setFieldErrors((current) => ({
          ...current,
          name: stepOneErrors.name,
          email: stepOneErrors.email,
        }))
        setTouched((current) => ({
          ...current,
          name: true,
          email: true,
        }))
        return
      }

      setStep(2)
      return
    }

    const nextErrors = validateForm(form, isSignup)
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setTouched(
        Object.keys(initialForms[mode]).reduce((allTouched, key) => {
          allTouched[key] = true
          return allTouched
        }, {}),
      )
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitState('submitting')
      setSubmitError('')

      if (isSignup) {
        await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        })
      } else {
        await login({
          email: form.email.trim(),
          password: form.password,
        })
      }

      setSubmitState('success')
      await new Promise((resolve) => window.setTimeout(resolve, 700))
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setSubmitError(requestError.message || (isSignup ? 'Could not create account.' : 'Could not log in.'))
      setSubmitState('idle')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-page text-text-secondary">Loading...</div>
  }

  const buttonLabel = isSignup ? 'Create Account' : 'Sign In'
  const buttonStateLabel =
    submitState === 'success'
      ? isSignup
        ? 'Account Ready'
        : 'Signed In'
      : submitState === 'submitting'
        ? isSignup
          ? 'Creating Account'
          : 'Signing In'
        : buttonLabel
  const signupButtonLabel =
    step === 1
      ? 'Continue to security'
      : submitState === 'success'
        ? 'Account ready'
        : submitState === 'submitting'
          ? 'Creating account'
          : 'Create my account'

  if (!isSignup) {
    return (
      <div className="w-full max-w-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#2a1806_0%,#120d08_40%,#0b0805_100%)] animate-page-mount">
        <div className="flex min-h-screen w-full flex-col md:flex-row">
          <section className="relative hidden min-h-screen overflow-hidden border-[rgba(255,200,60,0.12)] md:block md:w-[55%] md:border-r">
            <div className="absolute inset-0">
              <img
                src={loginHeroImage}
                alt="Signature Palavu platter"
                className="h-full w-full object-cover"
                style={{ maxWidth: '100%' }}
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,5,2,0.92)_0%,rgba(15,10,6,0.76)_45%,rgba(8,5,2,0.94)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,166,35,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(212,134,10,0.24),transparent_30%)]" />
            <div className="absolute left-8 top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.36),transparent_65%)] blur-3xl md:left-12 md:top-16 md:h-56 md:w-56" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 md:p-12">
              <div>
                <div className="inline-flex animate-fade-lift items-center gap-3 rounded-full border border-[rgba(255,200,60,0.18)] bg-black/25 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#f7c861] opacity-0 backdrop-blur" style={{ animationDelay: '0ms' }}>
                  <ShieldCheck className="h-4 w-4" />
                  {isOrderRedirect ? 'Checkout Access' : 'Member Sign In'}
                </div>

                <div className="mt-7 max-w-[30rem]">
                  {['Welcome', 'Back,', 'Foodie.'].map((word, index) => (
                    <span
                      key={word}
                      className="block animate-fade-lift text-[clamp(2.4rem,5vw,4.8rem)] font-black leading-[0.94] tracking-[-0.04em] text-[#f8e5b1] opacity-0"
                      style={{
                        animationDelay: `${120 + index * 120}ms`,
                        fontFamily: 'Playfair Display, serif',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>

                <p className="mt-6 max-w-xl animate-fade-lift text-sm leading-7 text-[#f5edd6]/78 opacity-0 md:text-base" style={{ animationDelay: '420ms' }}>
                  {isOrderRedirect
                    ? 'Sign in to continue to checkout with saved addresses and faster ordering.'
                    : 'Step back into a premium ordering experience with saved addresses, quick reorders, and your favourite Palavu picks ready to go.'}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {loginStats.map((item, index) => (
                    <div
                      key={item.label}
                      className="inline-flex animate-fade-lift items-center gap-2 rounded-full border border-[rgba(255,200,60,0.18)] bg-[rgba(14,10,7,0.46)] px-4 py-2 text-[11px] font-semibold text-[#fff1cc] opacity-0 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
                      style={{ animationDelay: `${520 + index * 100}ms` }}
                    >
                      {item.label.includes('₹299') ? (
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5 text-[#f5c053]" />
                          <Truck className="h-3.5 w-3.5 text-[#f5c053]" />
                        </span>
                      ) : (
                        <item.icon className="h-3.5 w-3.5 fill-current text-[#f5c053]" />
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {featureChips.map((item, index) => (
                    <div
                      key={item.label}
                      className="inline-flex animate-fade-lift items-center gap-3 rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-[#f8ebca] opacity-0 backdrop-blur-xl shadow-[0_18px_34px_rgba(0,0,0,0.18)]"
                      style={{ animationDelay: `${760 + index * 100}ms` }}
                    >
                      <item.icon className={`h-4 w-4 ${item.label === 'Favourites' ? 'text-[#f5ae48]' : 'text-[#f6cf7c]'}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="max-w-[24rem] animate-fade-lift rounded-[24px] border border-[rgba(255,200,60,0.12)] bg-[rgba(15,9,5,0.42)] p-5 text-sm leading-7 text-[#f4ead2]/76 opacity-0 backdrop-blur-xl" style={{ animationDelay: '980ms' }}>
                  Member access keeps your order trail, saved locations, and favourite dishes in one place across every visit.
                </div>
              </div>
            </div>
          </section>

          <section className="flex max-h-screen w-full items-center justify-center overflow-y-auto bg-[linear-gradient(180deg,rgba(15,10,7,0.96),rgba(10,7,5,0.98))] p-5 sm:p-6 md:w-[45%] md:p-10">
            <div className="w-full max-w-[470px] rounded-[16px] border border-[rgba(255,200,60,0.15)] bg-[linear-gradient(180deg,rgba(34,24,18,0.72),rgba(20,14,10,0.9))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.46)] backdrop-blur-[24px] sm:p-7">
              <div className="mx-auto max-w-[280px] text-center">
                <h2
                  className="animate-fade-lift text-center text-[36px] leading-none text-[var(--gold)] opacity-0"
                  style={{
                    animationDelay: '120ms',
                    fontFamily: 'Playfair Display, serif',
                    textTransform: 'none',
                    filter: 'none',
                  }}
                >
                  Welcome back
                </h2>
                <p className="mt-3 animate-fade-lift font-sans text-[14px] leading-7 text-[var(--text-muted)] opacity-0" style={{ animationDelay: '260ms' }}>
                  {isOrderRedirect ? 'Sign in to continue to checkout.' : 'Sign in to access orders, addresses, and favourites.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                {submitError && (
                  <div className="rounded-[20px] border border-red-500/25 bg-red-950/25 px-4 py-3 text-sm text-red-100">
                    {submitError}
                  </div>
                )}

                <LoginField
                  index={0}
                  label="Email address"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email ? fieldErrors.email : ''}
                  autoComplete="email"
                />

                <div className="relative pt-6">
                  <a
                    href={forgotPasswordHref}
                    className="absolute right-0 top-0 animate-fade-lift font-sans text-[13px] font-medium text-[var(--gold)] opacity-0 transition hover:text-[#ffd98a]"
                    style={{ animationDelay: '140ms' }}
                  >
                    Forgot password?
                  </a>
                  <LoginField
                    index={1}
                    label="Password"
                    icon={LockKeyhole}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? fieldErrors.password : ''}
                    autoComplete="current-password"
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#d8b467] transition duration-200 hover:bg-[rgba(240,165,0,0.12)] hover:text-[#ffd88a]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="flex h-4 w-4 items-center justify-center transition duration-200">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </span>
                      </button>
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brand-primary-btn w-full animate-fade-lift px-5 opacity-0 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ animationDelay: '220ms' }}
                >
                  {submitState === 'submitting' ? (
                    <LoaderCircle className="relative h-4 w-4 animate-spin" />
                  ) : submitState === 'success' ? (
                    <Check className="relative h-4 w-4" />
                  ) : (
                    <ChevronRight className="relative h-[18px] w-[18px]" />
                  )}
                  <span className="relative">{buttonStateLabel}</span>
                  {submitState !== 'submitting' && submitState !== 'success' && <ChevronRight className="relative h-[18px] w-[18px]" />}
                </button>

                <div className="flex animate-fade-lift items-center gap-3 opacity-0" style={{ animationDelay: '320ms' }}>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                  <span className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--text-subtle)]">OR</span>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>

                <div className="space-y-2">
                  {googleClientId ? (
                    <div
                      ref={googleButtonRef}
                      className="flex min-h-[44px] w-full animate-fade-lift items-center justify-center opacity-0"
                      style={{ animationDelay: '420ms' }}
                    />
                  ) : null}

                  {!googleClientId || !isGoogleSdkReady ? (
                    <button
                      type="button"
                      disabled
                      className="flex h-[52px] w-full animate-fade-lift items-center justify-center gap-3 rounded-[12px] border border-white/25 bg-transparent px-4 font-sans text-[14px] font-medium text-[#f5edd6] opacity-0 transition duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                      style={{ animationDelay: '420ms' }}
                    >
                      <GoogleIcon />
                      {isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}
                    </button>
                  ) : null}
                </div>
              </form>

              <p
                className="mt-6 animate-fade-lift text-center font-sans text-[13px] text-[var(--text-muted)] opacity-0"
                style={{ animationDelay: '520ms' }}
              >
                Need an account?{' '}
                <Link to="/signup" className="font-medium text-[var(--gold)] underline-offset-4 transition hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#2a1806_0%,#120d08_40%,#0b0805_100%)] animate-page-mount">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
          <div className="relative hidden min-h-screen overflow-hidden border-[rgba(255,200,60,0.12)] md:block md:w-[55%] md:border-r">
            <div className="absolute inset-0">
              <img src={loginHeroImage} alt="Palavu cuisine" className="h-full w-full object-cover" style={{ maxWidth: '100%' }} />
            </div>
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,2,1,0.82),rgba(11,5,2,0.3)_45%,rgba(5,2,1,0.88))]"></div>
            <div className="absolute left-12 top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.38),rgba(212,160,23,0.04)_55%,transparent_72%)] blur-3xl"></div>

            <div className="relative z-10 flex h-full flex-col justify-between p-12">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-gold/20 bg-black/25 px-4 py-2 text-[11px] font-black uppercase tracking-[3px] text-gold backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  {isOrderRedirect ? 'Checkout Access' : isSignup ? 'Create Account' : 'Welcome Back'}
                </div>

                <div className="relative mt-8 max-w-[30rem]">
                  <div className="absolute -left-10 top-5 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.3),transparent_72%)] blur-3xl"></div>
                  {['Your', 'First Order', 'Awaits.'].map((word, index) => (
                    <span
                      key={word}
                      className="block animate-fade-lift text-[clamp(2.4rem,5vw,4.8rem)] font-black leading-[0.94] tracking-[-0.04em] text-[#f8e5b1] opacity-0"
                      style={{
                        animationDelay: `${120 + index * 120}ms`,
                        fontFamily: 'Playfair Display, serif',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#f5ecd7]/78">
                  {isOrderRedirect
                    ? 'Sign in to continue to checkout with saved addresses.'
                    : isSignup
                      ? 'Create your account, browse the menu, and place your first order in minutes.'
                      : 'Sign in to see your orders, saved addresses, and favourites.'}
                </p>

                <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-xs">
                  {['10,000+ Happy Orders', '4.8 Rated', 'Free Delivery over ₹299'].map((label) => (
                    <div
                      key={label}
                      className="rounded-full border border-gold/25 bg-black/35 px-4 py-2 text-[11px] font-semibold text-[#fff6df] shadow-[0_0_0_rgba(212,160,23,0)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(212,160,23,0.22)]"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {featureChips.map((item) => (
                    <div
                      key={item.label}
                      className="inline-flex items-center gap-3 rounded-full border border-[#d4a017]/45 bg-black/25 px-4 py-3 text-sm text-[#fff6df] shadow-[0_0_0_rgba(212,160,23,0)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(212,160,23,0.22)]"
                    >
                      <item.icon className="h-4 w-4 text-[#f6d87a]" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-[16px] border border-[var(--gold-border)] bg-black/25 p-5 backdrop-blur">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--gold)]">First order flow</p>
                  <div className="relative mt-5 space-y-5 font-sans text-[13px] leading-6 text-[var(--text-muted)]">
                    <div className="absolute left-[15px] top-8 h-[calc(100%-2rem)] border-l border-dashed border-[rgba(240,165,0,0.45)]" aria-hidden="true" />
                    {signupSteps.map((item, index) => (
                      <div
                        key={item.label}
                        className="relative flex animate-fade-lift items-start gap-4 opacity-0"
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-[12px] font-medium text-white shadow-[0_0_24px_rgba(240,165,0,0.16)]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-[13px] text-[var(--text-muted)]">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex max-h-screen w-full items-center justify-center overflow-y-auto bg-[linear-gradient(180deg,rgba(15,8,5,0.94),rgba(7,3,1,0.98))] p-5 sm:p-6 md:w-[45%] md:p-10">
            <div className="w-full max-w-[470px] rounded-[16px] border border-[rgba(255,200,96,0.18)] bg-[linear-gradient(180deg,rgba(24,12,8,0.94),rgba(10,4,2,0.98))] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6 md:p-8">
              <div className="mx-auto flex w-full max-w-[260px] flex-col items-center text-center">
                <h2
                  className="text-center leading-none text-[var(--gold)]"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(1.75rem, 7vw, 1.95rem)',
                    textTransform: 'none',
                    filter: 'none',
                    lineHeight: 1.08,
                  }}
                >
                  {isSignup ? 'Welcome to PalavuCentre' : 'Welcome back'}
                </h2>
                <p className="mt-3 font-sans text-[14px] leading-7 text-[var(--text-muted)]">
                  {isSignup
                    ? 'Create your account to place orders faster.'
                    : isOrderRedirect
                      ? 'Sign in to continue to checkout.'
                      : 'Use your email and password.'}
                </p>
              </div>

              <div className="relative mt-7 flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`relative z-10 h-10 min-w-[90px] overflow-hidden rounded-full px-4 font-sans text-[13px] font-medium transition duration-200 ${
                    step === 1
                      ? 'bg-[var(--gold)] text-white shadow-[0_12px_28px_rgba(212,134,10,0.24)]'
                      : 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--gold-border)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  1 of 2
                </button>
                <div className="h-px flex-1 bg-[rgba(240,165,0,0.2)]" aria-hidden="true" />
                <button
                  type="button"
                  className={`relative z-10 h-10 min-w-[90px] overflow-hidden rounded-full px-4 font-sans text-[13px] font-medium transition duration-200 ${
                    step === 2
                      ? 'bg-[var(--gold)] text-white shadow-[0_12px_28px_rgba(212,134,10,0.24)]'
                      : 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                  }`}
                >
                  2 of 2
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                {submitError && (
                  <div className="rounded-[22px] border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                    {submitError}
                  </div>
                )}

                <div key={step} className="animate-auth-step space-y-5">
                  {step === 1 ? (
                    <>
                      {signupGreetingName.length > 1 && (
                        <div className="animate-fade-lift rounded-[12px] border border-[var(--gold-border)] bg-[rgba(240,165,0,0.08)] px-4 py-3 font-sans text-[14px] font-medium text-[var(--gold)]">
                          👋 Hi, {signupGreetingName}!
                        </div>
                      )}
                      <LoginField
                        index={0}
                        label="Full name"
                        icon={User}
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        onBlur={() => handleBlur('name')}
                        error={touched.name ? fieldErrors.name : ''}
                        autoComplete="name"
                        autoCapitalize="words"
                      />
                      <LoginField
                        index={1}
                        label="Email address"
                        icon={Mail}
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        onBlur={() => handleBlur('email')}
                        error={touched.email ? fieldErrors.email : ''}
                        autoComplete="email"
                      />
                    </>
                  ) : (
                    <>
                      <LoginField
                        index={0}
                        label="Password"
                        icon={LockKeyhole}
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => {
                          handleBlur('password')
                          setIsPasswordFocused(false)
                        }}
                        error={touched.password ? fieldErrors.password : ''}
                        autoComplete="new-password"
                        rightAction={
                          <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#d8b467] transition hover:bg-[rgba(240,165,0,0.12)] hover:text-[#ffd88a]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />

                      {isPasswordFocused && (
                        <div className="animate-fade-lift rounded-[18px] border border-gold/12 bg-black/30 p-4 text-xs text-text-secondary">
                          <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-gold/75">Password rules</p>
                          <div className="grid gap-2">
                            {passwordRules.map((rule) => (
                              <div key={rule.label} className="flex items-center gap-2">
                                <CheckCircle2 className={`h-4 w-4 ${rule.passed ? 'text-emerald-300' : 'text-white/20'}`} />
                                <span>{rule.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em]">
                          <span className="text-[var(--text-subtle)]">Password strength</span>
                          <span className={passwordStrength.tone}>{passwordStrength.label}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {passwordSegmentColors.map((segmentColor, index) => (
                            <span
                              key={segmentColor}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index < passwordStrength.score ? segmentColor : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <LoginField
                        index={1}
                        label="Confirm password"
                        icon={LockKeyhole}
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        error={touched.confirmPassword ? fieldErrors.confirmPassword : ''}
                        autoComplete="new-password"
                        rightAction={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((current) => !current)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#d8b467] transition hover:bg-[rgba(240,165,0,0.12)] hover:text-[#ffd88a]"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="font-sans text-[13px] font-medium text-[var(--text-muted)] underline-offset-4 transition hover:text-gold hover:underline"
                      >
                        Back to details
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brand-primary-btn w-full px-5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitState === 'submitting' ? (
                    <LoaderCircle className="relative h-4 w-4 animate-spin" />
                  ) : submitState === 'success' ? (
                    <Check className="relative h-4 w-4" />
                  ) : (
                    <ChevronRight className="relative h-[18px] w-[18px]" />
                  )}
                  <span className="relative">{signupButtonLabel}</span>
                  {submitState !== 'submitting' && submitState !== 'success' && <ChevronRight className="relative h-[18px] w-[18px]" />}
                </button>

                {!isSignup && (
                  <>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <div className="h-px flex-1 bg-white/10" />
                      <span>OR</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/35 bg-transparent text-[12px] font-semibold tracking-[0.16em] text-text-primary transition hover:bg-white/5"
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="h-4 w-4"
                      />
                      Continue with Google
                    </button>
                  </>
                )}
              </form>

              <div className="mt-6 text-center font-sans text-[13px] leading-7 text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-gold underline-offset-4 transition hover:text-gold-bright hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
