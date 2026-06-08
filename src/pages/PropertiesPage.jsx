import SiteShell from '../components/SiteShell'

const PropertiesPage = () => {
  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo inicial</span>
            <h1 className="section-title">Explora propiedades disponibles</h1>
            <p className="page-subtitle">
              Esta vista deja lista la base para filtros, tarjetas de alojamientos y reservas.
            </p>
          </div>
        </div>

        <div className="property-grid">
          <article className="property-card">
            <div className="property-photo" style={{ '--photo': 'linear-gradient(135deg, #002862, #1383f9)' }} />
            <h3 className="property-title">Casa de playa con terraza</h3>
            <p className="card-meta">Puerto Escondido</p>
            <div className="property-tags">
              <span className="tag">4 huéspedes</span>
              <span className="tag">Vista al mar</span>
            </div>
          </article>
          <article className="property-card">
            <div className="property-photo" style={{ '--photo': 'linear-gradient(135deg, #1383f9, #4cb0ff)' }} />
            <h3 className="property-title">Suite moderna en el centro</h3>
            <p className="card-meta">Monterrey</p>
            <div className="property-tags">
              <span className="tag">WiFi</span>
              <span className="tag">Aire acondicionado</span>
            </div>
          </article>
          <article className="property-card">
            <div className="property-photo" style={{ '--photo': 'linear-gradient(135deg, #002862, #4cb0ff)' }} />
            <h3 className="property-title">Cabaña tranquila para descansar</h3>
            <p className="card-meta">Aguascalientes</p>
            <div className="property-tags">
              <span className="tag">Naturaleza</span>
              <span className="tag">Parejas</span>
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  )
}

export default PropertiesPage
