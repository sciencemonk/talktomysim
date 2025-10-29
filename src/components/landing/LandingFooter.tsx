export const LandingFooter = () => {
  return (
    <footer className="w-full py-3 px-4 border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          © 2025 AI Agents. All rights reserved.
        </p>
        
        <div className="flex gap-4 text-xs">
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
