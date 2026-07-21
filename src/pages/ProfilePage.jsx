import { useState } from 'react'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
  })
  const [loading, setLoading] = useState(false)
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

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tu cuenta</span>
            <h1 className="section-title">Mi perfil</h1>
            <p className="page-subtitle">
              Actualiza tu información personal en HomieGo.
            </p>
          </div>
        </div>

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
      </section>
    </SiteShell>
  )
}

export default ProfilePage
