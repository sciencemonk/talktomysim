import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BatchUpdateDescriptions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const simIds = [
    'c2c0cca5-f42a-46e6-9535-a156477b2737', // Idea Guy
    '9e057f9d-b723-4706-bcc0-feac96bb3182', // Bible Verse On-demand
    'da28fb12-3ddf-4258-be2f-2ae2760d8798', // Roman History Story Time
    '44643cb2-0d0c-4fea-98e2-66e36bd6bf5a', // Meal Planner
    '0fd5bcc0-ff8c-4157-a27e-753146c3c27b', // Solana Whale Hunter
  ];

  const handleBatchUpdate = async () => {
    setIsProcessing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('batch-regenerate-descriptions', {
        body: { simIds }
      });

      if (error) throw error;

      setResults(data.results);
      
      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.length - successCount;

      toast({
        title: "Batch Update Complete",
        description: `${successCount} descriptions updated successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
      });
    } catch (error) {
      console.error('Batch update error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Batch Update Sim Descriptions</CardTitle>
          <CardDescription>
            Regenerate display descriptions for selected sims based on their system prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sims to update:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Idea Guy</li>
              <li>Bible Verse On-demand</li>
              <li>Roman History Story Time</li>
              <li>Meal Planner</li>
              <li>Solana Whale Hunter</li>
            </ul>
          </div>

          <Button 
            onClick={handleBatchUpdate} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Regenerate Descriptions'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold">Results:</h3>
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{result.simName || result.simId}</p>
                      {result.success ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.newDescription}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchUpdateDescriptions;
