import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, Lock } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const verificationCodeSchema = z.string().trim().length(6, { message: "Verification code must be 6 digits" });

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps) => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/auth/request-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          projectId: import.meta.env.VITE_CDP_PROJECT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }

      toast.success('Verification code sent to your email');
      setStep('verification');
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    
    try {
      verificationCodeSchema.parse(verificationCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setCodeError(error.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
          projectId: import.meta.env.VITE_CDP_PROJECT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const data = await response.json();
      
      updateUser({
        email: email.trim(),
        address: data.address,
        coinbaseAuth: true,
        signedInAt: new Date().toISOString()
      });

      toast.success('Successfully signed in!');
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error verifying code:', error);
      setCodeError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setEmailError('');
    setCodeError('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setTimeout(resetModal, 300);
      }
    }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border-border">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8 pt-12">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">Sign in</DialogTitle>
                <DialogDescription className="sr-only">Enter your email to sign in</DialogDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-medium bg-[#0052FF] hover:bg-[#0047E0] text-white"
              >
                {isSubmitting ? 'Sending...' : 'Continue'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Lock className="h-4 w-4" />
                <span>Secured by <span className="font-semibold">coinbase</span></span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">Enter verification code</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  We sent a code to <span className="font-medium">{email}</span>
                </DialogDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-foreground">
                  Verification code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setCodeError('');
                  }}
                  className="h-12 text-base text-center tracking-widest font-mono"
                  disabled={isSubmitting}
                  maxLength={6}
                />
                {codeError && (
                  <p className="text-sm text-destructive">{codeError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full h-12 text-base font-medium bg-[#0052FF] hover:bg-[#0047E0] text-white"
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('email');
                  setVerificationCode('');
                  setCodeError('');
                }}
                className="w-full text-sm"
              >
                Change email
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Lock className="h-4 w-4" />
                <span>Secured by <span className="font-semibold">coinbase</span></span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
