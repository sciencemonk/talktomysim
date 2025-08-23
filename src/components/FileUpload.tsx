
import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing?: boolean;
  processingProgress?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isProcessing = false,
  processingProgress = 0,
  acceptedTypes = ['.pdf', '.txt', '.docx'],
  maxFiles = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return acceptedTypes.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Only PDF, TXT, and DOCX files are supported.');
    }

    if (validFiles.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h4 className="font-medium mb-2">Drop files here or click to upload</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Supports PDF, TXT, and DOCX files up to 10MB each
        </p>
        <Button onClick={handleUploadClick} variant="outline" disabled={isProcessing}>
          Choose Files
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Selected Files ({selectedFiles.length})</h5>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Processing files...</span>
            <span className="text-sm text-muted-foreground">{processingProgress}%</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};
