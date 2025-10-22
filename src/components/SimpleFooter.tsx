import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";

const SimpleFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-card border-t border-border px-6 py-4">
      <div className="flex items-center justify-center">
        <Button
          variant="link"
          onClick={() => navigate('/whitepaper')}
          className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
        >
          <FileText className="h-4 w-4 mr-2" />
          Read the White Paper
        </Button>
      </div>
    </footer>
  );
};

export default SimpleFooter;