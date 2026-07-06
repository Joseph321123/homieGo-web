import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, hostOnly = false, adminOnly = false }) => {
  const { isAuthenticated, isHost, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="state-message">Verificando sesión...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (hostOnly && !isHost) {
    return <Navigate to="/register" replace state={{ needHost: true }} />
  }

  return children
}

export default ProtectedRoute
