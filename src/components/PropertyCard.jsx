import { Link } from 'react-router-dom'

const gradients = [
  'linear-gradient(135deg, #002862, #1383f9)',
  'linear-gradient(135deg, #1383f9, #4cb0ff)',
  'linear-gradient(135deg, #002862, #4cb0ff)',
]

const formatPrice = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(value))

export { formatPrice }

const PropertyCard = ({ property, index = 0 }) => {
  const photoStyle = property.photo_url
    ? { backgroundImage: `url(${property.photo_url})` }
    : { '--photo': gradients[index % gradients.length] }

  const rating = property.rating_avg ? Number(property.rating_avg) : null

  return (
    <Link className="property-card-link" to={`/properties/${property.id}`}>
      <article className="property-card">
        <div
          className={`property-photo${property.photo_url ? ' property-photo-image' : ''}`}
          style={photoStyle}
        />
        <div className="stack">
          <div>
            <div className="property-card-heading">
              <h3 className="property-title">{property.title}</h3>
              {rating != null && (
                <span className="rating-pill" title={`${property.reviews_count || 0} reseñas`}>
                  ★ {rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="card-meta">
              {property.city}, {property.country}
            </p>
          </div>
          <div className="property-tags">
            <span className="tag">{property.max_guests} huéspedes</span>
            <span className="tag">{formatPrice(property.price_per_night)} / noche</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default PropertyCard
