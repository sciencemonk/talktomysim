
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LoaderIcon } from './LoaderIcon';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Temporarily bypass authentication for testing
  // Just render children directly without checking auth status
  return <>{children}</>;
  
  // Original auth logic commented out for testing:
  /*
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
  */
};

export default ProtectedRoute;
