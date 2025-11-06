import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Check, Share2 } from "lucide-react";
import { XOfferingPurchaseModal } from "./XOfferingPurchaseModal";
import { DigitalFileModal } from "./DigitalFileModal";
import { AgentOfferingModal } from "./AgentOfferingModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_method: string;
  required_info: Array<{ label: string; type: string; required: boolean }>;
  media_url?: string;
  offering_type?: 'standard' | 'digital' | 'agent';
  digital_file_url?: string;
  blur_preview?: boolean;
}

interface XAgentStorefrontProps {
  agentId: string;
  agentName: string;
  walletAddress: string;
}

export function XAgentStorefront({ agentId, agentName, walletAddress }: XAgentStorefrontProps) {
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showAgentList, setShowAgentList] = useState(false);
  const [selectedAgentOffering, setSelectedAgentOffering] = useState<Offering | null>(null);
  const [agentData, setAgentData] = useState<any>(null);
  const [showDigitalFileModal, setShowDigitalFileModal] = useState(false);
  const [purchasedFileUrl, setPurchasedFileUrl] = useState<string>("");
  const [purchasedFileName, setPurchasedFileName] = useState<string>("");

  useEffect(() => {
    loadOfferings();
    loadAgentData();
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      const { data, error } = await supabase
        .from("advisors")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;
      setAgentData(data);
    } catch (error) {
      console.error("Error loading agent data:", error);
    }
  };

  const loadOfferings = async () => {
    try {
      const { data, error } = await supabase
        .from("x_agent_offerings")
        .select("*")
        .eq("agent_id", agentId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Filter out agent offerings - they're displayed separately
      // An offering is an agent if it has offering_type='agent' OR has agent_system_prompt
      const nonAgentOfferings = (data || []).filter((o: any) => 
        o.offering_type !== 'agent' && !o.agent_system_prompt
      );
      setOfferings(nonAgentOfferings as unknown as Offering[]);
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
    
    // If it's an agent offering, show agent list instead of purchase modal
    if (offering.offering_type === 'agent') {
      setSelectedAgentOffering(offering);
      setShowAgentList(true);
      return;
    }
    
    setSelectedOffering(offering);
    setIsPurchaseModalOpen(true);
  };

  const handleShare = (offeringId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/offering/${offeringId}`;
    navigator.clipboard.writeText(url);
    toast.success("Offering link copied to clipboard!");
  };

  const handleOfferingClick = (offeringId: string) => {
    navigate(`/offering/${offeringId}`);
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
          <Card 
            key={offering.id} 
            className="border-border bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleOfferingClick(offering.id)}
          >
            {offering.media_url && (
              <div className="w-full">
                {offering.media_url.includes('.mp4') || offering.media_url.includes('.webm') || offering.media_url.includes('.mov') ? (
                  <video 
                    src={offering.media_url} 
                    controls 
                    className={`w-full h-64 object-contain bg-muted rounded-t-lg ${offering.blur_preview ? 'blur-xl' : ''}`}
                  />
                ) : (
                  <img 
                    src={offering.media_url} 
                    alt={offering.title}
                    className={`w-full h-64 object-contain bg-muted rounded-t-lg ${offering.blur_preview ? 'blur-xl' : ''}`}
                  />
                )}
              </div>
            )}
            <CardHeader className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{offering.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {offering.description}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleShare(offering.id, e)}
                  className="flex-shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchaseClick(offering);
                  }}
                  style={{ backgroundColor: '#81f4aa', color: '#000' }}
                  className="hover:opacity-90"
                >
                  {offering.offering_type === 'agent' ? 'View Agents' : 'Purchase'}
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
          onPurchaseSuccess={(digitalFileUrl) => {
            if (digitalFileUrl) {
              // Extract filename from URL
              const fileName = digitalFileUrl.split('/').pop() || selectedOffering.title;
              setPurchasedFileUrl(digitalFileUrl);
              setPurchasedFileName(fileName);
              setShowDigitalFileModal(true);
            }
          }}
        />
      )}

      {/* Digital File Display Modal */}
      <DigitalFileModal
        isOpen={showDigitalFileModal}
        onClose={() => setShowDigitalFileModal(false)}
        fileUrl={purchasedFileUrl}
        fileName={purchasedFileName}
        offeringTitle={selectedOffering?.title || ""}
      />

      {selectedAgentOffering && agentData && (
        <AgentOfferingModal
          isOpen={showAgentList}
          onClose={() => {
            setShowAgentList(false);
            setSelectedAgentOffering(null);
          }}
          offering={selectedAgentOffering}
          agentData={{
            id: agentData.id,
            name: agentData.name,
            description: agentData.description,
            avatar: agentData.avatar_url || agentData.avatar || '',
            avatar_url: agentData.avatar_url || agentData.avatar || ''
          }}
          pricePerConversation={0}
        />
      )}
    </>
  );
}
