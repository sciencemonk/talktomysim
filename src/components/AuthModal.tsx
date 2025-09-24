
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

interface AuthForm {
  email: string;
  password: string;
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const form = useForm<AuthForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        toast.error('Failed to sign in with Google');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (signUpData.user) {
          setSignupEmail(data.email);
          setShowEmailConfirmation(true);
          // Don't show toast or close modal, show confirmation screen instead
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (signInData.user) {
          toast.success('Signed in successfully!');
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowEmailForm(false);
    setIsSignUp(false);
    setShowEmailConfirmation(false);
    setSignupEmail('');
    form.reset();
  };

  const handleBackFromConfirmation = () => {
    setShowEmailConfirmation(false);
    setSignupEmail('');
    setIsSignUp(false);
    setShowEmailForm(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-6 py-4">
          {showEmailConfirmation ? (
            // Email confirmation screen
            <>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Check your email</h2>
              </div>

              <div className="w-full space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    We sent a confirmation link to:
                  </p>
                  <p className="font-medium text-foreground bg-muted px-3 py-2 rounded-lg break-all">
                    {signupEmail}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Click the link in your email to activate your account.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleBackFromConfirmation}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </>
          ) : (
            // Regular auth flow
            <>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/a5a8957b-48cb-40f5-9097-0ab747b74077.png" 
                  alt="Think With Me" 
                  className="w-8 h-8"
                />
              </div>

              {!showEmailForm ? (
                <div className="w-full space-y-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Login with Google
                  </Button>
                  
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    variant="outline"
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    Login with Email
                  </Button>
                </div>
              ) : (
                <Card className="w-full border-0 shadow-none">
                  <CardContent className="space-y-4 px-0">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  {...field}
                                  required
                                  minLength={6}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white hover:opacity-90"
                          size="lg"
                        >
                          {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                        </Button>
                      </form>
                    </Form>

                    {!isSignUp && (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setIsSignUp(true)}
                          className="text-sm"
                        >
                          Don't have an account? Sign up
                        </Button>
                      </div>
                    )}

                    {isSignUp && (
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => setIsSignUp(false)}
                          className="text-sm"
                        >
                          Already have an account? Login
                        </Button>
                      </div>
                    )}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowEmailForm(false)}
                        className="text-sm text-muted-foreground"
                      >
                        ← Back to login options
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground text-center px-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
