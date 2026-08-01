import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { changePassword, getApiErrorMessage, submitIdentity } from '../services/api'
import { formatIdentityStatus } from '../utils/labels'

const ProfilePage = () => {
  const { user, token, updateProfile, becomeHost, isHost } = useAuth()
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
  })
  const [hostForm, setHostForm] = useState({
    documento_identidad: user?.documento_identidad || '',
    documento_url: user?.documento_url || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [hostLoading, setHostLoading] = useState(false)
  const [identityLoading, setIdentityLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateHostField = (field) => (event) => {
    setHostForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }))
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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage('')
    setPasswordError('')

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('La confirmación no coincide con la nueva contraseña')
      setPasswordLoading(false)
      return
    }

    try {
      await changePassword(token, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setPasswordMessage('Contraseña actualizada correctamente.')
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'No pudimos cambiar la contraseña'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleBecomeHost = async () => {
    if (!hostForm.documento_identidad.trim()) {
      setError('Para ser anfitrión debes indicar un documento de identidad')
      return
    }

    setHostLoading(true)
    setMessage('')
    setError('')
    try {
      await becomeHost(hostForm)
      setMessage('Ya eres anfitrión. Tu identidad quedó pendiente de verificación.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos activar el rol de anfitrión'))
    } finally {
      setHostLoading(false)
    }
  }

  const handleSubmitIdentity = async () => {
    if (!hostForm.documento_identidad.trim()) {
      setError('El documento de identidad es obligatorio')
      return
    }

    setIdentityLoading(true)
    setMessage('')
    setError('')
    try {
      await submitIdentity(token, hostForm)
      setMessage('Documento enviado. Un admin verificará tu identidad.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos enviar el documento'))
    } finally {
      setIdentityLoading(false)
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
              Actualiza tu información, verificación de identidad y rol en HomieGo.
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
                <span className="tag">
                  Identidad: {formatIdentityStatus(user?.identidad_estado)}
                </span>
              </div>

              {message && <p className="state-message">{message}</p>}
              {error && <p className="state-message state-message-error">{error}</p>}

              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>

          <aside className="panel-card">
            <h2 className="panel-title">Anfitrión y verificación</h2>
            <div className="stack">
              <div className="field">
                <label htmlFor="doc-id">Documento de identidad</label>
                <input
                  id="doc-id"
                  type="text"
                  value={hostForm.documento_identidad}
                  onChange={updateHostField('documento_identidad')}
                  placeholder="INE / pasaporte (demo)"
                />
              </div>
              <div className="field">
                <label htmlFor="doc-url">URL del documento (opcional)</label>
                <input
                  id="doc-url"
                  type="url"
                  value={hostForm.documento_url}
                  onChange={updateHostField('documento_url')}
                  placeholder="https://..."
                />
              </div>
              {isHost ? (
                <>
                  <p className="panel-text">
                    Ya eres anfitrión. Estado de identidad:{' '}
                    <strong>{formatIdentityStatus(user?.identidad_estado)}</strong>
                  </p>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={handleSubmitIdentity}
                    disabled={identityLoading}
                  >
                    {identityLoading ? 'Enviando...' : 'Actualizar documento'}
                  </button>
                  <Link className="button" to="/host">
                    Ir al panel de anfitrión
                  </Link>
                </>
              ) : (
                <>
                  <p className="panel-text">
                    Para publicar propiedades debes enviar un documento y activar el rol de anfitrión.
                  </p>
                  <button className="button" type="button" onClick={handleBecomeHost} disabled={hostLoading}>
                    {hostLoading ? 'Activando...' : 'Convertirme en anfitrión'}
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>

        <form className="panel-card profile-form" style={{ marginTop: '1.25rem' }} onSubmit={handlePasswordSubmit}>
          <h2 className="panel-title">Cambiar contraseña</h2>
          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="current-password">Contraseña actual</label>
              <input
                id="current-password"
                type="password"
                value={passwordForm.current_password}
                onChange={updatePasswordField('current_password')}
                required
                minLength={6}
              />
            </div>
            <div className="split-grid">
              <div className="field">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={updatePasswordField('new_password')}
                  required
                  minLength={6}
                />
              </div>
              <div className="field">
                <label htmlFor="confirm-password">Confirmar nueva</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={updatePasswordField('confirm_password')}
                  required
                  minLength={6}
                />
              </div>
            </div>
            {passwordMessage && <p className="state-message">{passwordMessage}</p>}
            {passwordError && <p className="state-message state-message-error">{passwordError}</p>}
            <button className="button" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </section>
    </SiteShell>
  )
}

export default ProfilePage
