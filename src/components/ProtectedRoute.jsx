import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, hostOnly = false }) => {
  const { isAuthenticated, isHost, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="state-message">Verificando sesión...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (hostOnly && !isHost) {
    return <Navigate to="/register" replace state={{ needHost: true }} />
  }

  return children
}

export default ProtectedRoute
