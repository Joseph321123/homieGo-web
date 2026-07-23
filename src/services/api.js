import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export const fetchProperties = async (params = {}) => {
  const { data } = await api.get('/api/properties', { params })
  return data
}

export const fetchPropertyById = async (id) => {
  const { data } = await api.get(`/api/properties/${id}`)
  return data
}

export const registerUser = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export const loginUser = async (payload) => {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export const fetchProfile = async (token) => {
  const { data } = await api.get('/api/auth/me', authHeaders(token))
  return data
}

export const updateProfile = async (token, payload) => {
  const { data } = await api.patch('/api/auth/me', payload, authHeaders(token))
  return data
}

export const becomeHost = async (token) => {
  const { data } = await api.post('/api/auth/become-host', {}, authHeaders(token))
  return data
}

export const createReservation = async (token, payload) => {
  const { data } = await api.post('/api/reservations', payload, authHeaders(token))
  return data
}

export const fetchMyReservations = async (token) => {
  const { data } = await api.get('/api/reservations/me', authHeaders(token))
  return data
}

export const createProperty = async (token, payload) => {
  const { data } = await api.post('/api/properties', payload, authHeaders(token))
  return data
}

export const fetchMyProperties = async (token) => {
  const { data } = await api.get('/api/properties/mine', authHeaders(token))
  return data
}

export const payReservation = async (token, reservationId, metodo_pago) => {
  const { data } = await api.post(
    `/api/reservations/${reservationId}/pay`,
    { metodo_pago },
    authHeaders(token)
  )
  return data
}

export const cancelReservation = async (token, reservationId) => {
  const { data } = await api.patch(`/api/reservations/${reservationId}/cancel`, {}, authHeaders(token))
  return data
}

export const createReview = async (token, payload) => {
  const { data } = await api.post('/api/reviews', payload, authHeaders(token))
  return data
}

export const fetchPropertyReviews = async (propertyId) => {
  const { data } = await api.get(`/api/properties/${propertyId}/reviews`)
  return data
}

export const fetchHostReservations = async (token) => {
  const { data } = await api.get('/api/reservations/host', authHeaders(token))
  return data
}

export const fetchAdminDashboard = async (token) => {
  const { data } = await api.get('/api/admin/dashboard', authHeaders(token))
  return data
}

export const fetchAdminReservations = async (token) => {
  const { data } = await api.get('/api/admin/reservations', authHeaders(token))
  return data
}

export const fetchAdminUsers = async (token) => {
  const { data } = await api.get('/api/admin/users', authHeaders(token))
  return data
}

export const togglePropertyActive = async (token, propertyId, active) => {
  const { data } = await api.patch(
    `/api/properties/${propertyId}/active`,
    { active },
    authHeaders(token)
  )
  return data
}

export const fetchConversations = async (token) => {
  const { data } = await api.get('/api/messages', authHeaders(token))
  return data
}

export const fetchConversation = async (token, reservationId) => {
  const { data } = await api.get(`/api/messages/${reservationId}`, authHeaders(token))
  return data
}

export const sendMessage = async (token, reservationId, message) => {
  const { data } = await api.post(
    `/api/messages/${reservationId}`,
    { message },
    authHeaders(token)
  )
  return data
}

export const fetchFavorites = async (token) => {
  const { data } = await api.get('/api/favorites', authHeaders(token))
  return data
}

export const fetchFavoriteIds = async (token) => {
  const { data } = await api.get('/api/favorites/ids', authHeaders(token))
  return data
}

export const addFavorite = async (token, propertyId) => {
  const { data } = await api.post(`/api/favorites/${propertyId}`, {}, authHeaders(token))
  return data
}

export const removeFavorite = async (token, propertyId) => {
  const { data } = await api.delete(`/api/favorites/${propertyId}`, authHeaders(token))
  return data
}

export const fetchMyProperty = async (token, propertyId) => {
  const { data } = await api.get(`/api/properties/mine/${propertyId}`, authHeaders(token))
  return data
}

export const updateProperty = async (token, propertyId, payload) => {
  const { data } = await api.put(`/api/properties/${propertyId}`, payload, authHeaders(token))
  return data
}

export const fetchHostStats = async (token) => {
  const { data } = await api.get('/api/host/stats', authHeaders(token))
  return data
}

export const checkPropertyAvailability = async (propertyId, checkIn, checkOut) => {
  const { data } = await api.get(`/api/properties/${propertyId}/availability/check`, {
    params: { check_in: checkIn, check_out: checkOut },
  })
  return data
}

export const addPropertyPhoto = async (token, propertyId, payload) => {
  const { data } = await api.post(`/api/properties/${propertyId}/photos`, payload, authHeaders(token))
  return data
}

export const removePropertyPhoto = async (token, photoId) => {
  const { data } = await api.delete(`/api/photos/${photoId}`, authHeaders(token))
  return data
}

export const setPrimaryPhoto = async (token, photoId) => {
  const { data } = await api.patch(`/api/photos/${photoId}/primary`, {}, authHeaders(token))
  return data
}

export const fetchAdminProperties = async (token) => {
  const { data } = await api.get('/api/admin/properties', authHeaders(token))
  return data
}

export const setAdminUserActive = async (token, userId, active) => {
  const { data } = await api.patch(
    `/api/admin/users/${userId}/active`,
    { active },
    authHeaders(token)
  )
  return data
}

export const setAdminPropertyActive = async (token, propertyId, active) => {
  const { data } = await api.patch(
    `/api/admin/properties/${propertyId}/active`,
    { active },
    authHeaders(token)
  )
  return data
}

export const getApiErrorMessage = (error, fallback = 'Ocurrió un error') =>
  error?.response?.data?.error || fallback
