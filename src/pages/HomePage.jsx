import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchProperties } from '../services/api'

const categories = ['NATURE', 'BEACH', 'CENTER']
const footerItems = ['About us', 'Contact', 'Sucursales']

const HomePage = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [propertyCount, setPropertyCount] = useState(0)

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (destination.trim()) params.set('ciudad', destination.trim())
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    const query = params.toString()
    navigate(query ? `/properties?${query}` : '/properties')
  }

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await fetchProperties({ limit: 3, sort: 'rating_desc' })
        setPropertyCount(response.total)
        setFeaturedProperties(response.data || [])
      } catch {
        setFeaturedProperties([])
      }
    }

    loadFeatured()
  }, [])

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
            <form className="mini-search-panel" onSubmit={handleSearch}>
              <div className="field">
                <label htmlFor="ms-destination">Dónde</label>
                <input
                  id="ms-destination"
                  type="text"
                  placeholder="Ciudad o zona"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                />
              </div>
              <div className="field-inline">
                <div className="field">
                  <label htmlFor="ms-checkin">In</label>
                  <input
                    id="ms-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="ms-checkout">Out</label>
                  <input
                    id="ms-checkout"
                    type="date"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                  />
                </div>
              </div>
              <button className="button" type="submit">
                Buscar
              </button>
            </form>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-value">{propertyCount > 0 ? `${propertyCount}+` : '3+'}</span>
            <span className="stat-label">Propiedades activas en el catálogo conectado a la API.</span>
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
          {featuredProperties.length > 0 ? (
            featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))
          ) : (
            <p className="state-message">Conecta la API para ver alojamientos destacados.</p>
          )}
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
