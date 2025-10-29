export const LandingFooter = () => {
  return (
    <footer className="w-full py-2 px-4 border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5">
        <p className="text-[10px] text-muted-foreground">
          © 2025 AI Agents. All rights reserved.
        </p>
        
        <div className="flex gap-3 text-[10px]">
          <a 
            href="/privacy" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="/contact" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};
