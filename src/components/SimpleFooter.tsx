import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";

const SimpleFooter = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <footer className="bg-card border-t border-border px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <Button
            variant="link"
            onClick={() => navigate('/white-paper')}
            className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
          >
            <FileText className="h-4 w-4 mr-2" />
            Read the White Paper
          </Button>
        </div>
        
        <div className="text-center sm:text-right w-full sm:w-auto">
          <p className="text-xs text-muted-foreground mb-1">Official Contract Address:</p>
          <button
            onClick={copyCAToClipboard}
            className="text-[10px] sm:text-xs font-mono bg-muted hover:bg-muted/80 px-2 sm:px-3 py-1 rounded-md text-foreground transition-colors cursor-pointer break-all max-w-full"
            title="Click to copy contract address"
          >
            FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;