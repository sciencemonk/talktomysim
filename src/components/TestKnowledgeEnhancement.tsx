import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { knowledgeEnhancementService } from '@/services/knowledgeEnhancementService';
import { toast } from 'sonner';

export const TestKnowledgeEnhancement: React.FC = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceFuller = async () => {
    setIsEnhancing(true);
    
    try {
      console.log('Starting knowledge enhancement for Fuller...');
      const result = await knowledgeEnhancementService.enhanceAdvisorKnowledge(
        'c15f79c8-1c03-4c60-b9cf-6d6d62605ae8', 
        'R. Buckminster Fuller'
      );
      
      console.log('Enhancement result:', result);
      
      if (result.success) {
        toast.success(`Enhanced Fuller's knowledge! Processed ${result.chunksProcessed} chunks from ${result.researchQueriesCount} research queries.`);
      } else {
        toast.error(`Failed to enhance Fuller: ${result.error}`);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(`Error enhancing Fuller: ${error}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Knowledge Enhancement</CardTitle>
        <CardDescription>
          Enhance Buckminster Fuller's knowledge base with comprehensive research
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={enhanceFuller} 
          disabled={isEnhancing}
          className="w-full"
        >
          {isEnhancing ? 'Enhancing Fuller...' : 'Enhance Fuller Knowledge'}
        </Button>
        {isEnhancing && (
          <p className="text-sm text-muted-foreground mt-2">
            This will research and process Fuller's major works, Cloud Nine project, geodesic domes, and more...
          </p>
        )}
      </CardContent>
    </Card>
  );
};