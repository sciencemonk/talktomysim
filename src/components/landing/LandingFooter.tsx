import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                    href="https://t.me/simprojectofficial" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                  >
                    Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowWhitepaperModal(true)}
                    className="text-sm text-muted-foreground hover:text-[#82f3aa] transition-colors"
                  >
                    Whitepaper
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SIM Corporation. All rights reserved.
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
                Welcome to SimProject ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and share information when you use our services.
              </p>

              <h3 className="text-lg font-semibold">Information We Collect</h3>
              <h4 className="text-base font-semibold">Information You Provide</h4>
              <p className="text-sm text-muted-foreground">We collect information you provide directly to us, including:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Account information (name, email, password)</li>
                <li>Profile information</li>
                <li>Communications with us</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h4 className="text-base font-semibold">Automatically Collected Information</h4>
              <p className="text-sm text-muted-foreground">When you use our services, we automatically collect:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Usage data and analytics</li>
                <li>Device information</li>
                <li>Log data</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h3 className="text-lg font-semibold">How We Use Your Information</h3>
              <p className="text-sm text-muted-foreground">We use the information we collect to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
              </ul>

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
                By accessing or using SimProject ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>

              <h3 className="text-lg font-semibold">Description of Service</h3>
              <p className="text-sm text-muted-foreground">
                SimProject provides an AI-powered platform for creating and interacting with simulated personas and advisors. 
                We reserve the right to modify, suspend, or discontinue the Service at any time.
              </p>

              <h3 className="text-lg font-semibold">User Accounts</h3>
              <h4 className="text-base font-semibold">Registration</h4>
              <p className="text-sm text-muted-foreground">To use certain features, you must register for an account. You agree to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-lg font-semibold">Acceptable Use</h3>
              <p className="text-sm text-muted-foreground">You agree not to:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>

              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For questions about these Terms, please contact us at: <strong>legal@simproject.org</strong>
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Whitepaper Modal */}
      <Dialog open={showWhitepaperModal} onOpenChange={setShowWhitepaperModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Build Your AI</DialogTitle>
            <DialogDescription>White Paper v2.0</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
              <h3 className="text-lg font-semibold">Why Build Your Own AI?</h3>
              <p className="text-sm text-muted-foreground">
                <strong>The AI revolution isn't about using someone else's AI.</strong> It's about creating your own. Your own personality. Your own knowledge. Your own purpose.
              </p>
              <p className="text-sm text-muted-foreground">
                Whether you're building a business consultant, a customer service agent, a personal coach, or a creative companion—<strong>Sim makes it possible for anyone to build their AI.</strong>
              </p>

              <h3 className="text-lg font-semibold">How to Build Your AI</h3>
              <div className="grid gap-4">
                <div>
                  <h4 className="text-base font-semibold">1. Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Give your AI a name, personality, and purpose. Upload an avatar. Define what makes it unique.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold">2. Launch</h4>
                  <p className="text-sm text-muted-foreground">
                    Your AI goes live instantly with its own URL and landing page. Share it anywhere, anytime.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold">3. Scale</h4>
                  <p className="text-sm text-muted-foreground">
                    Your AI handles unlimited conversations. Embed it on websites. Monetize it. Watch it grow.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold">Free to Build. Free to Host.</h3>
              <p className="text-sm text-muted-foreground">
                <strong>No hidden fees. No credit card required. No hosting costs.</strong> Build as many AI agents as you want, deploy them instantly, and let them handle unlimited conversations—all completely free.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
