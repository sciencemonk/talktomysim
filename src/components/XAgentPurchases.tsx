import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Check, Clock, DollarSign, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Purchase {
  id: string;
  offering_id: string;
  payment_amount: number;
  buyer_info: Record<string, string>;
  status: string;
  fulfilled_at: string | null;
  created_at: string;
  x_agent_offerings: {
    title: string;
    description: string;
  };
}

interface XAgentPurchasesProps {
  agentId: string;
}

export function XAgentPurchases({ agentId }: XAgentPurchasesProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, [agentId]);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("x_agent_purchases")
        .select(`
          *,
          x_agent_offerings (
            title,
            description
          )
        `)
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPurchases((data || []) as unknown as Purchase[]);
    } catch (error) {
      console.error("Error loading purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkFulfilled = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from("x_agent_purchases")
        .update({
          status: "fulfilled",
          fulfilled_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      if (error) throw error;
      toast.success("Marked as fulfilled");
      loadPurchases();
    } catch (error) {
      console.error("Error marking fulfilled:", error);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading purchases...</div>;
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
          <p className="text-muted-foreground">
            Your store purchases will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Purchase Orders</h3>
          <p className="text-sm text-muted-foreground">
            {purchases.length} total purchase{purchases.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {purchase.x_agent_offerings?.title || "Unknown Offering"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {format(new Date(purchase.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                <Badge
                  variant={purchase.status === "fulfilled" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {purchase.status === "fulfilled" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {purchase.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${purchase.payment_amount} USDC</span>
              </div>

              {purchase.buyer_info && Object.keys(purchase.buyer_info).length > 0 && (
                <div className="p-3 bg-muted rounded-md space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Buyer Information</span>
                  </div>
                  {Object.entries(purchase.buyer_info).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span>{" "}
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {purchase.status === "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkFulfilled(purchase.id)}
                  className="w-full"
                >
                  Mark as Fulfilled
                </Button>
              )}

              {purchase.fulfilled_at && (
                <p className="text-xs text-muted-foreground">
                  Fulfilled on {format(new Date(purchase.fulfilled_at), "MMM d, yyyy")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
