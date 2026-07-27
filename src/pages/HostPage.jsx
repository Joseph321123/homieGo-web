import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import {
  addPropertyPhoto,
  createProperty,
  fetchAmenities,
  fetchHostReservations,
  fetchHostStats,
  fetchMyProperties,
  fetchMyProperty,
  getApiErrorMessage,
  togglePropertyActive,
  updateProperty,
} from '../services/api'

const emptyForm = {
  title: '',
  description: '',
  address: '',
  city: '',
  country: 'México',
  price_per_night: '',
  max_guests: '',
  photo_url: '',
  amenity_ids: [],
}

const HostPage = () => {
  const { token, user } = useAuth()
  const [myProperties, setMyProperties] = useState([])
  const [hostReservations, setHostReservations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [extraPhotoUrl, setExtraPhotoUrl] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [amenities, setAmenities] = useState([])

  useEffect(() => {
    fetchAmenities()
      .then((response) => setAmenities(response.data || []))
      .catch(() => setAmenities([]))
  }, [])

  const loadMyProperties = async () => {
    try {
      setLoading(true)
      const [propertiesResponse, reservationsResponse, statsResponse] = await Promise.all([
        fetchMyProperties(token),
        fetchHostReservations(token),
        fetchHostStats(token),
      ])
      setMyProperties(propertiesResponse.data)
      setHostReservations(reservationsResponse.data)
      setStats(statsResponse.data)
    } catch {
      setError('No pudimos cargar tus propiedades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyProperties()
  }, [token])

  const handleAddExtraPhoto = async () => {
    if (!editingId || !extraPhotoUrl.trim()) return
    setError('')
    setMessage('')
    try {
      await addPropertyPhoto(token, editingId, { url: extraPhotoUrl, is_primary: false })
      setExtraPhotoUrl('')
      setMessage('Foto agregada a la galería.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos agregar la foto'))
    }
  }

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

  const handleEdit = async (propertyId) => {
    setError('')
    setMessage('')
    try {
      const response = await fetchMyProperty(token, propertyId)
      const property = response.data
      setEditingId(property.id)
      setForm({
        title: property.title || '',
        description: property.description || '',
        address: property.address || '',
        city: property.city || '',
        country: property.country || 'México',
        price_per_night: property.price_per_night || '',
        max_guests: property.max_guests || '',
        photo_url: property.photo_url || '',
        amenity_ids: (property.amenities || []).map((item) => item.id),
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos cargar la propiedad'))
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const toggleAmenity = (amenityId) => {
    setForm((current) => {
      const exists = current.amenity_ids.includes(amenityId)
      return {
        ...current,
        amenity_ids: exists
          ? current.amenity_ids.filter((id) => id !== amenityId)
          : [...current.amenity_ids, amenityId],
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...form,
        price_per_night: Number(form.price_per_night),
        max_guests: Number(form.max_guests),
        amenity_ids: form.amenity_ids,
      }

      if (editingId) {
        await updateProperty(token, editingId, payload)
        setMessage('Propiedad actualizada correctamente.')
      } else {
        await createProperty(token, payload)
        setMessage('Propiedad publicada correctamente.')
      }

      setEditingId(null)
      setForm(emptyForm)
      await loadMyProperties()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          editingId ? 'No pudimos actualizar la propiedad' : 'No pudimos publicar la propiedad'
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteShell>
      <section className="section">
        {stats && (
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <article className="stat-card">
              <span className="stat-value">{stats.active_properties}</span>
              <span className="stat-label">Propiedades activas</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">{stats.confirmed_reservations}</span>
              <span className="stat-label">Reservas confirmadas</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">${Number(stats.earnings).toLocaleString('es-MX')}</span>
              <span className="stat-label">Ganancias aprobadas</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">{stats.average_rating}</span>
              <span className="stat-label">Promedio de reseñas</span>
            </article>
          </div>
        )}

      <section className="dashboard-grid">
        <form className="panel-card" onSubmit={handleSubmit}>
          <span className="eyebrow">Panel de anfitrión</span>
          <h1 className="section-title">
            {editingId ? 'Editar hospedaje' : 'Publica un hospedaje'}
          </h1>
          <p className="page-subtitle">
            Hola {user?.nombre},{' '}
            {editingId
              ? 'modifica los datos de tu propiedad.'
              : 'completa el formulario para agregar una propiedad al catálogo.'}
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

            {amenities.length > 0 && (
              <div className="field">
                <span className="amenities-filter-label">Comodidades</span>
                <div className="amenities-chips" style={{ marginTop: '0.5rem' }}>
                  {amenities.map((amenity) => {
                    const active = form.amenity_ids.includes(amenity.id)
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

            {editingId && (
              <div className="field">
                <label htmlFor="extra-photo">Agregar foto extra a la galería</label>
                <div className="chat-form">
                  <input
                    id="extra-photo"
                    type="url"
                    placeholder="https://..."
                    value={extraPhotoUrl}
                    onChange={(event) => setExtraPhotoUrl(event.target.value)}
                  />
                  <button className="button-secondary" type="button" onClick={handleAddExtraPhoto}>
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {message && <p className="state-message">{message}</p>}
            {error && <p className="state-message state-message-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={submitting}>
                {submitting
                  ? editingId
                    ? 'Guardando...'
                    : 'Publicando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Publicar propiedad'}
              </button>
              {editingId ? (
                <button className="button-secondary" type="button" onClick={cancelEdit}>
                  Cancelar edición
                </button>
              ) : (
                <Link className="button-secondary" to="/properties">
                  Ver catálogo
                </Link>
              )}
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
                      <button className="button-secondary" type="button" onClick={() => handleEdit(property.id)}>
                        Editar
                      </button>
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
      </section>
    </SiteShell>
  )
}

export default HostPage
