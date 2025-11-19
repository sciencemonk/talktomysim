import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Send } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_urls?: string[];
}

interface MockCheckoutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  onCheckoutComplete?: (productTitle: string) => void;
}

type CheckoutStep = 'name' | 'email' | 'address' | 'payment' | 'complete';

interface Message {
  role: 'agent' | 'user';
  content: string;
}

export const MockCheckoutModal = ({
  product,
  isOpen,
  onClose,
  storeName,
  onCheckoutComplete,
}: MockCheckoutModalProps) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('name');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    address: '',
    payment: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      // Reset state when modal opens
      setCurrentStep('name');
      setUserInput('');
      setCheckoutData({ name: '', email: '', address: '', payment: '' });
      setMessages([
        {
          role: 'agent',
          content: `Great choice! Let's get your ${product.title} on its way to you. First, what's your full name?`,
        },
      ]);
    }
  }, [isOpen, product]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    
    // Update checkout data based on current step
    const updatedData = { ...checkoutData };
    let nextStep: CheckoutStep = currentStep;
    let agentResponse = '';

    switch (currentStep) {
      case 'name':
        updatedData.name = userInput;
        nextStep = 'email';
        agentResponse = `Thanks, ${userInput}! Now, what email should I use for your order confirmation?`;
        break;
      case 'email':
        updatedData.email = userInput;
        nextStep = 'address';
        agentResponse = "Perfect! Where should we ship your order? Please provide your full address.";
        break;
      case 'address':
        updatedData.address = userInput;
        nextStep = 'payment';
        agentResponse = "Got it! Last step - what payment method would you like to use? (This is just a demo, so feel free to say anything!)";
        break;
      case 'payment':
        updatedData.payment = userInput;
        nextStep = 'complete';
        agentResponse = `Awesome! Your order for ${product?.title} is confirmed! We'll send tracking details to ${updatedData.email}. Thanks for shopping with ${storeName}!`;
        break;
    }

    setCheckoutData(updatedData);
    newMessages.push({ role: 'agent', content: agentResponse });
    setMessages(newMessages);
    setCurrentStep(nextStep);
    setUserInput('');

    // If complete, trigger callback after a delay
    if (nextStep === 'complete' && product) {
      setTimeout(() => {
        onCheckoutComplete?.(product.title);
      }, 2000);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!product) return null;

  const displayImage = product.image_urls && product.image_urls.length > 0
    ? product.image_urls[0]
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
          <DialogDescription className="sr-only">
            Complete your purchase with our AI agent
          </DialogDescription>
        </DialogHeader>

        {/* Product Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          {displayImage && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={displayImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{product.title}</h3>
            <p className="text-lg font-bold text-primary">
              ${formatPrice(product.price)}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[300px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        {currentStep !== 'complete' ? (
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={
                currentStep === 'name'
                  ? 'Enter your name...'
                  : currentStep === 'email'
                  ? 'Enter your email...'
                  : currentStep === 'address'
                  ? 'Enter your address...'
                  : 'Enter payment method...'
              }
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={!userInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <Button onClick={handleClose} className="w-full max-w-xs">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
