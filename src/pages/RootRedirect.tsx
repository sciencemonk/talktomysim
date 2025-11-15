import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If signed in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not signed in, redirect to store page
  return <Navigate to="/store/sim" replace />;
};

export default RootRedirect;
