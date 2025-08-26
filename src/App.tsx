
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import PublicTutorDetail from "./pages/PublicTutorDetail";
import StudentChat from "./pages/StudentChat";
import NotFound from "./pages/NotFound";
import DebugAdvisors from "./pages/DebugAdvisors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page as default route for non-authenticated users */}
            <Route path="/" element={<Landing />} />
            
            {/* Admin route */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Debug route */}
            <Route path="/debug" element={<DebugAdvisors />} />
            
            {/* Legacy routes */}
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<Home />} />
            <Route path="/home" element={<Home />} />
            
            {/* Public tutor share links - accessible by non-signed in users */}
            <Route path="/tutors/:agentId" element={<PublicTutorDetail />} />
            <Route path="/tutors/:agentId/chat" element={<StudentChat />} />
            
            {/* New custom URL routes for public chats */}
            <Route path="/:customUrl" element={<StudentChat />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
