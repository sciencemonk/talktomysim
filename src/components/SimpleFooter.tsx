import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import { WhitePaperModal } from "./WhitePaperModal";

const SimpleFooter = () => {
  const { toast } = useToast();
  const [showWhitePaper, setShowWhitePaper] = useState(false);

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
    <>
      <footer className="bg-card border-t border-border px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <Button
              variant="link"
              onClick={() => setShowWhitePaper(true)}
              className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
            >
              <FileText className="h-4 w-4 mr-2" />
              Read the White Paper
            </Button>
          </div>
          
          <div className="text-center sm:text-right">
            <button
              onClick={copyCAToClipboard}
              className="text-[10px] sm:text-xs font-mono bg-muted hover:bg-muted/80 px-2 sm:px-3 py-1 rounded-md text-foreground transition-colors cursor-pointer break-all"
              title="Click to copy contract address"
            >
              FFqwoZ7phjoupWjLeE5yFeLqGi8jkGEFrTz6jnsUpump
            </button>
          </div>
        </div>
      </footer>

      <WhitePaperModal open={showWhitePaper} onOpenChange={setShowWhitePaper} />
    </>
  );
};

export default SimpleFooter;