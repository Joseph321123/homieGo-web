import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { fetchAmenities, fetchProperties } from '../services/api'

const SORT_OPTIONS = [
  { value: 'id', label: 'Relevancia' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'rating_desc', label: 'Mejor calificación' },
  { value: 'newest', label: 'Más recientes' },
]

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const cityQuery = searchParams.get('ciudad') || ''
  const minPriceQuery = searchParams.get('min_precio') || ''
  const maxPriceQuery = searchParams.get('max_precio') || ''
  const guestsQuery = searchParams.get('huespedes') || ''
  const checkInQuery = searchParams.get('check_in') || ''
  const checkOutQuery = searchParams.get('check_out') || ''
  const amenitiesQuery = searchParams.get('amenities') || ''
  const sortQuery = searchParams.get('sort') || 'id'
  const pageQuery = Number(searchParams.get('page') || 1)

  const selectedAmenities = amenitiesQuery
    ? amenitiesQuery.split(',').map(Number).filter(Boolean)
    : []

  const [filters, setFilters] = useState({
    city: cityQuery,
    min_precio: minPriceQuery,
    max_precio: maxPriceQuery,
    huespedes: guestsQuery,
    check_in: checkInQuery,
    check_out: checkOutQuery,
    amenities: selectedAmenities,
    sort: sortQuery,
  })
  const [amenities, setAmenities] = useState([])
  const [properties, setProperties] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAmenities()
      .then((response) => setAmenities(response.data || []))
      .catch(() => setAmenities([]))
  }, [])

  useEffect(() => {
    setFilters({
      city: cityQuery,
      min_precio: minPriceQuery,
      max_precio: maxPriceQuery,
      huespedes: guestsQuery,
      check_in: checkInQuery,
      check_out: checkOutQuery,
      amenities: selectedAmenities,
      sort: sortQuery,
    })
  }, [
    cityQuery,
    minPriceQuery,
    maxPriceQuery,
    guestsQuery,
    checkInQuery,
    checkOutQuery,
    amenitiesQuery,
    sortQuery,
  ])

  useEffect(() => {
    let active = true

    const loadProperties = async () => {
      try {
        setLoading(true)
        setError('')
        const params = { page: pageQuery, limit: 9, sort: sortQuery }
        if (cityQuery) params.ciudad = cityQuery
        if (minPriceQuery) params.min_precio = minPriceQuery
        if (maxPriceQuery) params.max_precio = maxPriceQuery
        if (guestsQuery) params.huespedes = guestsQuery
        if (checkInQuery) params.check_in = checkInQuery
        if (checkOutQuery) params.check_out = checkOutQuery
        if (amenitiesQuery) params.amenities = amenitiesQuery

        const response = await fetchProperties(params)
        if (active) {
          setProperties(response.data || [])
          setMeta({
            total: response.total || 0,
            page: response.page || 1,
            total_pages: response.total_pages || 1,
          })
        }
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
  }, [
    cityQuery,
    minPriceQuery,
    maxPriceQuery,
    guestsQuery,
    checkInQuery,
    checkOutQuery,
    amenitiesQuery,
    sortQuery,
    pageQuery,
  ])

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }))
  }

  const toggleAmenity = (amenityId) => {
    setFilters((current) => {
      const exists = current.amenities.includes(amenityId)
      return {
        ...current,
        amenities: exists
          ? current.amenities.filter((id) => id !== amenityId)
          : [...current.amenities, amenityId],
      }
    })
  }

  const buildParams = (overrides = {}) => {
    const next = {}
    const city = overrides.city ?? filters.city
    const min = overrides.min_precio ?? filters.min_precio
    const max = overrides.max_precio ?? filters.max_precio
    const guests = overrides.huespedes ?? filters.huespedes
    const checkIn = overrides.check_in ?? filters.check_in
    const checkOut = overrides.check_out ?? filters.check_out
    const amenityIds = overrides.amenities ?? filters.amenities
    const sort = overrides.sort ?? filters.sort
    const page = overrides.page ?? 1

    if (city.trim()) next.ciudad = city.trim()
    if (min) next.min_precio = min
    if (max) next.max_precio = max
    if (guests) next.huespedes = guests
    if (checkIn) next.check_in = checkIn
    if (checkOut) next.check_out = checkOut
    if (amenityIds.length) next.amenities = amenityIds.join(',')
    if (sort && sort !== 'id') next.sort = sort
    if (page > 1) next.page = String(page)
    return next
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setSearchParams(buildParams({ page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      city: '',
      min_precio: '',
      max_precio: '',
      huespedes: '',
      check_in: '',
      check_out: '',
      amenities: [],
      sort: 'id',
    })
    setSearchParams({})
  }

  const hasFilters =
    cityQuery ||
    minPriceQuery ||
    maxPriceQuery ||
    guestsQuery ||
    checkInQuery ||
    checkOutQuery ||
    amenitiesQuery ||
    (sortQuery && sortQuery !== 'id')

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo conectado</span>
            <h1 className="section-title">Explora propiedades disponibles</h1>
            <p className="page-subtitle">
              Filtra por ciudad, fechas, precio, capacidad, comodidades y ordenamiento.
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
            <label htmlFor="check-in-filter">Entrada</label>
            <input
              id="check-in-filter"
              type="date"
              value={filters.check_in}
              onChange={updateFilter('check_in')}
            />
          </div>
          <div className="field">
            <label htmlFor="check-out-filter">Salida</label>
            <input
              id="check-out-filter"
              type="date"
              value={filters.check_out}
              onChange={updateFilter('check_out')}
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
          <div className="field">
            <label htmlFor="sort-filter">Ordenar por</label>
            <select id="sort-filter" value={filters.sort} onChange={updateFilter('sort')}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

        {amenities.length > 0 && (
          <div className="amenities-filter">
            <p className="amenities-filter-label">Comodidades</p>
            <div className="amenities-chips">
              {amenities.map((amenity) => {
                const active = filters.amenities.includes(amenity.id)
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    className={active ? 'amenity-chip amenity-chip-active' : 'amenity-chip'}
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    {amenity.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!loading && !error && (
          <p className="state-message">
            {meta.total} resultado{meta.total === 1 ? '' : 's'}
            {hasFilters ? ' con los filtros actuales' : ''}
            {meta.total_pages > 1 ? ` · Página ${meta.page} de ${meta.total_pages}` : ''}
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

        {meta.total_pages > 1 && (
          <div className="pagination-bar">
            <button
              className="button-secondary"
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setSearchParams(buildParams({ page: meta.page - 1 }))}
            >
              Anterior
            </button>
            <span className="card-meta">
              Página {meta.page} de {meta.total_pages}
            </span>
            <button
              className="button-secondary"
              type="button"
              disabled={meta.page >= meta.total_pages}
              onClick={() => setSearchParams(buildParams({ page: meta.page + 1 }))}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default PropertiesPage
