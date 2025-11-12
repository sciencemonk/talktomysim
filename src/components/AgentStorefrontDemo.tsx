import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bot, Send, Check, Loader2 } from "lucide-react";

interface Message {
  role: 'agent' | 'user';
  content: string;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export const AgentStorefrontDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const products: Product[] = [
    { id: '1', name: 'Premium Plan', price: 29, emoji: '⭐' },
    { id: '2', name: 'Enterprise Plan', price: 99, emoji: '🚀' },
    { id: '3', name: 'Starter Pack', price: 9, emoji: '🎯' },
  ];

  useEffect(() => {
    // Initial greeting
    setTimeout(() => {
      setMessages([{
        role: 'agent',
        content: "Hi! I'm your AI shopping assistant. I can help you find the perfect product and complete your purchase right here in chat. What are you looking for today?",
        products: products
      }]);
    }, 500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAgentResponse = (userMessage: string, productId?: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      if (productId) {
        const product = products.find(p => p.id === productId);
        setMessages(prev => [...prev, {
          role: 'agent',
          content: `Perfect choice! Processing your payment for ${product?.name}...`
        }]);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: `Payment successful! Your ${product?.name} has been activated. Check your email for details. Is there anything else I can help you with?`
          }]);
          setPurchasedProduct(productId);
          
          setTimeout(() => setPurchasedProduct(null), 3000);
        }, 1500);
      } else if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('options')) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "I'd be happy to help! Here are our current offerings. Click on any product to purchase instantly:",
          products: products
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Great question! Our plans include advanced analytics, priority support, and API access. Which plan interests you most? Just click on one to purchase!"
        }]);
      }
    }, 800);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const userInput = input;
    setInput('');
    
    simulateAgentResponse(userInput);
  };

  const handleProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: `I'd like to purchase ${product.name}`
    }]);

    simulateAgentResponse(`purchase ${product.name}`, productId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[500px] flex flex-col bg-card border-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
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
              
              {message.products && (
                <div className="mt-3 space-y-2">
                  {message.products.map(product => (
                    <Button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      variant="outline"
                      className="w-full justify-between bg-background hover:bg-accent text-foreground border-border"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{product.emoji}</span>
                        <span>{product.name}</span>
                      </span>
                      <Badge variant="secondary">${product.price}/mo</Badge>
                    </Button>
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
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
