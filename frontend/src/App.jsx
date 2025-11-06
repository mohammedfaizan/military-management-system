import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from './routes/ProtectedRoutes.jsx'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout'
import { UnauthorizedPage } from './pages/UnauthorizedPage.jsx';
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage.jsx'
import PurchasePage from './pages/PurchasePage.jsx';
import TransferPage from './pages/TransferPage.jsx';
import AssignmentPage from './pages/AssignmentPage.jsx';
import ExpendituresPage from './pages/ExpendituresPage.jsx';
import StocksPage from './pages/StocksPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { useAuth } from './context/AuthContext.jsx'
import { LoadingPage } from './pages/LoadingPage.jsx'

function App() {
  const { user } = useAuth();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

          {/* Login required, but all user can access these routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin', 'base_commander', 'logistics_officer']}>
              <Layout />
            </ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Login required, Only Admin routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Login required, Only Admin and Base Commander routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin', 'base_commander']}>
              <Layout />
            </ProtectedRoute>}>
            <Route path="/assignment" element={<AssignmentPage />} />
            <Route path="/expend" element={<ExpendituresPage />} />
          </Route>

          {/* Login required, Only Admin and Base Logistics officer routes */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin', 'logistics_officer']}>
              <Layout />
            </ProtectedRoute>}>
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/transfer" element={<TransferPage />} />
          </Route>


          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  )
}

export default App