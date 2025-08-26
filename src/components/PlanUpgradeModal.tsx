import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';
import { STRIPE_PLANS, PlanId } from '@/lib/stripe';
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
import { Check, Crown, Zap, Star, CreditCard, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanChanged?: () => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  onPlanChanged,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userPlan, setUserPlan] = useState<PlanId>('free');
  const [userCredits, setUserCredits] = useState(30);
  const [maxCredits, setMaxCredits] = useState(30);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Load user subscription data
  useEffect(() => {
    const loadUserData = async () => {
      if (!isOpen || !user) return;
      
      setIsLoading(true);
      try {
        const planData = await paymentService.getUserPlanAndCredits();
        setUserPlan(planData.plan);
        setUserCredits(planData.credits);
        setMaxCredits(planData.maxCredits);
        setHasActiveSubscription(!!planData.subscription);
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ type: 'error', text: 'Failed to load subscription data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isOpen, user]);

  const plans = Object.values(STRIPE_PLANS).map(plan => ({
    ...plan,
    icon: plan.id === 'free' ? <Zap className="h-5 w-5" /> : 
          plan.id === 'plus' ? <Crown className="h-5 w-5" /> : 
          <Star className="h-5 w-5" />,
    popular: plan.id === 'plus',
    current: plan.id === userPlan
  }));

  const handlePlanSelect = async (planId: PlanId) => {
    if (planId === userPlan) {
      setMessage({ type: 'error', text: 'You are already on this plan' });
      return;
    }

    if (planId === 'free') {
      setMessage({ type: 'error', text: 'To downgrade to the free plan, please cancel your subscription from the billing portal.' });
      return;
    }

    setLoadingPlan(planId);
    setMessage(null);

    try {
      // Redirect to Stripe checkout
      await paymentService.redirectToCheckout(planId);
      // Note: User will be redirected to Stripe, so this won't execute
    } catch (error: any) {
      console.error('Error starting checkout:', error);
      setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!hasActiveSubscription) {
      setMessage({ type: 'error', text: 'No active subscription to manage' });
      return;
    }

    setIsLoading(true);
    try {
      await paymentService.redirectToBillingPortal();
      // Note: User will be redirected to Stripe billing portal
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      setMessage({ type: 'error', text: 'Failed to open billing portal. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none h-[95vh] max-h-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Your Plan</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Current Usage */}
          <div className="mb-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Plan: {STRIPE_PLANS[userPlan]?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {userCredits} of {maxCredits} messages remaining this month
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {userPlan}
                </Badge>
                {hasActiveSubscription && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Manage Billing
                  </Button>
                )}
              </div>
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
                    onClick={() => handlePlanSelect(plan.id as PlanId)}
                    disabled={isLoading || loadingPlan !== null || plan.current}
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.current ? 'secondary' : plan.popular ? 'default' : 'outline'}
                  >
                    {plan.current ? (
                      'Current Plan'
                    ) : loadingPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Redirecting...
                      </div>
                    ) : plan.id === 'free' ? (
                      'Free Plan'
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Upgrade to {plan.name}
                      </div>
                    )}
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
