
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Upload, FileText, Loader2, Globe, Type, BookOpen } from 'lucide-react';
import { documentService, AdvisorDocument } from '@/services/documentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CoreKnowledgeProps {
  advisorId?: string;
  advisorName?: string;
}

const CoreKnowledge: React.FC<CoreKnowledgeProps> = ({ 
  advisorId = 'default-advisor', 
  advisorName = 'Your Sim' 
}) => {
  const [documents, setDocuments] = useState<AdvisorDocument[]>([]);
  const [stats, setStats] = useState({ totalChunks: 0, totalDocuments: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Dialog states
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [webUrlDialogOpen, setWebUrlDialogOpen] = useState(false);
  const [webUrl, setWebUrl] = useState('');
  const [webUrls, setWebUrls] = useState<string[]>([]);

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

  const handleAddWebUrl = () => {
    if (webUrl.trim()) {
      setWebUrls([...webUrls, webUrl]);
      setWebUrl("");
    }
  };

  const handleAddText = () => {
    if (content.trim() && title.trim()) {
      handleProcessDocument();
      setTextDialogOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Core Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Upload and manage the knowledge base for your Sim. Add documents, books, personal insights, 
            and specialized information that defines what your Sim knows and how it responds.
          </p>

          {/* Stats */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalChunks}</div>
              <div className="text-sm text-muted-foreground">Knowledge Chunks</div>
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => setTextDialogOpen(true)}
            >
              <Type className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Add Text</div>
                <div className="text-xs text-muted-foreground">Personal insights, thoughts</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => setWebUrlDialogOpen(true)}
            >
              <Globe className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Add Web Page</div>
                <div className="text-xs text-muted-foreground">Articles, blogs, references</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Upload Files</div>
                <div className="text-xs text-muted-foreground">PDFs, documents, books</div>
              </div>
            </Button>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  console.log('Files selected:', files);
                  toast.info('File upload coming soon!');
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading knowledge sources...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No knowledge sources yet</h3>
              <p className="text-sm">Add your first piece of knowledge to get started building your Sim's intelligence.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {doc.file_type.toUpperCase()} • 
                        {doc.file_size ? ` ${Math.round(doc.file_size / 1024)} KB • ` : ' '}
                        Added {new Date(doc.upload_date).toLocaleDateString()}
                        {doc.processed_at && ' • Processed'}
                      </div>
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

      {/* Add Text Dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Text Knowledge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text-title">Title</Label>
              <Input
                id="text-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'My thoughts on creativity', 'Personal philosophy', 'Favorite quotes'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Content</Label>
              <Textarea 
                id="text-content"
                placeholder="Share your thoughts, insights, experiences, or any knowledge you want your Sim to have..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setTextDialogOpen(false);
                setTitle('');
                setContent('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddText}
              disabled={isProcessing || !title.trim() || !content.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add Knowledge'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Web URL Dialog */}
      <Dialog open={webUrlDialogOpen} onOpenChange={setWebUrlDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Web Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Enter URL (e.g., https://example.com)" 
                value={webUrl} 
                onChange={(e) => setWebUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddWebUrl}>Add</Button>
            </div>
            
            {webUrls.length > 0 && (
              <div className="border rounded-md p-3 space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  URLs to process ({webUrls.length})
                </h4>
                <div className="space-y-2">
                  {webUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate max-w-[250px]">{url}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => setWebUrls(webUrls.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setWebUrlDialogOpen(false);
                setWebUrl('');
                setWebUrls([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Web URLs to process:', webUrls);
                toast.info('Web page processing coming soon!');
                setWebUrlDialogOpen(false);
                setWebUrl('');
                setWebUrls([]);
              }}
              disabled={webUrls.length === 0}
            >
              Process Web Pages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoreKnowledge;
