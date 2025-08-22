
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Intelligence for everyday tasks",
      currentPlan: true,
      features: [
        "Access to GPT-5",
        "Limited file uploads",
        "Limited and slower image generation",
        "Limited memory and context",
        "Limited deep research"
      ]
    },
    {
      name: "Plus",
      price: 20,
      description: "More access to advanced intelligence",
      popular: true,
      features: [
        "GPT-5 with advanced reasoning",
        "Expanded messaging and uploads",
        "Expanded and faster image creation",
        "Expanded memory and context",
        "Expanded deep research and agent mode",
        "Projects, tasks, custom GPTs",
        "Sora video generation",
        "Codex agent"
      ]
    },
    {
      name: "Pro",
      price: 200,
      description: "Full access to the best of ChatGPT",
      features: [
        "GPT-5 with pro reasoning",
        "Unlimited messages and uploads",
        "Unlimited and faster image creation",
        "Maximum memory and context",
        "Maximum deep research and agent mode",
        "Expanded projects, tasks, and custom GPTs",
        "Expanded Sora video generation",
        "Expanded Codex agent",
        "Research preview of new features"
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center mb-2">
            Upgrade your plan
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border rounded-lg p-6 relative flex flex-col"
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                  POPULAR
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">USD / month</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                
                {plan.currentPlan && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Your current plan
                  </div>
                )}
              </div>

              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full ${
                  plan.currentPlan
                    ? "bg-muted text-muted-foreground cursor-default"
                    : plan.name === "Plus"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-black hover:bg-black/90 text-white"
                }`}
                disabled={plan.currentPlan}
              >
                {plan.currentPlan ? "Your current plan" : `Get ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Have an existing plan?{" "}
            <button className="text-primary hover:underline">
              See billing help
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
