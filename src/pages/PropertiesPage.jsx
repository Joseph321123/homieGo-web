import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchProperties } from '../services/api'

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const cityQuery = searchParams.get('ciudad') || ''
  const minPriceQuery = searchParams.get('min_precio') || ''
  const maxPriceQuery = searchParams.get('max_precio') || ''
  const guestsQuery = searchParams.get('huespedes') || ''

  const [filters, setFilters] = useState({
    city: cityQuery,
    min_precio: minPriceQuery,
    max_precio: maxPriceQuery,
    huespedes: guestsQuery,
  })
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setFilters({
      city: cityQuery,
      min_precio: minPriceQuery,
      max_precio: maxPriceQuery,
      huespedes: guestsQuery,
    })
  }, [cityQuery, minPriceQuery, maxPriceQuery, guestsQuery])

  useEffect(() => {
    let active = true

    const loadProperties = async () => {
      try {
        setLoading(true)
        setError('')
        const params = {}
        if (cityQuery) params.ciudad = cityQuery
        if (minPriceQuery) params.min_precio = minPriceQuery
        if (maxPriceQuery) params.max_precio = maxPriceQuery
        if (guestsQuery) params.huespedes = guestsQuery

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
  }, [cityQuery, minPriceQuery, maxPriceQuery, guestsQuery])

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const next = {}
    if (filters.city.trim()) next.ciudad = filters.city.trim()
    if (filters.min_precio) next.min_precio = filters.min_precio
    if (filters.max_precio) next.max_precio = filters.max_precio
    if (filters.huespedes) next.huespedes = filters.huespedes
    setSearchParams(next)
  }

  const clearFilters = () => {
    setFilters({ city: '', min_precio: '', max_precio: '', huespedes: '' })
    setSearchParams({})
  }

  const hasFilters = cityQuery || minPriceQuery || maxPriceQuery || guestsQuery

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo conectado</span>
            <h1 className="section-title">Explora propiedades disponibles</h1>
            <p className="page-subtitle">
              Filtra por ciudad, precio y capacidad de huéspedes.
            </p>
          </div>
        </div>

        <form className="search-bar filters-bar" onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="search-city">Ciudad</label>
            <input
              id="search-city"
              type="text"
              placeholder="Ej. Monterrey"
              value={filters.city}
              onChange={updateFilter('city')}
            />
          </div>
          <div className="field">
            <label htmlFor="min-price">Precio mínimo</label>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder="500"
              value={filters.min_precio}
              onChange={updateFilter('min_precio')}
            />
          </div>
          <div className="field">
            <label htmlFor="max-price">Precio máximo</label>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="2000"
              value={filters.max_precio}
              onChange={updateFilter('max_precio')}
            />
          </div>
          <div className="field">
            <label htmlFor="guests-filter">Huéspedes</label>
            <input
              id="guests-filter"
              type="number"
              min="1"
              placeholder="2"
              value={filters.huespedes}
              onChange={updateFilter('huespedes')}
            />
          </div>
          <button className="button" type="submit">
            Buscar
          </button>
          {hasFilters && (
            <button className="button-secondary" type="button" onClick={clearFilters}>
              Limpiar
            </button>
          )}
        </form>

        {hasFilters && !loading && !error && (
          <p className="state-message">
            Resultados filtrados: <strong>{properties.length}</strong>
          </p>
        )}

        {loading && <p className="state-message">Cargando propiedades...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && properties.length === 0 && (
          <p className="state-message">
            {hasFilters
              ? 'No encontramos propiedades con esos filtros.'
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
