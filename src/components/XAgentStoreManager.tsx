import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_method: string;
  required_info: Array<{ label: string; type: string; required: boolean }>;
  is_active: boolean;
  created_at: string;
  media_url?: string;
  offering_type?: 'standard' | 'digital' | 'agent';
  digital_file_url?: string;
  blur_preview?: boolean;
  agent_system_prompt?: string;
  agent_data_source?: string;
  agent_avatar_url?: string;
  price_per_conversation?: number;
  agent_functionality?: string;
}

interface XAgentStoreManagerProps {
  agentId: string;
  walletAddress: string;
  onWalletUpdate: (address: string) => void;
  editCode: string;
}

export function XAgentStoreManager({ agentId, walletAddress, onWalletUpdate, editCode }: XAgentStoreManagerProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [selectedType, setSelectedType] = useState<'standard' | 'digital' | 'agent' | null>(null);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    delivery_method: "",
    is_active: true,
    blur_preview: false,
    agent_system_prompt: "",
    agent_data_source: "",
    agent_functionality: "",
    price_per_conversation: "",
  });

  const [requiredFields, setRequiredFields] = useState<Array<{ label: string; type: string; required: boolean }>>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, [agentId]);

  const loadOfferings = async () => {
    try {
      const { data, error } = await supabase
        .from("x_agent_offerings")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOfferings((data || []) as unknown as Offering[]);
    } catch (error) {
      console.error("Error loading offerings:", error);
      toast.error("Failed to load offerings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV)");
      return;
    }

    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDigitalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit for digital products)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image, video, or PDF file");
      return;
    }

    setDigitalFile(file);
    toast.success("File selected: " + file.name);
  };

  const handleGenerateAgent = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in title and description first");
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const { data: promptData, error: promptError } = await supabase.functions.invoke(
        'generate-agent-system-prompt',
        {
          body: {
            title: formData.title,
            description: formData.description,
            dataSource: formData.agent_data_source
          }
        }
      );

      if (promptError) throw promptError;
      
      if (promptData?.success && promptData.systemPrompt) {
        setFormData(prev => ({ ...prev, agent_system_prompt: promptData.systemPrompt }));
        toast.success("Agent system prompt generated! Review it and click 'Create Offering' when ready.");
      } else {
        toast.error("Failed to generate system prompt");
      }
    } catch (error) {
      console.error("Error generating system prompt:", error);
      toast.error("Failed to generate system prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For 'agent' type, require functionality description
    if (selectedType === 'agent' && !formData.agent_functionality) {
      toast.error("Please describe how your agent works (Functionality)");
      return;
    }

    if (selectedType !== 'agent' && !formData.price) {
      toast.error("Please enter a price");
      return;
    }

    // For 'agent' type, require system prompt only when creating new agents
    if (selectedType === 'agent' && !formData.agent_system_prompt && !editingOffering) {
      toast.error("Please generate or write a system prompt for your agent");
      return;
    }

    if (selectedType === 'standard' && !formData.delivery_method) {
      toast.error("Please specify delivery method");
      return;
    }

    if (selectedType === 'digital' && !digitalFile && !editingOffering?.digital_file_url) {
      toast.error("Please upload a digital file");
      return;
    }

    try {
      setIsUploading(true);
      let mediaUrl = editingOffering?.media_url || null;
      let digitalFileUrl = editingOffering?.digital_file_url || null;

      // Upload preview media if a new file was selected
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `preview-${agentId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('offering-media')
          .upload(filePath, mediaFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('offering-media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      // Upload digital file if provided
      if (digitalFile) {
        const fileExt = digitalFile.name.split('.').pop();
        const fileName = `digital-${agentId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('offering-media')
          .upload(filePath, digitalFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('offering-media')
          .getPublicUrl(filePath);

        digitalFileUrl = publicUrl;
      }

      // Use RPC for all operations (it now handles all agent fields with SECURITY DEFINER)
      const { data, error } = await supabase.rpc('manage_offering_with_code', {
        p_agent_id: agentId,
        p_edit_code: editCode,
        p_offering_id: editingOffering?.id || null,
        p_title: formData.title,
        p_description: formData.description,
        p_price: selectedType === 'agent' 
          ? parseFloat(formData.price_per_conversation || '0')
          : parseFloat(formData.price),
        p_delivery_method: formData.delivery_method || 'Digital delivery',
        p_required_info: requiredFields,
        p_is_active: formData.is_active,
        p_operation: editingOffering ? 'update' : 'insert',
        p_offering_type: selectedType || 'standard',
        p_agent_system_prompt: formData.agent_system_prompt || null,
        p_agent_data_source: formData.agent_data_source || null,
        p_agent_functionality: formData.agent_functionality || null,
        p_agent_avatar_url: mediaUrl || null,
        p_price_per_conversation: parseFloat(formData.price_per_conversation || '0'),
        p_media_url: selectedType !== 'agent' ? mediaUrl : null,
        p_digital_file_url: digitalFileUrl || null,
        p_blur_preview: formData.blur_preview || false
      });

      if (error) throw error;

      toast.success(editingOffering ? "Offering updated successfully" : "Offering created successfully");
      setIsDialogOpen(false);
      resetForm();
      loadOfferings();
    } catch (error) {
      console.error("Error saving offering:", error);
      toast.error("Failed to save offering");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (offering: Offering) => {
    console.log("Editing offering:", offering); // Debug log
    setEditingOffering(offering);
    setSelectedType(offering.offering_type || 'standard');
    setFormData({
      title: offering.title,
      description: offering.description,
      price: offering.price.toString(),
      delivery_method: offering.delivery_method,
      is_active: offering.is_active,
      blur_preview: offering.blur_preview || false,
      agent_system_prompt: offering.agent_system_prompt || "",
      agent_data_source: offering.agent_data_source || "",
      agent_functionality: offering.agent_functionality || "",
      price_per_conversation: offering.price_per_conversation?.toString() || "",
    });
    setRequiredFields(offering.required_info || []);
    // For agent offerings, use agent_avatar_url; for others use media_url
    const previewUrl = offering.offering_type === 'agent' 
      ? offering.agent_avatar_url 
      : offering.media_url;
    setMediaPreview(previewUrl || null);
    setShowTypeSelection(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (offeringId: string) => {
    if (!confirm("Are you sure you want to delete this offering?")) return;

    try {
      const { error } = await supabase.rpc('manage_offering_with_code', {
        p_agent_id: agentId,
        p_edit_code: editCode,
        p_offering_id: offeringId,
        p_operation: 'delete'
      });

      if (error) throw error;

      toast.success("Offering deleted successfully");
      loadOfferings();
    } catch (error) {
      console.error("Error deleting offering:", error);
      toast.error("Failed to delete offering");
    }
  };

  const handleToggleActive = async (offeringId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('manage_offering_with_code', {
        p_agent_id: agentId,
        p_edit_code: editCode,
        p_offering_id: offeringId,
        p_is_active: !currentStatus,
        p_operation: 'update'
      });

      if (error) throw error;

      toast.success(currentStatus ? "Offering deactivated" : "Offering activated");
      loadOfferings();
    } catch (error) {
      console.error("Error toggling offering:", error);
      toast.error("Failed to update offering");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      delivery_method: "",
      is_active: true,
      blur_preview: false,
      agent_system_prompt: "",
      agent_data_source: "",
      agent_functionality: "",
      price_per_conversation: "",
    });
    setRequiredFields([]);
    setEditingOffering(null);
    setMediaFile(null);
    setMediaPreview(null);
    setDigitalFile(null);
    setSelectedType(null);
    setShowTypeSelection(false);
    setIsGeneratingPrompt(false);
  };

  const handleTypeSelect = (type: 'standard' | 'digital' | 'agent') => {
    setSelectedType(type);
    setShowTypeSelection(false);
  };

  const addRequiredField = () => {
    setRequiredFields([...requiredFields, { label: "", type: "text", required: true }]);
  };

  const updateRequiredField = (index: number, field: string, value: any) => {
    const updated = [...requiredFields];
    updated[index] = { ...updated[index], [field]: value };
    setRequiredFields(updated);
  };

  const removeRequiredField = (index: number) => {
    setRequiredFields(requiredFields.filter((_, i) => i !== index));
  };

  const handleSaveWallet = async () => {
    // Validate wallet address format (basic Solana address validation)
    if (walletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      toast.error("Invalid Solana wallet address format");
      return;
    }

    setIsSavingWallet(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          x402_wallet: walletAddress,
          x402_enabled: walletAddress ? true : false,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId)
        .eq('edit_code', editCode);

      if (error) throw error;

      toast.success("Wallet address saved successfully!");
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error("Failed to save wallet address");
    } finally {
      setIsSavingWallet(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading store...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Wallet Configuration */}
      <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-5">
          <CardTitle className="text-lg font-bold">Payment Configuration</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Configure your Solana wallet to receive USDC payments. Payments (minus 5% platform fee) go directly to your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Solana Wallet Address</Label>
            <Input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => onWalletUpdate(e.target.value)}
              placeholder="Enter your Solana wallet address"
            />
            <p className="text-xs text-muted-foreground">
              Your Solana wallet address to receive USDC payments from store purchases
            </p>
          </div>
          <Button 
            onClick={handleSaveWallet} 
            className="w-full" 
            disabled={isSavingWallet}
            variant="mint"
          >
            {isSavingWallet ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Wallet Address"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Store Management</h2>
          <p className="text-muted-foreground">Manage your offerings and receive x402 payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <Button 
            variant="mint"
            onClick={() => {
              if (!walletAddress) {
                toast.error("Please add a Solana wallet address before creating offerings");
                return;
              }
              setShowTypeSelection(true);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Offering
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {showTypeSelection && !selectedType ? (
              <>
                <DialogHeader>
                  <DialogTitle>Select Product Type</DialogTitle>
                  <DialogDescription>
                    Choose the type of offering you want to create
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('standard')}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <Package className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Standard Listing</h3>
                        <p className="text-sm text-muted-foreground">
                          Offer services, consultations, or custom work. You'll fulfill orders manually.
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('digital')}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <DollarSign className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Digital Product</h3>
                        <p className="text-sm text-muted-foreground">
                          Sell digital files (images, videos, PDFs). Buyers get instant access after payment.
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('agent')}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <Package className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Agent</h3>
                        <p className="text-sm text-muted-foreground">
                          Create an AI agent trained on your expertise. Charge per conversation or make it free.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>{editingOffering ? "Edit Offering" : "Create New Offering"}</DialogTitle>
                  <DialogDescription>
                    {selectedType === 'digital' 
                      ? "Create a digital product that buyers can access instantly"
                      : selectedType === 'agent'
                      ? "Create an AI agent that users can chat with"
                      : "Create offerings that users can purchase with x402 payments"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={selectedType === 'agent' ? "e.g., Marketing Strategy AI Agent" : "e.g., 1-hour Consulting Call"}
                />
              </div>

              {selectedType !== 'agent' && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you're offering..."
                    rows={4}
                  />
                </div>
              )}

              {selectedType !== 'agent' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDC) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
              )}

              {selectedType === 'agent' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="agentDescription">Agent Description *</Label>
                    <Textarea
                      id="agentDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your agent's expertise and what it can help with..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used to generate the agent's system prompt and capabilities.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentFunctionality">How it Works (Functionality) *</Label>
                    <Textarea
                      id="agentFunctionality"
                      value={formData.agent_functionality}
                      onChange={(e) => setFormData({ ...formData, agent_functionality: e.target.value })}
                      placeholder="Explain how users interact with this agent and what they can do with it..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe the agent's functionality and how users will interact with it.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentDataSource">Proprietary Data Source (Optional)</Label>
                    <Textarea
                      id="agentDataSource"
                      value={formData.agent_data_source}
                      onChange={(e) => setFormData({ ...formData, agent_data_source: e.target.value })}
                      placeholder="Add any specialized knowledge, data, or context that your agent should reference..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste proprietary information, guidelines, or knowledge that will enhance your agent's responses.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentImage">Agent Avatar</Label>
                    <Input
                      id="agentImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleMediaChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload an avatar for your agent. Max file size: 10MB.
                    </p>
                    {mediaPreview && (
                      <div className="mt-2">
                        <img 
                          src={mediaPreview} 
                          alt="Agent Avatar" 
                          className="w-24 h-24 object-cover rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerConversation">Price Per Conversation (USDC)</Label>
                    <Input
                      id="pricePerConversation"
                      type="number"
                      step="0.01"
                      value={formData.price_per_conversation}
                      onChange={(e) => setFormData({ ...formData, price_per_conversation: e.target.value })}
                      placeholder="0.00 (Free) or enter price per conversation"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave at 0.00 to make conversations free. Or charge per conversation (e.g., 1.00 for $1 per chat).
                    </p>
                  </div>

                  {/* Required Information from Buyer - Moved here for agents */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Required Information from Buyer</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addRequiredField}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Field
                      </Button>
                    </div>
                    {requiredFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            placeholder="Field label (e.g., Email, Phone)"
                            value={field.label}
                            onChange={(e) => updateRequiredField(index, "label", e.target.value)}
                          />
                        </div>
                        <div className="w-32">
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={field.type}
                            onChange={(e) => updateRequiredField(index, "type", e.target.value)}
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="textarea">Long Text</option>
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequiredField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Collect information from buyers (email, phone, etc.)
                    </p>
                  </div>

                  {/* System Prompt Section - Show only after generation or when editing */}
                  {(formData.agent_system_prompt || editingOffering) && (
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <Label>Agent System Prompt {!editingOffering && '*'}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!formData.title || !formData.description) {
                            toast.error("Please fill in title and description first");
                            return;
                          }
                          setIsGeneratingPrompt(true);
                          try {
                            const { data: promptData, error: promptError } = await supabase.functions.invoke(
                              'generate-agent-system-prompt',
                              {
                                body: {
                                  title: formData.title,
                                  description: formData.description,
                                  dataSource: formData.agent_data_source
                                }
                              }
                            );

                            if (promptError) throw promptError;
                            
                            if (promptData?.success && promptData.systemPrompt) {
                              setFormData(prev => ({ ...prev, agent_system_prompt: promptData.systemPrompt }));
                              toast.success(editingOffering ? "System prompt regenerated!" : "System prompt generated!");
                            }
                          } catch (error) {
                            console.error("Error generating system prompt:", error);
                            toast.error("Failed to generate system prompt");
                          } finally {
                            setIsGeneratingPrompt(false);
                          }
                        }}
                        disabled={isGeneratingPrompt}
                      >
                        {isGeneratingPrompt ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          formData.agent_system_prompt ? 'Regenerate' : 'Generate'
                        )}
                      </Button>
                      </div>
                      <Textarea
                        value={formData.agent_system_prompt}
                        onChange={(e) => setFormData({ ...formData, agent_system_prompt: e.target.value })}
                        rows={10}
                        className="text-sm resize-none bg-background font-mono"
                        placeholder="The agent's system prompt will appear here. Click 'Generate' to create one, or write your own custom prompt..."
                      />
                      <p className="text-xs text-muted-foreground">
                        {editingOffering 
                          ? "Edit the system prompt to change your agent's behavior and expertise."
                          : "This prompt defines your agent's personality and expertise. You can generate one or write your own."
                        }
                      </p>
                    </div>
                  )}

                  {/* Generate Button - Only show if system prompt not generated yet */}
                  {!formData.agent_system_prompt && !editingOffering && (
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!formData.title || !formData.description) {
                          toast.error("Please fill in title and description first");
                          return;
                        }
                        setIsGeneratingPrompt(true);
                        try {
                          const { data: promptData, error: promptError } = await supabase.functions.invoke(
                            'generate-agent-system-prompt',
                            {
                              body: {
                                title: formData.title,
                                description: formData.description,
                                dataSource: formData.agent_data_source
                              }
                            }
                          );

                          if (promptError) throw promptError;
                          
                          if (promptData?.success && promptData.systemPrompt) {
                            setFormData(prev => ({ ...prev, agent_system_prompt: promptData.systemPrompt }));
                            toast.success("Agent system prompt generated!");
                          }
                        } catch (error) {
                          console.error("Error generating system prompt:", error);
                          toast.error("Failed to generate system prompt");
                        } finally {
                          setIsGeneratingPrompt(false);
                        }
                      }}
                      disabled={isGeneratingPrompt}
                      className="w-full bg-[#83f1aa] hover:bg-[#6dd88f] text-black"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Agent...
                        </>
                      ) : (
                        'Generate Agent'
                      )}
                    </Button>
                  )}
                </>
              )}

              {selectedType === 'standard' && (
                <div className="space-y-2">
                  <Label htmlFor="delivery">Delivery Method *</Label>
                  <Textarea
                    id="delivery"
                    value={formData.delivery_method}
                    onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                    placeholder="e.g., I'll email you within 24 hours to schedule the call"
                    rows={3}
                  />
                </div>
              )}

              {selectedType === 'digital' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="digitalFile">Digital File * (Image, Video, or PDF)</Label>
                    <Input
                      id="digitalFile"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf"
                      onChange={handleDigitalFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max file size: 50MB. This is the file buyers will receive after payment.
                    </p>
                    {digitalFile && (
                      <p className="text-sm text-green-600">✓ {digitalFile.name} selected</p>
                    )}
                    {editingOffering?.digital_file_url && !digitalFile && (
                      <p className="text-sm text-muted-foreground">Current file uploaded</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media">Preview Image (Optional)</Label>
                    <Input
                      id="media"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleMediaChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a preview image. Max file size: 10MB.
                    </p>
                    {mediaPreview && (
                      <div className="mt-2">
                        <img 
                          src={mediaPreview} 
                          alt="Preview" 
                          className={`w-full max-h-48 object-cover rounded-md ${formData.blur_preview ? 'blur-md' : ''}`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blur_preview"
                      checked={formData.blur_preview}
                      onCheckedChange={(checked) => setFormData({ ...formData, blur_preview: checked })}
                      className="data-[state=checked]:bg-[#81f4aa]"
                    />
                    <Label htmlFor="blur_preview">Blur preview image (unblurs after purchase)</Label>
                  </div>
                </>
              )}

              {selectedType === 'standard' && (
                <div className="space-y-2">
                  <Label htmlFor="media">Product Image or Video</Label>
                  <Input
                    id="media"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    onChange={handleMediaChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max file size: 10MB. Supported formats: JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV
                  </p>
                  {mediaPreview && (
                    <div className="mt-2">
                      {mediaFile?.type.startsWith('video/') || mediaPreview.includes('video') ? (
                        <video src={mediaPreview} controls className="w-full max-h-48 rounded-md" />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-md" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedType !== 'agent' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Required Information from Buyer</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRequiredField}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  {requiredFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Field label (e.g., Email, Phone)"
                          value={field.label}
                          onChange={(e) => updateRequiredField(index, "label", e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={field.type}
                          onChange={(e) => updateRequiredField(index, "type", e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="textarea">Long Text</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequiredField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Collect information from buyers (email, phone, etc.)
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="data-[state=checked]:bg-[#81f4aa]"
                />
                <Label htmlFor="is_active">Active (visible to buyers)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  if (showTypeSelection) {
                    setIsDialogOpen(false);
                  } else {
                    setShowTypeSelection(true);
                    setSelectedType(null);
                  }
                }}>
                  {showTypeSelection ? "Cancel" : "Back"}
                </Button>
                {selectedType === 'agent' && !formData.agent_system_prompt ? (
                  <Button 
                    type="button" 
                    variant="mint" 
                    disabled={isGeneratingPrompt}
                    onClick={handleGenerateAgent}
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Agent"
                    )}
                  </Button>
                ) : (
                  <Button type="submit" variant="mint" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {mediaFile || digitalFile ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      <>{editingOffering ? "Update" : "Create"} Offering</>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </form>
            </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {offerings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No offerings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first offering to start selling through your X agent
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offerings.map((offering) => (
            <Card key={offering.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{offering.title}</CardTitle>
                      {!offering.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>{offering.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(offering)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(offering.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">${offering.price} USDC</span>
                  </div>
                  {offering.required_info && offering.required_info.length > 0 && (
                    <div className="text-muted-foreground">
                      Requires: {offering.required_info.map(f => f.label).join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={offering.is_active}
                      onCheckedChange={() => handleToggleActive(offering.id, offering.is_active)}
                      className="data-[state=checked]:bg-[#81f4aa]"
                    />
                    <span className="text-xs text-muted-foreground">
                      {offering.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
