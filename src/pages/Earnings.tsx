import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEvmAddress, useIsSignedIn, useCurrentUser } from "@coinbase/cdp-hooks";
import { toast } from "sonner";
import { Wallet, TrendingUp, DollarSign, ExternalLink, Copy, Check } from "lucide-react";

export default function Earnings() {
  const { user } = useAuth();
  const { evmAddress } = useEvmAddress();
  const isSignedIn = useIsSignedIn();
  const { currentUser } = useCurrentUser();
  const [store, setStore] = useState<any>(null);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    transactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingOfframp, setProcessingOfframp] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  // Monitor wallet connection status
  useEffect(() => {
    // Check for wallet address from different sources
    let walletAddress: string | null = null;

    if (evmAddress) {
      walletAddress = evmAddress;
    } else if (currentUser?.evmSmartAccounts?.[0]) {
      // evmSmartAccounts[0] is already the address string
      walletAddress = currentUser.evmSmartAccounts[0];
    }

    setDisplayAddress(walletAddress);

    // Stop loading after checking all sources
    if (isSignedIn) {
      const timer = setTimeout(() => {
        setWalletLoading(false);
        if (!walletAddress) {
          console.warn('Coinbase wallet not detected despite being signed in');
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setWalletLoading(false);
    }
  }, [evmAddress, currentUser, isSignedIn]);

  useEffect(() => {
    if (displayAddress) {
      console.log('Coinbase wallet detected:', displayAddress);
    }
  }, [displayAddress]);

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);

      // Load store data
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Load payment sessions for earnings calculation
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_sessions')
        .select('amount, created_at, is_active')
        .eq('metadata->>store_id', storeData.id)
        .eq('is_active', false); // Only completed transactions

      if (paymentsError) throw paymentsError;

      // Calculate earnings
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalEarnings = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const monthlyEarnings = payments?.filter(p => new Date(p.created_at) >= startOfMonth)
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setEarnings({
        total: totalEarnings,
        thisMonth: monthlyEarnings,
        transactions: payments?.length || 0
      });

    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWallet = async () => {
    if (!displayAddress) return;
    
    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopiedWallet(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (error) {
      toast.error('Failed to copy wallet address');
    }
  };

  const handleCashOut = async () => {
    if (!displayAddress) {
      toast.error('No wallet connected. Please connect your wallet first.');
      return;
    }

    try {
      setProcessingOfframp(true);
      
      // Call edge function to generate offramp URL
      const { data, error } = await supabase.functions.invoke('generate-offramp-url', {
        body: {
          walletAddress: displayAddress,
          redirectUrl: `${window.location.origin}/dashboard?view=earnings`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Coinbase offramp in new window
        window.open(data.url, '_blank', 'width=500,height=700');
        toast.success('Opening Coinbase cash out...');
      }
    } catch (error) {
      console.error('Error initiating cash out:', error);
      toast.error('Failed to initiate cash out. Please try again.');
    } finally {
      setProcessingOfframp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your store revenue and manage withdrawals
        </p>
      </div>

      {/* Wallet Info Card */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connected Wallet
            </CardTitle>
            <CardDescription>
              Your store's payment wallet on Base network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletLoading ? (
              <div className="p-4 bg-muted rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Loading wallet...
                </p>
              </div>
            ) : displayAddress ? (
              <>
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">
                    {displayAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyWallet}
                    className="flex-shrink-0"
                  >
                    {copiedWallet ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Base Network • Connected</span>
                </div>
              </>
            ) : (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  No wallet connected
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {isSignedIn ? (
                    'Your embedded wallet is being initialized. This may take a moment.'
                  ) : (
                    'Sign in with Coinbase to access your embedded wallet'
                  )}
                </p>
                {isSignedIn && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                )}
              </div>
            )}
          </CardContent>
      </Card>

      {/* Earnings Overview */}
      <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earnings.total.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                USDC on Base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${earnings.thisMonth.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <Badge variant="secondary">{earnings.transactions}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnings.transactions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed sales
              </p>
            </CardContent>
        </Card>
      </div>

      {/* Cash Out Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Out to Bank Account</CardTitle>
          <CardDescription>
            Convert your USDC earnings to fiat currency and send directly to your bank account via Coinbase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Available to cash out</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ${earnings.total.toFixed(2)} USDC
              </p>
            </div>
            <Button
              onClick={handleCashOut}
              disabled={processingOfframp || !displayAddress || earnings.total === 0}
              className="gap-2"
            >
              {processingOfframp ? (
                <>Processing...</>
              ) : (
                <>
                  Cash Out <ExternalLink className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>No fees for USDC withdrawals</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Funds sent directly to your bank account via ACH</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Processing typically takes 1-3 business days</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Powered by Coinbase offramp technology</span>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }