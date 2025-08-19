
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Landing from './pages/Landing';
import PublicTutorDetail from './pages/PublicTutorDetail';
import SimpleTeacherDashboard from './pages/SimpleTeacherDashboard';
import Marketplace from './pages/Marketplace';
import ProfessionalDevelopment from './pages/ProfessionalDevelopment';
import AgentDetails from './pages/AgentDetails';
import AgentCreate from './pages/AgentCreate';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import NotFound from './pages/NotFound';
import StudentChat from './pages/StudentChat';
import SimpleDashboardLayout from './layouts/SimpleDashboardLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-bg font-system">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
              
              {/* Student chat route - public */}
              <Route path="/tutors/:agentId/chat" element={<StudentChat />} />
              
              {/* Protected routes with simplified layout */}
              <Route path="/dashboard" element={
                <SimpleDashboardLayout>
                  <SimpleTeacherDashboard />
                </SimpleDashboardLayout>
              } />
              <Route path="/marketplace" element={
                <SimpleDashboardLayout>
                  <Marketplace />
                </SimpleDashboardLayout>
              } />
              <Route path="/professional-development" element={
                <SimpleDashboardLayout>
                  <ProfessionalDevelopment />
                </SimpleDashboardLayout>
              } />
              <Route path="/agents/:agentId" element={
                <SimpleDashboardLayout>
                  <AgentDetails />
                </SimpleDashboardLayout>
              } />
              <Route path="/create-tutor" element={
                <SimpleDashboardLayout>
                  <AgentCreate />
                </SimpleDashboardLayout>
              } />
              <Route path="/settings" element={
                <SimpleDashboardLayout>
                  <Settings />
                </SimpleDashboardLayout>
              } />
              <Route path="/billing" element={
                <SimpleDashboardLayout>
                  <Billing />
                </SimpleDashboardLayout>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
