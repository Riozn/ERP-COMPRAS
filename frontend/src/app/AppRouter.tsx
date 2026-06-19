import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '../shared/layout/AppShell'
import { ProtectedRoute } from '../shared/routing/ProtectedRoute'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { ArticlesPage } from '../features/articles/pages/ArticlesPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { InventoryPage } from '../features/inventory/pages/InventoryPage'
import { OrdersPage } from '../features/orders/pages/OrdersPage'
import { PayablesPage } from '../features/payables/pages/PayablesPage'
import { PaymentsPage } from '../features/payments/pages/PaymentsPage'
import { ReportsPage } from '../features/reports/pages/ReportsPage'
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/payables" element={<PayablesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
