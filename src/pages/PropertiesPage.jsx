import { useEffect, useState } from 'react'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchProperties } from '../services/api'

const PropertiesPage = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProperties = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchProperties()
        if (active) setProperties(response.data)
      } catch {
        if (active) {
          setError('No pudimos cargar las propiedades. Verifica que la API esté corriendo.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProperties()

    return () => {
      active = false
    }
  }, [])

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo conectado</span>
            <h1 className="section-title">Explora propiedades disponibles</h1>
            <p className="page-subtitle">
              Listado obtenido desde la API y la base de datos PostgreSQL de HomieGo.
            </p>
          </div>
        </div>

        {loading && <p className="state-message">Cargando propiedades...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && properties.length === 0 && (
          <p className="state-message">Aún no hay propiedades publicadas.</p>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="property-grid">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default PropertiesPage
