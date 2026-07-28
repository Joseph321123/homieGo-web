import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import SiteShell from '../components/SiteShell'
import { useAuth } from '../context/AuthContext'
import { fetchFavorites, getApiErrorMessage, removeFavorite } from '../services/api'

const FavoritesPage = () => {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetchFavorites(token)
      setFavorites(response.data)
    } catch {
      setError('No pudimos cargar tus favoritos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [token])

  const handleRemove = async (propertyId) => {
    setMessage('')
    try {
      await removeFavorite(token, propertyId)
      setMessage('Propiedad eliminada de favoritos.')
      await loadFavorites()
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'No pudimos quitar el favorito'))
    }
  }

  return (
    <SiteShell>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Tu lista</span>
            <h1 className="section-title">Favoritos</h1>
            <p className="page-subtitle">
              Propiedades guardadas para consultarlas más tarde.
            </p>
          </div>
        </div>

        {message && <p className="state-message">{message}</p>}
        {loading && <p className="state-message">Cargando favoritos...</p>}
        {error && <p className="state-message state-message-error">{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <div className="empty-panel">
            <p className="state-message">
              Aún no tienes favoritos. Guarda alojamientos desde su ficha para encontrarlos después.
            </p>
            <Link className="button" to="/properties">
              Explorar propiedades
            </Link>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="property-grid">
            {favorites.map((property, index) => (
              <div className="favorite-item" key={property.id}>
                <PropertyCard property={property} index={index} />
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => handleRemove(property.id)}
                >
                  Quitar de favoritos
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  )
}

export default FavoritesPage
