
import React, { useState } from 'react';
import { DocumentManager } from './DocumentManager';
import { BulkDocumentOperations } from './BulkDocumentOperations';
import { ExternalDocumentImporter } from './ExternalDocumentImporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Globe, Settings } from 'lucide-react';
import { documentService } from '@/services/documentService';

interface AdvancedDocumentManagerProps {
  advisorId: string;
}

export const AdvancedDocumentManager: React.FC<AdvancedDocumentManagerProps> = ({ advisorId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    loadDocuments();
  };

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getAdvisorDocuments(advisorId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, [advisorId, refreshTrigger]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Bulk Ops
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Import
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <DocumentManager
                advisorId={advisorId}
                onDocumentsChange={handleRefresh}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <BulkDocumentOperations
                advisorId={advisorId}
                documents={documents}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <ExternalDocumentImporter
                advisorId={advisorId}
                onImportComplete={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Document Versioning</h4>
                        <p className="text-sm text-muted-foreground">
                          Track changes and maintain version history for your documents.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Auto-Summarization</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically generate summaries and extract key points from documents.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Advanced Chunking</h4>
                        <p className="text-sm text-muted-foreground">
                          Semantic and adaptive chunking strategies for better context retrieval.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Auto-Tagging</h4>
                        <p className="text-sm text-muted-foreground">
                          Automatically categorize and tag documents based on content analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
