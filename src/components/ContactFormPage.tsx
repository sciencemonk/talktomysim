import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentType } from "@/types/agent";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface ContactFormPageProps {
  agent: AgentType;
}

const ContactFormPage = ({ agent }: ContactFormPageProps) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if user has already submitted a message for this agent
  useEffect(() => {
    const submittedKey = `contact_submitted_${agent.id}`;
    const alreadySubmitted = localStorage.getItem(submittedKey);
    if (alreadySubmitted) {
      setHasSubmitted(true);
    }
  }, [agent.id]);

  const handleNavigateHome = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // User is authenticated, find their X agent and redirect to creator page
      const { data: agents } = await supabase
        .from('advisors')
        .select('id, name, edit_code, social_links, custom_url')
        .eq('user_id', session.user.id)
        .eq('sim_category', 'Crypto Mail')
        .maybeSingle();
      
      if (agents) {
        // Extract X username from social_links or name
        const xUsername = (agents.social_links as any)?.x_username || 
                         agents.custom_url || 
                         agents.name?.replace('@', '');
        
        if (xUsername) {
          // Redirect to creator page (no code needed - using X auth)
          navigate(`/${xUsername}/creator`);
          return;
        }
      }
    }
    
    // Not authenticated or no agent found, go to homepage
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before submitting",
        variant: "destructive"
      });
      return;
    }

    if (message.length > 1000) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 1000 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          advisor_id: agent.id,
          sender_email: null,
          sender_phone: null,
          message: message.trim()
        }]);

      if (error) throw error;

      // Store in localStorage to prevent multiple submissions
      const submittedKey = `contact_submitted_${agent.id}`;
      localStorage.setItem(submittedKey, 'true');
      
      toast({
        title: "Message sent!",
        description: "Redirecting to home page..."
      });

      // Redirect to home page after a brief delay
      setTimeout(() => {
        handleNavigateHome();
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="backdrop-blur-md bg-card/95 border border-border rounded-3xl p-8 shadow-lg">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 border-4 border-border mb-4">
              <AvatarImage src={getAvatarUrl(agent.avatar)} alt={agent.name} className="object-cover" />
              <AvatarFallback className="text-2xl">{agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            {agent.title && (
              <p className="text-lg text-muted-foreground mb-4">{agent.title}</p>
            )}
            {/* For Crypto Mail sims, show user description; for others show auto_description */}
            {(agent.sim_category === 'Crypto Mail' && agent.description) ? (
              <p className="text-muted-foreground max-w-lg">{agent.description}</p>
            ) : (agent as any).auto_description ? (
              <p className="text-muted-foreground max-w-lg">{(agent as any).auto_description}</p>
            ) : agent.description && (
              <p className="text-muted-foreground max-w-lg">{agent.description}</p>
            )}
          </div>

          {/* Show message if already submitted */}
          {hasSubmitted ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold">Message Already Sent</h2>
              <p className="text-muted-foreground">
                You've already sent a message to {agent.name}. They'll get back to you soon!
              </p>
              <Button 
                onClick={handleNavigateHome}
                className="mt-4"
              >
                Go to Home
              </Button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message *</Label>
                <span className="text-xs text-muted-foreground">
                  {message.length}/1000
                </span>
              </div>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows={6}
                maxLength={1000}
                required
                disabled={isSubmitting}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-[#82f2aa] hover:bg-[#82f2aa]/90 text-black"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactFormPage;
