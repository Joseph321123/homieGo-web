import { useEffect, useState } from 'react'
import SiteShell from '../components/SiteShell'
import { formatPrice } from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminDashboard,
  fetchAdminProperties,
  fetchAdminReservations,
  fetchAdminUsers,
  getApiErrorMessage,
  setAdminPropertyActive,
  setAdminUserActive,
} from '../services/api'

const AdminPage = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [users, setUsers] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAdmin = async () => {
    try {
      setLoading(true)
      setError('')
      const [dashboard, reservationsData, usersData, propertiesData] = await Promise.all([
        fetchAdminDashboard(token),
        fetchAdminReservations(token),
        fetchAdminUsers(token),
        fetchAdminProperties(token),
      ])
      setStats(dashboard.data)
      setReservations(reservationsData.data)
      setUsers(usersData.data)
      setProperties(propertiesData.data)
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

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Control de plataforma</span>
            <h1 className="section-title">Panel de administración</h1>
            <p className="page-subtitle">
              Métricas, moderación de usuarios y control de propiedades.
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
                <span className="stat-value">{stats.reservations}</span>
                <span className="stat-label">Reservaciones totales</span>
              </article>
              <article className="stat-card">
                <span className="stat-value">{formatPrice(stats.revenue)}</span>
                <span className="stat-label">Ingresos por pagos aprobados</span>
              </article>
            </div>

            <div className="admin-panels">
              <article className="panel-card">
                <h2 className="panel-title">Reservaciones recientes</h2>
                <div className="admin-table">
                  {reservations.map((item) => (
                    <div className="admin-row" key={item.id}>
                      <span>#{item.id} · {item.property_title}</span>
                      <span>{item.guest_name}</span>
                      <span>{item.check_in} → {item.check_out}</span>
                      <span className="tag">{item.status}</span>
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
