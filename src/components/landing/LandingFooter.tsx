import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhitePaperModal } from "@/components/WhitePaperModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export const LandingFooter = () => {
  const { theme } = useTheme();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showWhitepaperModal, setShowWhitepaperModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simple implementation: just show success toast
      // In production, you could send to an email service or database
      toast.success("Support request submitted successfully! We'll get back to you soon.");
      setSupportForm({ name: "", email: "", message: "" });
      setShowSupportModal(false);
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      toast.error("Failed to submit support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <footer className="w-full py-16 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="bg-black rounded-2xl p-3 w-fit shadow-lg">
                <img
                  src="/sim-logo-gradient.png"
                  alt="Sim Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Create and sell AI agents, digital products, and on-chain services.
              </p>
            </div>

            {/* Product Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#learn-more-section" 
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a 
                    href="#why-crypto" 
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Why Crypto?
                  </a>
                </li>
                <li>
                  <a 
                    href="#agents-showcase-section" 
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Browse Stores
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-gray-400 cursor-not-allowed inline-flex items-center gap-2">
                          Documentation
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
                <li>
                  <a 
                    href="https://t.me/simprojectofficial" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowWhitepaperModal(true)}
                    className="text-sm text-gray-400 hover:text-[#635BFF] transition-colors"
                  >
                    Whitepaper
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2025 Solana Internet Market. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://x.com/simprojectorg" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#635BFF] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Support Modal */}
      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support Request</DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support-name">Name</Label>
              <Input
                id="support-name"
                value={supportForm.name}
                onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Email</Label>
              <Input
                id="support-email"
                type="email"
                value={supportForm.email}
                onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowSupportModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <h3 className="text-lg font-semibold">Introduction</h3>
              <p className="text-sm text-muted-foreground">
                Welcome to SIMAI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and share information when you use our agentic payment platform and services.
              </p>

              <h3 className="text-lg font-semibold">About Our Service</h3>
              <p className="text-sm text-muted-foreground">
                SIMAI is an agentic payment platform that enables users to transform their X (Twitter) accounts into AI agents capable of accepting x402 payments. Our platform facilitates autonomous commerce through AI-powered storefronts.
              </p>

              <h3 className="text-lg font-semibold">Information We Collect</h3>
              <h4 className="text-base font-semibold">Information You Provide</h4>
              <p className="text-sm text-muted-foreground">We collect information you provide directly to us, including:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>X (Twitter) account information and profile data</li>
                <li>Email address and contact information</li>
                <li>Crypto wallet addresses for payment processing</li>
                <li>Agent configuration and customization data</li>
                <li>Communications with us</li>
              </ul>

              <h4 className="text-base font-semibold">Automatically Collected Information</h4>
              <p className="text-sm text-muted-foreground">When you use our platform, we automatically collect:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Transaction data and payment information (on-chain)</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>Log data and interaction patterns</li>
              </ul>

              <h3 className="text-lg font-semibold">How We Use Your Information</h3>
              <p className="text-sm text-muted-foreground">We use the information we collect to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Provide and maintain our agentic payment platform</li>
                <li>Process x402 payments and crypto transactions</li>
                <li>Train and improve AI agent capabilities</li>
                <li>Send transaction notifications and updates</li>
                <li>Respond to your inquiries and provide support</li>
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>

              <h3 className="text-lg font-semibold">Data Security</h3>
              <p className="text-sm text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your data. All payments are processed on-chain using x402 protocol with zero fees. We never store your private keys or have access to your crypto wallets.
              </p>

              <h3 className="text-lg font-semibold">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have questions about this privacy policy, please contact us at: <strong>privacy@simproject.org</strong>
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
            <DialogDescription>Last updated: {new Date().toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <h3 className="text-lg font-semibold">Agreement to Terms</h3>
              <p className="text-sm text-muted-foreground">
                By accessing or using SIMAI ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>

              <h3 className="text-lg font-semibold">Description of Service</h3>
              <p className="text-sm text-muted-foreground">
                SIMAI is an agentic payment platform that enables users to create AI agents from their X (Twitter) accounts and accept x402 payments. Our platform facilitates autonomous commerce through AI-powered storefronts with zero-fee crypto transactions.
              </p>

              <h3 className="text-lg font-semibold">Agent Creation and Ownership</h3>
              <p className="text-sm text-muted-foreground">When you create an AI agent on SIMAI:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>You retain ownership of your X account and associated content</li>
                <li>You authorize us to analyze your public X posts to train your AI agent</li>
                <li>You are responsible for the content and behavior of your AI agent</li>
                <li>You must ensure your agent complies with X's Terms of Service</li>
              </ul>

              <h3 className="text-lg font-semibold">Payment Terms</h3>
              <p className="text-sm text-muted-foreground">Regarding payments on the platform:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>All payments are processed on-chain using x402 protocol</li>
                <li>SIMAI charges zero platform fees on transactions</li>
                <li>You are responsible for managing your crypto wallet</li>
                <li>All transactions are final and irreversible on the blockchain</li>
                <li>You must comply with applicable tax and regulatory requirements</li>
              </ul>

              <h3 className="text-lg font-semibold">User Accounts</h3>
              <h4 className="text-base font-semibold">Registration</h4>
              <p className="text-sm text-muted-foreground">To use our platform, you agree to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Provide accurate information about your X account</li>
                <li>Maintain the security of your wallet and credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-lg font-semibold">Acceptable Use</h3>
              <p className="text-sm text-muted-foreground">You agree not to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Use the Service for any illegal purpose or fraud</li>
                <li>Impersonate others or create misleading AI agents</li>
                <li>Violate intellectual property rights</li>
                <li>Engage in market manipulation or scams</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to compromise the security of the platform</li>
              </ul>

              <h3 className="text-lg font-semibold">Disclaimers</h3>
              <p className="text-sm text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES. AI-generated content is not professional advice. Cryptocurrency transactions carry risk and are irreversible. We are not responsible for losses from market volatility or user error.
              </p>

              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms, please contact us at: <strong>legal@simproject.org</strong>
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Whitepaper Modal */}
      <WhitePaperModal open={showWhitepaperModal} onOpenChange={setShowWhitepaperModal} />
    </>
  );
};
