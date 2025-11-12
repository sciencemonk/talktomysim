import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const CoinbaseSignIn = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const coinbaseWallet = (window as any).coinbaseWallet;
      
      if (!coinbaseWallet) {
        toast.error('Coinbase Wallet SDK not initialized');
        setIsLoading(false);
        return;
      }

      // Create embedded wallet provider
      const provider = coinbaseWallet.makeWeb3Provider();
      
      // Request email verification
      // Note: The actual implementation may vary based on Coinbase's embedded wallet API
      // This is a placeholder for the verification flow
      await provider.request({
        method: 'wallet_requestEmailVerification',
        params: [{ email }]
      });

      setCodeSent(true);
      toast.success('Verification code sent to your email!');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast.error(error?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const coinbaseWallet = (window as any).coinbaseWallet;
      
      if (!coinbaseWallet) {
        toast.error('Coinbase Wallet SDK not initialized');
        setIsLoading(false);
        return;
      }

      const provider = coinbaseWallet.makeWeb3Provider();
      
      // Verify the code and get the wallet address
      const accounts = await provider.request({
        method: 'wallet_verifyEmailCode',
        params: [{ email, code: verificationCode }]
      });

      if (accounts && accounts.length > 0) {
        const userData = { 
          address: accounts[0],
          email: email 
        };
        updateUser(userData);
        
        toast.success('Successfully verified! Welcome to Agentic Sales Platform.');
        console.log('Verified account:', accounts[0]);
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      
      if (error.code === 4001) {
        toast.error('Verification cancelled');
      } else if (error.message?.includes('invalid') || error.message?.includes('code')) {
        toast.error('Invalid verification code. Please try again.');
      } else {
        toast.error(error?.message || 'Failed to verify code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {codeSent ? 'Verify Your Email' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-base">
            {codeSent 
              ? 'Enter the verification code we sent to your email'
              : 'Enter your email to receive a verification code'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!codeSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendCode}
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !email}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <Button
                onClick={handleVerifyCode}
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || !verificationCode}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Verify & Sign In
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode('');
                }}
                variant="ghost"
                className="w-full"
                disabled={isLoading}
              >
                Use Different Email
              </Button>
            </>
          )}

          <div className="pt-4 border-t">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Secure wallet creation via Coinbase
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Your wallet remains in your control
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                No complex setup required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
