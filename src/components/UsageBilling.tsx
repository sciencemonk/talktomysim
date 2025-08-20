
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CreditCard, Star, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface UsageBillingProps {
  onClose?: () => void;
}

const UsageBilling = ({ onClose }: UsageBillingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data - replace with real data
  const hoursRemaining = 0.0;
  const totalHours = 10;
  const usagePercentage = ((totalHours - hoursRemaining) / totalHours) * 100;

  const packages = [
    {
      hours: 1,
      price: 20,
      pricePerHour: 20,
      popular: false,
    },
    {
      hours: 5,
      price: 80,
      pricePerHour: 16,
      popular: true,
    },
    {
      hours: 10,
      price: 165,
      pricePerHour: 16.5,
      popular: false,
    }
  ];

  const handlePurchase = async (packageInfo: typeof packages[0]) => {
    setIsLoading(true);
    try {
      // TODO: Implement Stripe integration
      console.log("Purchasing package:", packageInfo);
      toast({
        title: "Purchase initiated",
        description: `Redirecting to payment for ${packageInfo.hours} hour${packageInfo.hours > 1 ? 's' : ''}...`,
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Usage & Billing</h1>
          <p className="text-fgMuted">Manage your child's learning time</p>
        </div>
      </div>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Usage
          </CardTitle>
          <CardDescription>Your child's remaining learning time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hours Used</span>
            <span className="text-sm text-fgMuted">{totalHours - hoursRemaining} / {totalHours} hours</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{hoursRemaining}</div>
            <div className="text-sm text-fgMuted">Hours Remaining</div>
          </div>
          {hoursRemaining === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-orange-800 font-medium">No hours remaining</p>
              <p className="text-orange-700 text-sm">Purchase more time below to continue learning</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Learning Time
          </CardTitle>
          <CardDescription>Choose a package that works best for your family</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card 
                key={pkg.hours} 
                className={`relative ${pkg.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.hours} Hour{pkg.hours > 1 ? 's' : ''}</CardTitle>
                  <div className="text-3xl font-bold">${pkg.price}</div>
                  <CardDescription>
                    ${pkg.pricePerHour.toFixed(0)} per hour
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(pkg)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Purchase"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-fgMuted">
            <p>Secure payment processed by Stripe</p>
            <p>Hours never expire and can be used anytime</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageBilling;
