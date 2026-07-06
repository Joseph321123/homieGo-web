import { useEffect, useState } from 'react'
import SiteShell from '../components/SiteShell'
import { formatPrice } from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminDashboard,
  fetchAdminReservations,
  fetchAdminUsers,
} from '../services/api'

const AdminPage = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const [dashboard, reservationsData, usersData] = await Promise.all([
          fetchAdminDashboard(token),
          fetchAdminReservations(token),
          fetchAdminUsers(token),
        ])
        setStats(dashboard.data)
        setReservations(reservationsData.data)
        setUsers(usersData.data)
      } finally {
        setLoading(false)
      }
    }

    loadAdmin()
  }, [token])

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Control de plataforma</span>
            <h1 className="section-title">Panel de administración</h1>
            <p className="page-subtitle">
              Métricas en tiempo real de usuarios, propiedades, reservas y pagos.
            </p>
          </div>
        </div>

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
