import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XAgentStoreManager } from "@/components/XAgentStoreManager";
import { XAgentPurchases } from "@/components/XAgentPurchases";
import xIcon from "@/assets/x-icon.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock data for demo
const mockAgent = {
  id: "demo-agent-id",
  name: "Demo Creator",
  description: "This is a demo creator store showcasing the X Agent Creator experience",
  type: 'General Tutor' as const,
  status: 'active' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  prompt: "I am a helpful AI assistant",
  welcome_message: "Welcome to my store!",
  title: "Demo Creator",
  sim_type: 'living' as const,
  is_featured: false,
  model: 'GPT-4',
  interactions: 0,
  studentsSaved: 0,
  helpfulnessScore: 0,
  avmScore: 0,
  csat: 0,
  performance: 0,
  channels: [],
  channelConfigs: {},
  isPersonal: false,
  voiceTraits: [],
  social_links: {
    x_username: "democreator",
    userName: "democreator",
    name: "Demo Creator",
    description: "Showcasing the X Agent Creator Dashboard",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    isVerified: true,
    followers: 12500,
    following: 234,
  },
  sim_category: 'Crypto Mail',
  is_verified: true,
  x402_enabled: true,
  x402_price: 5.0,
  integrations: [],
};

const mockXData = {
  displayName: "Demo Creator",
  username: "@democreator",
  bio: "This is a demo account showcasing the creator dashboard experience",
  profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  verified: true,
  metrics: {
    followers: 12500,
    following: 234,
  },
  tweets: [],
};

export default function DemoTest() {
  const navigate = useNavigate();
  const [totalEarnings] = useState<number>(1250);
  const [walletAddress, setWalletAddress] = useState("DemoWallet123...xyz");

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 h-9 px-2 md:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <img src={xIcon} alt="X" className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Creator Dashboard (Demo)</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-7xl">
        <div className="space-y-4 md:space-y-6">
          {/* Demo Notice */}
          <Card className="border-border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Demo Mode:</strong> This is a preview of the creator dashboard experience. Sign in with X to create your own store.
              </p>
            </CardContent>
          </Card>

          {/* Profile Header */}
          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="p-5 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 shrink-0 ring-2 ring-[#81f4aa]/20" style={{ borderColor: '#81f4aa' }}>
                    <AvatarImage 
                      src={mockXData.profileImageUrl} 
                      alt={mockAgent.name}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="text-lg font-bold">{mockAgent.name[0]}</AvatarFallback>
                  </Avatar>
                  {mockXData.verified && (
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#81f4aa' }}>
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 flex-wrap">
                    <CardTitle className="text-xl md:text-2xl break-words font-bold">{mockXData.displayName}</CardTitle>
                  </div>
                  <CardDescription className="text-sm md:text-base mb-3 break-all font-medium opacity-70">
                    {mockXData.username}
                  </CardDescription>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                      <Users className="h-3 w-3 mr-1.5" style={{ color: '#81f4aa' }} />
                      {formatNumber(mockXData.metrics?.followers)} Followers
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium" style={{ backgroundColor: 'rgba(129, 244, 170, 0.15)', color: '#81f4aa', borderColor: 'rgba(129, 244, 170, 0.3)' }}>
                      💰 ${totalEarnings.toFixed(0)} Earned
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="purchases">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store" className="mt-6">
              <XAgentStoreManager 
                agentId={mockAgent.id}
                walletAddress={walletAddress}
                onWalletUpdate={setWalletAddress}
              />
            </TabsContent>
            
            <TabsContent value="purchases" className="mt-6">
              <XAgentPurchases agentId={mockAgent.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
