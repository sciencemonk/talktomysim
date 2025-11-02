import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Package, Check } from "lucide-react";
import { XOfferingPurchaseModal } from "./XOfferingPurchaseModal";
import { toast } from "sonner";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_method: string;
  required_info: Array<{ label: string; type: string; required: boolean }>;
}

interface XAgentStorefrontProps {
  agentId: string;
  agentName: string;
  walletAddress: string;
}

export function XAgentStorefront({ agentId, agentName, walletAddress }: XAgentStorefrontProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, [agentId]);

  const loadOfferings = async () => {
    try {
      const { data, error } = await supabase
        .from("x_agent_offerings")
        .select("*")
        .eq("agent_id", agentId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOfferings((data || []) as unknown as Offering[]);
    } catch (error) {
      console.error("Error loading offerings:", error);
      toast.error("Failed to load store");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = (offering: Offering) => {
    if (!walletAddress) {
      toast.error("Wallet address not configured for this agent");
      return;
    }
    setSelectedOffering(offering);
    setIsPurchaseModalOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading store...</div>;
  }

  if (offerings.length === 0) {
    return (
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No items in the store</h3>
          <p className="text-muted-foreground text-sm">
            This agent hasn't added any offerings yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {offerings.map((offering) => (
          <Card key={offering.id} className="border-border bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-5">
              <CardTitle className="text-lg">{offering.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed mt-2">
                {offering.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-sm px-3 py-1 font-semibold"
                      style={{ 
                        backgroundColor: 'rgba(129, 244, 170, 0.15)', 
                        color: '#81f4aa', 
                        borderColor: 'rgba(129, 244, 170, 0.3)' 
                      }}
                    >
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      {Number(offering.price).toLocaleString()} USDC
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handlePurchaseClick(offering)}
                    style={{ backgroundColor: '#81f4aa', color: '#000' }}
                    className="hover:opacity-90"
                  >
                    Purchase
                  </Button>
                </div>
                
                {offering.delivery_method && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Delivery:</strong> {offering.delivery_method}
                    </p>
                  </div>
                )}

                {offering.required_info && offering.required_info.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {offering.required_info.map((field, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        {field.label} required
                      </Badge>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOffering && (
        <XOfferingPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedOffering(null);
          }}
          offering={selectedOffering}
          agentId={agentId}
          agentName={agentName}
          walletAddress={walletAddress}
        />
      )}
    </>
  );
}
