import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'

const featuredProperties = [
  {
    name: 'House in the beach',
    place: 'Beach front',
    price: 'TÍTULO DE RENTA',
    tags: ['BEACH', 'BUY', 'RENT'],
    photo: 'linear-gradient(135deg, #002862, #1383f9 45%, #4cb0ff)',
  },
  {
    name: 'Center apartment',
    place: 'Center area',
    price: 'TÍTULO DE CASA',
    tags: ['CENTER', 'BUY', 'RENT'],
    photo: 'linear-gradient(135deg, #002862, #4cb0ff 45%, #fff4e9)',
  },
  {
    name: 'Nature cabin',
    place: 'Green zone',
    price: 'TÍTULO DE RENTA',
    tags: ['NATURE', 'BUY', 'RENT'],
    photo: 'linear-gradient(135deg, #1383f9, #4cb0ff 48%, #fff4e9)',
  },
]

const categories = ['NATURE', 'BEACH', 'CENTER']
const footerItems = ['About us', 'Contact', 'Sucursales']

const HomePage = () => {
  return (
    <SiteShell>
      <section className="hero">
        <div className="home-hero-wrapper">
          <div className="hero-main">
            <span className="eyebrow">HomieGo</span>
            <h1 className="hero-title">
              <span className="hero-homie">HOMIE</span>
              <span className="hero-go">GO</span>
            </h1>
            <p className="hero-copy">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

            <div className="categories-row" aria-label="Categories">
              {categories.map((category) => (
                <span className="category-chip" key={category}>
                  {category}
                </span>
              ))}
            </div>

            <div className="hero-actions">
              <Link className="button" to="/properties">
                BUY
              </Link>
              <Link className="button-secondary" to="/host">
                RENT
              </Link>
            </div>
          </div>

          <aside className="mini-search-fixed" aria-label="Mini search">
            <div className="mini-search-panel">
              <div className="field">
                <label htmlFor="ms-destination">Dónde</label>
                <input id="ms-destination" type="text" placeholder="Ciudad o zona" />
              </div>
              <div className="field-inline">
                <div className="field">
                  <label htmlFor="ms-checkin">In</label>
                  <input id="ms-checkin" type="date" />
                </div>
                <div className="field">
                  <label htmlFor="ms-checkout">Out</label>
                  <input id="ms-checkout" type="date" />
                </div>
              </div>
              <Link className="button" to="/properties">
                Buscar
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-value">120+</span>
            <span className="stat-label">Títulos de renta o casas listos para catálogo.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">3 roles</span>
            <span className="stat-label">Plancha house, buy y rent.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Información de contacto y reservas siempre visible.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Títulos de renta o casas</h2>
            <p className="section-note">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>

        <div className="property-grid">
          {featuredProperties.map((property) => (
            <article className="property-card" key={property.name}>
              <div className="property-photo" style={{ '--photo': property.photo }} />
              <div className="stack">
                <div>
                  <h3 className="property-title">{property.name}</h3>
                  <p className="card-meta">{property.place}</p>
                </div>
                <div className="property-tags">
                  {property.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <strong>{property.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Information of contact</h2>
            <p className="section-note">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>

        <div className="stats-grid">
          <article className="panel-card">
            <div className="footer-about">Information of contact</div>
            <div className="footer-copy" style={{ marginTop: '0.7rem' }}>
              <strong>About us</strong>
              <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
            </div>
          </article>
          <article className="panel-card">
            <div className="footer-about">Contact</div>
            <div className="footer-copy" style={{ marginTop: '0.7rem' }}>
              <strong>Dream avenue</strong>
              <span>+52 55 0000 0000 · hello@homiego.com</span>
            </div>
          </article>
          <article className="panel-card">
            <div className="footer-about">Sucursales</div>
            <div className="footer-links" style={{ marginTop: '0.7rem' }}>
              {footerItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </SiteShell>
  )
}

export default HomePage
