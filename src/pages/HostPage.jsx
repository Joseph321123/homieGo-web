import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import {
  acceptReservation,
  addPropertyPhoto,
  createProperty,
  createPropertyBlock,
  createReview,
  fetchAmenities,
  fetchHostReservations,
  fetchHostStats,
  fetchMyProperties,
  fetchMyProperty,
  fetchPropertyBlocks,
  getApiErrorMessage,
  rejectReservation,
  releaseEscrow,
  removePropertyBlock,
  togglePropertyActive,
  updateProperty,
} from '../services/api'
import { formatPaymentStatus, formatReservationStatus } from '../utils/labels'

const emptyForm = {
  title: '',
  description: '',
  address: '',
  city: '',
  country: 'México',
  price_per_night: '',
  max_guests: '',
  photo_url: '',
  house_rules: '',
  latitude: '',
  longitude: '',
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
  const [blockForm, setBlockForm] = useState({
    property_id: '',
    check_in: '',
    check_out: '',
    reason: '',
  })
  const [blocks, setBlocks] = useState([])
  const [reviewForms, setReviewForms] = useState({})

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
      if (!blockForm.property_id && propertiesResponse.data[0]) {
        setBlockForm((current) => ({
          ...current,
          property_id: String(propertiesResponse.data[0].id),
        }))
      }
    } catch {
      setError('No pudimos cargar tus propiedades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyProperties()
  }, [token])

  useEffect(() => {
    const loadBlocks = async () => {
      if (!blockForm.property_id) {
        setBlocks([])
        return
      }
      try {
        const response = await fetchPropertyBlocks(token, blockForm.property_id)
        setBlocks(response.data || [])
      } catch {
        setBlocks([])
      }
    }
    loadBlocks()
  }, [token, blockForm.property_id])

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
        house_rules: property.house_rules || '',
        latitude: property.latitude ?? '',
        longitude: property.longitude ?? '',
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
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
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

  const handleAccept = async (id) => {
    setMessage('')
    try {
      await acceptReservation(token, id)
      setMessage('Reserva aceptada. El huésped ya puede pagar.')
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos aceptar la reserva'))
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('¿Rechazar esta solicitud?')) return
    setMessage('')
    try {
      await rejectReservation(token, id)
      setMessage('Solicitud rechazada.')
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos rechazar la reserva'))
    }
  }

  const handleRelease = async (id) => {
    setMessage('')
    try {
      await releaseEscrow(token, id)
      setMessage('Pago liberado al anfitrión.')
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos liberar el escrow'))
    }
  }

  const handleCreateBlock = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await createPropertyBlock(token, blockForm.property_id, {
        check_in: blockForm.check_in,
        check_out: blockForm.check_out,
        reason: blockForm.reason,
      })
      setBlockForm((current) => ({ ...current, check_in: '', check_out: '', reason: '' }))
      setMessage('Fechas bloqueadas en el calendario.')
      const response = await fetchPropertyBlocks(token, blockForm.property_id)
      setBlocks(response.data || [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos bloquear las fechas'))
    }
  }

  const handleRemoveBlock = async (blockId) => {
    try {
      await removePropertyBlock(token, blockId)
      const response = await fetchPropertyBlocks(token, blockForm.property_id)
      setBlocks(response.data || [])
      setMessage('Bloqueo eliminado.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos eliminar el bloqueo'))
    }
  }

  const handleHostReview = async (reservationId) => {
    const formData = reviewForms[reservationId]
    if (!formData?.rating) return
    try {
      await createReview(token, {
        reservation_id: reservationId,
        rating: Number(formData.rating),
        comment: formData.comment,
      })
      setMessage('Reseña del huésped publicada.')
      await loadMyProperties()
    } catch (err) {
      setError(getApiErrorMessage(err, 'No pudimos guardar la reseña'))
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
              <span className="stat-label">Ganancias liberadas</span>
            </article>
            <article className="stat-card">
              <span className="stat-value">
                ${Number(stats.escrow_held || 0).toLocaleString('es-MX')}
              </span>
              <span className="stat-label">En escrow</span>
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
              Hola {user?.nombre}, incluye reglas de casa y coordenadas para el mapa.
            </p>

            <div className="stack" style={{ marginTop: '1rem' }}>
              <div className="field">
                <label htmlFor="property-name">Nombre de la propiedad</label>
                <input
                  id="property-name"
                  type="text"
                  value={form.title}
                  onChange={updateField('title')}
                  required
                />
              </div>
              <div className="split-grid">
                <div className="field">
                  <label htmlFor="property-city">Ciudad</label>
                  <input id="property-city" type="text" value={form.city} onChange={updateField('city')} required />
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
                  rows="3"
                  value={form.description}
                  onChange={updateField('description')}
                />
              </div>
              <div className="field">
                <label htmlFor="property-rules">Reglas de la casa</label>
                <textarea
                  id="property-rules"
                  rows="3"
                  value={form.house_rules}
                  onChange={updateField('house_rules')}
                  placeholder="No fumar, horarios, mascotas..."
                />
              </div>
              <div className="split-grid">
                <div className="field">
                  <label htmlFor="property-lat">Latitud (mapa)</label>
                  <input
                    id="property-lat"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={updateField('latitude')}
                    placeholder="25.6866"
                  />
                </div>
                <div className="field">
                  <label htmlFor="property-lng">Longitud (mapa)</label>
                  <input
                    id="property-lng"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={updateField('longitude')}
                    placeholder="-100.3161"
                  />
                </div>
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
                  <label htmlFor="extra-photo">Agregar foto extra</label>
                  <div className="chat-form">
                    <input
                      id="extra-photo"
                      type="url"
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
                <div className="empty-panel">
                  <p className="panel-text">Aún no has publicado propiedades.</p>
                </div>
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
                          className="button-secondary"
                          type="button"
                          onClick={() => handleEdit(property.id)}
                        >
                          Editar
                        </button>
                        <button className="button" type="button" onClick={() => handleToggleActive(property)}>
                          {property.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="panel-card">
              <h2 className="panel-title">Calendario / bloqueos</h2>
              <form className="stack" onSubmit={handleCreateBlock}>
                <div className="field">
                  <label htmlFor="block-property">Propiedad</label>
                  <select
                    id="block-property"
                    value={blockForm.property_id}
                    onChange={(event) =>
                      setBlockForm((current) => ({ ...current, property_id: event.target.value }))
                    }
                    required
                  >
                    <option value="">Selecciona</option>
                    {myProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="split-grid">
                  <div className="field">
                    <label htmlFor="block-in">Desde</label>
                    <input
                      id="block-in"
                      type="date"
                      value={blockForm.check_in}
                      onChange={(event) =>
                        setBlockForm((current) => ({ ...current, check_in: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="block-out">Hasta</label>
                    <input
                      id="block-out"
                      type="date"
                      value={blockForm.check_out}
                      onChange={(event) =>
                        setBlockForm((current) => ({ ...current, check_out: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="block-reason">Motivo</label>
                  <input
                    id="block-reason"
                    type="text"
                    value={blockForm.reason}
                    onChange={(event) =>
                      setBlockForm((current) => ({ ...current, reason: event.target.value }))
                    }
                    placeholder="Mantenimiento, uso personal..."
                  />
                </div>
                <button className="button" type="submit">
                  Bloquear fechas
                </button>
              </form>
              <div className="stack" style={{ marginTop: '1rem' }}>
                {blocks.map((block) => (
                  <div className="admin-row" key={block.id}>
                    <span>
                      {block.check_in} → {block.check_out}
                    </span>
                    <span className="tag">{block.reason || 'Bloqueo'}</span>
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => handleRemoveBlock(block.id)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <h2 className="panel-title">Reservas en tus propiedades</h2>
              {hostReservations.length === 0 && (
                <div className="empty-panel">
                  <p className="panel-text">Aún no tienes reservas como anfitrión.</p>
                </div>
              )}
              <div className="admin-table">
                {hostReservations.map((item) => (
                  <div className="admin-row host-reservation-row" key={item.id}>
                    <div>
                      <strong>{item.property_title}</strong>
                      <p className="card-meta">
                        {item.guest_name} · {item.check_in} → {item.check_out}
                      </p>
                      <div className="property-tags">
                        <span className="tag">{formatReservationStatus(item.status)}</span>
                        <span className="tag">{formatPaymentStatus(item.payment_status)}</span>
                        {item.host_payout != null && (
                          <span className="tag">Neto: ${Number(item.host_payout).toLocaleString('es-MX')}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-actions">
                      {item.status === 'pendiente' && (
                        <>
                          <button className="button" type="button" onClick={() => handleAccept(item.id)}>
                            Aceptar
                          </button>
                          <button
                            className="button-secondary"
                            type="button"
                            onClick={() => handleReject(item.id)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {item.payment_status === 'retenido' && (
                        <button className="button" type="button" onClick={() => handleRelease(item.id)}>
                          Liberar escrow
                        </button>
                      )}
                      <Link className="button-secondary" to={`/messages?reserva=${item.id}`}>
                        Mensajes
                      </Link>
                    </div>
                    {item.status === 'confirmada' && !item.has_host_review && (
                      <div className="review-form stack" style={{ width: '100%' }}>
                        <h3 className="panel-title">Reseñar huésped</h3>
                        <div className="split-grid">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            placeholder="1-5"
                            value={reviewForms[item.id]?.rating || ''}
                            onChange={(event) =>
                              setReviewForms((current) => ({
                                ...current,
                                [item.id]: { ...current[item.id], rating: event.target.value },
                              }))
                            }
                          />
                          <input
                            type="text"
                            placeholder="Comentario"
                            value={reviewForms[item.id]?.comment || ''}
                            onChange={(event) =>
                              setReviewForms((current) => ({
                                ...current,
                                [item.id]: { ...current[item.id], comment: event.target.value },
                              }))
                            }
                          />
                        </div>
                        <button className="button-secondary" type="button" onClick={() => handleHostReview(item.id)}>
                          Publicar reseña
                        </button>
                      </div>
                    )}
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
