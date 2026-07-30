import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { RecurringPayments } from './pages/RecurringPayments';
import { Reports } from './pages/Reports';
import { AIAdvisor } from './pages/AIAdvisor';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Main Application Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Auth Routes (Redirect to dashboard if already logged in) */}
          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute requireAuth={true} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/recurring" element={<RecurringPayments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
