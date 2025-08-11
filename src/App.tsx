
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import TeacherDashboard from "./pages/TeacherDashboard";
import TutorDetails from "./pages/TutorDetails";
import TutorCreate from "./pages/TutorCreate";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if we get a 404 for new123 tutor
        if (error?.message?.includes("Tutor with id new123 not found")) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Navigate to="/tutors" replace />} />
            <Route path="/agents" element={<Navigate to="/tutors" replace />} />
            <Route path="/tutors" element={<TeacherDashboard />} />
            <Route path="/tutors/create" element={<TutorCreate />} />
            <Route path="/tutors/:tutorId" element={<TutorDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
