import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { createProperty, fetchHostReservations, fetchMyProperties, getApiErrorMessage, togglePropertyActive } from '../services/api'

const HostPage = () => {
  const { token, user } = useAuth()
  const [myProperties, setMyProperties] = useState([])
  const [hostReservations, setHostReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    country: 'México',
    price_per_night: '',
    max_guests: '',
    photo_url: '',
  })

  const loadMyProperties = async () => {
    try {
      setLoading(true)
      const [propertiesResponse, reservationsResponse] = await Promise.all([
        fetchMyProperties(token),
        fetchHostReservations(token),
      ])
      setMyProperties(propertiesResponse.data)
      setHostReservations(reservationsResponse.data)
    } catch {
      setError('No pudimos cargar tus propiedades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyProperties()
  }, [token])

  const handleToggleActive = async (property) => {
    setError('')
    setMessage('')
    try {
      await togglePropertyActive(token, property.id, !property.active)
      setMessage(
        property.active
          ? `"${property.title}" quedó desactivada.`
          : `"${property.title}" quedó activa en el catálogo.`
      )
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos actualizar la propiedad'))
    }
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await createProperty(token, {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
      })
      setMessage('Propiedad publicada correctamente.')
      setForm({
        title: '',
        description: '',
        address: '',
        city: '',
        country: 'México',
        price_per_night: '',
        max_guests: '',
        photo_url: '',
      })
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos publicar la propiedad'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteShell>
      <section className="dashboard-grid">
        <form className="panel-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Panel de anfitrión</span>
          <h1 className="section-title">Publica un hospedaje</h1>
          <p className="page-subtitle">
            Hola {user?.nombre}, completa el formulario para agregar una propiedad al catálogo.
          </p>

          <div className="stack" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="property-name">Nombre de la propiedad</label>
              <input
                id="property-name"
                type="text"
                placeholder="Ej. Loft con terraza"
                value={form.title}
                onChange={updateField('title')}
                required
              />
            </div>
            <div className="split-grid">
              <div className="field">
                <label htmlFor="property-city">Ciudad</label>
                <input
                  id="property-city"
                  type="text"
                  value={form.city}
                  onChange={updateField('city')}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="property-country">País</label>
                <input
                  id="property-country"
                  type="text"
                  value={form.country}
                  onChange={updateField('country')}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="property-address">Dirección</label>
              <input
                id="property-address"
                type="text"
                value={form.address}
                onChange={updateField('address')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="property-description">Descripción</label>
              <textarea
                id="property-description"
                rows="4"
                value={form.description}
                onChange={updateField('description')}
                placeholder="Describe comodidades, ubicación y estilo del alojamiento"
              />
            </div>
            <div className="split-grid">
              <div className="field">
                <label htmlFor="property-price">Precio por noche (MXN)</label>
                <input
                  id="property-price"
                  type="number"
                  min="1"
                  value={form.price_per_night}
                  onChange={updateField('price_per_night')}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="property-guests">Huéspedes máximos</label>
                <input
                  id="property-guests"
                  type="number"
                  min="1"
                  value={form.max_guests}
                  onChange={updateField('max_guests')}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="property-photo">URL de foto (opcional)</label>
              <input
                id="property-photo"
                type="url"
                placeholder="https://..."
                value={form.photo_url}
                onChange={updateField('photo_url')}
              />
            </div>

            {message && <p className="state-message">{message}</p>}
            {error && <p className="state-message state-message-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar propiedad'}
              </button>
              <Link className="button-secondary" to="/properties">
                Ver catálogo
              </Link>
            </div>
          </div>
        </form>

        <aside className="stack">
          <article className="panel-card">
            <h2 className="panel-title">Tus propiedades</h2>
            {loading && <p className="panel-text">Cargando...</p>}
            {!loading && myProperties.length === 0 && (
              <p className="panel-text">Aún no has publicado propiedades.</p>
            )}
            {!loading && myProperties.length > 0 && (
              <div className="stack host-property-list">
                {myProperties.map((property) => (
                  <article className="host-property-item" key={property.id}>
                    <div>
                      <h3 className="panel-title">{property.title}</h3>
                      <p className="card-meta">
                        {property.city}, {property.country}
                      </p>
                      <div className="property-tags">
                        <span className="tag">{property.active ? 'Activa' : 'Inactiva'}</span>
                        <span className="tag">${property.price_per_night} / noche</span>
                      </div>
                    </div>
                    <div className="form-actions">
                      <Link className="button-secondary" to={`/properties/${property.id}`}>
                        Ver
                      </Link>
                      <button
                        className="button"
                        type="button"
                        onClick={() => handleToggleActive(property)}
                      >
                        {property.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
          <article className="panel-card">
            <h2 className="panel-title">Reservas en tus propiedades</h2>
            {hostReservations.length === 0 && (
              <p className="panel-text">Aún no tienes reservas como anfitrión.</p>
            )}
            <div className="admin-table">
              {hostReservations.map((item) => (
                <div className="admin-row" key={item.id}>
                  <span>{item.property_title}</span>
                  <span>{item.guest_name}</span>
                  <span>{item.check_in} → {item.check_out}</span>
                  <span className="tag">{item.status}</span>
                  <Link className="button-secondary" to={`/messages?reserva=${item.id}`}>
                    Mensajes
                  </Link>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </SiteShell>
  )
}

export default HostPage
