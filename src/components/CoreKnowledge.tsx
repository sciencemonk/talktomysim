
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { DocumentManager } from './DocumentManager';
import { TextContentInput } from './TextContentInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { toast } from 'sonner';
import { useSim } from '@/hooks/useSim';
import { useAuth } from '@/hooks/useAuth';

interface CoreKnowledgeProps {
  advisorId?: string;
}

export const CoreKnowledge: React.FC<CoreKnowledgeProps> = ({ advisorId: propAdvisorId }) => {
  const { user } = useAuth();
  const { sim, isLoading: simLoading, error: simError } = useSim();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  // FIXED: Use the actual sim ID, not the user ID or prop
  const advisorId = propAdvisorId || sim?.id;

  console.log('CoreKnowledge Debug Info:');
  console.log('- User:', user?.id);
  console.log('- Sim from useSim:', sim);
  console.log('- Actual Sim ID:', sim?.id);
  console.log('- Advisor ID being used:', advisorId);
  console.log('- Prop advisor ID:', propAdvisorId);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileProcess = async (file: File) => {
    try {
      if (!user) {
        toast.error('Please log in to upload documents.');
        return;
      }

      if (!advisorId) {
        toast.error('No sim selected. Please complete your sim setup first.');
        console.error('No advisor ID available for file processing');
        return;
      }

      setIsProcessing(true);
      setProcessingProgress(10);
      
      console.log('Processing file:', file.name, 'for sim ID:', advisorId, 'user:', user.id);
      
      setProcessingProgress(30);
      const result = await documentService.processFile(advisorId, file);
      
      setProcessingProgress(90);
      
      if (result.success) {
        toast.success(
          `Document processed successfully! Generated ${result.chunksProcessed} text chunks.`
        );
        
        if (result.failedChunks && result.failedChunks > 0) {
          toast.warning(
            `${result.failedChunks} chunks failed to process, but ${result.chunksProcessed} were successful.`
          );
        }
        
        // Refresh the document list
        setRefreshDocuments(prev => prev + 1);
      } else {
        toast.error(result.error || 'Failed to process document');
        console.error('Document processing failed:', result);
      }
      
      setProcessingProgress(100);
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error(error.message || 'Failed to process file');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 1000);
    }
  };

  const handleTextProcess = async (title: string, content: string) => {
    try {
      if (!user) {
        toast.error('Please log in to process text.');
        return;
      }

      if (!advisorId) {
        toast.error('No sim selected. Please complete your sim setup first.');
        console.error('No advisor ID available for text processing');
        return;
      }

      setIsProcessing(true);
      setProcessingProgress(20);
      
      console.log('Processing text for sim ID:', advisorId, 'user:', user.id);
      
      const result = await documentService.processDocument(
        advisorId,
        title,
        content,
        'text'
      );
      
      setProcessingProgress(90);
      
      if (result.success) {
        toast.success(
          `Text processed successfully! Generated ${result.chunksProcessed} text chunks.`
        );
        
        if (result.failedChunks && result.failedChunks > 0) {
          toast.warning(
            `${result.failedChunks} chunks failed to process, but ${result.chunksProcessed} were successful.`
          );
        }
        
        setRefreshDocuments(prev => prev + 1);
      } else {
        toast.error(result.error || 'Failed to process text');
        console.error('Text processing failed:', result);
      }
      
      setProcessingProgress(100);
    } catch (error: any) {
      console.error('Error processing text:', error);
      toast.error(error.message || 'Failed to process text');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 1000);
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

  // Show loading state while sim is loading
  if (simLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading Sim...</h3>
            <p className="text-muted-foreground">Please wait while we load your sim information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Validate sim exists and has proper ID
  if (!sim || !sim.id || sim.id.trim() === '') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Sim Found</h3>
            <p className="text-muted-foreground">
              No sim was found for your account. Please create a sim first before managing knowledge.
            </p>
            <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
              Debug: User ID: {user.id} | Sim: {sim ? JSON.stringify({id: sim.id, name: sim.name}) : 'null'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Debug info */}
      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
        Debug: User: {user.id} | Sim ID: {sim.id} | Sim Name: {sim.name} | Using advisor ID: {advisorId}
      </div>

      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Embedding - {sim.name || 'Unknown Sim'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Upload documents, add personal experiences, and share your expertise to build your Sim's brain. We'll convert it into a vector embedding so that huge amounts of information are readily available.
          </p>

          {/* Add Knowledge Tabs - directly in the card content */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="text">Paste Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileProcess={handleFileProcess}
                isProcessing={isProcessing}
                processingProgress={processingProgress}
                acceptedTypes={['.pdf', '.txt', '.docx']}
                maxFiles={10}
                maxFileSize={25}
              />
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <TextContentInput
                onProcess={handleTextProcess}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Uploaded Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
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
