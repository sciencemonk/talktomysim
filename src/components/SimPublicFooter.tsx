import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SimPublicFooter = () => {
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
    <footer className="backdrop-blur-md bg-black/30 border-t border-white/20 px-6 py-4 relative z-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <img 
            src="/lovable-uploads/d1283b59-7cfa-45f5-b151-4c32b24f3621.png" 
            alt="Sim" 
            className="h-5 w-5 object-contain"
          />
          <Link 
            to="/"
            className="text-sm font-semibold text-white hover:text-white/80 transition-colors"
          >
            Create your Sim
          </Link>
        </div>
        
        <div className="text-center sm:text-right w-full sm:w-auto">
          <p className="text-xs text-white/60 mb-1">Official Contract Address:</p>
          <button
            onClick={copyCAToClipboard}
            className="text-[10px] sm:text-xs font-mono bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 rounded-md text-white transition-colors cursor-pointer break-all max-w-full border border-white/20"
            title="Click to copy contract address"
          >
            FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SimPublicFooter;
