import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Marketplace from "./Marketplace";

const RootRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // For development: skip auth and go to onboarding
  const isDev = import.meta.env.DEV;
  
  useEffect(() => {
    if (isDev && !loading) {
      navigate('/onboarding');
    }
  }, [isDev, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // In dev mode, user already redirected to onboarding
  // In production, show marketplace for non-authenticated users
  return <Marketplace />;
};

export default RootRedirect;
