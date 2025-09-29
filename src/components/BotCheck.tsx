import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, RefreshCw } from 'lucide-react';

interface BotCheckProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

const BotCheck = ({ onVerificationComplete, onCancel }: BotCheckProps) => {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(() => generateChallenge());

  function generateChallenge() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let correctAnswer: number;
    let question: string;
    
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        correctAnswer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '×':
        correctAnswer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    return { question, correctAnswer };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (parseInt(answer) === challenge.correctAnswer) {
      onVerificationComplete();
    } else {
      setError('Incorrect answer. Please try again.');
      setChallenge(generateChallenge());
      setAnswer('');
    }
    
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setChallenge(generateChallenge());
    setAnswer('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Verify You're Human</CardTitle>
          <CardDescription>
            Please solve this simple math problem to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <div className="bg-muted rounded-lg p-6 mb-4">
                <div className="text-2xl font-mono font-bold text-foreground">
                  {challenge.question} = ?
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Question
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                required
                className="text-center text-lg"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !answer.trim()}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotCheck;