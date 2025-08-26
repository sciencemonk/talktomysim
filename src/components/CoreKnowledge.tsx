
import React, { useState, useEffect } from 'react';
import { DocumentManager } from './DocumentManager';
import { TextContentInput } from './TextContentInput';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { documentService } from '@/services/documentService';
import { conversationEmbeddingService } from '@/services/conversationEmbeddingService';

import { useSim } from '@/hooks/useSim';
import { useAuth } from '@/hooks/useAuth';
import { useUserPlan } from '@/hooks/useUserPlan';

interface CoreKnowledgeProps {
  advisorId?: string;
}

export const CoreKnowledge: React.FC<CoreKnowledgeProps> = ({ advisorId: propAdvisorId }) => {
  const { user } = useAuth();
  const { sim, isLoading: simLoading, error: simError } = useSim();
  const { plan, hasActiveSubscription } = useUserPlan();
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [autoProcessed, setAutoProcessed] = useState(false);
  
  const isPremium = plan !== 'free' && hasActiveSubscription;

  // FIXED: Always use the sim ID, never use propAdvisorId for document processing
  const advisorId = sim?.id;

  // Auto-process conversations for intelligence when sim is available
  useEffect(() => {
    if (sim?.id && !autoProcessed) {
      console.log('Auto-processing recent conversations...');
      conversationEmbeddingService.autoProcessRecentConversations(sim.id, 30)
        .then(() => {
          console.log('Auto-processing completed');
          setAutoProcessed(true);
        })
        .catch(err => {
          console.error('Auto-processing failed:', err);
          setAutoProcessed(true); // Still mark as processed to avoid infinite retries
        });
    }
  }, [sim?.id, autoProcessed]);



  const handleProcessStart = () => {
    // Immediately refresh documents to show new document with "Processing" status
    setRefreshDocuments(prev => prev + 1);
  };

  const handleTextProcess = async (title: string, content: string) => {
    try {
      if (!user) {
        return;
      }

      if (!advisorId) {
        console.error('No advisor ID available for text processing');
        return;
      }

      console.log('Processing text for sim ID:', advisorId, 'user:', user.id);
      
      const result = await documentService.processDocument(
        advisorId,
        title,
        content,
        'text'
      );
      
      // Only refresh once at the end to update status from "Processing" to "Processed"
      setRefreshDocuments(prev => prev + 1);
      
      if (!result.success) {
        console.error('Text processing failed:', result);
      }
    } catch (error: any) {
      console.error('Error processing text:', error);
      // Still refresh to show current state
      setRefreshDocuments(prev => prev + 1);
    }
  };

  const handleDocumentsChange = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please log in to manage your sim's knowledge base.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't show loading state - just render the page like other pages

  // Show error state if sim loading failed
  if (simError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Sim</h3>
            <p className="text-muted-foreground">
              There was an error loading your sim: {simError}
            </p>
            <p className="text-muted-foreground mt-2">
              Please refresh the page and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If sim is not available yet (still loading), don't render anything
  if (!sim || !sim.id || sim.id.trim() === '') {
    // Return null to not render anything, similar to other pages
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vector Embedding {!isPremium && <span className="ml-2 text-sm font-normal text-amber-500">(Premium Feature)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Add personal experiences, knowledge, and expertise to build your Sim's brain. Paste or write content directly to create a comprehensive knowledge base. We'll convert it into vector embeddings so that information is readily available for conversations.
          </p>
          
          {!isPremium && (
            <Card className="bg-muted border-border">
              <CardContent className="p-4 flex items-center space-x-3">
                <Lock className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  Vector Embedding is available on Plus and Pro plans. Upgrade your plan to access this feature.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Text Content Input - simplified interface */}
          <TextContentInput
            onProcess={isPremium ? handleTextProcess : undefined}
            onProcessStart={handleProcessStart}
            premiumRequired={!isPremium}
          />
        </CardContent>
      </Card>



      {/* Saved Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Content</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentManager
            advisorId={advisorId!}
            onDocumentsChange={handleDocumentsChange}
            refreshTrigger={refreshDocuments}
          />
        </CardContent>
      </Card>
    </div>
  );
};
