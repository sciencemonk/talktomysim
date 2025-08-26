import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { documentService, AdvisorDocument } from '@/services/documentService';


interface DocumentManagerProps {
  advisorId: string;
  onDocumentsChange?: () => void;
  refreshTrigger?: number;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  advisorId, 
  onDocumentsChange,
  refreshTrigger = 0
}) => {
  const [documents, setDocuments] = useState<AdvisorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<AdvisorDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [advisorId, refreshTrigger]);

  // Polling effect to update processing status
  useEffect(() => {
    const hasProcessingDocuments = documents.some(doc => !doc.processed_at);
    
    if (hasProcessingDocuments) {
      const interval = setInterval(() => {
        loadDocuments();
      }, 10000); // Poll every 10 seconds (less frequent to avoid UI flickering)
      
      return () => clearInterval(interval);
    }
  }, [documents, advisorId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      console.log('DocumentManager: Loading documents for advisor ID:', advisorId);
      const docs = await documentService.getAdvisorDocuments(advisorId);
      console.log('DocumentManager: Loaded documents:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('DocumentManager: Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      loadDocuments();
      onDocumentsChange?.();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handlePreviewDocument = (document: AdvisorDocument) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const getStatusBadge = (document: AdvisorDocument) => {
    if (document.processed_at) {
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Processed
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-amber-500/20 text-amber-700 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      );
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-16" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">No content saved yet</h4>
          <p className="text-sm text-muted-foreground">
            Add text content above to start building your knowledge base
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((document) => (
          <Card key={document.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{document.title}</h5>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{document.file_type.toUpperCase()}</span>
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(document)}
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handlePreviewDocument(document)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteDocument(document.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh] p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">
              {selectedDocument?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
