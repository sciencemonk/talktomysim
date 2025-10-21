import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BatchUpdateDescriptions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [simsToUpdate, setSimsToUpdate] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all sims missing auto_description on component mount
  useEffect(() => {
    const fetchSimsWithoutDescription = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('advisors')
          .select('id, name, auto_description')
          .eq('is_active', true)
          .is('auto_description', null);
        
        if (error) throw error;
        setSimsToUpdate(data || []);
      } catch (error) {
        console.error('Error fetching sims:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch sims without descriptions',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimsWithoutDescription();
  }, []);

  const handleBatchUpdate = async () => {
    setIsProcessing(true);
    setResults([]);

    try {
      const simIds = simsToUpdate.map(sim => sim.id);
      const { data, error } = await supabase.functions.invoke('batch-regenerate-descriptions', {
        body: { simIds }
      });

      if (error) throw error;

      setResults(data.results);
      
      const successCount = data.results.filter((r: any) => r.success).length;
      const failCount = data.results.length - successCount;
      
      toast({
        title: 'Batch Update Complete',
        description: `${successCount} sims updated successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });

      // Refresh the list
      const { data: refreshData } = await supabase
        .from('advisors')
        .select('id, name, auto_description')
        .eq('is_active', true)
        .is('auto_description', null);
      
      setSimsToUpdate(refreshData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update descriptions',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Update Sim Display Descriptions</CardTitle>
          <CardDescription>
            Generate auto_description field for sims that are missing it. This is the public-facing description shown in the marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading sims...</span>
            </div>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">
                  {simsToUpdate.length} sims need display descriptions:
                </h3>
                {simsToUpdate.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All sims have display descriptions! 🎉</p>
                ) : (
                  <ul className="list-disc list-inside text-sm space-y-1 max-h-60 overflow-y-auto">
                    {simsToUpdate.map(sim => (
                      <li key={sim.id}>{sim.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <Button 
                onClick={handleBatchUpdate} 
                disabled={isProcessing || simsToUpdate.length === 0}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing {simsToUpdate.length} sims...
                  </>
                ) : (
                  `Generate Display Descriptions for ${simsToUpdate.length} Sims`
                )}
              </Button>
            </>
          )}

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
