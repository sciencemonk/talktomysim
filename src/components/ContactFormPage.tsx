import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentType } from "@/types/agent";
import { getAvatarUrl } from "@/lib/avatarUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface ContactFormPageProps {
  agent: AgentType;
}

const ContactFormPage = ({ agent }: ContactFormPageProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully."
      });

      // Reset form
      setMessage("");
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
            {agent.description && (
              <p className="text-muted-foreground max-w-lg">{agent.description}</p>
            )}
          </div>

          {/* Contact Form */}
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
              className="w-full h-12 text-base"
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
        </div>
      </div>
    </div>
  );
};

export default ContactFormPage;
