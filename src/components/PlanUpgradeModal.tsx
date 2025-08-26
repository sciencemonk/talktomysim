import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  currentCredits?: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  icon: React.ReactNode;
  features: string[];
  credits: number;
  popular?: boolean;
  current?: boolean;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  currentCredits = 30,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceDisplay: 'Free',
      icon: <Zap className="h-5 w-5" />,
      features: [
        '30 monthly messages',
        'Basic AI conversations',
        'Standard support',
        'Community access'
      ],
      credits: 30,
      current: currentPlan === 'free'
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 20,
      priceDisplay: '$20/month',
      icon: <Crown className="h-5 w-5" />,
      features: [
        '100 monthly messages',
        'Advanced AI conversations',
        'Priority support',
        'Enhanced features',
        'Conversation history'
      ],
      credits: 100,
      popular: true,
      current: currentPlan === 'plus'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 200,
      priceDisplay: '$200/month',
      icon: <Star className="h-5 w-5" />,
      features: [
        '1,000+ monthly messages',
        'Unlimited AI conversations',
        'Premium support',
        'All features included',
        'Advanced analytics',
        'Custom integrations'
      ],
      credits: 1000,
      current: currentPlan === 'pro'
    }
  ];

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) {
      setMessage({ type: 'error', text: 'You are already on this plan' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // For now, just show a message about contacting support
      // In a real implementation, you'd integrate with a payment processor
      if (planId === 'free') {
        setMessage({ 
          type: 'success', 
          text: 'Successfully downgraded to Free plan! Your credits will reset at the next billing cycle.' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `Thank you for your interest in the ${plans.find(p => p.id === planId)?.name} plan! Please contact support to complete your upgrade.` 
        });
      }
    } catch (error: any) {
      console.error('Error updating plan:', error);
      setMessage({ type: 'error', text: 'Failed to update plan. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Upgrade your account to unlock more conversations and advanced features
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Current Usage */}
          <div className="mb-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Plan: {plans.find(p => p.current)?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentCredits} messages remaining this month
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {currentPlan}
              </Badge>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className="mb-6">
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''} ${plan.current ? 'bg-muted/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>${plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isLoading || plan.current}
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.current ? 'secondary' : plan.popular ? 'default' : 'outline'}
                  >
                    {plan.current ? 'Current Plan' : isLoading ? 'Processing...' : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">How messaging credits work:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Each conversation message (yours and the AI's response) counts as 1 credit</li>
              <li>• Credits reset monthly on your billing date</li>
              <li>• Unused credits don't roll over to the next month</li>
              <li>• You can track your usage in your account settings</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
