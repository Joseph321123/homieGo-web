import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'

const LoginPage = () => {
  return (
    <SiteShell>
      <section className="auth-grid">
        <div className="auth-card">
          <span className="eyebrow">Acceso a tu cuenta</span>
          <h1 className="section-title">Inicia sesión en HomieGo</h1>
          <p className="page-subtitle">
            Este espacio deja lista la base visual para autenticación de huéspedes,
            anfitriones y administradores.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="login-email">Correo electrónico</label>
              <input id="login-email" type="email" placeholder="tu@correo.com" />
            </div>
            <div className="field">
              <label htmlFor="login-password">Contraseña</label>
              <input id="login-password" type="password" placeholder="••••••••" />
            </div>
            <div className="form-actions">
              <Link className="button" to="/">
                Entrar
              </Link>
              <Link className="button-secondary" to="/register">
                Crear una cuenta
              </Link>
            </div>
          </div>
        </div>

        <aside className="panel-card">
          <h2 className="panel-title">Lo que tendrá de función en esta pantaá xd</h2>
          <p className="panel-text">
            Inicio de sesión, recuperación de acceso y selección de rol para mostrar
            opciones distintas a huéspedes y anfitriones.
          </p>
          <ul>
            <li>Autenticación básica</li>
            <li>Protección de rutas futuras</li>
            <li>Acceso a paneles de gestión</li>
          </ul>
        </aside>
      </section>
    </SiteShell>
  )
}

export default LoginPage
