import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const redirectTo = location.state?.from || '/'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('HomieGo123')
    setShowDemo(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos iniciar sesión'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteShell>
      <section className="auth-grid">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Acceso a tu cuenta</span>
          <h1 className="section-title">Inicia sesión en HomieGo</h1>
          <p className="page-subtitle">
            Ingresa con tu cuenta para reservar alojamientos o administrar propiedades.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="state-message state-message-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <Link className="button-secondary" to="/register">
                Crear una cuenta
              </Link>
            </div>
          </div>
        </form>

        <aside className="panel-card">
          <h2 className="panel-title">¿Primera vez aquí?</h2>
          <p className="panel-text">
            Crea una cuenta de huésped o activa el rol de anfitrión desde tu perfil para publicar
            alojamientos.
          </p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => setShowDemo((current) => !current)}
          >
            {showDemo ? 'Ocultar cuentas demo' : 'Usar cuentas demo'}
          </button>

          {showDemo && (
            <div className="stack" style={{ marginTop: '1rem' }}>
              <p className="panel-text">
                Contraseña compartida: <strong>HomieGo123</strong>
              </p>
              <div className="form-actions">
                <button
                  className="button"
                  type="button"
                  onClick={() => fillDemo('ana@homiego.demo')}
                >
                  Entrar como Ana
                </button>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => fillDemo('admin@homiego.demo')}
                >
                  Entrar como admin
                </button>
              </div>
              <ul>
                <li>Ana: anfitriona y huésped con propiedades demo</li>
                <li>Admin: panel de moderación</li>
              </ul>
            </div>
          )}
        </aside>
      </section>
    </SiteShell>
  )
}

export default LoginPage
