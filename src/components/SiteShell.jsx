import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchMessagesUnreadCount,
  fetchNotificationsUnreadCount,
} from '../services/api'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/properties', label: 'Propiedades' },
  { to: '/reservations', label: 'Mis reservas', auth: true },
  { to: '/favorites', label: 'Favoritos', auth: true },
  { to: '/messages', label: 'Mensajes', auth: true, badge: 'messages' },
  { to: '/notifications', label: 'Avisos', auth: true, badge: 'notifications' },
  { to: '/profile', label: 'Perfil', auth: true },
  { to: '/host', label: 'Ser anfitrión', host: true },
  { to: '/admin', label: 'Administración', admin: true },
]

const SiteShell = ({ children }) => {
  const { isAuthenticated, isHost, isAdmin, user, logout, token } = useAuth()
  const [messageUnread, setMessageUnread] = useState(0)
  const [notificationUnread, setNotificationUnread] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setMessageUnread(0)
      setNotificationUnread(0)
      return
    }

    let active = true
    const loadBadges = async () => {
      try {
        const [messages, notifications] = await Promise.all([
          fetchMessagesUnreadCount(token),
          fetchNotificationsUnreadCount(token),
        ])
        if (!active) return
        setMessageUnread(messages.data?.unread || 0)
        setNotificationUnread(notifications.data?.unread || 0)
      } catch {
        if (active) {
          setMessageUnread(0)
          setNotificationUnread(0)
        }
      }
    }

    loadBadges()
    const timer = setInterval(loadBadges, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [isAuthenticated, token])

  const visibleNav = navigation.filter((item) => {
    if (item.auth && !isAuthenticated) return false
    if (item.host && !isHost) return false
    if (item.admin && !isAdmin) return false
    return true
  })

  const badgeFor = (item) => {
    if (item.badge === 'messages') return messageUnread
    if (item.badge === 'notifications') return notificationUnread
    return 0
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">H</span>
          <span className="brand-copy">
            <span className="brand-name">HomieGo</span>
            <span className="brand-tagline">Hospedajes simples y confiables</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Navegación principal">
          {visibleNav.map((item) => {
            const count = badgeFor(item)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'site-nav-link site-nav-link-active' : 'site-nav-link'
                }
              >
                {item.label}
                {count > 0 && <span className="nav-badge">{count > 9 ? '9+' : count}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="site-header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">Hola, {user?.nombre?.split(' ')[0]}</span>
              <button className="button-secondary" type="button" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink className="button-secondary" to="/login">
                Ingresar
              </NavLink>
              <NavLink className="button" to="/register">
                Crear cuenta
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="page">{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>HomieGo · plataforma fullstack inspirada en Airbnb</span>
          <span>Reservas, anfitriones y administración en un solo lugar</span>
        </div>
      </footer>
    </div>
  )
}

export default SiteShell
