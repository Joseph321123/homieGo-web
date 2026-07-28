import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import {
  fetchNotifications,
  getApiErrorMessage,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/api'
import { formatNotificationType } from '../utils/labels'

const NotificationsPage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    const response = await fetchNotifications(token)
    setItems(response.data)
  }

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      try {
        setLoading(true)
        setError('')
        await load()
      } catch {
        if (active) setError('No pudimos cargar tus notificaciones.')
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [token])

  const handleOpen = async (item) => {
    try {
      if (!item.read) {
        await markNotificationRead(token, item.id)
        setItems((current) =>
          current.map((row) => (row.id === item.id ? { ...row, read: true } : row))
        )
      }
      if (item.link) navigate(item.link)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos abrir la notificación'))
    }
  }

  const handleMarkAll = async () => {
    setMessage('')
    setError('')
    try {
      await markAllNotificationsRead(token)
      setItems((current) => current.map((row) => ({ ...row, read: true })))
      setMessage('Todas las notificaciones quedaron como leídas.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos marcar como leídas'))
    }
  }

  const unread = items.filter((item) => !item.read).length

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Centro de avisos</span>
            <h1 className="section-title">Notificaciones</h1>
            <p className="page-subtitle">
              Reservas, pagos, mensajes y reseñas relacionadas con tu cuenta.
            </p>
          </div>
          {unread > 0 && (
            <button className="button-secondary" type="button" onClick={handleMarkAll}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {loading && <p className="state-message">Cargando notificaciones...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}
        {message && <p className="state-message">{message}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="empty-panel">
            <p className="state-message">
              Aún no tienes notificaciones. Cuando reserves, pagues o recibas mensajes, aparecerán aquí.
            </p>
            <Link className="button" to="/properties">
              Explorar propiedades
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="notifications-list">
            {items.map((item) => (
              <article
                key={item.id}
                className={`notification-item${item.read ? '' : ' notification-item-unread'}`}
              >
                <div>
                  <div className="notification-meta">
                    <span className="tag">{formatNotificationType(item.type)}</span>
                    {!item.read && <span className="rating-pill">Nueva</span>}
                  </div>
                  <h2 className="panel-title">{item.title}</h2>
                  <p className="panel-text">{item.message}</p>
                  <p className="card-meta">
                    {new Date(item.created_at).toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="form-actions">
                  <button className="button" type="button" onClick={() => handleOpen(item)}>
                    {item.link ? 'Abrir' : 'Marcar leída'}
                  </button>
                  {item.link && (
                    <Link className="button-secondary" to={item.link}>
                      Ir al enlace
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default NotificationsPage
