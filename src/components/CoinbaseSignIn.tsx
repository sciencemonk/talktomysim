import { useState } from 'react';
import { useSignIn } from '@coinbase/cdp-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const CoinbaseSignIn = () => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await signIn({ method: 'email', email });
      toast.success('Check your email for a sign-in link');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      await signIn({ method: 'oauth', provider });
    } catch (error: any) {
      console.error('Social sign in error:', error);
      toast.error(error?.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to access your agentic storefront
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialSignIn('apple')}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apple
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
