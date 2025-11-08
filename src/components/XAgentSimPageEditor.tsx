import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Save, ExternalLink, Check, Package, Edit2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { XAgentStorefront } from "@/components/XAgentStorefront";
import { AgentOfferingsDisplay } from "@/components/AgentOfferingsDisplay";

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

interface XAgentSimPageEditorProps {
  agentId: string;
  agentName: string;
  agentUsername: string;
  avatarUrl?: string;
  walletAddress: string;
  isVerified?: boolean;
}

export function XAgentSimPageEditor({
  agentId,
  agentName,
  agentUsername,
  avatarUrl,
  walletAddress,
  isVerified
}: XAgentSimPageEditorProps) {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomLinks();
    loadOfferings();
    loadDescription();
  }, [agentId]);

  const loadOfferings = async () => {
    try {
      const { data, error } = await supabase
        .from('x_agent_offerings')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOfferings(data || []);
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const loadDescription = async () => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('description')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      setDescription(data?.description || "");
    } catch (error) {
      console.error('Error loading description:', error);
    }
  };

  const loadCustomLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('advisors')
        .select('social_links')
        .eq('id', agentId)
        .single();

      if (error) throw error;

      const socialLinks = data?.social_links as any;
      const links = socialLinks?.custom_links || [];
      setCustomLinks(links);
    } catch (error) {
      console.error('Error loading custom links:', error);
    }
  };

  const addLink = () => {
    if (customLinks.length >= 5) {
      toast.error("Maximum 5 links allowed");
      return;
    }

    setCustomLinks([
      ...customLinks,
      { id: crypto.randomUUID(), label: "", url: "" }
    ]);
  };

  const updateLink = (id: string, field: 'label' | 'url', value: string) => {
    setCustomLinks(customLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const removeLink = (id: string) => {
    setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  const saveDescription = async () => {
    try {
      const { error } = await supabase
        .from('advisors')
        .update({ description })
        .eq('id', agentId);

      if (error) throw error;
      toast.success("Description saved!");
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Error saving description:', error);
      toast.error("Failed to save description");
    }
  };

  const saveLinks = async () => {
    try {
      // Validate links
      const validLinks = customLinks.filter(link => link.label && link.url);
      
      // Get current social_links
      const { data: currentData, error: fetchError } = await supabase
        .from('advisors')
        .select('social_links')
        .eq('id', agentId)
        .single();

      if (fetchError) throw fetchError;

      const currentSocialLinks = currentData?.social_links as any || {};

      // Update with custom links
      const { error } = await supabase
        .from('advisors')
        .update({
          social_links: {
            ...currentSocialLinks,
            custom_links: validLinks
          }
        })
        .eq('id', agentId);

      if (error) throw error;

      toast.success("Links saved!");
      setCustomLinks(validLinks);
      setEditingLinkId(null);
    } catch (error) {
      console.error('Error saving links:', error);
      toast.error("Failed to save links");
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    
    if (url.includes('pbs.twimg.com') || url.includes('twimg.com')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    
    if (url.includes('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Full Public Page Preview */}
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Public Page Preview</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                This is exactly how your page appears to visitors
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs gap-1"
                  asChild
                >
                  <a href={`/${agentUsername}`} target="_blank" rel="noopener noreferrer">
                    View live page
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Check className="h-3 w-3" />
              Live Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            {/* Hero Section - Profile */}
            <div className="border-b border-border bg-gradient-to-r from-card/95 via-card/80 to-card/95 backdrop-blur-sm p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 ring-2 ring-[#81f4aa]/20" style={{ borderColor: '#81f4aa' }}>
                    <AvatarImage 
                      src={getImageUrl(avatarUrl)} 
                      alt={agentName}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="text-2xl font-bold">{agentName[0]}</AvatarFallback>
                  </Avatar>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#81f4aa' }}>
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold">{agentName}</h2>
                    {isVerified && (
                      <Badge variant="default" className="gap-1" style={{ backgroundColor: '#81f4aa', color: '#000' }}>
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {/* Editable Description */}
                  <div className="space-y-2">
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Add a description for your page..."
                          className="min-h-[80px] text-sm"
                          maxLength={300}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveDescription}
                            style={{ backgroundColor: '#635cff', color: 'white' }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingDescription(false);
                              loadDescription();
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-start gap-2">
                        <p className="text-muted-foreground text-sm flex-1">
                          {description || "Click edit to add a description for your page"}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingDescription(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Wallet Address */}
                  {walletAddress && (
                    <div className="text-xs text-muted-foreground font-mono break-all max-w-md">
                      {walletAddress}
                    </div>
                  )}

                  {/* Custom Links */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {customLinks
                        .filter(link => link.label && link.url)
                        .map(link => (
                          editingLinkId === link.id ? (
                            <Card key={link.id} className="p-3 space-y-2 w-full">
                              <div className="space-y-2">
                                <Input
                                  value={link.label}
                                  onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                  placeholder="Label"
                                  className="text-sm"
                                />
                                <Input
                                  value={link.url}
                                  onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={saveLinks}
                                  style={{ backgroundColor: '#635cff', color: 'white' }}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingLinkId(null);
                                    loadCustomLinks();
                                  }}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    removeLink(link.id);
                                    saveLinks();
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          ) : (
                            <div key={link.id} className="group relative">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                asChild
                              >
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  {link.label}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingLinkId(link.id)}
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        ))}
                      {customLinks.length < 5 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addLink}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Add Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                {/* Left Column - Store Offerings */}
                <div>
                  {walletAddress ? (
                    <XAgentStorefront
                      agentId={agentId}
                      agentName={agentName}
                      walletAddress={walletAddress}
                    />
                  ) : (
                    <Card className="border-border bg-card/80 backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Wallet Configured</h3>
                        <p className="text-muted-foreground text-sm">
                          Add a wallet address in the Inventory tab to start selling
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - AI Agents */}
                <div className="lg:sticky lg:top-4 h-fit">
                  <AgentOfferingsDisplay 
                    offerings={offerings.filter((o: any) => o.offering_type === 'agent' || o.agent_system_prompt)}
                    avatarUrl={avatarUrl}
                    agentName={agentUsername}
                    onAgentClick={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
