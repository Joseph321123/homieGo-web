import SiteShell from '../components/SiteShell'

const AdminPage = () => {
  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Control de plataforma</span>
            <h1 className="section-title">Panel de administración</h1>
            <p className="page-subtitle">
              Base visual para supervisar usuarios, propiedades, reservaciones y pagos.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-value">Usuarios</span>
            <span className="stat-label">Seguimiento de registros, roles y actividad.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">Reservas</span>
            <span className="stat-label">Supervisión de solicitudes, estados y confirmaciones.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">Pagos</span>
            <span className="stat-label">Preparado para integrar cobros digitales y control financiero.</span>
          </article>
        </div>
      </section>
    </SiteShell>
  )
}

export default AdminPage
