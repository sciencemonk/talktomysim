
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Upload, FileText, Loader2 } from 'lucide-react';
import { documentService, AdvisorDocument } from '@/services/documentService';

interface AdvisorDocumentManagerProps {
  advisorId: string;
  advisorName: string;
}

const AdvisorDocumentManager: React.FC<AdvisorDocumentManagerProps> = ({ 
  advisorId, 
  advisorName 
}) => {
  const [documents, setDocuments] = useState<AdvisorDocument[]>([]);
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [advisorId]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentService.getAdvisorDocuments(advisorId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await documentService.getEmbeddingStats(advisorId);
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleProcessDocument = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await documentService.processDocument(
        advisorId,
        title.trim(),
        content.trim(),
        'text'
      );

      if (result.success) {
        toast.success(`Document processed successfully! Generated ${result.chunksProcessed} embeddings.`);
        setTitle('');
        setContent('');
        await loadDocuments();
        await loadStats();
      } else {
        toast.error(result.error || 'Failed to process document');
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${documentTitle}"? This will also remove all related embeddings.`)) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      await loadDocuments();
      await loadStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base for {advisorName}
          </CardTitle>
          <CardDescription>
            Upload source materials to enhance your advisor's responses with relevant context.
            Documents are processed into embeddings for semantic search.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalChunks}</div>
              <div className="text-sm text-muted-foreground">Text Chunks</div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Add New Document</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title (e.g., 'Interview with Expert', 'Chapter 1: Introduction')"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your document content here..."
                className="min-h-[200px]"
              />
            </div>

            <Button 
              onClick={handleProcessDocument} 
              disabled={isProcessing || !title.trim() || !content.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Process Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Add your first document above to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    <div className="text-sm text-muted-foreground">
                      {doc.file_type.toUpperCase()} • 
                      {doc.file_size ? ` ${Math.round(doc.file_size / 1024)} KB • ` : ' '}
                      Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                      {doc.processed_at && ' • Processed'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorDocumentManager;
