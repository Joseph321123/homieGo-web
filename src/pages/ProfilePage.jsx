import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

const ProfilePage = () => {
  const { user, updateProfile, becomeHost, isHost } = useAuth()
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
  })
  const [loading, setLoading] = useState(false)
  const [hostLoading, setHostLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      await updateProfile(form)
      setMessage('Perfil actualizado correctamente.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos actualizar tu perfil'))
    } finally {
      setLoading(false)
    }
  }

  const handleBecomeHost = async () => {
    setHostLoading(true)
    setMessage('')
    setError('')
    try {
      await becomeHost()
      setMessage('Ya eres anfitrión. Puedes publicar propiedades desde el panel.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos activar el rol de anfitrión'))
    } finally {
      setHostLoading(false)
    }
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tu cuenta</span>
            <h1 className="section-title">Mi perfil</h1>
            <p className="page-subtitle">
              Actualiza tu información personal y gestiona tu rol en HomieGo.
            </p>
          </div>
        </div>

        <div className="profile-layout">
          <form className="panel-card profile-form" onSubmit={handleSubmit}>
            <div className="stack">
              <div className="field">
                <label htmlFor="profile-email">Correo</label>
                <input id="profile-email" type="email" value={user?.email || ''} disabled />
              </div>
              <div className="field">
                <label htmlFor="profile-name">Nombre</label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.nombre}
                  onChange={updateField('nombre')}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="profile-phone">Teléfono</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.telefono}
                  onChange={updateField('telefono')}
                  placeholder="+52 555 000 0000"
                />
              </div>
              <div className="property-tags">
                {(user?.roles || []).map((role) => (
                  <span className="tag" key={role}>
                    {role}
                  </span>
                ))}
              </div>

              {message && <p className="state-message">{message}</p>}
              {error && <p className="state-message state-message-error">{error}</p>}

              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          <aside className="panel-card">
            <h2 className="panel-title">Rol de anfitrión</h2>
            {isHost ? (
              <>
                <p className="panel-text">
                  Ya tienes permisos para publicar y administrar hospedajes.
                </p>
                <Link className="button" to="/host">
                  Ir al panel de anfitrión
                </Link>
              </>
            ) : (
              <>
                <p className="panel-text">
                  Activa el rol de anfitrión para publicar propiedades y recibir reservas.
                </p>
                <button className="button" type="button" onClick={handleBecomeHost} disabled={hostLoading}>
                  {hostLoading ? 'Activando...' : 'Convertirme en anfitrión'}
                </button>
              </>
            )}
          </aside>
        </div>
      </section>
    </SiteShell>
  )
}

export default ProfilePage
