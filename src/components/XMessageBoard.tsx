import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MessageSquare, Send, Plus } from "lucide-react";
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

const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined;
  
  // Handle Twitter/X images with CORS proxy
  if (url.includes('pbs.twimg.com') || url.includes('twimg.com')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }
  
  // Handle IPFS URLs
  if (url.includes('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  // Handle gateway.pinata.cloud URLs
  if (url.includes('gateway.pinata.cloud')) {
    const hash = url.split('/ipfs/')[1];
    if (hash) {
      return `https://ipfs.io/ipfs/${hash}`;
    }
  }
  
  // Handle cf-ipfs.com URLs (which are failing)
  if (url.includes('cf-ipfs.com')) {
    const hash = url.split('/ipfs/')[1];
    if (hash) {
      return `https://ipfs.io/ipfs/${hash}`;
    }
  }
  
  return url;
};

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Demo messages
  const demoMessages: Message[] = [
    {
      id: "demo-1",
      content: "What's your take on the current market trends?",
      sender_name: "CryptoEnthusiast",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      response: "Great question! Based on recent data, we're seeing increased institutional adoption...",
      response_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "demo-2",
      content: "Can you share your thoughts on DeFi's future?",
      sender_name: "BlockchainDev",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      response: "DeFi is evolving rapidly. The key trends I'm watching are...",
      response_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    }
  ];

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
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
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
          sender_name: 'Anonymous',
          session_id: sessionId,
          payment_amount: price
        });

      if (error) throw error;

      toast.success("Message posted successfully!");
      setNewMessage("");
      setIsDialogOpen(false);
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error("Failed to post message");
    } finally {
      setIsPosting(false);
    }
  };

  // Combine real and demo messages
  const displayMessages = [...messages, ...demoMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-4 md:p-6 border-b border-border/50">
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-2 md:gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)' }}>
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 shrink-0" style={{ color: '#81f4aa' }} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg md:text-xl mb-1 font-bold">Public Message Board</CardTitle>
                <CardDescription className="text-xs md:text-sm leading-relaxed">
                  Messages from the community • ${price} per post
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 h-10 px-4 md:px-5 shrink-0 font-medium shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: '#81f4aa', color: '#000' }}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Post Message</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">Post a Message</DialogTitle>
                  <DialogDescription className="text-xs md:text-sm">
                    Pay ${price} USDC to post and get a response from @{xUsername}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 md:space-y-4 py-3 md:py-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs md:text-sm font-medium">Message</label>
                      <span className="text-xs text-muted-foreground">
                        {newMessage.length}/500
                      </span>
                    </div>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setNewMessage(e.target.value);
                        }
                      }}
                      placeholder="Write your message..."
                      rows={4}
                      maxLength={500}
                      className="resize-none text-xs md:text-sm"
                    />
                  </div>
                  <Button 
                    onClick={handlePostMessage}
                    disabled={!newMessage.trim() || isPosting}
                    className="w-full h-10 text-xs md:text-sm hover:opacity-90"
                    style={{ backgroundColor: '#81f4aa', color: '#000' }}
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Pay ${price} USDC & Post
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
          {/* Messages List */}
          <div className="space-y-3 md:space-y-4 max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" style={{ color: '#81f4aa' }} />
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center py-10 md:py-16 text-muted-foreground">
                <div className="p-4 rounded-full inline-flex mb-3" style={{ backgroundColor: 'rgba(129, 244, 170, 0.1)' }}>
                  <MessageSquare className="h-12 w-12 md:h-16 md:w-16 opacity-50" style={{ color: '#81f4aa' }} />
                </div>
                <p className="text-sm md:text-base font-medium">No messages yet. Be the first to post!</p>
              </div>
            ) : (
              displayMessages.map((message) => (
                <div key={message.id} className="p-3 md:p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow space-y-2 md:space-y-3">
                  {/* Original Message - Just the content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] md:text-xs px-2 py-0.5 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                        Paid ${price}
                      </Badge>
                      <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
                  </div>

                  {/* Response */}
                  {message.response && (
                    <div className="flex gap-2 md:gap-3 pt-2 pl-3 md:pl-4 border-l-2 rounded-l-lg py-2" style={{ borderColor: '#81f4aa', backgroundColor: 'rgba(129, 244, 170, 0.05)' }}>
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0 ring-2 ring-[#81f4aa]/30">
                        <AvatarImage 
                          src={getImageUrl(agentAvatar)} 
                          alt={agentName}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-xs font-semibold">{agentName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                          <span className="font-semibold text-xs md:text-sm truncate">@{xUsername}</span>
                          <Badge variant="secondary" className="text-[10px] md:text-xs px-2 py-0.5 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                            Creator
                          </Badge>
                          {message.response_at && (
                            <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(message.response_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm break-words leading-relaxed opacity-90">{message.response}</p>
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
