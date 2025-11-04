import { useTheme } from "@/hooks/useTheme";

export const LandingFooter = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="w-full py-16 px-6 border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <img
              src={theme === "dark" ? "/sim-logo-dark.png" : "/sim-logo-light-final.png"}
              alt="Sim Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/sim-logo.png";
              }}
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your X account into an AI Agent that generates revenue. Accept crypto payments instantly with zero fees.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Product</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#learn-more-section" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="/agents" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Browse Agents
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://docs.x402.org" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/x402protocol" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/whitepaper" 
                  className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                >
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Agentic Payments. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://x.com/x402protocol" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[#82f3aa] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
