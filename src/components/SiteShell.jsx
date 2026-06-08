import { Link, NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/properties', label: 'Propiedades' },
  { to: '/host', label: 'Ser anfitrión' },
  { to: '/admin', label: 'Administración' },
]

const SiteShell = ({ children }) => {
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
          {navigation.map((item) => (
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
          <NavLink className="button-secondary" to="/login">
            Ingresar
          </NavLink>
          <NavLink className="button" to="/register">
            Crear cuenta
          </NavLink>
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