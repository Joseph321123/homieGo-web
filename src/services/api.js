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

export const getApiErrorMessage = (error, fallback = 'Ocurrió un error') =>
  error?.response?.data?.error || fallback
