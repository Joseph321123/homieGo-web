import { useEffect, useState } from 'react'
import SiteShell from '../components/SiteShell'
import { formatPrice } from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminDashboard,
  fetchAdminProperties,
  fetchAdminReservations,
  fetchAdminUsers,
  fetchCommission,
  fetchPendingIdentities,
  getApiErrorMessage,
  releaseDueEscrow,
  setAdminCommission,
  setAdminIdentityStatus,
  setAdminPropertyActive,
  setAdminUserActive,
} from '../services/api'
import { formatIdentityStatus, formatReservationStatus } from '../utils/labels'

const AdminPage = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [identities, setIdentities] = useState([])
  const [commission, setCommission] = useState(12)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAdmin = async () => {
    try {
      setLoading(true)
      setError('')
      const [
        dashboard,
        reservationsData,
        usersData,
        propertiesData,
        identitiesData,
        commissionData,
      ] = await Promise.all([
        fetchAdminDashboard(token),
        fetchAdminReservations(token),
        fetchAdminUsers(token),
        fetchAdminProperties(token),
        fetchPendingIdentities(token),
        fetchCommission(),
      ])
      setStats(dashboard.data)
      setReservations(reservationsData.data)
      setUsers(usersData.data)
      setProperties(propertiesData.data)
      setIdentities(identitiesData.data)
      setCommission(commissionData.data?.comision_porcentaje ?? 12)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos cargar el panel'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmin()
  }, [token])

  const handleToggleUser = async (user) => {
    setMessage('')
    try {
      await setAdminUserActive(token, user.id, !user.activo)
      setMessage(`Usuario ${user.nombre} actualizado.`)
      await loadAdmin()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos actualizar el usuario'))
    }
  }

  const handleToggleProperty = async (property) => {
    setMessage('')
    try {
      await setAdminPropertyActive(token, property.id, !property.active)
      setMessage(`Propiedad ${property.title} actualizada.`)
      await loadAdmin()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos actualizar la propiedad'))
    }
  }

  const handleIdentity = async (userId, status) => {
    setMessage('')
    try {
      await setAdminIdentityStatus(token, userId, status)
      setMessage(`Identidad marcada como ${status}.`)
      await loadAdmin()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos actualizar la identidad'))
    }
  }

  const handleSaveCommission = async () => {
    setMessage('')
    try {
      await setAdminCommission(token, Number(commission))
      setMessage(`Comisión actualizada a ${commission}%.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos guardar la comisión'))
    }
  }

  const handleReleaseDue = async () => {
    setMessage('')
    try {
      const result = await releaseDueEscrow(token)
      setMessage(`Escrows liberados: ${result.data?.released ?? 0}`)
      await loadAdmin()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos liberar escrows'))
    }
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Control de plataforma</span>
            <h1 className="section-title">Panel de administración</h1>
            <p className="page-subtitle">
              Comisión, verificación de identidad, escrow y moderación.
            </p>
          </div>
        </div>

        {message && <p className="state-message">{message}</p>}
        {error && <p className="state-message state-message-error">{error}</p>}
        {loading && <p className="state-message">Cargando panel...</p>}

        {!loading && stats && (
          <>
            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-value">{stats.users}</span>
                <span className="stat-label">Usuarios activos</span>
              </article>
              <article className="stat-card">
                <span className="stat-value">{stats.properties}</span>
                <span className="stat-label">Propiedades publicadas</span>
              </article>
              <article className="stat-card">
                <span className="stat-value">{stats.pending_identities || 0}</span>
                <span className="stat-label">Identidades pendientes</span>
              </article>
              <article className="stat-card">
                <span className="stat-value">{formatPrice(stats.revenue)}</span>
                <span className="stat-label">Volumen de pagos</span>
              </article>
            </div>

            <div className="admin-panels">
              <article className="panel-card">
                <h2 className="panel-title">Comisión de plataforma</h2>
                <div className="split-grid">
                  <div className="field">
                    <label htmlFor="commission">Porcentaje (10–15 recomendado)</label>
                    <input
                      id="commission"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={commission}
                      onChange={(event) => setCommission(event.target.value)}
                    />
                  </div>
                  <div className="form-actions" style={{ alignItems: 'end' }}>
                    <button className="button" type="button" onClick={handleSaveCommission}>
                      Guardar comisión
                    </button>
                    <button className="button-secondary" type="button" onClick={handleReleaseDue}>
                      Liberar escrows vencidos
                    </button>
                  </div>
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Verificación de identidad</h2>
                {identities.length === 0 && (
                  <p className="panel-text">No hay documentos pendientes.</p>
                )}
                <div className="admin-table">
                  {identities.map((item) => (
                    <div className="admin-row" key={item.id}>
                      <span>{item.nombre}</span>
                      <span>{item.email}</span>
                      <span className="tag">{item.documento_identidad}</span>
                      <span className="tag">{formatIdentityStatus(item.identidad_estado)}</span>
                      <button
                        className="button"
                        type="button"
                        onClick={() => handleIdentity(item.id, 'verificada')}
                      >
                        Verificar
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => handleIdentity(item.id, 'rechazada')}
                      >
                        Rechazar
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Reservaciones recientes</h2>
                <div className="admin-table">
                  {reservations.map((item) => (
                    <div className="admin-row" key={item.id}>
                      <span>#{item.id} · {item.property_title}</span>
                      <span>{item.guest_name}</span>
                      <span>{item.check_in} → {item.check_out}</span>
                      <span className="tag">{formatReservationStatus(item.status)}</span>
                      <span className="tag">{item.payment_status || 'sin pago'}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Usuarios registrados</h2>
                <div className="admin-table">
                  {users.map((item) => (
                    <div className="admin-row" key={item.id}>
                      <span>{item.nombre}</span>
                      <span>{item.email}</span>
                      <span className="tag">{item.roles?.join(', ')}</span>
                      <span className="tag">{formatIdentityStatus(item.identidad_estado)}</span>
                      <span className="tag">{item.activo ? 'activo' : 'inactivo'}</span>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => handleToggleUser(item)}
                      >
                        {item.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel-card">
                <h2 className="panel-title">Propiedades</h2>
                <div className="admin-table">
                  {properties.map((item) => (
                    <div className="admin-row" key={item.id}>
                      <span>{item.title}</span>
                      <span>{item.host_name}</span>
                      <span>{item.city}</span>
                      <span className="tag">{item.active ? 'activa' : 'inactiva'}</span>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => handleToggleProperty(item)}
                      >
                        {item.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </>
        )}
      </section>
    </SiteShell>
  )
}

export default AdminPage
