import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminMarketplacePage from './pages/admin/AdminMarketplacePage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import OfficerOverviewPage from './pages/officer/OfficerOverviewPage'
import OfficerVerificationQueuePage from './pages/officer/OfficerVerificationQueuePage'
import OfficerRequestQueuePage from './pages/officer/OfficerRequestQueuePage'
import './App.css'

function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'officer'
  children: ReactNode
}) {
  const { token, user } = useAuth()
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'officer') return <Navigate to="/officer" replace />
    return <Navigate to="/login" replace state={{ denied: true }} />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { token, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          !token ? (
            <Navigate to="/login" replace />
          ) : user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : user?.role === 'officer' ? (
            <Navigate to="/officer" replace />
          ) : (
            <Navigate to="/login" replace state={{ denied: true }} />
          )
        }
      />
      <Route
        path="/officer"
        element={
          <RequireRole role="officer">
            <OfficerOverviewPage />
          </RequireRole>
        }
      />
      <Route
        path="/officer/verification"
        element={
          <RequireRole role="officer">
            <OfficerVerificationQueuePage />
          </RequireRole>
        }
      />
      <Route
        path="/officer/transfers"
        element={
          <RequireRole role="officer">
            <OfficerRequestQueuePage kind="transfer" />
          </RequireRole>
        }
      />
      <Route
        path="/officer/services"
        element={
          <RequireRole role="officer">
            <OfficerRequestQueuePage kind="service" />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminOverviewPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireRole role="admin">
            <AdminUsersPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/marketplace"
        element={
          <RequireRole role="admin">
            <AdminMarketplacePage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RequireRole role="admin">
            <AdminPaymentsPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireRole role="admin">
            <AdminReportsPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireRole role="admin">
            <AdminSettingsPage />
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
