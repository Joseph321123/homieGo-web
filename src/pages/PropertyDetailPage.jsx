import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatPrice } from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { createReservation, fetchPropertyById, fetchPropertyReviews, getApiErrorMessage } from '../services/api'

const PropertyDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState({ items: [], average: null, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1 })
  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadProperty = async () => {
      try {
        setLoading(true)
        setError('')
        const [propertyResponse, reviewsResponse] = await Promise.all([
          fetchPropertyById(id),
          fetchPropertyReviews(id),
        ])
        if (active) {
          setProperty(propertyResponse.data)
          setReviews(reviewsResponse.data)
        }
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

  const handleBooking = async (event) => {
    event.preventDefault()
    setBookingError('')
    setBookingMessage('')

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } })
      return
    }

    setBookingLoading(true)
    try {
      await createReservation(token, {
        property_id: Number(id),
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests: Number(booking.guests),
      })
      setBookingMessage('Reserva creada. Ve a Mis reservaciones para pagar y confirmar.')
    } catch (err) {
      setBookingError(getApiErrorMessage(err, 'No pudimos completar la reserva'))
    } finally {
      setBookingLoading(false)
    }
  }

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

            <div className="property-detail-layout">
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

                <article className="panel-card" style={{ marginTop: '1rem' }}>
                  <h2 className="panel-title">
                    Reseñas {reviews.average ? `· ${reviews.average}/5` : ''}
                  </h2>
                  {reviews.total === 0 && (
                    <p className="panel-text">Esta propiedad aún no tiene reseñas.</p>
                  )}
                  <div className="review-list">
                    {reviews.items.map((review) => (
                      <div className="review-item" key={review.id}>
                        <strong>{review.author_name}</strong>
                        <span className="tag">{review.rating}/5</span>
                        <p className="panel-text">{review.comment || 'Sin comentario'}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <aside className="panel-card booking-panel">
                <h2 className="panel-title">Reservar</h2>
                <p className="panel-text">
                  {formatPrice(property.price_per_night)} por noche · máximo {property.max_guests}{' '}
                  huéspedes
                </p>

                <form className="stack" onSubmit={handleBooking} style={{ marginTop: '1rem' }}>
                  <div className="field">
                    <label htmlFor="check-in">Entrada</label>
                    <input
                      id="check-in"
                      type="date"
                      value={booking.check_in}
                      onChange={(event) =>
                        setBooking((current) => ({ ...current, check_in: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="check-out">Salida</label>
                    <input
                      id="check-out"
                      type="date"
                      value={booking.check_out}
                      onChange={(event) =>
                        setBooking((current) => ({ ...current, check_out: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="guests">Huéspedes</label>
                    <input
                      id="guests"
                      type="number"
                      min="1"
                      max={property.max_guests}
                      value={booking.guests}
                      onChange={(event) =>
                        setBooking((current) => ({ ...current, guests: event.target.value }))
                      }
                      required
                    />
                  </div>

                  {bookingMessage && <p className="state-message">{bookingMessage}</p>}
                  {bookingError && (
                    <p className="state-message state-message-error">{bookingError}</p>
                  )}

                  <button className="button" type="submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Reservando...' : isAuthenticated ? 'Solicitar reserva' : 'Inicia sesión para reservar'}
                  </button>

                  {bookingMessage && (
                    <Link className="button-secondary" to="/reservations">
                      Ver mis reservaciones
                    </Link>
                  )}
                </form>
              </aside>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default PropertyDetailPage
