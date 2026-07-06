import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/properties', label: 'Propiedades' },
  { to: '/reservations', label: 'Mis reservas', auth: true },
  { to: '/host', label: 'Ser anfitrión', host: true },
  { to: '/admin', label: 'Administración', admin: true },
]

const SiteShell = ({ children }) => {
  const { isAuthenticated, isHost, isAdmin, user, logout } = useAuth()

  const visibleNav = navigation.filter((item) => {
    if (item.auth && !isAuthenticated) return false
    if (item.host && !isHost) return false
    if (item.admin && !isAdmin) return false
    return true
  })

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
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'site-nav-link site-nav-link-active' : 'site-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
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
