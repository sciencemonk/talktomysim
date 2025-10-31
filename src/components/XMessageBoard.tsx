import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { X402PaymentModal } from "./X402PaymentModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_name: string;
  created_at: string;
  response?: string;
  response_at?: string;
}

interface XMessageBoardProps {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  price: number;
  walletAddress?: string;
  xUsername?: string;
}

export const XMessageBoard = ({
  agentId,
  agentName,
  agentAvatar,
  price,
  walletAddress,
  xUsername
}: XMessageBoardProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`x_messages_${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'x_messages',
          filter: `agent_id=eq.${agentId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('x_messages')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostMessage = () => {
    if (!newMessage.trim() || !senderName.trim()) {
      toast.error("Please enter your name and message");
      return;
    }

    if (!walletAddress) {
      toast.error("Wallet address not configured for this agent");
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (sessionId: string) => {
    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('x_messages')
        .insert({
          agent_id: agentId,
          content: newMessage,
          sender_name: senderName,
          session_id: sessionId,
          payment_amount: price
        });

      if (error) throw error;

      toast.success("Message posted successfully!");
      setNewMessage("");
      setSenderName("");
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error("Failed to post message");
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Public Message Board
          </CardTitle>
          <CardDescription>
            Post a message for ${price} USDC and get a response from @{xUsername}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post Message Form */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <label className="text-sm font-medium mb-1 block">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message..."
                rows={3}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handlePostMessage}
              disabled={!newMessage.trim() || !senderName.trim() || isPosting}
              className="w-full"
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pay ${price} USDC & Post Message
                </>
              )}
            </Button>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Be the first to post!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                  {/* Original Message */}
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{message.sender_name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.sender_name}</span>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          Paid ${price}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>

                  {/* Response */}
                  {message.response && (
                    <div className="flex gap-3 ml-8 pl-4 border-l-2 border-primary/30">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agentAvatar} />
                        <AvatarFallback>{agentName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">@{xUsername}</span>
                          <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-500">
                            Creator
                          </Badge>
                          {message.response_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.response_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{message.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {walletAddress && (
        <X402PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          simName={agentName}
          price={price}
          walletAddress={walletAddress}
        />
      )}
    </>
  );
};
