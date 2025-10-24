import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles, Loader2, Trash2, Link2, Wallet, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { z } from 'zod';

interface EditSimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simId: string;
  editCode?: string;
}

const categories = [
  { value: 'crypto', label: 'Crypto & Web3' },
  { value: 'historical', label: 'Historical Figures' },
  { value: 'influencers', label: 'Influencers & Celebrities' },
  { value: 'fictional', label: 'Fictional Characters' },
  { value: 'education', label: 'Education & Tutoring' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'lifestyle', label: 'Lifestyle & Wellness' },
  { value: 'entertainment', label: 'Entertainment & Games' },
  { value: 'spiritual', label: 'Spiritual & Philosophy' },
  { value: 'adult', label: 'Adult' },
];

const EditSimModal = ({ open, onOpenChange, simId, editCode }: EditSimModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state matching CreateSimModal
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [xLink, setXLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [inputEditCode, setInputEditCode] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [x402Enabled, setX402Enabled] = useState(false);
  const [x402Price, setX402Price] = useState('0.01');
  const [x402Wallet, setX402Wallet] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load sim data
  useEffect(() => {
    if (open && simId) {
      loadSimData();
    }
  }, [open, simId]);

  const loadSimData = async () => {
    try {
      const { data: sim, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', simId)
        .single();

      if (error) throw error;

      if (sim) {
        setName(sim.name || '');
        setCategory(sim.category || '');
        setDescription(sim.description || '');
        setSystemPrompt(sim.prompt || '');
        setWelcomeMessage(sim.welcome_message || '');
        setAvatarPreview(sim.avatar_url || null);
        
        // Load social links
        const socialLinks = sim.social_links as any;
        if (socialLinks) {
          setXLink(socialLinks.x || '');
          setWebsiteLink(socialLinks.website || '');
          setTelegramLink(socialLinks.telegram || '');
        }
        
        // Load wallet and x402 settings
        setCryptoWallet(sim.crypto_wallet || '');
        setX402Enabled(sim.x402_enabled || false);
        setX402Price(sim.x402_price?.toString() || '0.01');
        setX402Wallet(sim.x402_wallet || '');
        
        // If system prompt and welcome message exist, mark as generated
        if (sim.prompt && sim.welcome_message) {
          setHasGenerated(true);
        }
      }
    } catch (error) {
      console.error('Error loading sim:', error);
      toast.error('Failed to load sim data');
    }
  };


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name first");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description first");
      return;
    }

    if (!category) {
      toast.error("Please select a category first");
      return;
    }

    setIsGenerating(true);
    try {
      // Generate system prompt - always include all integrations
      const allIntegrations = ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"];
      const { data, error } = await supabase.functions.invoke("generate-system-prompt", {
        body: { 
          name: name.trim(),
          description: description.trim(), 
          category,
          integrations: allIntegrations 
        },
      });

      if (error) throw error;

      if (data?.systemPrompt) {
        setSystemPrompt(data.systemPrompt);
        
        // Generate welcome message
        let welcomeMessage = `Hi! I'm ${name.trim()}. ${description.trim()}`;
        
        try {
          const { data: welcomeData } = await supabase.functions.invoke("chat-completion", {
            body: {
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant that creates engaging welcome messages for AI chatbots. The welcome message should: 1) Greet the user warmly, 2) Briefly explain what the AI does, 3) Explain HOW users should interact (rules, format, what to do first), 4) Be 2-3 sentences, under 200 characters. Write in first person from the AI's perspective."
                },
                {
                  role: "user",
                  content: `Create a welcome message for an AI called "${name.trim()}" with this description: ${description.trim()}\n\nSystem prompt: ${data.systemPrompt.trim()}`
                }
              ]
            }
          });
          
          if (welcomeData?.content) {
            welcomeMessage = welcomeData.content.trim();
          }
        } catch (error) {
          console.error("Error generating welcome message:", error);
          // Use fallback if generation fails
        }
        
        setWelcomeMessage(welcomeMessage);
        setHasGenerated(true);
        toast.success("Sim generated!");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate sim");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const codeToUse = editCode || inputEditCode;
    
    if (!codeToUse || codeToUse.length !== 6) {
      toast.error('Please enter a valid 6-digit edit code');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for your sim');
      return;
    }

    if (name.trim().length > 50) {
      toast.error('Sim name must be 50 characters or less');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    if (!systemPrompt.trim()) {
      toast.error('Please enter or generate a system prompt');
      return;
    }

    if (!welcomeMessage.trim()) {
      toast.error('Please enter or generate a welcome message');
      return;
    }

    // Validate x402 fields if enabled
    if (x402Enabled) {
      // Validate wallet address
      const walletSchema = z.string()
        .trim()
        .min(42, 'Wallet address must be at least 42 characters')
        .max(42, 'Wallet address must be exactly 42 characters')
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format');
      
      try {
        walletSchema.parse(x402Wallet);
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast.error(err.errors[0].message);
          return;
        }
      }
      
      // Validate price
      const priceSchema = z.number()
        .min(0.01, 'x402 price must be at least $0.01')
        .max(1000, 'x402 price cannot exceed $1000');
      
      const price = parseFloat(x402Price);
      if (isNaN(price)) {
        toast.error('Please enter a valid price');
        return;
      }
      
      try {
        priceSchema.parse(price);
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast.error(err.errors[0].message);
          return;
        }
      }
    }
    
    setIsSaving(true);
    try {
      let avatarUrl = avatarPreview;

      // Upload avatar if new file provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${simId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }
      
      // Prepare social links object
      const socialLinks: any = {};
      if (xLink.trim()) socialLinks.x = xLink.trim();
      if (websiteLink.trim()) socialLinks.website = websiteLink.trim();
      if (telegramLink.trim()) socialLinks.telegram = telegramLink.trim();
      
      const allIntegrations = ["solana-explorer", "pumpfun", "x-analyzer", "crypto-prices"];
      
      // First verify the edit code
      const { data: verifyData, error: verifyError } = await supabase
        .from('advisors')
        .select('id')
        .eq('id', simId)
        .eq('edit_code', codeToUse)
        .single();
      
      if (verifyError || !verifyData) {
        toast.error('Invalid edit code. Please check and try again.');
        return;
      }
      
      // Update sim with all fields
      console.log('Updating sim with x402 data:', {
        x402Enabled,
        x402Price: x402Enabled ? parseFloat(x402Price) : null,
        x402Wallet: x402Enabled && x402Wallet.trim() ? x402Wallet.trim() : null
      });
      
      const { error } = await supabase
        .from('advisors')
        .update({
          name: name.trim(),
          category: category || null,
          description: description.trim(),
          prompt: systemPrompt.trim(),
          welcome_message: welcomeMessage.trim(),
          avatar_url: avatarUrl,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          integrations: allIntegrations,
          crypto_wallet: cryptoWallet.trim() || null,
          x402_enabled: x402Enabled,
          x402_price: x402Enabled ? parseFloat(x402Price) : null,
          x402_wallet: x402Enabled && x402Wallet.trim() ? x402Wallet.trim() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', simId)
        .eq('edit_code', codeToUse);

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
      await queryClient.invalidateQueries({ queryKey: ['sim-conversations'] });
      
      toast.success('Sim updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving sim:', error);
      toast.error('Failed to update sim');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('advisors')
        .delete()
        .eq('id', simId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['user-sim'] });
      await queryClient.invalidateQueries({ queryKey: ['user-sim-check'] });
      await queryClient.invalidateQueries({ queryKey: ['my-sim-conversations'] });
      
      toast.success('Sim deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
      navigate('/directory');
    } catch (error) {
      console.error('Error deleting sim:', error);
      toast.error('Failed to delete sim');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8 p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Edit Sim</h2>
              <p className="text-sm text-muted-foreground">
                Update your AI sim's configuration and behavior
              </p>
            </div>

            {/* Edit Code - Only show if not provided as prop */}
            {!editCode && (
              <div className="space-y-2">
                <Label htmlFor="editCode" className="text-sm font-medium">
                  Edit Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editCode"
                  value={inputEditCode}
                  onChange={(e) => setInputEditCode(e.target.value)}
                  placeholder="Enter 6-digit edit code"
                  maxLength={6}
                  className="h-11 bg-background font-mono text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code that was provided when this sim was created
                </p>
              </div>
            )}

            {/* Sim Identity */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-foreground/80">Sim Identity</h3>
              
              <div className="flex gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <Avatar 
                    className="w-24 h-24 cursor-pointer border border-border/50 hover:border-border transition-colors" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Avatar preview" className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-muted/50">
                        <Upload className="w-6 h-6 text-muted-foreground/50" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-8 px-4"
                  >
                    Upload
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Marcus, Dr. Code, Legal Eagle"
                      required
                      maxLength={50}
                      className="h-11 bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      {name.length}/50 characters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground/80">Category</h3>
              
              <div className="space-y-2">
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Intelligence & Behavior */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground/80">Behavior</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your Sim do?"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground/80">Social Links</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="xLink" className="text-sm font-medium">
                    X (Twitter)
                  </Label>
                  <Input
                    id="xLink"
                    type="url"
                    value={xLink}
                    onChange={(e) => setXLink(e.target.value)}
                    placeholder="https://x.com/username"
                    className="h-11 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteLink" className="text-sm font-medium">
                    Website
                  </Label>
                  <Input
                    id="websiteLink"
                    type="url"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="h-11 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegramLink" className="text-sm font-medium">
                    Telegram
                  </Label>
                  <Input
                    id="telegramLink"
                    type="url"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    placeholder="https://t.me/username"
                    className="h-11 bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Wallet & Payments */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground/80">Wallet & Payments</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cryptoWallet" className="text-sm font-medium">
                    SOL Wallet Address (for donations)
                  </Label>
                  <Input
                    id="cryptoWallet"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    placeholder="Your Solana wallet address"
                    className="h-11 bg-background font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Display your Solana wallet for donations on your sim page
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="x402Enabled" className="text-sm font-medium cursor-pointer">
                          x402 Payment Required
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Require users to pay USDC before chatting
                      </p>
                    </div>
                    <Switch
                      id="x402Enabled"
                      checked={x402Enabled}
                      onCheckedChange={setX402Enabled}
                    />
                  </div>

                  {x402Enabled && (
                    <div className="space-y-3 pl-6 border-l-2 border-border">
                      <div className="space-y-2">
                        <Label htmlFor="x402Price" className="text-sm font-medium">
                          Price (USDC) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="x402Price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={x402Price}
                          onChange={(e) => setX402Price(e.target.value)}
                          placeholder="0.01"
                          className="h-11 bg-background"
                          required={x402Enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount in USDC users must pay for 24-hour access
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="x402Wallet" className="text-sm font-medium">
                          Payment Wallet (EVM) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="x402Wallet"
                          value={x402Wallet}
                          onChange={(e) => setX402Wallet(e.target.value)}
                          placeholder="0x..."
                          className="h-11 bg-background font-mono text-sm"
                          required={x402Enabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          EVM-compatible wallet address to receive USDC payments
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sim Generation */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !name.trim() || !description.trim() || !category}
                className="gap-2 w-full h-11"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Sim
                  </>
                )}
              </Button>
            </div>

            {/* Generated Fields - Only show after generation */}
            {hasGenerated && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage" className="text-sm font-medium">
                    Welcome Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="welcomeMessage"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="The first message users see..."
                    rows={3}
                    required
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className="text-sm font-medium">
                    System Prompt <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="The brains behind your Sim..."
                    rows={8}
                    required
                    className="resize-none text-sm font-mono"
                  />
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSaving || isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !name.trim() || !category || !systemPrompt.trim() || !welcomeMessage.trim()}
                className="h-11 gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sim Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{name}" from the directory for everyone. 
              All conversations with this sim will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditSimModal;
