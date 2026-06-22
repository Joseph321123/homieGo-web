import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchProperties } from '../services/api'

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const cityQuery = searchParams.get('ciudad') || ''
  const [city, setCity] = useState(cityQuery)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCity(cityQuery)
  }, [cityQuery])

  useEffect(() => {
    let active = true

    const loadProperties = async () => {
      try {
        setLoading(true)
        setError('')
        const params = cityQuery ? { ciudad: cityQuery } : {}
        const response = await fetchProperties(params)
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
  }, [cityQuery])

  const handleSearch = (event) => {
    event.preventDefault()
    if (city.trim()) {
      setSearchParams({ ciudad: city.trim() })
    } else {
      setSearchParams({})
    }
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo conectado</span>
            <h1 className="section-title">Explora propiedades disponibles</h1>
            <p className="page-subtitle">
              Busca por ciudad y abre cada tarjeta para ver el detalle completo.
            </p>
          </div>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="search-city">Ciudad</label>
            <input
              id="search-city"
              type="text"
              placeholder="Ej. Monterrey, Puerto Escondido"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <button className="button" type="submit">
            Buscar
          </button>
          {cityQuery && (
            <button
              className="button-secondary"
              type="button"
              onClick={() => {
                setCity('')
                setSearchParams({})
              }}
            >
              Limpiar
            </button>
          )}
        </form>

        {cityQuery && !loading && !error && (
          <p className="state-message">
            Resultados para: <strong>{cityQuery}</strong> ({properties.length})
          </p>
        )}

        {loading && <p className="state-message">Cargando propiedades...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && properties.length === 0 && (
          <p className="state-message">
            {cityQuery
              ? 'No encontramos propiedades en esa ciudad.'
              : 'Aún no hay propiedades publicadas.'}
          </p>
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
