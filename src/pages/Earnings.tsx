import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Wallet, TrendingUp, DollarSign, ExternalLink, Copy, Check, AlertCircle, Save } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const solanaAddressSchema = z.string()
  .trim()
  .min(32, "Solana address must be at least 32 characters")
  .max(44, "Solana address must be at most 44 characters")
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format");

export default function Earnings() {
  const { user } = useAuth();
  const { connection } = useConnection();
  const [store, setStore] = useState<any>(null);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    transactions: 0
  });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processingOfframp, setProcessingOfframp] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [editingWallet, setEditingWallet] = useState(false);
  const [newSolanaWallet, setNewSolanaWallet] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);

  const walletAddress = user?.address;
  const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user]);

  useEffect(() => {
    if (store?.crypto_wallet) {
      loadWalletBalance();
    }
  }, [store?.crypto_wallet]);

  const loadWalletBalance = async () => {
    if (!store?.crypto_wallet) return;
    
    try {
      const walletPubkey = new PublicKey(store.crypto_wallet);
      const tokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        walletPubkey
      );

      const accountInfo = await getAccount(connection, tokenAccount);
      const balance = Number(accountInfo.amount) / 1_000_000; // USDC has 6 decimals
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const handleSaveSolanaWallet = async () => {
    try {
      // Validate the Solana address
      const validation = solanaAddressSchema.safeParse(newSolanaWallet);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      // Verify it's a valid Solana public key
      try {
        new PublicKey(newSolanaWallet);
      } catch {
        toast.error("Invalid Solana address format");
        return;
      }

      setSavingWallet(true);

      const { error } = await supabase
        .from('stores')
        .update({ crypto_wallet: newSolanaWallet })
        .eq('id', store.id);

      if (error) throw error;

      setStore({ ...store, crypto_wallet: newSolanaWallet });
      setEditingWallet(false);
      toast.success("Solana wallet address saved successfully");
      loadWalletBalance();
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error("Failed to save wallet address");
    } finally {
      setSavingWallet(false);
    }
  };

  const handleCopySolanaWallet = async () => {
    if (!store?.crypto_wallet) return;
    
    try {
      await navigator.clipboard.writeText(store.crypto_wallet);
      toast.success('Solana wallet address copied!');
    } catch (error) {
      toast.error('Failed to copy wallet address');
    }
  };

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

      // Load orders for earnings calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, created_at, status')
        .eq('store_id', storeData.id)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Calculate earnings
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalEarnings = orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
      const monthlyEarnings = orders?.filter(o => new Date(o.created_at) >= startOfMonth)
        .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

      setEarnings({
        total: totalEarnings,
        thisMonth: monthlyEarnings,
        transactions: orders?.length || 0
      });

    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedWallet(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (error) {
      toast.error('Failed to copy wallet address');
    }
  };

  const handleCashOut = async () => {
    if (!walletAddress) {
      toast.error('No wallet connected. Please connect your wallet first.');
      return;
    }

    try {
      setProcessingOfframp(true);
      
      // Call edge function to generate offramp URL
      const { data, error } = await supabase.functions.invoke('generate-offramp-url', {
        body: {
          walletAddress: walletAddress,
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

      {/* Solana Payment Wallet Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solana Payment Wallet
          </CardTitle>
          <CardDescription>
            Your store receives USDC payments on Solana. Connect a Phantom or Solflare wallet address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!store?.crypto_wallet && !editingWallet && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required:</strong> Add your Solana wallet address to receive payments. You cannot create products without this.
              </AlertDescription>
            </Alert>
          )}

          {editingWallet || !store?.crypto_wallet ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="solana-wallet">Solana Wallet Address</Label>
                <Input
                  id="solana-wallet"
                  type="text"
                  placeholder="Enter your Solana wallet address (32-44 characters)"
                  value={newSolanaWallet}
                  onChange={(e) => setNewSolanaWallet(e.target.value.trim())}
                  className="font-mono"
                  maxLength={44}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a valid Solana address from Phantom, Solflare, or another Solana wallet
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSolanaWallet}
                  disabled={savingWallet || !newSolanaWallet}
                >
                  {savingWallet ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Wallet
                    </>
                  )}
                </Button>
                {store?.crypto_wallet && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingWallet(false);
                      setNewSolanaWallet("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {store.crypto_wallet}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySolanaWallet}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Solana Mainnet • Configured</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingWallet(true);
                    setNewSolanaWallet(store.crypto_wallet);
                  }}
                >
                  Update Wallet
                </Button>
              </div>
            </>
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
                ${walletBalance.toFixed(2)} USDC
              </p>
            </div>
            <Button
              onClick={handleCashOut}
              disabled={processingOfframp || !walletAddress || walletBalance === 0}
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