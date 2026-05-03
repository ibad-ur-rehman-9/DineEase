import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { Toaster } from './components/ui/sonner';

// Pages
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import TableMap from './pages/waiter/TableMap';
import OrderBuilder from './pages/waiter/OrderBuilder';
import BillPayment from './pages/waiter/BillPayment';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import TicketDetail from './pages/kitchen/TicketDetail';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StaffActivity from './pages/manager/StaffActivity';
import Reports from './pages/manager/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RestaurantProvider>
          <BrowserRouter>
            <div className="size-full" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/role-select" element={<RoleSelection />} />

            {/* Waiter Routes */}
            <Route
              path="/waiter/tables"
              element={
                <ProtectedRoute>
                  <TableMap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter/order"
              element={
                <ProtectedRoute>
                  <OrderBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiter/bill"
              element={
                <ProtectedRoute>
                  <BillPayment />
                </ProtectedRoute>
              }
            />

            {/* Kitchen Routes */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kitchen/ticket"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/activity"
              element={
                <ProtectedRoute>
                  <StaffActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

            <Toaster position="bottom-center" />
            </div>
          </BrowserRouter>
        </RestaurantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}