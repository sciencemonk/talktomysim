import { useToast } from "@/hooks/use-toast";

const SimpleFooter = () => {
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
    <footer className="bg-card border-t border-border px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">$SIMAI</span> coin
          </p>
        </div>
        
        <div className="text-center sm:text-right">
          <p className="text-xs text-muted-foreground mb-1">Official Contract Address:</p>
          <button
            onClick={copyCAToClipboard}
            className="text-xs font-mono bg-muted hover:bg-muted/80 px-3 py-1 rounded-md text-foreground transition-colors cursor-pointer select-all"
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