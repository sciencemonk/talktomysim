import { useToast } from "@/hooks/use-toast";

const Footer = () => {
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
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sim is made possible by{" "}
            <span className="font-medium text-foreground">Sim Coin</span>
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Official CA:</span>
            <button
              onClick={copyCAToClipboard}
              className="group inline-flex items-center px-3 py-1.5 rounded-md text-xs font-mono bg-muted hover:bg-muted/80 transition-colors cursor-pointer border"
              title="Click to copy contract address"
            >
              <span className="text-foreground group-hover:text-primary transition-colors">
                66gmaksi3kdlak34AtJnWqFW6H2L5YQDRy4W41y6zbpump
              </span>
              <svg
                className="ml-2 h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;