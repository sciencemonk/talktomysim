import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Copy, Wallet, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
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

export default function NFTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { data: nft, isLoading } = useQuery({
    queryKey: ['nft', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', id)
        .eq('marketplace_category', 'nft')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleViewOnSolscan = () => {
    const mintAddress = (nft?.social_links as any)?.mint_address;
    if (mintAddress) {
      window.open(`https://solscan.io/token/${mintAddress}`, '_blank');
    }
  };

  const handleViewTransaction = () => {
    const signature = (nft?.social_links as any)?.transaction_signature;
    if (signature) {
      window.open(`https://solscan.io/tx/${signature}`, '_blank');
    }
  };

  const handlePurchaseClick = () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet to purchase this NFT');
      return;
    }
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!wallet.publicKey || !nft) return;
    
    setIsPurchasing(true);
    try {
      toast.info('NFT purchase functionality coming soon!');
      toast.info('This will integrate with Solana SPL token transfers and NFT ownership verification');
      
      // TODO: Implement actual NFT purchase flow:
      // 1. Verify NFT ownership is with seller
      // 2. Create escrow or atomic swap transaction
      // 3. Transfer USDC/SOL from buyer to seller
      // 4. Transfer NFT from seller to buyer
      // 5. Update database with new owner
      
      setShowPurchaseDialog(false);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error?.message || 'Failed to purchase NFT');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-fg">Loading NFT details...</div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-fg mb-2">NFT Not Found</h2>
            <p className="text-fgMuted mb-4">This NFT does not exist or has been removed.</p>
            <Button onClick={() => navigate('/')}>
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = nft.social_links as any;
  const mintAddress = socialLinks?.mint_address;
  const transactionSig = socialLinks?.transaction_signature;
  const metadataUri = socialLinks?.metadata_uri;
  const symbol = socialLinks?.symbol;
  const royaltyPercent = socialLinks?.royalty_percent || 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-fg hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: NFT Image */}
          <div>
            <Card className="overflow-hidden border-border">
              <div className="aspect-square bg-muted relative">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage 
                    src={nft.avatar_url}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="w-full h-full rounded-none bg-primary/10 flex items-center justify-center text-4xl">
                    {nft.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Card>
          </div>

          {/* Right: NFT Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-fg mb-2">{nft.name}</h1>
              {symbol && (
                <Badge variant="secondary" className="text-sm">
                  {symbol}
                </Badge>
              )}
            </div>

            <p className="text-fgMuted text-lg">{nft.description}</p>

            {/* Price Card */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-fgMuted mb-1">Current Price</p>
                    <p className="text-3xl font-bold text-fg">
                      {nft.price && nft.price > 0 ? `${nft.price} USDC` : 'Not for sale'}
                    </p>
                  </div>
                  
                  {nft.price && nft.price > 0 && (
                    wallet.connected ? (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handlePurchaseClick}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Purchase NFT
                      </Button>
                    ) : (
                      <div className="w-full">
                        <p className="text-sm text-fgMuted mb-2 text-center">
                          Connect wallet to purchase
                        </p>
                        <WalletMultiButton className="!w-full !h-11" />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* NFT Details */}
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-fg mb-4">NFT Details</h3>
                
                {mintAddress && (
                  <div>
                    <p className="text-sm text-fgMuted mb-2">Mint Address</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border border-border text-fg font-mono break-all">
                        {mintAddress}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(mintAddress, 'Mint address')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {nft.crypto_wallet && (
                  <div>
                    <p className="text-sm text-fgMuted mb-2">Creator Wallet</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border border-border text-fg font-mono break-all">
                        {nft.crypto_wallet}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(nft.crypto_wallet, 'Creator wallet')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-fgMuted mb-2">Royalty</p>
                  <p className="text-fg font-medium">{royaltyPercent}%</p>
                </div>

                {transactionSig && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewTransaction}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Mint Transaction
                  </Button>
                )}

                {mintAddress && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewOnSolscan}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    View on Solscan
                  </Button>
                )}

                {metadataUri && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(metadataUri, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Metadata
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fg">Confirm NFT Purchase</AlertDialogTitle>
            <AlertDialogDescription className="text-fgMuted">
              You are about to purchase <strong className="text-fg">{nft?.name}</strong> for{' '}
              <strong className="text-primary">{nft?.price} USDC</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-fgMuted">NFT</span>
              <span className="text-fg font-medium">{nft?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-fgMuted">Price</span>
              <span className="text-fg font-medium">{nft?.price} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-fgMuted">Your Wallet</span>
              <span className="text-fg font-mono text-xs">
                {wallet.publicKey?.toBase58().slice(0, 4)}...{wallet.publicKey?.toBase58().slice(-4)}
              </span>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-fgMuted">
                This NFT will be transferred to your connected wallet after payment is confirmed.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurchasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPurchase}
              disabled={isPurchasing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
