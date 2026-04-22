/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { accountApi } from '../lib/api'
import { clearStoredCsrfToken } from '../lib/csrf'
import { disableGoogleAutoSelect } from '../lib/google-auth'

const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ addresses: [], orders: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile({ addresses: [], orders: [] })
      return null
    }

    try {
      setIsProfileLoading(true)
      const response = await accountApi.getProfile()
      setProfile({
        addresses: response.data.addresses || [],
        orders: response.data.orders || [],
      })
      return response.data
    } finally {
      setIsProfileLoading(false)
    }
  }, [user])

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await accountApi.me()
      setUser(response.data.user)
      return response.data.user
    } catch (requestError) {
      if (requestError.status !== 401) {
        console.warn('[account] Could not hydrate account session.', requestError)
      }

      setUser(null)
      setProfile({ addresses: [], orders: [] })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  useEffect(() => {
    if (!user) {
      setProfile({ addresses: [], orders: [] })
      return
    }

    refreshProfile().catch((requestError) => {
      if (requestError.status !== 401) {
        console.warn('[account] Could not load account profile.', requestError)
      }
    })
  }, [refreshProfile, user])

  const signup = useCallback(async (payload) => {
    const response = await accountApi.signup(payload)
    clearStoredCsrfToken()
    setUser(response.data.user)
    return response.data.user
  }, [])

  const login = useCallback(async (payload) => {
    const response = await accountApi.login(payload)
    clearStoredCsrfToken()
    setUser(response.data.user)
    return response.data.user
  }, [])

  const googleLogin = useCallback(async (payload) => {
    const response = await accountApi.googleLogin(payload)
    clearStoredCsrfToken()
    setUser(response.data.user)
    return response.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await accountApi.logout()
    } finally {
      disableGoogleAutoSelect()
      clearStoredCsrfToken()
      setUser(null)
      setProfile({ addresses: [], orders: [] })
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      isProfileLoading,
      isAuthenticated: Boolean(user),
      signup,
      login,
      googleLogin,
      logout,
      refreshSession,
      refreshProfile,
    }),
    [profile, user, isLoading, isProfileLoading, signup, login, googleLogin, logout, refreshSession, refreshProfile],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)

  if (!context) {
    throw new Error('useAccount must be used within AccountProvider')
  }

  return context
}
