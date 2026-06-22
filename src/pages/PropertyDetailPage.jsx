import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchPropertyById } from '../services/api'

const PropertyDetailPage = () => {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProperty = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchPropertyById(id)
        if (active) setProperty(response.data)
      } catch {
        if (active) setError('No encontramos esta propiedad o la API no está disponible.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProperty()

    return () => {
      active = false
    }
  }, [id])

  return (
    <SiteShell>
      <section className="section">
        <Link className="button-secondary detail-back-link" to="/properties">
          Volver al catálogo
        </Link>

        {loading && <p className="state-message">Cargando propiedad...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && property && (
          <div className="property-detail">
            <div
              className={`property-detail-photo${property.photo_url ? ' property-photo-image' : ''}`}
              style={
                property.photo_url
                  ? { backgroundImage: `url(${property.photo_url})` }
                  : { '--photo': 'linear-gradient(135deg, #002862, #1383f9)' }
              }
            />

            <div className="property-detail-content">
              <span className="eyebrow">Detalle del alojamiento</span>
              <h1 className="section-title">{property.title}</h1>
              <p className="card-meta">
                {property.city}, {property.country} · Anfitriona: {property.host_name}
              </p>

              <div className="property-tags" style={{ marginTop: '1rem' }}>
                <span className="tag">{property.max_guests} huéspedes</span>
                <span className="tag">{formatPrice(property.price_per_night)} / noche</span>
              </div>

              <article className="panel-card" style={{ marginTop: '1.5rem' }}>
                <h2 className="panel-title">Descripción</h2>
                <p className="panel-text">{property.description}</p>
              </article>

              <article className="panel-card" style={{ marginTop: '1rem' }}>
                <h2 className="panel-title">Ubicación</h2>
                <p className="panel-text">{property.address}</p>
                <p className="card-meta">
                  {property.city}, {property.country}
                </p>
              </article>

              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button className="button" type="button" disabled>
                  Reservar (próximamente)
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default PropertyDetailPage
