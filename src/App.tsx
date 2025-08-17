import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Landing from './pages/Landing';
import TeacherDashboard from './pages/TeacherDashboard';
import AgentDetails from './pages/AgentDetails';
import AgentCreate from './pages/AgentCreate';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import NotFound from './pages/NotFound';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            } />
            <Route path="/tutors" element={
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            } />
            <Route path="/tutors/:agentId" element={
              <DashboardLayout>
                <AgentDetails />
              </DashboardLayout>
            } />
            {/* Keep agents routes for backward compatibility */}
            <Route path="/agents" element={
              <DashboardLayout>
                <TeacherDashboard />
              </DashboardLayout>
            } />
            <Route path="/agents/:agentId" element={
              <DashboardLayout>
                <AgentDetails />
              </DashboardLayout>
            } />
            <Route path="/create-tutor" element={
              <DashboardLayout>
                <AgentCreate />
              </DashboardLayout>
            } />
            <Route path="/settings" element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            } />
            <Route path="/billing" element={
              <DashboardLayout>
                <Billing />
              </DashboardLayout>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
