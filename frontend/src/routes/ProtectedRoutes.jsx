import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UnauthorizedPage } from '../pages/UnauthorizedPage.jsx'
import { LoadingPage } from '../pages/LoadingPage.jsx'
import { toast } from 'sonner'

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (!user) {
    toast.info("Login to access the site")
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Option 1: Redirect to Unauthorized Page route
    toast.error("This page is not accessible to your role")
    return <Navigate to="/unauthorized" replace />

    // Option 2: Just show the page component directly
    // return <UnauthorizedPage />
  }

  return children
}
