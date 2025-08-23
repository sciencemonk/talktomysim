
import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileProcess?: (file: File) => Promise<void>;
  isProcessing?: boolean;
  processingProgress?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileProcess,
  isProcessing = false,
  processingProgress = 0,
  acceptedTypes = ['.pdf', '.txt', '.docx'],
  maxFiles = 10,
  maxFileSize = 25 // 25MB default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
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

  const validateFile = (file: File): string | null => {
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} is not supported. Supported types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxFileSize) {
      return `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFiles = (files: File[]) => {
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Check total file count
    if (validFiles.length + selectedFiles.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed. You're trying to add ${validFiles.length} more files to ${selectedFiles.length} existing files.`);
      return;
    }

    // Set errors if any
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error(`${validationErrors.length} file(s) were rejected`);
    } else {
      setErrors([]);
    }

    // Add valid files
    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
      onFileSelect(newFiles);
      
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file(s) added successfully`);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
    
    // Clear errors if removing files
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const processFile = async (file: File) => {
    if (!onFileProcess) return;
    
    try {
      setProcessingFile(file.name);
      await onFileProcess(file);
      
      // Remove processed file from the list
      const newFiles = selectedFiles.filter(f => f !== file);
      setSelectedFiles(newFiles);
      onFileSelect(newFiles);
      
      toast.success(`${file.name} processed successfully`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Failed to process ${file.name}`);
    } finally {
      setProcessingFile(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
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
          Supports PDF, TXT, and DOCX files up to {maxFileSize}MB each
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

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Selected Files ({selectedFiles.length})</h5>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {processingFile === file.name && (
                  <div className="text-xs text-muted-foreground">Processing...</div>
                )}
                
                {onFileProcess && !isProcessing && processingFile !== file.name && (
                  <Button
                    onClick={() => processFile(file)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                  >
                    Process
                  </Button>
                )}
                
                {!isProcessing && processingFile !== file.name && (
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
