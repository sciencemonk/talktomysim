import { useNavigate } from "react-router-dom";

const SimpleFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-card border-t border-border px-6 py-4">
      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={() => navigate('/')} 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/agents')} 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          Agent Directory
        </button>
        <button 
          onClick={() => navigate('/documentation')} 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          Documentation
        </button>
        <button 
          onClick={() => navigate('/simai')} 
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          $SIMAI
        </button>
      </div>
    </footer>
  );
};

export default SimpleFooter;