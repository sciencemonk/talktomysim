import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Wallet, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEvmAddress } from "@coinbase/cdp-hooks";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [copiedWallet, setCopiedWallet] = useState(false);
  
  // Get wallet information from Coinbase CDP
  const { evmAddress: walletAddress } = useEvmAddress();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center hover:opacity-80 transition-opacity">
            <div className="bg-black/90 rounded-lg px-2 py-1">
              <img src="/sim-logo-white.png" alt="Logo" className="h-6 w-auto" />
            </div>
          </button>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground">
              Your Coinbase wallet information and account details
            </p>
          </div>

          {/* Account Information Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Email Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold break-all">
                  {user?.email || 'Not available'}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Address Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-mono break-all">
                    {walletAddress ? (
                      <>
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </>
                    ) : (
                      'Loading...'
                    )}
                  </div>
                  {walletAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
                    >
                      {copiedWallet ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy Full Address
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {walletAddress ? 'Connected' : 'Not Connected'}
                </div>
                {walletAddress && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ethereum Mainnet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {user?.id || 'Not available'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {user?.email || 'Not available'}
                  </p>
                </div>
              </div>

              {walletAddress && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Wallet Address</p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {walletAddress}
                    </p>
                  </div>
                </div>
              )}

              {user?.coinbaseAuth && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-primary">Coinbase Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Successfully authenticated with Coinbase
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
              {walletAddress && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://etherscan.io/address/${walletAddress}`,
                      '_blank'
                    )
                  }
                >
                  View on Etherscan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
