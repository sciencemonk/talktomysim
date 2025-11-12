import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Check, Loader2, ExternalLink, X, Minus } from "lucide-react";

import productDenimJacket from "@/assets/product-denim-jacket.jpg";
import productSummerDress from "@/assets/product-summer-dress.jpg";
import productLeatherBoots from "@/assets/product-leather-boots.jpg";
import productWoolSweater from "@/assets/product-wool-sweater.jpg";
import productSneakers from "@/assets/product-sneakers.jpg";
import callCenterAgent from "@/assets/call-center-agent.png";

interface Message {
  role: 'agent' | 'user';
  content: string;
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
}

export const FloatingAgentDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recommendations: Recommendation[] = [
    { id: '1', name: 'Classic Denim Jacket', price: 89, image: productDenimJacket, url: '#' },
    { id: '2', name: 'Cotton Summer Dress', price: 65, image: productSummerDress, url: '#' },
    { id: '3', name: 'Leather Boots', price: 120, image: productLeatherBoots, url: '#' },
    { id: '4', name: 'Wool Sweater', price: 75, image: productWoolSweater, url: '#' },
    { id: '5', name: 'Casual Sneakers', price: 95, image: productSneakers, url: '#' },
  ];

  useEffect(() => {
    // Auto-open after 2 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initial greeting when opened for the first time
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          role: 'agent',
          content: "Hi! I noticed you're browsing our Fall Collection. I'm your personal shopping assistant and I can see you're on our Women's Outerwear page. Are you shopping for yourself or looking for a gift?"
        }]);
      }, 500);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAgentResponse = (userMessage: string, recommendationId?: string, confirmPurchase?: boolean) => {
    setIsTyping(true);
    const lowerMessage = userMessage.toLowerCase();
    
    // Get recent conversation context
    const recentMessages = messages.slice(-3).map(m => m.content.toLowerCase()).join(' ');
    const conversationContext = recentMessages + ' ' + lowerMessage;
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (confirmPurchase && pendingPurchase) {
        const item = recommendations.find(r => r.id === pendingPurchase);
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Perfect! Processing your order for the ${item?.name}...`
        }]);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Order confirmed! Your ${item?.name} will arrive in 3-5 business days. I've also added a 10% discount code to your email. Would you like to see matching accessories?`
          }]);
          setPurchasedProduct(pendingPurchase);
          setPendingPurchase(null);
          
          setTimeout(() => setPurchasedProduct(null), 3000);
        }, 1500);
      } else if (recommendationId) {
        const item = recommendations.find(r => r.id === recommendationId);
        setPendingPurchase(recommendationId);
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Great choice! The ${item?.name} is one of our bestsellers. It's currently priced at $${item?.price}. Would you like to proceed with this purchase?`
        }]);
      } else if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('proceed') || lowerMessage.includes('purchase')) {
        if (pendingPurchase) {
          simulateAgentResponse('', undefined, true);
          return;
        }
        // Handle "yes" response to accessories question
        if (conversationContext.includes('accessories') || conversationContext.includes('matching')) {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: "Great! Here are some perfect accessories to complement your style:",
            recommendations: [recommendations[2], recommendations[4]]
          }]);
          return;
        }
      } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel') || lowerMessage.includes('not now')) {
        if (pendingPurchase) {
          setPendingPurchase(null);
          setMessages(prev => [...prev, {
            role: 'agent',
            content: "No problem! Take your time browsing. Would you like to see other options?"
          }]);
          return;
        }
        // Handle "no" after order completion / accessories offer
        if (conversationContext.includes('order confirmed') || conversationContext.includes('accessories') || conversationContext.includes('arrive in')) {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: "Perfect! Thank you for shopping with us. Your order is confirmed and on its way. Feel free to reach out anytime if you need anything else. Have a wonderful day! 😊"
          }]);
          return;
        }
      } else if (lowerMessage.includes('casual') || lowerMessage.includes('everyday')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Perfect! I see you've spent 2 minutes looking at our denim section. Based on your browsing, here are my top picks for casual wear:",
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
      } else if (lowerMessage.includes('black') || lowerMessage.includes('dark')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Great! Our black collection is very popular. These pieces would work perfectly:",
          recommendations: [recommendations[0], recommendations[2]]
        }]);
      } else if (lowerMessage.includes('color') || lowerMessage.includes('blue') || lowerMessage.includes('red') || lowerMessage.includes('white')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help you find that! Here are some options in different colors:",
          recommendations: [recommendations[1], recommendations[3], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('size') || lowerMessage.includes('fit') || lowerMessage.includes('small') || lowerMessage.includes('medium') || lowerMessage.includes('large')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "All of these items are available in sizes XS through XL. Would you like me to show you items that tend to run true to size, or would you prefer oversized styles?"
        }]);
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable') || lowerMessage.includes('expensive')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help with that! What's your price range? Here are some options under $100:",
          recommendations: [recommendations[0], recommendations[1], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('more') || lowerMessage.includes('other') || lowerMessage.includes('different') || lowerMessage.includes('else')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Of course! Here are some other great options I think you'll love:",
          recommendations: [recommendations[3], recommendations[1]]
        }]);
      } else if (conversationContext.includes('trendy') || conversationContext.includes('trend') || lowerMessage.includes('trendy') || lowerMessage.includes('trend')) {
        // Check if user is responding to a style question
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Perfect! Here are our trendiest pieces right now - these are what fashion-forward shoppers are loving:",
          recommendations: [recommendations[1], recommendations[4], recommendations[0]]
        }]);
      } else if (conversationContext.includes('classic') && (conversationContext.includes('style') || conversationContext.includes('fashion'))) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Excellent taste! Here are our timeless classic pieces that never go out of style:",
          recommendations: [recommendations[0], recommendations[3]]
        }]);
      } else if (lowerMessage.includes('myself') || lowerMessage.includes('me')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Love it! Since you've been browsing our Fall Collection, what's the occasion? Are you updating your everyday wardrobe, or looking for something special?"
        }]);
      } else if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('bestseller')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Here are our top trending items this season! These are flying off the shelves:",
          recommendations: [recommendations[0], recommendations[2], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('boot') || lowerMessage.includes('shoes') || lowerMessage.includes('footwear')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Great choice! Here are our most popular footwear options:",
          recommendations: [recommendations[2], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('black') || lowerMessage.includes('dark')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Great! Our black collection is very popular. These pieces would work perfectly:",
          recommendations: [recommendations[0], recommendations[2]]
        }]);
      } else if (lowerMessage.includes('color') || lowerMessage.includes('blue') || lowerMessage.includes('red') || lowerMessage.includes('white')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help you find that! Here are some options in different colors:",
          recommendations: [recommendations[1], recommendations[3], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('size') || lowerMessage.includes('fit') || lowerMessage.includes('small') || lowerMessage.includes('medium') || lowerMessage.includes('large')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "All of these items are available in sizes XS through XL. Would you like me to show you items that tend to run true to size, or would you prefer oversized styles?"
        }]);
      } else if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable') || lowerMessage.includes('expensive')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help with that! What's your price range? Here are some options under $100:",
          recommendations: [recommendations[0], recommendations[1], recommendations[4]]
        }]);
      } else if (lowerMessage.includes('more') || lowerMessage.includes('other') || lowerMessage.includes('different') || lowerMessage.includes('else')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Of course! Here are some other great options I think you'll love:",
          recommendations: [recommendations[3], recommendations[1]]
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I can help you find exactly what you need! Would you like to see our trending items, or would you prefer personalized recommendations based on your browsing?"
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50 animate-fade-in overflow-hidden"
      >
        <img src={callCenterAgent} alt="AI Assistant" className="w-full h-full object-cover" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <Card className="w-[400px] h-[600px] flex flex-col bg-card border-border shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src={callCenterAgent} alt="AI Assistant" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Shopping Assistant</h3>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} rounded-lg p-3`}>
                <p className="text-sm">{message.content}</p>
                
                {message.recommendations && (
                  <div className="mt-3 space-y-2">
                    {message.recommendations.map(rec => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={(e) => handleRecommendationClick(e, rec.id)}
                        className="w-full flex items-center gap-3 p-3 bg-background hover:bg-accent text-foreground border border-border rounded-lg transition-all hover:scale-[1.02] text-left"
                      >
                        <img src={rec.image} alt={rec.name} className="w-16 h-16 object-cover rounded" />
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
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted text-foreground rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          )}

          {purchasedProduct && (
            <div className="flex justify-center animate-scale-in">
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
    </div>
  );
};
