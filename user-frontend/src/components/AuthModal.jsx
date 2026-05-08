import { LoaderCircle, LockKeyhole, Mail, User, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useAccount } from '../context/AccountContext'
import {
  consumeGoogleAuthSource,
  getGoogleClientId,
  renderGoogleButton,
  setGoogleAuthSource,
  setGoogleCredentialHandler,
} from '../lib/google-auth'

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

function validateForm(mode, form) {
  const nextErrors = {}

  if (mode === 'signup') {
    if (!String(form.name || '').trim()) {
      nextErrors.name = 'Enter your full name.'
    }
  }

  if (!String(form.email || '').trim()) {
    nextErrors.email = 'Enter your email address.'
  }

  if (!form.password) {
    nextErrors.password = 'Enter your password.'
  } else if (mode === 'signup' && form.password.length < 8) {
    nextErrors.password = 'Use at least 8 characters.'
  }

  if (mode === 'signup') {
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
  }

  return nextErrors
}

export default function AuthModal({
  isOpen,
  mode = 'login',
  authSource = 'checkout',
  defaultEmail = '',
  title = 'Sign in faster',
  description = 'Use your account for order history and faster pickup ordering.',
  onClose,
  onSuccess,
}) {
  const { login, signup, googleLogin } = useAccount()
  const [activeMode, setActiveMode] = useState(mode)
  const [form, setForm] = useState({
    ...initialForms[mode],
    email: defaultEmail || initialForms[mode].email,
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const googleButtonRef = useRef(null)
  const googleClientId = getGoogleClientId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setActiveMode(mode)
    setErrors({})
    setSubmitError('')
    setForm({
      ...initialForms[mode],
      email: defaultEmail || initialForms[mode].email,
    })
  }, [defaultEmail, isOpen, mode])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !googleClientId) {
      setIsGoogleReady(false)
      return undefined
    }

    let isMounted = true

    const cleanupGoogleHandler = setGoogleCredentialHandler(async (response) => {
      if (!response?.credential || !isMounted) {
        return
      }

      try {
        setSubmitError('')
        setIsGoogleSubmitting(true)
        await googleLogin({ idToken: response.credential })
        const nextSource = consumeGoogleAuthSource()
        await onSuccess?.({ source: nextSource, mode: activeMode, provider: 'google' })
        onClose?.()
      } catch (requestError) {
        if (isMounted) {
          setSubmitError(requestError.message || 'Google sign-in failed. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsGoogleSubmitting(false)
        }
      }
    })

    setGoogleAuthSource(authSource)

    renderGoogleButton(googleButtonRef.current, {
      text: activeMode === 'signup' ? 'signup_with' : 'continue_with',
      width: 320,
    })
      .then((ready) => {
        if (isMounted) {
          setIsGoogleReady(Boolean(ready))
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setSubmitError(requestError.message || 'Google sign-in could not be loaded in this browser.')
          setIsGoogleReady(false)
        }
      })

    return () => {
      isMounted = false
      cleanupGoogleHandler()
    }
  }, [activeMode, authSource, googleClientId, googleLogin, isOpen, onClose, onSuccess])

  const googleLabel = useMemo(
    () => (activeMode === 'signup' ? 'Sign up with Google' : 'Continue with Google'),
    [activeMode],
  )

  if (!isOpen) {
    return null
  }

  const handleModeChange = (nextMode) => {
    setActiveMode(nextMode)
    setErrors({})
    setSubmitError('')
    setForm((current) => ({
      ...initialForms[nextMode],
      email: current.email || defaultEmail || '',
    }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm(activeMode, form)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')

      if (activeMode === 'signup') {
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

      await onSuccess?.({ source: authSource, mode: activeMode, provider: 'password' })
      onClose?.()
    } catch (requestError) {
      setSubmitError(requestError.message || 'Could not complete authentication.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-[430px] rounded-[28px] border border-gold/15 bg-[linear-gradient(180deg,rgba(24,12,8,0.97),rgba(10,4,2,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.6)]" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[3px] text-gold/70">{activeMode === 'signup' ? 'Create Account' : 'Sign In'}</p>
            <h2 className="mt-3 text-[28px] leading-none text-gold-bright" style={{ fontFamily: 'Playfair Display, serif' }}>
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/15 bg-black/20 text-text-secondary transition hover:border-gold/30 hover:text-gold"
            aria-label="Close authentication dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[13px] font-medium text-[var(--text-muted)]">
            Use your Google account to instantly {activeMode === 'signup' ? 'create an account' : 'sign in'}.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {submitError && (
            <div className="rounded-[18px] border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-100">
              {submitError}
            </div>
          )}

          <div className="space-y-3">
            <div ref={googleButtonRef} className="flex min-h-[44px] items-center justify-center" />
            {!googleClientId || !isGoogleReady ? (
              <button
                type="button"
                disabled
                className="flex h-[46px] w-full items-center justify-center rounded-[12px] border border-white/20 bg-transparent text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGoogleSubmitting ? 'Connecting Google...' : googleLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
