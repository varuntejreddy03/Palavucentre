import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { fallbackSiteSettings } from '../lib/public-fallbacks'
import { publicApi } from '../lib/api'

const SiteContext = createContext(null)

export function SiteProvider({ children }) {
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSiteSettings = async () => {
    try {
      setError('')
      setIsLoading(true)
      const response = await publicApi.getSiteSettings()
      setSiteSettings(response.data)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load site settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSiteSettings()
    // Public site should always try to hydrate from the backend on startup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({
      siteSettings,
      isLoading,
      error,
      refreshSiteSettings: loadSiteSettings,
    }),
    [siteSettings, isLoading, error],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SiteContext)

  if (!context) {
    throw new Error('useSiteSettings must be used within SiteProvider')
  }

  return context
}
