import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'

const RegisterPage = () => {
  return (
    <SiteShell>
      <section className="auth-grid">
        <div className="auth-card">
          <span className="eyebrow">Nuevo usuario</span>
          <h1 className="section-title">Crea tu cuenta en HomieGo</h1>
          <p className="page-subtitle">
            Un registro simple para empezar a buscar hospedajes o publicar tu primera propiedad.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="split-grid">
              <div className="field">
                <label htmlFor="name">Nombre</label>
                <input id="name" type="text" placeholder="Tu nombre" />
              </div>
              <div className="field">
                <label htmlFor="lastname">Apellido</label>
                <input id="lastname" type="text" placeholder="Tu apellido" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="register-email">Correo electrónico</label>
              <input id="register-email" type="email" placeholder="tu@correo.com" />
            </div>
            <div className="field">
              <label htmlFor="register-password">Contraseña</label>
              <input id="register-password" type="password" placeholder="Crea una contraseña" />
            </div>
            <div className="form-actions">
              <Link className="button" to="/login">
                Crear cuenta
              </Link>
              <Link className="button-secondary" to="/login">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>

        <aside className="panel-card">
          <h2 className="panel-title">Pensado para crecer</h2>
          <p className="panel-text">
            Después se podrá conectar con validaciones, roles, verificación por correo y
            permisos personalizados.
          </p>
          <div className="badge-row">
            <span className="badge">Huésped</span>
            <span className="badge">Anfitrión</span>
            <span className="badge">Administrador</span>
          </div>
        </aside>
      </section>
    </SiteShell>
  )
}

export default RegisterPage
