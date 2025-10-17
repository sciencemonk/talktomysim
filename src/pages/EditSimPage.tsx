import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Globe, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import landingBackground from "@/assets/landing-background.jpg";

const EditSimPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userSim, setUserSim] = useState<any>(null);
  
  // Form states
  const [backgroundImage, setBackgroundImage] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [cryptoWallet, setCryptoWallet] = useState("");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  useEffect(() => {
    checkUserAndLoadSim();
  }, []);

  const checkUserAndLoadSim = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setCurrentUser(user);

      const { data: sim, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (sim) {
        setUserSim(sim);
        setBackgroundImage(sim.background_image_url || "");
        setTwitterUrl(sim.twitter_url || "");
        setWebsiteUrl(sim.website_url || "");
        setCryptoWallet(sim.crypto_wallet || "");
      }
    } catch (error) {
      console.error('Error loading sim:', error);
      toast.error('Failed to load your sim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackgroundFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setBackgroundImage(previewUrl);
  };

  const uploadBackgroundImage = async (): Promise<string | null> => {
    if (!backgroundFile || !currentUser) return null;

    try {
      const fileExt = backgroundFile.name.split('.').pop();
      const fileName = `${currentUser.id}-background-${Date.now()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('advisor_assets')
        .upload(filePath, backgroundFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('advisor_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading background:', error);
      toast.error('Failed to upload background image');
      return null;
    }
  };

  const handleSave = async () => {
    if (!userSim || !currentUser) return;

    setIsSaving(true);
    try {
      let finalBackgroundUrl = backgroundImage;

      // Upload new background if file was selected
      if (backgroundFile) {
        const uploadedUrl = await uploadBackgroundImage();
        if (uploadedUrl) {
          finalBackgroundUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('advisors')
        .update({
          background_image_url: finalBackgroundUrl,
          twitter_url: twitterUrl,
          website_url: websiteUrl,
          crypto_wallet: cryptoWallet,
          updated_at: new Date().toISOString()
        })
        .eq('id', userSim.id);

      if (error) throw error;

      toast.success('Your sim page has been updated!');
      
      // Refresh the sim data
      await checkUserAndLoadSim();
      setBackgroundFile(null);
    } catch (error) {
      console.error('Error saving sim page:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userSim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Sim Found</h1>
          <p className="text-muted-foreground">You need to create a sim first.</p>
          <Button onClick={() => navigate('/edit-sim')}>Create Your Sim</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen overflow-auto bg-background">
      <div className="h-full max-w-7xl mx-auto p-8">
        <div className="grid lg:grid-cols-2 gap-8 h-full min-h-[calc(100vh-4rem)]">
          {/* Editor Panel */}
          <div className="space-y-4">
            {/* Background Image */}
            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex gap-2">
                <Input
                  value={backgroundImage}
                  onChange={(e) => setBackgroundImage(e.target.value)}
                  placeholder="Enter image URL or upload"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('background-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBackgroundUpload}
                />
              </div>
              {backgroundFile && (
                <p className="text-xs text-muted-foreground">New file ready to upload: {backgroundFile.name}</p>
              )}
            </div>

            {/* Twitter/X URL */}
            <div className="space-y-2">
              <Label>Twitter/X Profile URL</Label>
              <div className="flex gap-2">
                <svg className="h-5 w-5 mt-2.5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <Input
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label>Website URL</Label>
              <div className="flex gap-2">
                <Globe className="h-5 w-5 mt-2.5 text-muted-foreground" />
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Crypto Wallet */}
            <div className="space-y-2">
              <Label>Crypto Wallet Address</Label>
              <div className="flex gap-2">
                <Wallet className="h-5 w-5 mt-2.5 text-muted-foreground" />
                <Input
                  value={cryptoWallet}
                  onChange={(e) => setCryptoWallet(e.target.value)}
                  placeholder="Your wallet address"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            
            <div 
              className="relative rounded-3xl overflow-hidden border-2 flex-1 min-h-[600px]"
              style={{
                backgroundImage: `url(${backgroundImage || landingBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
                <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-8 w-full max-w-sm">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white/30">
                      <AvatarImage src={userSim.avatar_url} alt={userSim.name} />
                      <AvatarFallback className="text-3xl bg-white/20 text-white">
                        {userSim.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Title */}
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-2xl font-bold text-white">{userSim.name}</h3>
                    {userSim.title && (
                      <p className="text-sm text-white/70">{userSim.title}</p>
                    )}
                  </div>

                  {/* Social Links Preview */}
                  {(twitterUrl || websiteUrl || cryptoWallet) && (
                    <div className="space-y-2 pt-4 border-t border-white/20">
                      {twitterUrl && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/20">
                          <svg className="h-4 w-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span className="text-xs text-white/80">Follow on X</span>
                        </div>
                      )}
                      {websiteUrl && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/20">
                          <Globe className="h-4 w-4 text-white/60" />
                          <span className="text-xs text-white/80">Visit Website</span>
                        </div>
                      )}
                      {cryptoWallet && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/20">
                          <Wallet className="h-4 w-4 text-white/60" />
                          <span className="text-xs text-white/80 truncate font-mono">
                            {cryptoWallet.slice(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSimPage;
