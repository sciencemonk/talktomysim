import { CreditCard, Download, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const Billing = () => {
  const creditsLeft = 75;
  const totalCredits = 100;
  const creditsUsed = totalCredits - creditsLeft;
  const progressPercentage = (creditsUsed / totalCredits) * 100;

  const plans = [
    {
      name: "Starter",
      price: "Free",
      credits: 100,
      features: ["Basic AI tutors", "Limited customization", "Community support"]
    },
    {
      name: "Professional",
      price: "$19/month",
      credits: 1000,
      features: ["Advanced AI tutors", "Full customization", "Priority support", "Analytics dashboard"]
    },
    {
      name: "Enterprise",
      price: "$99/month",
      credits: "Unlimited",
      features: ["Everything in Professional", "Custom integrations", "Dedicated support", "Multiple schools"]
    }
  ];

  const invoices = [
    { id: "INV-001", date: "2024-01-15", amount: "$19.00", status: "Paid" },
    { id: "INV-002", date: "2023-12-15", amount: "$19.00", status: "Paid" },
    { id: "INV-003", date: "2023-11-15", amount: "$19.00", status: "Paid" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription and view usage</p>
          <Link to="/agents" className="mt-4 inline-block">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Usage
          </CardTitle>
          <CardDescription>Your monthly credit usage and remaining balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Credits Used</span>
            <span className="text-sm text-muted-foreground">{creditsUsed} / {totalCredits}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{creditsLeft}</div>
              <div className="text-sm text-muted-foreground">Credits Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{creditsUsed}</div>
              <div className="text-sm text-muted-foreground">Credits Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Starter</div>
              <div className="text-sm text-muted-foreground">Current Plan</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Choose the plan that works best for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${index === 0 ? 'border-primary' : ''}`}>
                {index === 0 && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    Current Plan
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <CardDescription>
                    {typeof plan.credits === 'number' ? `${plan.credits} credits/month` : plan.credits}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={index === 0 ? "outline" : "default"}
                    disabled={index === 0}
                  >
                    {index === 0 ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id}>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {invoice.status}
                    </Badge>
                    <span className="font-medium">{invoice.amount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
