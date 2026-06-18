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

const PropertyCard = ({ property, index = 0 }) => {
  const photoStyle = property.photo_url
    ? { backgroundImage: `url(${property.photo_url})` }
    : { '--photo': gradients[index % gradients.length] }

  return (
    <article className="property-card">
      <div
        className={`property-photo${property.photo_url ? ' property-photo-image' : ''}`}
        style={photoStyle}
      />
      <div className="stack">
        <div>
          <h3 className="property-title">{property.title}</h3>
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
  )
}

export default PropertyCard
