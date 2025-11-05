import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, RotateCcw } from "lucide-react";
import simDesignerIcon from "@/assets/sim-designer-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SimDesignerChatProps {
  agentId: string;
  editCode: string;
  currentDesignSettings: any;
  onDesignUpdate: (settings: any) => void;
}

export const SimDesignerChat = ({ 
  agentId, 
  editCode, 
  currentDesignSettings, 
  onDesignUpdate 
}: SimDesignerChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm SIM Designer. I can help you customize the look and feel of your storefront. Try asking me to change colors, update your header image, or adjust the layout!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRevertToDefault = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('advisors')
        .update({
          social_links: {
            ...(currentDesignSettings || {}),
            design_settings: null,
          },
        })
        .eq('id', agentId)
        .eq('edit_code', editCode);

      if (error) throw error;

      onDesignUpdate(null);
      toast.success("Design reverted to default!");
      
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "I've reverted your storefront design back to the default settings. Your store now has the original clean look!",
        },
      ]);
    } catch (error: any) {
      console.error("Error reverting design:", error);
      toast.error("Failed to revert design");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Call AI to understand the design request and generate new settings
      const { data, error } = await supabase.functions.invoke("enhanced-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are SIM Designer, an AI assistant that helps users customize the design of their online storefront. 
              
Current design settings:
${JSON.stringify(currentDesignSettings || {}, null, 2)}

Your task is to understand the user's design request and generate updated design settings as JSON. 
The design settings can include:
- primaryColor: Main brand color (hex code)
- secondaryColor: Secondary color (hex code)
- headerImage: URL for header background image
- accentColor: Accent color for highlights (hex code)
- backgroundColor: Background color (hex code)

Only respond with valid JSON in this format:
{
  "settings": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "headerImage": "url",
    ...
  },
  "explanation": "Brief explanation of what you changed"
}

If the user's request is not design-related, respond with:
{
  "error": "I can only help with design and layout changes. Please ask about colors, images, or layout adjustments.",
  "explanation": "Message to user"
}`,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        },
      });

      if (error) throw error;

      const responseText = data.response;
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        // If not JSON, treat as explanation
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText },
        ]);
        setIsLoading(false);
        return;
      }

      if (parsedResponse.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: parsedResponse.explanation },
        ]);
        setIsLoading(false);
        return;
      }

      // Apply the design settings
      const newSettings = {
        ...(currentDesignSettings || {}),
        ...parsedResponse.settings,
      };

      const { error: updateError } = await supabase
        .from('advisors')
        .update({
          social_links: {
            ...(currentDesignSettings || {}),
            design_settings: newSettings,
          },
        })
        .eq('id', agentId)
        .eq('edit_code', editCode);

      if (updateError) throw updateError;

      onDesignUpdate(newSettings);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: parsedResponse.explanation || "I've updated your design! Check out the changes.",
        },
      ]);
      
      toast.success("Design updated successfully!");
    } catch (error: any) {
      console.error("Error processing design request:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that request. Could you try rephrasing it?",
        },
      ]);
      toast.error("Failed to update design");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-[#82f3aa] focus:ring-offset-2"
          style={{
            background: "linear-gradient(135deg, #82f3aa 0%, #6dd991 100%)",
          }}
        >
          <img
            src={simDesignerIcon}
            alt="SIM Designer"
            className="w-full h-full rounded-full object-cover"
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-card border-2 rounded-lg shadow-2xl flex flex-col overflow-hidden"
          style={{ borderColor: "#82f3aa" }}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-black"
            style={{ backgroundColor: "#82f3aa" }}
          >
            <div className="flex items-center gap-3">
              <img
                src={simDesignerIcon}
                alt="SIM Designer"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">SIM Designer</h3>
                <p className="text-xs opacity-90">Customize your store design</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-[#82f3aa] text-black"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevertToDefault}
              disabled={isLoading}
              className="w-full mb-2"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert to Default
            </Button>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Describe your design changes..."
                className="resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                style={{ backgroundColor: "#82f3aa", color: "#000" }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};