import { useAuth } from "@/hooks/useAuth";
import Marketplace from "./Marketplace";

const RootRedirect = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Marketplace />;
};

export default RootRedirect;
