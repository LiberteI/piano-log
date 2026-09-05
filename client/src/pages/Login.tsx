import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAccessToken } from '../auth.ts'
import { apiUrl } from '../api.ts'
import './login.css'

const Login = () => {
  const navigate = useNavigate()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      setMessage('Google sign-in is not configured for this environment.')
      return
    }

    let isCurrent = true

    async function signInWithGoogle(response: GoogleCredentialResponse) {
      try {
        const loginResponse = await fetch(apiUrl('/api/auth/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })

        if (loginResponse.status === 403) {
          throw new Error('This Google account is not allowed to access Piano Log.')
        }
        if (!loginResponse.ok) throw new Error('Google sign-in could not be verified. Please try again.')

        const login = await loginResponse.json() as { accessToken: string }
        setAccessToken(login.accessToken)
        navigate('/', { replace: true })
      } catch (error) {
        if (isCurrent) {
          setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
        }
      }
    }

    function renderGoogleButton() {
      if (!isCurrent || !window.google || !googleButtonRef.current) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: signInWithGoogle,
        auto_select: false,
      })
      const buttonWidth = Math.min(360, Math.max(200, Math.floor(googleButtonRef.current.clientWidth - 4)))
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: buttonWidth,
      })
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (existingScript) {
      if (window.google) {
        renderGoogleButton()
      } else {
        existingScript.addEventListener('load', renderGoogleButton, { once: true })
      }
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.googleIdentity = 'true'
      script.onload = renderGoogleButton
      script.onerror = () => setMessage('Unable to load Google sign-in. Please check your connection.')
      document.head.appendChild(script)
    }

    return () => {
      isCurrent = false
    }
  }, [navigate])

  return (
    <main className='login-page'>
      <header className='login-brand'>
        <span aria-hidden='true'>|</span>
        <h1>Piano Log</h1>
      </header>

      <section className='login-card' aria-labelledby='login-heading'>
        <h2 id='login-heading'>Welcome back</h2>
        <p>Log in to continue your piano journey.</p>

        <div className='login-google-button' ref={googleButtonRef} />
        {message && <p className='login-message' role='status'>{message}</p>}
      </section>
    </main>
  )
}

export default Login
