
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSim } from "@/hooks/useSim";
import { documentService } from "@/services/documentService";
import { FileUpload } from "./FileUpload";
import { DocumentManager } from "./DocumentManager";
import { VectorStats } from "./VectorStats";
import { TextContentInput } from "./TextContentInput";
import { toast } from 'sonner';

interface CoreKnowledgeProps {
  advisorId?: string;
  advisorName?: string;
}

const CoreKnowledge = ({ advisorId, advisorName }: CoreKnowledgeProps) => {
  const { sim, updateCoreKnowledgeStatus, isLoading } = useSim();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Use sim?.id if available, fallback to advisorId prop
  const effectiveAdvisorId = sim?.id || advisorId;
  const effectiveAdvisorName = sim?.name || advisorName;

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!effectiveAdvisorId) {
      toast.error('No advisor ID available');
      return;
    }

    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        toast.info(`Processing ${file.name}...`);
        
        const result = await documentService.processDocument(
          effectiveAdvisorId,
          file.name,
          fileContent,
          file.type || 'text/plain',
          file.size
        );

        if (result.success) {
          toast.success(`${file.name} processed successfully`);
        } else {
          toast.error(`Failed to process ${file.name}: ${result.error}`);
        }

        setProcessingProgress(((i + 1) / files.length) * 100);
      }

      // Update completion status
      await updateCoreKnowledgeStatus();
      
      // Refresh the document list and stats
      setRefreshKey(prev => prev + 1);
      
    } catch (error: any) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [effectiveAdvisorId, updateCoreKnowledgeStatus]);

  const handleTextContent = useCallback(async (title: string, content: string) => {
    if (!effectiveAdvisorId) {
      toast.error('No advisor ID available');
      return;
    }

    setIsProcessing(true);
    
    try {
      toast.info(`Processing ${title}...`);
      
      const result = await documentService.processDocument(
        effectiveAdvisorId,
        title,
        content,
        'text/plain',
        content.length
      );

      if (result.success) {
        toast.success(`${title} processed successfully`);
        await updateCoreKnowledgeStatus();
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(`Failed to process content: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('Error processing text content:', error);
      toast.error('Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  }, [effectiveAdvisorId, updateCoreKnowledgeStatus]);

  const handleDocumentsChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  if (!effectiveAdvisorId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h4 className="font-medium mb-2">No Advisor Available</h4>
            <p className="text-sm text-muted-foreground">
              Please create or select an advisor to manage vector embeddings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Vector Embedding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Upload documents, add personal experiences, and share your expertise to build your Sim's brain. 
            We'll convert it into a vector embedding so that huge amounts of information are readily available.
          </p>

          {/* Vector Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium">Knowledge Base Statistics</h4>
            <VectorStats key={refreshKey} advisorId={effectiveAdvisorId} />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Upload Documents</h4>
            <FileUpload
              onFileSelect={handleFileUpload}
              isProcessing={isProcessing}
              processingProgress={processingProgress}
              acceptedTypes={['.pdf', '.txt', '.docx']}
              maxFiles={10}
            />
          </div>

          {/* Text Content Input */}
          <div className="space-y-3">
            <h4 className="font-medium">Add Text Content</h4>
            <TextContentInput
              onSave={handleTextContent}
              isProcessing={isProcessing}
            />
          </div>

          {/* Document Management */}
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Documents</h4>
            <DocumentManager
              key={refreshKey}
              advisorId={effectiveAdvisorId}
              onDocumentsChange={handleDocumentsChange}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={updateCoreKnowledgeStatus} 
              className="px-8"
              disabled={isLoading || isProcessing}
            >
              {isLoading ? 'Saving...' : 'Save Vector Embedding'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Building Your Knowledge Base</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload PDFs, text files, or Word documents with your expertise</li>
            <li>• Add personal experiences and methodologies using the text input</li>
            <li>• Include domain-specific knowledge and frameworks you use</li>
            <li>• Add your opinions and perspectives on topics you're passionate about</li>
            <li>• Each document is split into chunks and converted to vector embeddings</li>
            <li>• More content leads to better, more personalized responses from your Sim</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreKnowledge;
