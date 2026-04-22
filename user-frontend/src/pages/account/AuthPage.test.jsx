import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'

import AuthPage from './AuthPage'

const mockAccount = {
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  signup: vi.fn(),
  googleLogin: vi.fn(),
}

const mockSiteSettings = {
  restaurantName: 'RajaMahendravaram PalavuCentre',
  logoUrl: '',
}

vi.mock('../../context/AccountContext.jsx', () => ({
  useAccount: () => mockAccount,
}))

vi.mock('../../context/SiteContext.jsx', () => ({
  useSiteSettings: () => ({ siteSettings: mockSiteSettings }),
}))

vi.mock('../../lib/google-auth', () => ({
  consumeGoogleAuthSource: vi.fn(() => 'profile'),
  getGoogleClientId: vi.fn(() => ''),
  renderGoogleButton: vi.fn(() => Promise.resolve(false)),
  setGoogleAuthSource: vi.fn(),
  setGoogleCredentialHandler: vi.fn(() => () => {}),
}))

function LocationDisplay() {
  const location = useLocation()
  return <div>{`${location.pathname}${location.search}`}</div>
}

function renderAuth({ mode = 'login', entry = mode === 'signup' ? '/signup' : '/login' } = {}) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/profile" element={<LocationDisplay />} />
        <Route path="/order" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockAccount.isAuthenticated = false
  mockAccount.isLoading = false
  mockAccount.login.mockReset()
  mockAccount.signup.mockReset()
  mockAccount.googleLogin.mockReset()
})

describe('AuthPage', () => {
  it('renders the sign-in headings and CTA copy', () => {
    renderAuth({ mode: 'login' })

    expect(screen.getByText('Member Sign In')).toBeTruthy()
    expect(screen.getByText('Welcome back')).toBeTruthy()
    expect(screen.getByText('Continue with Google')).toBeTruthy()
  })

  it('shows checkout redirect copy when opened from the order page', () => {
    renderAuth({
      mode: 'login',
      entry: {
        pathname: '/login',
        state: {
          from: {
            pathname: '/order',
            search: '',
          },
        },
      },
    })

    expect(screen.getByText('Checkout Access')).toBeTruthy()
    expect(screen.getByText('Sign in to continue to checkout with saved addresses and faster ordering.')).toBeTruthy()
  })

  it('preserves the profile orders search params when redirecting an authenticated user', async () => {
    mockAccount.isAuthenticated = true

    renderAuth({
      mode: 'login',
      entry: {
        pathname: '/login',
        state: {
          from: {
            pathname: '/profile',
            search: '?tab=orders',
          },
          authSource: 'profile',
        },
      },
    })

    expect(await screen.findByText('/profile?tab=orders')).toBeTruthy()
  })

  it('shows an inline email validation error on blur', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'login' })

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'bad-email')
    await user.tab()

    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
  })

  it('submits login with a trimmed email payload', async () => {
    const user = userEvent.setup()
    mockAccount.login.mockResolvedValue({ id: 7 })

    renderAuth({ mode: 'login' })

    await user.type(screen.getByLabelText(/email address/i), '  user@example.com  ')
    await user.type(screen.getByLabelText(/^password$/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(mockAccount.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password1!',
      }),
    )
  })

  it('moves sign-up to the security step and submits the full payload', async () => {
    const user = userEvent.setup()
    mockAccount.signup.mockResolvedValue({ id: 8 })

    renderAuth({ mode: 'signup' })

    await user.type(screen.getByLabelText(/full name/i), 'Varun Teja')
    await user.type(screen.getByLabelText(/email address/i), 'varun@example.com')
    await user.click(screen.getByRole('button', { name: /continue to security/i }))
    await user.type(screen.getByLabelText(/^password$/i), 'Password1!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /create my account/i }))

    await waitFor(() =>
      expect(mockAccount.signup).toHaveBeenCalledWith({
        name: 'Varun Teja',
        email: 'varun@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      }),
    )
  })
})
