import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Send, Check, Loader2, ExternalLink } from "lucide-react";
import callCenterAgent from "@/assets/call-center-agent.png";

interface Message {
  role: 'agent' | 'user';
  content: string;
  products?: Product[];
  recommendations?: Recommendation[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

interface Recommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
}

export const AgentStorefrontDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recommendations: Recommendation[] = [
    { id: '1', name: 'Classic Denim Jacket', price: 89, image: '👔', url: '#' },
    { id: '2', name: 'Cotton Summer Dress', price: 65, image: '👗', url: '#' },
    { id: '3', name: 'Leather Boots', price: 120, image: '👢', url: '#' },
    { id: '4', name: 'Wool Sweater', price: 75, image: '🧥', url: '#' },
    { id: '5', name: 'Casual Sneakers', price: 95, image: '👟', url: '#' },
  ];

  useEffect(() => {
    // Initial greeting with context awareness
    setTimeout(() => {
      setMessages([{
        role: 'agent',
        content: "Hi! I noticed you're browsing our Fall Collection. I'm your personal shopping assistant and I can see you're on our Women's Outerwear page. Are you shopping for yourself or looking for a gift? What's your style preference—casual, formal, or something in between?"
      }]);
    }, 500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAgentResponse = (userMessage: string, recommendationId?: string) => {
    setIsTyping(true);
    const lowerMessage = userMessage.toLowerCase();
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (recommendationId) {
        const item = recommendations.find(r => r.id === recommendationId);
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Great choice! The ${item?.name} is one of our bestsellers. Processing your order now...`
        }]);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Order confirmed! Your ${item?.name} will arrive in 3-5 business days. I've also added a 10% discount code to your email. Would you like to see matching accessories?`
          }]);
          setPurchasedProduct(recommendationId);
          
          setTimeout(() => setPurchasedProduct(null), 3000);
        }, 1500);
      } else if (lowerMessage.includes('casual') || lowerMessage.includes('everyday')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Perfect! I see you've spent 2 minutes looking at our denim section. Based on your browsing, here are my top picks for casual wear. Click any item to view details and purchase:",
          recommendations: [recommendations[0], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('formal') || lowerMessage.includes('work') || lowerMessage.includes('office')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Excellent! I noticed you previously viewed our Professional Collection. Here are some pieces that would work great for the office:",
          recommendations: [recommendations[3], recommendations[1]]
        }]);
      } else if (lowerMessage.includes('gift') || lowerMessage.includes('someone')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Shopping for someone special! What's their style? Are they more into classic pieces or trendy fashion? Also, what's your budget range?"
        }]);
      } else if (lowerMessage.includes('boot') || lowerMessage.includes('shoes') || lowerMessage.includes('footwear')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I see you're interested in footwear! Based on the jacket you were looking at earlier, these would pair perfectly:",
          recommendations: [recommendations[2], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('myself') || lowerMessage.includes('me')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Love it! Since you've been browsing our Fall Collection, what's the occasion? Are you updating your everyday wardrobe, or looking for something special?"
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help you find exactly what you need! I notice you've been on this page for a few minutes. Would you like me to show you our trending items, or would you prefer personalized recommendations based on your browsing history?"
        }]);
      }
    }, 800);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const userInput = input;
    setInput('');
    
    simulateAgentResponse(userInput);
  };

  const handleRecommendationClick = (e: React.MouseEvent, recommendationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const item = recommendations.find(r => r.id === recommendationId);
    if (!item) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: `Tell me more about the ${item.name}`
    }]);

    simulateAgentResponse(`purchase ${item.name}`, recommendationId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[500px] flex flex-col bg-card border-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
          <img src={callCenterAgent} alt="AI Assistant" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Shopping Assistant</h3>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} rounded-lg p-3`}>
              <p className="text-sm">{message.content}</p>
              
              {message.recommendations && (
                <div className="mt-3 space-y-2">
                  {message.recommendations.map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={(e) => handleRecommendationClick(e, rec.id)}
                      className="w-full flex items-center gap-3 p-3 bg-background hover:bg-accent text-foreground border border-border rounded-lg transition-colors text-left"
                    >
                      <span className="text-3xl">{rec.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.name}</p>
                        <p className="text-xs text-muted-foreground">${rec.price}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Typing...</span>
            </div>
          </div>
        )}

        {purchasedProduct && (
          <div className="flex justify-center">
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg p-3 flex items-center gap-2 border border-green-500/20">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Purchase Complete!</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
