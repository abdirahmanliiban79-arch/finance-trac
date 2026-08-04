import { Route, Routes, Navigate } from 'react-router';
import { LoginPage } from './pages/auth/loginPage';
import { RegisterPage } from './pages/auth/registerPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import DashboardProtec from './components/Routes/DashboardProtec';
import PublicRoute from './components/Routes/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <DashboardProtec>
            <DashboardPage />
          </DashboardProtec>
        }
      />
      <Route
        path="/transactions"
        element={
          <DashboardProtec>
            <TransactionsPage />
          </DashboardProtec>
        }
      />
      <Route
        path="/categories"
        element={
          <DashboardProtec>
            <CategoriesPage />
          </DashboardProtec>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardProtec>
            <SettingsPage />
          </DashboardProtec>
        }
      />

      {/* Default Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
