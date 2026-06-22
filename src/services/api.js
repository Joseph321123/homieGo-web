import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

export const fetchProperties = async (params = {}) => {
  const { data } = await api.get('/api/properties', { params })
  return data
}

export const fetchPropertyById = async (id) => {
  const { data } = await api.get(`/api/properties/${id}`)
  return data
}
