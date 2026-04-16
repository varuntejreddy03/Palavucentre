import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import AuthPage from './AuthPage'

const mockAccount = {
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  signup: vi.fn(),
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

function renderAuth({ mode = 'login', entry = mode === 'signup' ? '/signup' : '/login' } = {}) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/profile" element={<div>Profile Screen</div>} />
        <Route path="/order" element={<div>Order Screen</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockAccount.isAuthenticated = false
  mockAccount.isLoading = false
  mockAccount.login.mockReset()
  mockAccount.signup.mockReset()
})

describe('AuthPage', () => {
  it('renders the simplified sign in headings', () => {
    renderAuth({ mode: 'login' })

    expect(screen.getByText('Member Sign In')).toBeTruthy()
    expect(screen.getByText('Welcome back')).toBeTruthy()
    expect(screen.getByText('Orders')).toBeTruthy()
    expect(screen.getByText('Continue with Google')).toBeTruthy()
  })

  it('renders sign up mode with the first step fields', () => {
    renderAuth({ mode: 'signup' })

    expect(screen.getByText('First Order')).toBeTruthy()
    expect(screen.getByText('1 of 2')).toBeTruthy()
    expect(screen.getByLabelText(/full name/i)).toBeTruthy()
    expect(screen.getByLabelText(/email address/i)).toBeTruthy()
  })

  it('prevents moving to security step when profile fields are invalid', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'signup' })

    await user.click(screen.getByRole('button', { name: /continue to security/i }))

    expect(await screen.findByText('Enter your full name.')).toBeTruthy()
    expect(screen.getByText('Enter your email address.')).toBeTruthy()
    expect(screen.getByText('1 of 2')).toBeTruthy()
  })

  it('shows checkout redirect copy when opened from the order page', () => {
    renderAuth({
      mode: 'login',
      entry: {
        pathname: '/login',
        state: {
          from: {
            pathname: '/order',
          },
        },
      },
    })

    expect(screen.getByText('Checkout Access')).toBeTruthy()
    expect(screen.getByText('Foodie.')).toBeTruthy()
    expect(screen.getByText('Sign in to continue to checkout with saved addresses and faster ordering.')).toBeTruthy()
  })

  it('shows an inline email validation error on blur', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'login' })

    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'bad-email')
    await user.tab()

    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
  })

  it('shows a password mismatch error during sign up', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'signup' })

    await user.type(screen.getByLabelText(/full name/i), 'Varun')
    await user.type(screen.getByLabelText(/email address/i), 'varun@example.com')
    await user.click(screen.getByRole('button', { name: /continue to security/i }))

    await user.type(screen.getByLabelText(/^password$/i), 'Password1!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password2!')
    await user.tab()

    expect(await screen.findByText('Passwords do not match.')).toBeTruthy()
  })

  it('shows a great password strength label for strong passwords', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'signup' })

    await user.type(screen.getByLabelText(/full name/i), 'Varun')
    await user.type(screen.getByLabelText(/email address/i), 'varun@example.com')
    await user.click(screen.getByRole('button', { name: /continue to security/i }))

    await user.type(screen.getByLabelText(/^password$/i), 'Password1!')

    expect(screen.getByText('Password strength')).toBeTruthy()
    expect(screen.getByText('Secure')).toBeTruthy()
  })

  it('toggles password visibility in login mode', async () => {
    const user = userEvent.setup()
    renderAuth({ mode: 'login' })

    const passwordInput = screen.getByLabelText(/^password$/i)
    expect(passwordInput.getAttribute('type')).toBe('password')

    await user.click(screen.getByLabelText('Show password'))
    expect(passwordInput.getAttribute('type')).toBe('text')

    await user.click(screen.getByLabelText('Hide password'))
    expect(passwordInput.getAttribute('type')).toBe('password')
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

  it('submits signup with the full account payload', async () => {
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

  it('shows a submit error when login fails', async () => {
    const user = userEvent.setup()
    mockAccount.login.mockRejectedValue(new Error('Invalid credentials'))
    renderAuth({ mode: 'login' })

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password1!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid credentials')).toBeTruthy()
  })
})
