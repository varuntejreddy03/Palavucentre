const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

let scriptPromise = null
let googleInitialized = false
let activeCredentialHandler = null
let googleAuthSource = 'navbar'

function getGoogleIdentityApi() {
  return window.google?.accounts?.id || null
}

export function getGoogleClientId() {
  return GOOGLE_CLIENT_ID
}

export function setGoogleAuthSource(source) {
  googleAuthSource = String(source || '').trim() || 'navbar'
}

export function consumeGoogleAuthSource() {
  const currentSource = googleAuthSource
  googleAuthSource = 'navbar'
  return currentSource
}

export function setGoogleCredentialHandler(handler) {
  activeCredentialHandler = typeof handler === 'function' ? handler : null

  return () => {
    if (activeCredentialHandler === handler) {
      activeCredentialHandler = null
    }
  }
}

export async function loadGoogleIdentityScript() {
  if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) {
    return null
  }

  const existingApi = getGoogleIdentityApi()

  if (existingApi) {
    return existingApi
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-identity-client')

    const handleLoad = () => resolve(getGoogleIdentityApi())
    const handleError = () => reject(new Error('Google sign-in could not be loaded in this browser.'))

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-client'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = handleLoad
    script.onerror = handleError
    document.head.appendChild(script)
  }).finally(() => {
    scriptPromise = null
  })

  return scriptPromise
}

export async function initializeGoogleIdentity() {
  if (!GOOGLE_CLIENT_ID) {
    return null
  }

  const googleIdentity = (await loadGoogleIdentityScript()) || getGoogleIdentityApi()

  if (!googleIdentity) {
    return null
  }

  if (!googleInitialized) {
    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      callback: (response) => {
        activeCredentialHandler?.(response)
      },
    })
    googleInitialized = true
  }

  return googleIdentity
}

export async function renderGoogleButton(container, { text = 'continue_with', width = 360 } = {}) {
  if (!container) {
    return false
  }

  const googleIdentity = await initializeGoogleIdentity()

  if (!googleIdentity) {
    container.innerHTML = ''
    return false
  }

  container.innerHTML = ''
  googleIdentity.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text,
    shape: 'pill',
    width,
  })

  return true
}

export function disableGoogleAutoSelect() {
  getGoogleIdentityApi()?.disableAutoSelect?.()
}
