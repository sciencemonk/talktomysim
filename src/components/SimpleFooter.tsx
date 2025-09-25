import { useToast } from "@/hooks/use-toast";

const SimpleFooter = () => {
  const { toast } = useToast();

  const copyCAToClipboard = async () => {
    const ca = "66gmaksi3kdlak34AtJnWqFW6H2L5YQDRy4W41y6zbpump";
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
    <footer className="bg-card border-t border-border px-4 py-3">
      <div className="flex items-center justify-center">
        <div className="text-center space-y-1">
          <p className="text-[10px] text-muted-foreground">Official CA:</p>
          <button
            onClick={copyCAToClipboard}
            className="text-[9px] font-mono bg-muted px-2 py-1 rounded text-foreground hover:bg-muted/80 transition-colors cursor-pointer break-all"
            title="Click to copy"
          >
            66gmaksi3kdlak34AtJnWqFW6H2L5YQDRy4W41y6zbpump
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;