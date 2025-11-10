import { useAuth } from "@/hooks/useAuth";
import Marketplace from "./Marketplace";
import MySimChat from "./MySimChat";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, show chat dashboard, otherwise show marketplace
  return user ? <MySimChat /> : <Marketplace />;
};

export default RootRedirect;
