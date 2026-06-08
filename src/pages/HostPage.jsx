import SiteShell from '../components/SiteShell'

const HostPage = () => {
  return (
    <SiteShell>
      <section className="dashboard-grid">
        <article className="panel-card">
          <span className="eyebrow">Panel de anfitrión</span>
          <h1 className="section-title">Administra tus hospedajes</h1>
          <p className="page-subtitle">
            Aquí irá la publicación de propiedades, calendario de disponibilidad y seguimiento de reservas.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="split-grid">
              <div className="field">
                <label htmlFor="property-name">Nombre de la propiedad</label>
                <input id="property-name" type="text" placeholder="Ej. Loft con terraza" />
              </div>
              <div className="field">
                <label htmlFor="property-type">Tipo</label>
                <select id="property-type" defaultValue="apartment">
                  <option value="apartment">Departamento</option>
                  <option value="house">Casa</option>
                  <option value="cabin">Cabaña</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="property-description">Descripción</label>
              <textarea id="property-description" rows="4" placeholder="Describe comodidades, ubicación y estilo del alojamiento" />
            </div>
            <div className="form-actions">
              <span className="button">Publicar borrador</span>
              <span className="button-secondary">Ver calendario</span>
            </div>
          </div>
        </article>

        <aside className="stack">
          <article className="panel-card">
            <h2 className="panel-title">Funciones futuras</h2>
            <p className="panel-text">Disponibilidad, precios por noche, fotos, reseñas y mensajería.</p>
          </article>
          <article className="panel-card">
            <h2 className="panel-title">Estado actual</h2>
            <ul>
              <li>Catálogo de propiedades</li>
              <li>Reservaciones</li>
              <li>Herramientas para anfitriones</li>
            </ul>
          </article>
        </aside>
      </section>
    </SiteShell>
  )
}

export default HostPage
