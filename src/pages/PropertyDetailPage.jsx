import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import {
  addFavorite,
  checkPropertyAvailability,
  createReservation,
  fetchFavoriteIds,
  fetchPropertyById,
  fetchPropertyReviews,
  getApiErrorMessage,
  removeFavorite,
} from '../services/api'

const PropertyDetailPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState({ items: [], average: null, total: 0 })
  const [activePhoto, setActivePhoto] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [availabilityNote, setAvailabilityNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState({
    check_in: searchParams.get('check_in') || '',
    check_out: searchParams.get('check_out') || '',
    guests: Number(searchParams.get('huespedes') || 1),
  })
  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    setBooking((current) => ({
      ...current,
      check_in: searchParams.get('check_in') || current.check_in,
      check_out: searchParams.get('check_out') || current.check_out,
      guests: Number(searchParams.get('huespedes') || current.guests || 1),
    }))
  }, [searchParams])

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
          setActivePhoto(
            propertyResponse.data.photos?.[0]?.url || propertyResponse.data.photo_url || ''
          )
        }

        if (isAuthenticated && token) {
          const favoritesResponse = await fetchFavoriteIds(token)
          if (active) {
            setIsFavorite(favoritesResponse.data.map(String).includes(String(id)))
          }
        } else if (active) {
          setIsFavorite(false)
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
  }, [id, isAuthenticated, token])

  useEffect(() => {
    const verifyDates = async () => {
      if (!booking.check_in || !booking.check_out) {
        setAvailabilityNote('')
        return
      }

      try {
        const response = await checkPropertyAvailability(id, booking.check_in, booking.check_out)
        setAvailabilityNote(
          response.data.available
            ? 'Fechas disponibles para reservar.'
            : 'Esas fechas ya están ocupadas.'
        )
      } catch {
        setAvailabilityNote('')
      }
    }

    verifyDates()
  }, [id, booking.check_in, booking.check_out])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } })
      return
    }

    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        await removeFavorite(token, id)
        setIsFavorite(false)
      } else {
        await addFavorite(token, id)
        setIsFavorite(true)
      }
    } catch (err) {
      setBookingError(getApiErrorMessage(err, 'No pudimos actualizar favoritos'))
    } finally {
      setFavoriteLoading(false)
    }
  }

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
      const availability = await checkPropertyAvailability(id, booking.check_in, booking.check_out)
      if (!availability.data.available) {
        setBookingError('Las fechas seleccionadas no están disponibles')
        return
      }

      await createReservation(token, {
        property_id: Number(id),
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests: Number(booking.guests),
      })
      setBookingMessage(
        'Solicitud enviada. El anfitrión debe aceptarla antes de que puedas pagar (escrow).'
      )
    } catch (err) {
      setBookingError(getApiErrorMessage(err, 'No pudimos completar la reserva'))
    } finally {
      setBookingLoading(false)
    }
  }

  const photos = property?.photos?.length
    ? property.photos
    : property?.photo_url
      ? [{ id: 'main', url: property.photo_url }]
      : []

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
              className={`property-detail-photo${activePhoto ? ' property-photo-image' : ''}`}
              style={
                activePhoto
                  ? { backgroundImage: `url(${activePhoto})` }
                  : { '--photo': 'linear-gradient(135deg, #002862, #1383f9)' }
              }
            />

            {photos.length > 1 && (
              <div className="photo-thumbs">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`photo-thumb${activePhoto === photo.url ? ' photo-thumb-active' : ''}`}
                    style={{ backgroundImage: `url(${photo.url})` }}
                    onClick={() => setActivePhoto(photo.url)}
                    aria-label="Cambiar foto"
                  />
                ))}
              </div>
            )}

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
                  {property.rating_avg != null && (
                    <span className="rating-pill">
                      ★ {Number(property.rating_avg).toFixed(1)}
                      {property.reviews_count ? ` · ${property.reviews_count}` : ''}
                    </span>
                  )}
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading
                      ? 'Guardando...'
                      : isFavorite
                        ? 'Quitar de favoritos'
                        : 'Guardar en favoritos'}
                  </button>
                </div>

                <article className="panel-card" style={{ marginTop: '1.5rem' }}>
                  <h2 className="panel-title">Descripción</h2>
                  <p className="panel-text">{property.description}</p>
                </article>

                {property.house_rules && (
                  <article className="panel-card" style={{ marginTop: '1rem' }}>
                    <h2 className="panel-title">Reglas de la casa</h2>
                    <p className="panel-text">{property.house_rules}</p>
                  </article>
                )}

                {(property.amenities || []).length > 0 && (
                  <article className="panel-card" style={{ marginTop: '1rem' }}>
                    <h2 className="panel-title">Comodidades</h2>
                    <div className="property-tags">
                      {property.amenities.map((amenity) => (
                        <span className="tag" key={amenity.id}>
                          {amenity.name}
                        </span>
                      ))}
                    </div>
                  </article>
                )}

                <article className="panel-card" style={{ marginTop: '1rem' }}>
                  <h2 className="panel-title">Ubicación</h2>
                  <p className="panel-text">{property.address}</p>
                  <p className="card-meta">
                    {property.city}, {property.country}
                    {property.host_identity_status === 'verificada' && ' · Anfitrión verificado'}
                  </p>
                  {property.latitude != null && property.longitude != null && (
                    <div className="property-map">
                      <iframe
                        title={`Mapa de ${property.title}`}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                          Number(property.longitude) - 0.02
                        }%2C${Number(property.latitude) - 0.015}%2C${
                          Number(property.longitude) + 0.02
                        }%2C${Number(property.latitude) + 0.015}&layer=mapnik&marker=${
                          property.latitude
                        }%2C${property.longitude}`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <a
                        className="button-secondary"
                        href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=15/${property.latitude}/${property.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir mapa
                      </a>
                    </div>
                  )}
                </article>

                <article className="panel-card" style={{ marginTop: '1rem' }}>
                  <h2 className="panel-title">Disponibilidad</h2>
                  {(property.blocked_dates || []).length === 0 ? (
                    <p className="panel-text">Sin fechas bloqueadas próximas.</p>
                  ) : (
                    <div className="property-tags">
                      {property.blocked_dates.map((range) => (
                        <span className="tag" key={`${range.check_in}-${range.check_out}`}>
                          {range.check_in} → {range.check_out} ({range.status})
                        </span>
                      ))}
                    </div>
                  )}
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

                  {availabilityNote && <p className="state-message">{availabilityNote}</p>}
                  {bookingMessage && <p className="state-message">{bookingMessage}</p>}
                  {bookingError && (
                    <p className="state-message state-message-error">{bookingError}</p>
                  )}

                  <button className="button" type="submit" disabled={bookingLoading}>
                    {bookingLoading
                      ? 'Reservando...'
                      : isAuthenticated
                        ? 'Solicitar reserva'
                        : 'Inicia sesión para reservar'}
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
