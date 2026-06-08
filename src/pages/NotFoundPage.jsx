import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'

const NotFoundPage = () => {
  return (
    <SiteShell>
      <section className="empty-state">
        <span className="eyebrow">404</span>
        <h1 className="section-title">No encontramos esta ruta</h1>
        <p>
          La página que buscabas no existe o todavía no está creada dentro de HomieGo.
        </p>
        <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Link className="button" to="/">
            Volver al inicio
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}

export default NotFoundPage
