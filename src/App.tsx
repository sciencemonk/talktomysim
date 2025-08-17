
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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tutors" element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tutors/:agentId" element={
              <ProtectedRoute>
                <AgentDetails />
              </ProtectedRoute>
            } />
            <Route path="/create-tutor" element={
              <ProtectedRoute>
                <AgentCreate />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
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
