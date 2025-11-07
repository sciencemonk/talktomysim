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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Store Offerings</h2>
          <Badge variant="secondary" className="text-sm">
            {offerings.length} Available
          </Badge>
        </div>

        {/* Offerings Grid */}
        {offerings.map((offering) => {
          // Generate gradient based on offering ID
          const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          ];
          const gradientIndex = offering.id.charCodeAt(0) % gradients.length;
          const gradient = gradients[gradientIndex];

          return (
            <Card 
              key={offering.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-border"
              onClick={() => handleOfferingClick(offering.id)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image or Gradient */}
                <div 
                  className="md:w-64 h-48 md:h-auto bg-muted relative overflow-hidden shrink-0"
                  style={offering.media_url ? {} : { background: gradient }}
                >
                  {offering.media_url ? (
                    offering.media_url.includes('.mp4') || offering.media_url.includes('.webm') || offering.media_url.includes('.mov') ? (
                      <video 
                        src={offering.media_url} 
                        controls 
                        className={`w-full h-full object-cover ${offering.blur_preview ? 'blur-xl' : ''}`}
                      />
                    ) : (
                      <img 
                        src={offering.media_url} 
                        alt={offering.title}
                        className={`w-full h-full object-cover ${offering.blur_preview ? 'blur-xl' : ''}`}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  {offering.offering_type === 'digital' && (
                    <Badge 
                      className="absolute top-3 right-3 bg-[#635cff] text-white"
                    >
                      Digital
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{offering.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {offering.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-sm text-muted-foreground mb-0.5">Price</div>
                          <div className="text-2xl font-bold flex items-baseline gap-1">
                            <DollarSign className="h-5 w-5" />
                            {Number(offering.price).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-0.5">Delivery</div>
                          <div className="text-sm font-medium">{offering.delivery_method || 'Instant'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          style={{ backgroundColor: '#635cff', color: 'white' }}
                          className="hover:opacity-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchaseClick(offering);
                          }}
                        >
                          Purchase
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`https://solanainternetmarket.com/offering/${offering.id}`);
                            toast.success("Offering link copied!");
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
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
