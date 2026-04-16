import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { ADMIN_STANDALONE } from '../../../admin-frontend/src/lib/admin-routing'
import { accountApi } from '../lib/api'

const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ addresses: [], orders: [] })
  const [isLoading, setIsLoading] = useState(!ADMIN_STANDALONE)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  const refreshProfile = async () => {
    if (ADMIN_STANDALONE || !user) {
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
  }

  const refreshSession = async () => {
    if (ADMIN_STANDALONE) {
      setIsLoading(false)
      return null
    }

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
  }

  useEffect(() => {
    if (ADMIN_STANDALONE) {
      setIsLoading(false)
      return
    }

    refreshSession()
  }, [])

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
  }, [user?.id])

  const signup = async (payload) => {
    const response = await accountApi.signup(payload)
    setUser(response.data.user)
    return response.data.user
  }

  const login = async (payload) => {
    const response = await accountApi.login(payload)
    setUser(response.data.user)
    return response.data.user
  }

  const googleLogin = async (payload) => {
    const response = await accountApi.googleLogin(payload)
    setUser(response.data.user)
    return response.data.user
  }

  const logout = async () => {
    try {
      await accountApi.logout()
    } finally {
      setUser(null)
      setProfile({ addresses: [], orders: [] })
    }
  }

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
    [profile, user, isLoading, isProfileLoading],
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
