import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from '../pages/AdminPage'
import HomePage from '../pages/HomePage'
import HostPage from '../pages/HostPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PropertyDetailPage from '../pages/PropertyDetailPage'
import PropertiesPage from '../pages/PropertiesPage'
import RegisterPage from '../pages/RegisterPage'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
