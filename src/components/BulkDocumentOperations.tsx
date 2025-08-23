
import React, { useState } from 'react';
import { Upload, Download, Trash2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { bulkDocumentService, BulkProcessingProgress } from '@/services/bulkDocumentService';
import { toast } from 'sonner';

interface BulkDocumentOperationsProps {
  advisorId: string;
  documents: Array<{ id: string; title: string; file_type: string }>;
  onRefresh: () => void;
}

export const BulkDocumentOperations: React.FC<BulkDocumentOperationsProps> = ({
  advisorId,
  documents,
  onRefresh
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<BulkProcessingProgress | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) {
      toast.error('No documents selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await bulkDocumentService.bulkDeleteDocuments(selectedDocuments);
      
      if (result.successful > 0) {
        toast.success(`Successfully deleted ${result.successful} documents`);
        setSelectedDocuments([]);
        onRefresh();
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} documents`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setIsProcessing(true);
    
    try {
      const result = await bulkDocumentService.processFilesInBulk(
        advisorId,
        fileArray,
        (progress) => setProcessingProgress(progress)
      );
      
      toast.success(
        `Bulk upload completed: ${result.successful} successful, ${result.failed} failed`
      );
      
      if (result.errors.length > 0) {
        console.log('Upload errors:', result.errors);
      }
      
      onRefresh();
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Bulk upload failed');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const blob = await bulkDocumentService.exportDocuments(advisorId, exportFormat);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Documents exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export documents');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bulk Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bulk Upload */}
        <div className="space-y-2">
          <h4 className="font-medium">Bulk Upload</h4>
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.docx"
              onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
              className="hidden"
              id="bulk-upload"
              disabled={isProcessing}
            />
            <Button
              onClick={() => document.getElementById('bulk-upload')?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Multiple Files
            </Button>
          </div>
          
          {processingProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing: {processingProgress.currentFile}</span>
                <span>{processingProgress.current}/{processingProgress.total}</span>
              </div>
              <Progress 
                value={(processingProgress.current / processingProgress.total) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Document Selection */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Documents</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedDocuments.length === documents.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Select All ({documents.length})
                </label>
              </div>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc.id}
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={(checked) => handleSelectDocument(doc.id, checked as boolean)}
                  />
                  <label htmlFor={doc.id} className="text-sm truncate flex-1">
                    {doc.title} ({doc.file_type.toUpperCase()})
                  </label>
                </div>
              ))}
            </div>
            
            {selectedDocuments.length > 0 && (
              <Alert>
                <AlertDescription>
                  {selectedDocuments.length} document(s) selected
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleBulkDelete}
            disabled={selectedDocuments.length === 0 || isProcessing}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
          
          <div className="space-y-2">
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="txt">Text</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isProcessing}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
          
          <Button
            onClick={onRefresh}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
