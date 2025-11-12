import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const StoreOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    interactionStyle: '',
    responseTone: '',
    primaryFocus: '',
    greetingMessage: '',
    cryptoWallet: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/store/auth');
        return;
      }

      // Check if user already has a store
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (store) {
        navigate(`/store/${store.x_username}`);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!formData.storeName || !formData.cryptoWallet) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const xUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username || 'store';
      const xDisplayName = user.user_metadata?.name || user.user_metadata?.full_name;
      const xProfileImage = user.user_metadata?.avatar_url || user.user_metadata?.picture;

      const { error } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          x_username: xUsername,
          x_display_name: xDisplayName,
          x_profile_image: xProfileImage,
          store_name: formData.storeName,
          store_description: formData.storeDescription,
          interaction_style: formData.interactionStyle,
          response_tone: formData.responseTone,
          primary_focus: formData.primaryFocus,
          greeting_message: formData.greetingMessage,
          crypto_wallet: formData.cryptoWallet
        });

      if (error) throw error;

      toast.success('Store created successfully!');
      navigate(`/store/${xUsername}`);
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast.error(error.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Store Basics</h2>
              <p className="text-muted-foreground">Let's set up your store identity</p>
            </div>
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="My Awesome Store"
                className="h-12 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={formData.storeDescription}
                onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                placeholder="What does your store offer?"
                className="mt-2 min-h-24"
              />
            </div>
            <div>
              <Label htmlFor="cryptoWallet">Payment Wallet Address (USDC/SOL) *</Label>
              <Input
                id="cryptoWallet"
                value={formData.cryptoWallet}
                onChange={(e) => setFormData({ ...formData, cryptoWallet: e.target.value })}
                placeholder="Your Solana wallet address"
                className="h-12 mt-2"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">AI Interaction Model</h2>
              <p className="text-muted-foreground">Configure how your AI assistant interacts</p>
            </div>
            <div>
              <Label htmlFor="interactionStyle">Interaction Style</Label>
              <Textarea
                id="interactionStyle"
                value={formData.interactionStyle}
                onChange={(e) => setFormData({ ...formData, interactionStyle: e.target.value })}
                placeholder="e.g., Friendly and conversational, professional and concise..."
                className="mt-2 min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="responseTone">Response Tone</Label>
              <Textarea
                id="responseTone"
                value={formData.responseTone}
                onChange={(e) => setFormData({ ...formData, responseTone: e.target.value })}
                placeholder="e.g., Warm and helpful, expert and authoritative..."
                className="mt-2 min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="primaryFocus">Primary Focus</Label>
              <Textarea
                id="primaryFocus"
                value={formData.primaryFocus}
                onChange={(e) => setFormData({ ...formData, primaryFocus: e.target.value })}
                placeholder="e.g., Help customers find products, answer questions, process orders..."
                className="mt-2 min-h-20"
              />
            </div>
            <div>
              <Label htmlFor="greetingMessage">Greeting Message</Label>
              <Textarea
                id="greetingMessage"
                value={formData.greetingMessage}
                onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
                placeholder="e.g., Welcome! How can I help you today?"
                className="mt-2 min-h-20"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-black/90 rounded-lg px-3 py-2 inline-block mb-6">
            <img src="/sim-logo-white.png" alt="SIM" className="h-8 w-auto" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {renderStep()}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.storeName || !formData.cryptoWallet}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.storeName || !formData.cryptoWallet}
                className="flex-1"
              >
                {loading ? 'Creating Store...' : 'Create Store'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreOnboarding;
