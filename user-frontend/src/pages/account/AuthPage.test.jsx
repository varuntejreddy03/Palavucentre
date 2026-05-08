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

    expect(screen.getByText('Sign in')).toBeTruthy()
    expect(screen.getByText('Access your orders and favourites')).toBeTruthy()
    expect(screen.getByText('Continue with Google')).toBeTruthy()
  })

  it('does not show address-based checkout copy when opened from the order page', () => {
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

    expect(screen.getByText('Sign in')).toBeTruthy()
    expect(screen.queryByText(/saved addresses/i)).toBeNull()
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

    const emailInput = screen.getByPlaceholderText(/email address/i)
    await user.type(emailInput, 'bad-email')
    await user.tab()

    expect(await screen.findByText('Invalid email')).toBeTruthy()
  })

  it('submits login with a trimmed email payload', async () => {
    const user = userEvent.setup()
    mockAccount.login.mockResolvedValue({ id: 7 })

    renderAuth({ mode: 'login' })

    await user.type(screen.getByPlaceholderText(/email address/i), '  user@example.com  ')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(mockAccount.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password1!',
      }),
    )
  })

  it('submits the sign-up payload', async () => {
    const user = userEvent.setup()
    mockAccount.signup.mockResolvedValue({ id: 8 })

    renderAuth({ mode: 'signup' })

    await user.type(screen.getByPlaceholderText(/full name/i), 'Varun Teja')
    await user.type(screen.getByPlaceholderText(/email address/i), 'varun@example.com')
    await user.type(screen.getByPlaceholderText(/password \(min 8 chars\)/i), 'Password1!')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /create account/i }))

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
