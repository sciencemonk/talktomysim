import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { knowledgeEnhancementService, KnowledgeEnhancementResult } from '@/services/knowledgeEnhancementService';
import { toast } from 'sonner';

interface KnowledgeEnhancementManagerProps {
  advisors: Array<{
    id: string;
    name: string;
  }>;
}

export const KnowledgeEnhancementManager: React.FC<KnowledgeEnhancementManagerProps> = ({ advisors }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<KnowledgeEnhancementResult[]>([]);
  const [currentAdvisor, setCurrentAdvisor] = useState<string>('');

  const handleEnhanceSingleAdvisor = async (advisorId: string, advisorName: string) => {
    setIsEnhancing(true);
    setCurrentAdvisor(advisorName);
    
    try {
      const result = await knowledgeEnhancementService.enhanceAdvisorKnowledge(advisorId, advisorName);
      
      if (result.success) {
        toast.success(`Enhanced knowledge for ${advisorName}`);
        setResults(prev => [...prev, result]);
      } else {
        toast.error(`Failed to enhance ${advisorName}: ${result.error}`);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(`Error enhancing ${advisorName}`);
    } finally {
      setIsEnhancing(false);
      setCurrentAdvisor('');
    }
  };

  const handleEnhanceAllAdvisors = async () => {
    setIsEnhancing(true);
    setProgress(0);
    setResults([]);
    
    try {
      const total = advisors.length;
      
      for (let i = 0; i < advisors.length; i++) {
        const advisor = advisors[i];
        setCurrentAdvisor(advisor.name);
        
        const result = await knowledgeEnhancementService.enhanceAdvisorKnowledge(advisor.id, advisor.name);
        setResults(prev => [...prev, result]);
        
        const progressPercent = ((i + 1) / total) * 100;
        setProgress(progressPercent);
        
        if (result.success) {
          toast.success(`Enhanced knowledge for ${advisor.name}`);
        } else {
          toast.error(`Failed to enhance ${advisor.name}: ${result.error}`);
        }
      }
      
      toast.success('Knowledge enhancement completed for all advisors');
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Error during knowledge enhancement');
    } finally {
      setIsEnhancing(false);
      setCurrentAdvisor('');
    }
  };

  const getStatusIcon = (result: KnowledgeEnhancementResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Knowledge Enhancement Manager
        </CardTitle>
        <CardDescription>
          Enhance advisor knowledge bases with comprehensive web research and vector embeddings.
          Each advisor will receive 5-10 targeted searches covering their major works, projects, and contributions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleEnhanceAllAdvisors}
            disabled={isEnhancing}
            size="lg"
          >
            {isEnhancing ? 'Enhancing...' : 'Enhance All Advisors'}
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            Cost: ~$0.05-0.10 per advisor (~$2-3 total)
          </div>
        </div>

        {/* Progress Indicator */}
        {isEnhancing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing: {currentAdvisor}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Individual Advisor Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Advisors</h3>
          <div className="grid gap-3">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{advisor.name}</span>
                  {results.find(r => r.advisorName === advisor.name) && 
                    getStatusIcon(results.find(r => r.advisorName === advisor.name)!)
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnhanceSingleAdvisor(advisor.id, advisor.name)}
                  disabled={isEnhancing}
                >
                  {isEnhancing && currentAdvisor === advisor.name ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Enhance'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enhancement Results</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result)}
                    <span className="font-medium">{result.advisorName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.success ? (
                      <span>
                        {result.chunksProcessed} chunks • {result.researchQueriesCount} searches
                      </span>
                    ) : (
                      <span className="text-red-600">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};