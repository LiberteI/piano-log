import './login.css'

const Login = () => {
  return (
    <main className='login-page'>
      <header className='login-brand'>
        <span aria-hidden='true'>|</span>
        <h1>Piano Log</h1>
      </header>

      <section className='login-card' aria-labelledby='login-heading'>
        <h2 id='login-heading'>Welcome back</h2>
        <p>Log in to continue your piano journey.</p>

        <button className='login-google-button' type='button'>
          <GoogleMark />
          Continue with Google
        </button>
      </section>
    </main>
  )
}

function GoogleMark() {
  return <span className='login-google-mark' aria-hidden='true'>G</span>
}

export default Login
