import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { becomeHost as becomeHostRequest, fetchProfile, loginUser, registerUser, updateProfile as updateProfileRequest } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'homiego_auth'

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = readStoredAuth()
    if (!stored?.token) {
      setLoading(false)
      return
    }

    setToken(stored.token)
    setUser(stored.user)

    fetchProfile(stored.token)
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persistAuth = (authData) => {
    setToken(authData.token)
    setUser(authData.user)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: authData.token, user: authData.user })
    )
  }

  const login = async (credentials) => {
    const response = await loginUser(credentials)
    persistAuth(response.data)
    return response.data
  }

  const register = async (payload) => {
    const response = await registerUser(payload)
    persistAuth(response.data)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (payload) => {
    const response = await updateProfileRequest(token, payload)
    setUser(response.data)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user: response.data })
    )
    return response.data
  }

  const becomeHost = async () => {
    const response = await becomeHostRequest(token)
    setUser(response.data)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user: response.data })
    )
    return response.data
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      isHost: user?.roles?.includes('anfitrion'),
      isAdmin: user?.roles?.includes('admin'),
      login,
      register,
      logout,
      updateProfile,
      becomeHost,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
