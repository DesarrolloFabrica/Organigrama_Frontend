import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from './authStorage'

type RequireAuthProps = {
  children: React.ReactNode
}

/** Redirige al login si no hay sesión guardada. */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return children
}
