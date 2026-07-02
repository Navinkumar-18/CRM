
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Customers } from './pages/customers/Customers';
import { Leads } from './pages/leads/Leads';
import { Tasks } from './pages/tasks/Tasks';
import { Activities } from './pages/activities/Activities';
import { Companies } from './pages/companies/Companies';
import { Contacts } from './pages/contacts/Contacts';
import { Deals } from './pages/deals/Deals';
import { CustomModules } from './pages/custom/CustomModules';

import { Register } from './pages/auth/Register';
import { Profile } from './pages/auth/Profile';
import { useAuthStore } from './store/authStore';

// Admin Staff Management
import { StaffManagement } from './pages/staff/StaffManagement';
import { StaffDetails } from './pages/staff/StaffDetails';

// Staff Portal
import { StaffDashboard } from './pages/staff-portal/StaffDashboard';
import { MyLeads } from './pages/staff-portal/MyLeads';
import { MyCustomers } from './pages/staff-portal/MyCustomers';
import { MyTasks } from './pages/staff-portal/MyTasks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RoleBasedDashboard = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') {
    return <Dashboard />;
  }
  return <StaffDashboard />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* General / Shared & Staff Portal Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout><RoleBasedDashboard /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/my-leads" element={<AppLayout><MyLeads /></AppLayout>} />
            <Route path="/my-customers" element={<AppLayout><MyCustomers /></AppLayout>} />
            <Route path="/my-tasks" element={<AppLayout><MyTasks /></AppLayout>} />
          </Route>
          
          {/* Admin-Only Routes */}
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/staff" element={<AppLayout><StaffManagement /></AppLayout>} />
            <Route path="/staff/:id" element={<AppLayout><StaffDetails /></AppLayout>} />
            <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
            <Route path="/companies" element={<AppLayout><Companies /></AppLayout>} />
            <Route path="/contacts" element={<AppLayout><Contacts /></AppLayout>} />
            <Route path="/leads" element={<AppLayout><Leads /></AppLayout>} />
            <Route path="/deals" element={<AppLayout><Deals /></AppLayout>} />
            <Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
            <Route path="/activities" element={<AppLayout><Activities /></AppLayout>} />
            <Route path="/custom-modules" element={<AppLayout><CustomModules /></AppLayout>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

