import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    asHost: location.state?.needHost || false,
    documento_identidad: '',
    documento_url: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const updateField = (field) => (event) => {
    const value = field === 'asHost' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(form)
      navigate(form.asHost ? '/host' : '/properties', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos crear la cuenta'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SiteShell>
      <section className="auth-grid">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Nuevo usuario</span>
          <h1 className="section-title">Crea tu cuenta en HomieGo</h1>
          <p className="page-subtitle">
            Regístrate para reservar hospedajes o publicar tu primera propiedad.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={updateField('nombre')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-email">Correo electrónico</label>
              <input
                id="register-email"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-phone">Teléfono</label>
              <input
                id="register-phone"
                type="tel"
                placeholder="+52 555 000 0000"
                value={form.telefono}
                onChange={updateField('telefono')}
              />
            </div>
            <div className="field">
              <label htmlFor="register-password">Contraseña</label>
              <input
                id="register-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={updateField('password')}
                minLength={6}
                required
              />
            </div>
            <label className="checkbox-field">
              <input type="checkbox" checked={form.asHost} onChange={updateField('asHost')} />
              También quiero publicar propiedades como anfitrión
            </label>

            {form.asHost && (
              <>
                <div className="field">
                  <label htmlFor="register-doc">Documento de identidad</label>
                  <input
                    id="register-doc"
                    type="text"
                    placeholder="INE / pasaporte (obligatorio para anfitrión)"
                    value={form.documento_identidad}
                    onChange={updateField('documento_identidad')}
                    required={form.asHost}
                  />
                </div>
                <div className="field">
                  <label htmlFor="register-doc-url">URL del documento (opcional)</label>
                  <input
                    id="register-doc-url"
                    type="url"
                    placeholder="https://..."
                    value={form.documento_url}
                    onChange={updateField('documento_url')}
                  />
                </div>
              </>
            )}

            {error && <p className="state-message state-message-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
              <Link className="button-secondary" to="/login">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </form>

        <aside className="panel-card">
          <h2 className="panel-title">Roles disponibles</h2>
          <p className="panel-text">
            Todos los usuarios pueden reservar. Si activas anfitrión, también podrás publicar
            propiedades desde el panel correspondiente.
          </p>
          <div className="badge-row">
            <span className="badge">Huésped</span>
            <span className="badge">Anfitrión</span>
          </div>
        </aside>
      </section>
    </SiteShell>
  )
}

export default RegisterPage
