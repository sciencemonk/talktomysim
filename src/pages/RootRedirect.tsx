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

  // No automatic redirects - let users choose where to go
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to SIM</h1>
        <p className="text-muted-foreground">Choose where you'd like to go:</p>
        <div className="flex gap-4 justify-center">
          <Navigate to="/store/sim" replace />
        </div>
      </div>
    </div>
  );
};

export default RootRedirect;
