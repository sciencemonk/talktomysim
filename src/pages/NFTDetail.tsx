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

export default function NFTDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
            <Button onClick={() => navigate('/marketplace')}>
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
              onClick={() => navigate('/marketplace')}
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
                    <Button className="w-full" size="lg">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Purchase NFT
                    </Button>
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
    </div>
  );
}
