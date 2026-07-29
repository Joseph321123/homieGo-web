import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { fetchProperties } from '../services/api'

const destinations = [
  { label: 'Playa', city: 'Puerto Escondido', hint: 'Costa y terraza' },
  { label: 'Ciudad', city: 'Monterrey', hint: 'Centro y suites' },
  { label: 'Naturaleza', city: 'Aguascalientes', hint: 'Cabañas tranquilas' },
]

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1800&q=80'

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isHost } = useAuth()
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [propertyCount, setPropertyCount] = useState(0)
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (destination.trim()) params.set('ciudad', destination.trim())
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    const query = params.toString()
    navigate(query ? `/properties?${query}` : '/properties')
  }

  const goToDestination = (city) => {
    navigate(`/properties?ciudad=${encodeURIComponent(city)}`)
  }

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoadingFeatured(true)
        const response = await fetchProperties({ limit: 3, sort: 'rating_desc' })
        setPropertyCount(response.total || 0)
        setFeaturedProperties(response.data || [])
      } catch {
        setFeaturedProperties([])
        setPropertyCount(0)
      } finally {
        setLoadingFeatured(false)
      }
    }

    loadFeatured()
  }, [])

  return (
    <SiteShell wide>
      <section
        className="home-hero"
        style={{ backgroundImage: `linear-gradient(120deg, rgba(0, 30, 70, 0.78), rgba(0, 40, 98, 0.45)), url(${HERO_IMAGE})` }}
      >
        <div className="home-hero-inner">
          <div className="home-hero-brand-row">
            <img
              className="home-hero-icon"
              src="/brand/homiego-icon.png"
              alt=""
              width="88"
              height="116"
            />
            <div className="home-hero-wordmark">
              <p className="home-hero-brand">
                <span className="brand-name-homie">HOMIE</span>
                <span className="brand-name-go">GO</span>
              </p>
              <p className="home-hero-tagline">Hospedajes simples y confiables</p>
            </div>
          </div>
          <h1 className="home-hero-title">Encuentra tu próximo hospedaje</h1>
          <p className="home-hero-copy">
            Reserva casas, suites y cabañas en México con confianza: fechas claras, anfitriones reales
            y pago seguro en un solo lugar.
          </p>

          <div className="home-hero-actions">
            <Link className="button" to="/properties">
              Explorar alojamientos
            </Link>
            <Link className="button-secondary home-hero-secondary" to={isHost ? '/host' : isAuthenticated ? '/profile' : '/register'}>
              {isHost ? 'Ir a mi panel' : 'Ser anfitrión'}
            </Link>
          </div>

          <form className="home-search" onSubmit={handleSearch} aria-label="Buscar hospedaje">
            <div className="field">
              <label htmlFor="ms-destination">Destino</label>
              <input
                id="ms-destination"
                type="text"
                placeholder="Ciudad o zona"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="ms-checkin">Entrada</label>
              <input
                id="ms-checkin"
                type="date"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="ms-checkout">Salida</label>
              <input
                id="ms-checkout"
                type="date"
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>
            <button className="button" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Destinos destacados</span>
            <h2 className="section-title">Empieza por un tipo de viaje</h2>
            <p className="page-subtitle">
              Elige playa, ciudad o naturaleza y te llevamos al catálogo filtrado.
            </p>
          </div>
        </div>
        <div className="destination-row">
          {destinations.map((item) => (
            <button
              key={item.city}
              type="button"
              className="destination-chip"
              onClick={() => goToDestination(item.city)}
            >
              <strong>{item.label}</strong>
              <span>{item.city}</span>
              <span className="card-meta">{item.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catálogo vivo</span>
            <h2 className="section-title">Alojamientos destacados</h2>
            <p className="page-subtitle">
              {propertyCount > 0
                ? `${propertyCount} propiedades activas. Estas son algunas de las mejor valoradas.`
                : 'Explora el catálogo cuando la API esté disponible.'}
            </p>
          </div>
          <Link className="button-secondary" to="/properties">
            Ver todas
          </Link>
        </div>

        {loadingFeatured && <p className="state-message">Cargando destacados...</p>}

        {!loadingFeatured && featuredProperties.length === 0 && (
          <div className="empty-panel">
            <p className="state-message">Todavía no hay alojamientos para mostrar.</p>
            <Link className="button" to="/properties">
              Ir al catálogo
            </Link>
          </div>
        )}

        {!loadingFeatured && featuredProperties.length > 0 && (
          <div className="property-grid">
            {featuredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="section home-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Cómo funciona</span>
            <h2 className="section-title">De la búsqueda a la llegada</h2>
            <p className="page-subtitle">
              Tres pasos simples para huéspedes y anfitriones.
            </p>
          </div>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-value">01</span>
            <span className="stat-label">Busca por ciudad, fechas, precio o comodidades.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">02</span>
            <span className="stat-label">Reserva, paga y confirma tu estancia en minutos.</span>
          </article>
          <article className="stat-card">
            <span className="stat-value">03</span>
            <span className="stat-label">Coordina con mensajes y deja tu reseña al terminar.</span>
          </article>
        </div>
      </section>

      <section className="section home-section home-cta-band">
        <div>
          <h2 className="section-title">¿Tienes un espacio libre?</h2>
          <p className="page-subtitle">
            Publica tu propiedad, administra reservas y recibe huéspedes desde el panel de anfitrión.
          </p>
        </div>
        <Link className="button" to={isHost ? '/host' : isAuthenticated ? '/profile' : '/register'}>
          {isHost ? 'Abrir panel de anfitrión' : 'Empezar a hospedar'}
        </Link>
      </section>
    </SiteShell>
  )
}

export default HomePage
