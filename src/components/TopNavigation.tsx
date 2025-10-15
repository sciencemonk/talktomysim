import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const TopNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const copyCAToClipboard = async () => {
    const ca = "FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump";
    try {
      await navigator.clipboard.writeText(ca);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="bg-card border-b border-border px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Logo - clickable to home */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img 
            src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
            alt="Sim" 
            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
          />
        </button>

        {/* Contract Address */}
        <button
          onClick={copyCAToClipboard}
          className="text-[8px] sm:text-[10px] md:text-xs font-mono bg-muted hover:bg-muted/80 px-1.5 sm:px-2 md:px-3 py-1 rounded-md text-fg transition-colors cursor-pointer truncate max-w-[140px] sm:max-w-none"
          title="Click to copy contract address"
        >
          <span className="hidden sm:inline">FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump</span>
          <span className="sm:hidden">FFqwoZ...nsUpump</span>
        </button>
      </div>
    </nav>
  );
};

export default TopNavigation;
