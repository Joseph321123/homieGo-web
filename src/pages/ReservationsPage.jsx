import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { formatPrice } from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import {
  cancelReservation,
  createReview,
  fetchMyReservations,
  getApiErrorMessage,
  payReservation,
} from '../services/api'
import { formatPaymentStatus, formatReservationStatus } from '../utils/labels'

const ReservationsPage = () => {
  const { token } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [reviewForms, setReviewForms] = useState({})

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchMyReservations(token)
      setReservations(response.data)
    } catch {
      setError('No pudimos cargar tus reservas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [token])

  const handlePay = async (reservation) => {
    const confirmed = window.confirm(
      `¿Confirmas el pago de ${formatPrice(reservation.total)} con tarjeta (demo)?`
    )
    if (!confirmed) return

    setActionMessage('')
    try {
      await payReservation(token, reservation.id, 'tarjeta')
      setActionMessage('Pago confirmado. Tu reserva está activa.')
      await loadReservations()
    } catch (err) {
      setActionMessage(getApiErrorMessage(err, 'No pudimos procesar el pago'))
    }
  }

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm('¿Seguro que quieres cancelar esta reservación?')
    if (!confirmed) return

    setActionMessage('')
    try {
      await cancelReservation(token, reservationId)
      setActionMessage('Reservación cancelada.')
      await loadReservations()
    } catch (err) {
      setActionMessage(getApiErrorMessage(err, 'No pudimos cancelar la reserva'))
    }
  }

  const handleReview = async (reservationId) => {
    const form = reviewForms[reservationId]
    if (!form?.rating) return

    setActionMessage('')
    try {
      await createReview(token, {
        reservation_id: reservationId,
        rating: Number(form.rating),
        comment: form.comment,
      })
      setActionMessage('Gracias por tu reseña.')
      await loadReservations()
    } catch (err) {
      setActionMessage(getApiErrorMessage(err, 'No pudimos guardar la reseña'))
    }
  }

  const updateReviewForm = (reservationId, field, value) => {
    setReviewForms((current) => ({
      ...current,
      [reservationId]: { ...current[reservationId], [field]: value },
    }))
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tus viajes</span>
            <h1 className="section-title">Mis reservaciones</h1>
            <p className="page-subtitle">
              Paga, cancela o deja una reseña sobre tus hospedajes.
            </p>
          </div>
        </div>

        {actionMessage && <p className="state-message">{actionMessage}</p>}
        {loading && <p className="state-message">Cargando reservas...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && reservations.length === 0 && (
          <div className="empty-panel">
            <p className="state-message">Aún no tienes reservas. Explora el catálogo y elige tu próxima estancia.</p>
            <Link className="button" to="/properties">
              Explorar propiedades
            </Link>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="reservation-list">
            {reservations.map((reservation) => (
              <article className="panel-card reservation-card reservation-card-wide" key={reservation.id}>
                <div
                  className={`reservation-photo${reservation.photo_url ? ' property-photo-image' : ''}`}
                  style={
                    reservation.photo_url
                      ? { backgroundImage: `url(${reservation.photo_url})` }
                      : { '--photo': 'linear-gradient(135deg, #002862, #1383f9)' }
                  }
                />
                <div className="stack">
                  <div>
                    <h2 className="panel-title">{reservation.property_title}</h2>
                    <p className="card-meta">
                      {reservation.city}, {reservation.country}
                    </p>
                  </div>
                  <div className="property-tags">
                    <span className="tag">
                      {reservation.check_in} → {reservation.check_out}
                    </span>
                    <span className="tag">{reservation.guests} huéspedes</span>
                    <span className="tag">{formatReservationStatus(reservation.status)}</span>
                    <span className="tag">
                      Pago: {formatPaymentStatus(reservation.payment_status)}
                    </span>
                  </div>
                  <strong>{formatPrice(reservation.total)}</strong>

                  <div className="form-actions">
                    {reservation.status === 'pendiente' && (
                      <>
                        <button
                          className="button"
                          type="button"
                          onClick={() => handlePay(reservation)}
                        >
                          Pagar con tarjeta
                        </button>
                        <button
                          className="button-secondary"
                          type="button"
                          onClick={() => handleCancel(reservation.id)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {reservation.status === 'confirmada' && (
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        Cancelar reserva
                      </button>
                    )}
                    <Link className="button-secondary" to={`/messages?reserva=${reservation.id}`}>
                      Mensajes
                    </Link>
                  </div>

                  {reservation.status === 'confirmada' && !reservation.has_review && (
                    <div className="review-form stack">
                      <h3 className="panel-title">Deja tu reseña</h3>
                      <div className="field">
                        <label htmlFor={`rating-${reservation.id}`}>Calificación (1-5)</label>
                        <input
                          id={`rating-${reservation.id}`}
                          type="number"
                          min="1"
                          max="5"
                          value={reviewForms[reservation.id]?.rating || ''}
                          onChange={(event) =>
                            updateReviewForm(reservation.id, 'rating', event.target.value)
                          }
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`comment-${reservation.id}`}>Comentario</label>
                        <textarea
                          id={`comment-${reservation.id}`}
                          rows="3"
                          value={reviewForms[reservation.id]?.comment || ''}
                          onChange={(event) =>
                            updateReviewForm(reservation.id, 'comment', event.target.value)
                          }
                        />
                      </div>
                      <button className="button" type="button" onClick={() => handleReview(reservation.id)}>
                        Publicar reseña
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default ReservationsPage
