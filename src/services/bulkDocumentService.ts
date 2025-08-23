
import { supabase } from '@/integrations/supabase/client';
import { documentService } from './documentService';

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; filename: string; error: string }>;
  results: Array<{ filename: string; documentId?: string; success: boolean }>;
}

export interface BulkProcessingProgress {
  current: number;
  total: number;
  currentFile: string;
  status: 'processing' | 'complete' | 'error';
}

export class BulkDocumentService {
  
  async processFilesInBulk(
    advisorId: string,
    files: File[],
    onProgress?: (progress: BulkProcessingProgress) => void
  ): Promise<BulkOperationResult> {
    const results: Array<{ filename: string; documentId?: string; success: boolean }> = [];
    const errors: Array<{ index: number; filename: string; error: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      onProgress?.({
        current: i + 1,
        total: files.length,
        currentFile: file.name,
        status: 'processing'
      });

      try {
        const result = await documentService.processFile(advisorId, file);
        
        if (result.success) {
          results.push({
            filename: file.name,
            documentId: result.documentId,
            success: true
          });
          successful++;
        } else {
          results.push({
            filename: file.name,
            success: false
          });
          errors.push({
            index: i,
            filename: file.name,
            error: result.error || 'Unknown error'
          });
          failed++;
        }
      } catch (error: any) {
        results.push({
          filename: file.name,
          success: false
        });
        errors.push({
          index: i,
          filename: file.name,
          error: error.message || 'Processing failed'
        });
        failed++;
      }

      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    onProgress?.({
      current: files.length,
      total: files.length,
      currentFile: '',
      status: 'complete'
    });

    return { successful, failed, errors, results };
  }

  async bulkDeleteDocuments(documentIds: string[]): Promise<BulkOperationResult> {
    const results: Array<{ filename: string; documentId?: string; success: boolean }> = [];
    const errors: Array<{ index: number; filename: string; error: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < documentIds.length; i++) {
      const documentId = documentIds[i];
      
      try {
        // Get document info first
        const { data: doc } = await supabase
          .from('advisor_documents')
          .select('title')
          .eq('id', documentId)
          .single();

        await documentService.deleteDocument(documentId);
        
        results.push({
          filename: doc?.title || `Document ${i + 1}`,
          documentId,
          success: true
        });
        successful++;
      } catch (error: any) {
        results.push({
          filename: `Document ${i + 1}`,
          documentId,
          success: false
        });
        errors.push({
          index: i,
          filename: `Document ${i + 1}`,
          error: error.message || 'Deletion failed'
        });
        failed++;
      }
    }

    return { successful, failed, errors, results };
  }

  async bulkUpdateDocuments(
    updates: Array<{ id: string; title?: string; content?: string }>
  ): Promise<BulkOperationResult> {
    const results: Array<{ filename: string; documentId?: string; success: boolean }> = [];
    const errors: Array<{ index: number; filename: string; error: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      
      try {
        const { error } = await supabase
          .from('advisor_documents')
          .update({
            title: update.title,
            content: update.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (error) throw error;

        results.push({
          filename: update.title || `Document ${i + 1}`,
          documentId: update.id,
          success: true
        });
        successful++;
      } catch (error: any) {
        results.push({
          filename: update.title || `Document ${i + 1}`,
          documentId: update.id,
          success: false
        });
        errors.push({
          index: i,
          filename: update.title || `Document ${i + 1}`,
          error: error.message || 'Update failed'
        });
        failed++;
      }
    }

    return { successful, failed, errors, results };
  }

  async exportDocuments(
    advisorId: string,
    format: 'json' | 'csv' | 'txt' = 'json'
  ): Promise<Blob> {
    const documents = await documentService.getAdvisorDocuments(advisorId);
    
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(documents, null, 2)], {
          type: 'application/json'
        });
      
      case 'csv':
        const csvHeader = 'Title,File Type,File Size,Upload Date,Content\n';
        const csvRows = documents.map(doc => 
          `"${doc.title}","${doc.file_type}","${doc.file_size || 0}","${doc.upload_date}","${doc.content.replace(/"/g, '""')}"`
        ).join('\n');
        return new Blob([csvHeader + csvRows], {
          type: 'text/csv'
        });
      
      case 'txt':
        const txtContent = documents.map(doc => 
          `=== ${doc.title} ===\nType: ${doc.file_type}\nUploaded: ${doc.upload_date}\n\n${doc.content}\n\n`
        ).join('---\n\n');
        return new Blob([txtContent], {
          type: 'text/plain'
        });
      
      default:
        throw new Error('Unsupported export format');
    }
  }
}

export const bulkDocumentService = new BulkDocumentService();
