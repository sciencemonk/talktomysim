import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Save, ExternalLink, Check, Package } from "lucide-react";
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

  useEffect(() => {
    loadCustomLinks();
    loadOfferings();
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

  const saveLinks = async () => {
    setIsSaving(true);
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

      toast.success("Links saved successfully!");
      setCustomLinks(validLinks);
    } catch (error) {
      console.error('Error saving links:', error);
      toast.error("Failed to save links");
    } finally {
      setIsSaving(false);
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
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-bold">{agentName}</h2>
                    {isVerified && (
                      <Badge variant="default" className="gap-1" style={{ backgroundColor: '#81f4aa', color: '#000' }}>
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground font-medium text-sm">{agentUsername}</p>
                  
                  {/* Wallet Address */}
                  {walletAddress && (
                    <div className="text-xs text-muted-foreground font-mono break-all max-w-md">
                      {walletAddress}
                    </div>
                  )}

                  {/* Custom Links */}
                  {customLinks.filter(link => link.label && link.url).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {customLinks
                        .filter(link => link.label && link.url)
                        .map(link => (
                          <Button
                            key={link.id}
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
                        ))}
                    </div>
                  )}
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

      {/* Link Editor Card */}
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>Customize Links</CardTitle>
          <CardDescription>
            Add up to 5 custom links to display on your public page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Link Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Custom Links (max 5)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addLink}
                disabled={customLinks.length >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>

            <div className="space-y-3">
              {customLinks.map((link, index) => (
                <Card key={link.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={`label-${link.id}`} className="text-xs">
                            Label
                          </Label>
                          <Input
                            id={`label-${link.id}`}
                            value={link.label}
                            onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                            placeholder="e.g., My Website"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`url-${link.id}`} className="text-xs">
                            URL
                          </Label>
                          <Input
                            id={`url-${link.id}`}
                            value={link.url}
                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLink(link.id)}
                        className="shrink-0 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {customLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No custom links yet. Click "Add Link" to get started.
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={saveLinks}
            disabled={isSaving}
            className="w-full"
            style={{ backgroundColor: '#635cff', color: 'white' }}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
