import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
