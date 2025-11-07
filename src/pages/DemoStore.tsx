import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Copy, Check, Share2, ExternalLink, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import xIcon from "@/assets/x-icon.png";

// Mock offerings data
const mockOfferings = [
  {
    id: "1",
    title: "Premium Consultation",
    description: "Get personalized advice and strategy for your crypto journey. One-on-one session with expert guidance.",
    price: 50,
    delivery_method: "Video Call",
    media_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
    offering_type: 'standard' as const,
  },
  {
    id: "2",
    title: "Exclusive NFT Collection",
    description: "Limited edition digital artwork from our featured artist. Includes commercial rights.",
    price: 0.5,
    delivery_method: "Instant Digital Delivery",
    media_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=300&fit=crop",
    offering_type: 'digital' as const,
  },
  {
    id: "3",
    title: "Trading Signals Package",
    description: "Access to daily trading signals with technical analysis and market insights. Valid for 30 days.",
    price: 99,
    delivery_method: "Email + Telegram",
    media_url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop",
    offering_type: 'standard' as const,
  },
];

const mockXData = {
  displayName: "Crypto Advisor",
  username: "@cryptoadvisor",
  bio: "Helping traders navigate the crypto markets since 2017. Expert in DeFi, NFTs, and blockchain technology. Building the future of decentralized finance.",
  profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoadvisor",
  verified: true,
  metrics: {
    followers: 45600,
    following: 892,
  },
};

const mockWallet = "DemoWallet1234567890abcdefgh";
const mockTotalEarnings = 2450;

export default function DemoStore() {
  const navigate = useNavigate();
  const [usernameCopied, setUsernameCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(mockWallet);
    setUsernameCopied(true);
    setTimeout(() => setUsernameCopied(false), 2000);
    toast.success("Wallet address copied!");
  };

  const handleShareLink = () => {
    const url = `https://socialinternetmoney.com/${mockXData.username}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const handleOfferingClick = () => {
    toast.info("This is a demo. Sign in with X to create your own store!");
  };

  const primaryColor = '#635cff';
  const secondaryColor = '#ffffff';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 font-system">
      {/* Top Navigation Bar */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="/sim-logo-dark.png"
                alt="SIM Logo"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/sim-logo.png";
                }}
              />
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="gap-2"
              >
                {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Prominent Profile Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-card/95 via-card/80 to-card/95 backdrop-blur-sm relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* Profile Image */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 shadow-2xl ring-4" style={{ borderColor: primaryColor, '--tw-ring-color': `${primaryColor}33` } as any}>
              <AvatarImage 
                src={mockXData.profileImageUrl} 
                alt={mockXData.displayName}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {mockXData.displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Crypto-native Online Store</p>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{mockXData.displayName}</h1>
                  {mockXData.verified && (
                    <Badge variant="default" className="gap-1" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button 
                    onClick={handleCopyUsername}
                    className="flex items-center gap-2 hover:text-foreground transition-colors font-mono text-sm"
                  >
                    <span className="truncate max-w-[200px] md:max-w-xs">
                      {mockWallet}
                    </span>
                    {usernameCopied ? (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  <a 
                    href={`https://x.com/${mockXData.username.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <img src={xIcon} alt="X" className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{formatNumber(mockXData.metrics.followers)}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">${mockTotalEarnings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{mockOfferings.length}</div>
                  <div className="text-sm text-muted-foreground">Offerings</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                {mockXData.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Storefront */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-8 md:py-12">
        <div className="space-y-6">
          {/* Demo Notice Banner */}
          <Card className="border-2 border-[#635cff] bg-[#635cff]/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-[#635cff]/10">
                  <Package className="h-6 w-6" style={{ color: '#635cff' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Demo Store Preview</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This is a preview of what your public store will look like. Sign in with X to create your own crypto-enabled store and start selling.
                  </p>
                  <Button 
                    onClick={() => navigate('/')}
                    style={{ backgroundColor: '#635cff', color: 'white' }}
                    className="hover:opacity-90"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offerings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Store Offerings</h2>
              <Badge variant="secondary" className="text-sm">
                {mockOfferings.length} Available
              </Badge>
            </div>

            {/* Offerings Grid */}
            <div className="grid gap-6">
              {mockOfferings.map((offering) => (
                <Card 
                  key={offering.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-border"
                  onClick={handleOfferingClick}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {offering.media_url && (
                      <div className="md:w-64 h-48 md:h-auto bg-muted relative overflow-hidden shrink-0">
                        <img
                          src={offering.media_url}
                          alt={offering.title}
                          className="w-full h-full object-cover"
                        />
                        {offering.offering_type === 'digital' && (
                          <Badge 
                            className="absolute top-3 right-3 bg-[#635cff] text-white"
                          >
                            Digital
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{offering.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {offering.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-sm text-muted-foreground mb-0.5">Price</div>
                              <div className="text-2xl font-bold flex items-baseline gap-1">
                                <DollarSign className="h-5 w-5" />
                                {offering.price.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-0.5">Delivery</div>
                              <div className="text-sm font-medium">{offering.delivery_method}</div>
                            </div>
                          </div>
                          <Button 
                            style={{ backgroundColor: '#635cff', color: 'white' }}
                            className="hover:opacity-90"
                          >
                            Purchase
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
