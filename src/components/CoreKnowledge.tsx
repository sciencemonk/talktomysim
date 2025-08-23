import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { DocumentManager } from './DocumentManager';
import { TextContentInput } from './TextContentInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { documentService } from '@/services/documentService';
import { toast } from 'sonner';

interface CoreKnowledgeProps {
  advisorId: string;
}

export const CoreKnowledge: React.FC<CoreKnowledgeProps> = ({ advisorId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFileProcess = async (file: File) => {
    try {
      setIsProcessing(true);
      setProcessingProgress(10);
      
      console.log('Processing file:', file.name);
      
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
      setIsProcessing(true);
      setProcessingProgress(20);
      
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg mb-4">Vector Embedding</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Upload documents, add personal experiences, and share your expertise to build your Sim's brain. We'll convert it into a vector embedding so that huge amounts of information are readily available.
        </p>
      </div>

      {/* Add Knowledge Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-fg mb-6">Add Knowledge</h2>
        <Card>
          <CardContent className="p-6">
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
      </div>

      {/* Uploaded Documents Section */}
      <div>
        <h2 className="text-2xl font-semibold text-fg mb-6">Uploaded Documents</h2>
        <Card>
          <CardContent className="p-6">
            <DocumentManager
              advisorId={advisorId}
              onDocumentsChange={handleDocumentsChange}
              refreshTrigger={refreshDocuments}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
