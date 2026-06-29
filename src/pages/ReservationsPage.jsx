import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { formatPrice } from '../components/PropertyCard'
import { useAuth } from '../context/AuthContext'
import { fetchMyReservations } from '../services/api'

const ReservationsPage = () => {
  const { token } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadReservations = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchMyReservations(token)
        if (active) setReservations(response.data)
      } catch {
        if (active) setError('No pudimos cargar tus reservas.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadReservations()

    return () => {
      active = false
    }
  }, [token])

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tus viajes</span>
            <h1 className="section-title">Mis reservaciones</h1>
            <p className="page-subtitle">
              Historial de hospedajes reservados en HomieGo.
            </p>
          </div>
        </div>

        {loading && <p className="state-message">Cargando reservas...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && reservations.length === 0 && (
          <div className="stack">
            <p className="state-message">Aún no tienes reservas.</p>
            <Link className="button" to="/properties">
              Explorar propiedades
            </Link>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="reservation-list">
            {reservations.map((reservation) => (
              <article className="panel-card reservation-card" key={reservation.id}>
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
                    <span className="tag">{reservation.status}</span>
                  </div>
                  <strong>{formatPrice(reservation.total)}</strong>
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
