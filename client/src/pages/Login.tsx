import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAccessToken } from '../auth.ts'
import { apiUrl } from '../api.ts'
import './login.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const Login = () => {
  const navigate = useNavigate()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState(googleClientId ? '' : 'Google sign-in is not configured for this environment.')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'signing-in'>(googleClientId ? 'loading' : 'error')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!googleClientId) return

    const buttonContainer = googleButtonRef.current
    let isCurrent = true
    let backendReady = false
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      fail('Piano Log is taking longer than expected. Please try again.')
    }, 120_000)

    function fail(message: string) {
      if (!isCurrent) return
      isCurrent = false
      controller.abort()
      window.clearTimeout(timeout)
      setMessage(message)
      setStatus('error')
    }

    async function wakeBackend() {
      try {
        const response = await fetch(apiUrl('/api/health'), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Backend unavailable')
        const health = await response.json() as { status?: string }
        if (health.status !== 'ok') throw new Error('Backend unavailable')
        backendReady = true
        renderGoogleButton()
      } catch {
        fail('Couldn’t connect to Piano Log. Please try again.')
      }
    }

    async function signInWithGoogle(response: GoogleCredentialResponse) {
      if (!isCurrent) return
      setMessage('')
      setStatus('signing-in')
      try {
        const loginResponse = await fetch(apiUrl('/api/auth/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(120_000)]),
        })

        if (loginResponse.status === 403) {
          throw new Error('This Google account is not allowed to access Piano Log.')
        }
        if (!loginResponse.ok) throw new Error('Google sign-in could not be verified. Please try again.')

        const login = await loginResponse.json() as { accessToken: string }
        if (!isCurrent) return
        setAccessToken(login.accessToken)
        navigate('/', { replace: true })
      } catch (error) {
        if (isCurrent) {
          setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
          setStatus('ready')
        }
      }
    }

    function renderGoogleButton() {
      if (!isCurrent || !backendReady || !window.google || !googleButtonRef.current) return

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: signInWithGoogle,
        auto_select: false,
      })
      const card = googleButtonRef.current.parentElement!
      const cardStyle = window.getComputedStyle(card)
      const availableWidth = card.clientWidth - parseFloat(cardStyle.paddingLeft) - parseFloat(cardStyle.paddingRight) - 6
      const buttonWidth = Math.min(360, Math.max(200, Math.floor(availableWidth)))
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: buttonWidth,
      })
      window.clearTimeout(timeout)
      setStatus('ready')
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    const script = existingScript ?? document.createElement('script')
    const onScriptError = () => {
      script.remove()
      fail('Unable to load Google sign-in. Please check your connection and try again.')
    }
    script.addEventListener('load', renderGoogleButton)
    script.addEventListener('error', onScriptError)
    if (!existingScript) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.googleIdentity = 'true'
      document.head.appendChild(script)
    }
    void wakeBackend()

    return () => {
      isCurrent = false
      controller.abort()
      window.clearTimeout(timeout)
      script.removeEventListener('load', renderGoogleButton)
      script.removeEventListener('error', onScriptError)
      if (!window.google) script.remove()
      buttonContainer?.replaceChildren()
    }
  }, [navigate, attempt])

  return (
    <main className='login-page'>
      <header className='login-brand'>
        <span aria-hidden='true'>|</span>
        <h1>Piano Log</h1>
      </header>

      <section className='login-card' aria-labelledby='login-heading'>
        <h2 id='login-heading'>Welcome back</h2>
        <p>Log in to continue your piano journey.</p>

        {status === 'loading' && (
          <div className='login-loading' role='status'>
            <span className='login-spinner' aria-hidden='true' />
            <p>Getting Piano Log ready…<br />The server is waking up. This may take a moment.</p>
          </div>
        )}
        {status === 'signing-in' && <p className='login-message' role='status'>Signing you in…</p>}
        <div className='login-google-button' ref={googleButtonRef} hidden={status !== 'ready'} />
        {status === 'error' && googleClientId && <button className='login-retry' type='button' onClick={() => {
          setMessage('')
          setStatus('loading')
          setAttempt((value) => value + 1)
        }}>Try again</button>}
        {message && <p className='login-message' role='status'>{message}</p>}
      </section>
    </main>
  )
}

export default Login
