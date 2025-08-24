import { supabase } from "@/integrations/supabase/client";

export interface AdvisorDocument {
  id: string;
  advisor_id: string;
  title: string;
  content: string;
  file_type: string;
  file_size?: number;
  upload_date: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingResult {
  success: boolean;
  documentId?: string;
  chunksProcessed?: number;
  totalChunks?: number;
  failedChunks?: number;
  error?: string;
}

export const documentService = {
  // Process a file upload (PDF, TXT, DOCX, etc.)
  async processFile(
    advisorId: string,
    file: File
  ): Promise<ProcessingResult> {
    try {
      console.log('Processing file:', file.name, 'type:', file.type, 'size:', file.size);
      console.log('For advisor ID:', advisorId);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User authentication error:', userError);
        return { success: false, error: 'User not authenticated. Please log in and try again.' };
      }

      console.log('Current user ID:', user.id);
      
      // Validate that the advisor exists and belongs to the current user
      const { data: advisorExists, error: advisorError } = await supabase
        .from('advisors')
        .select('id, name, user_id')
        .eq('id', advisorId)
        .eq('user_id', user.id) // Ensure it belongs to current user
        .maybeSingle();

      console.log('Advisor validation result:', { advisorExists, advisorError });

      if (advisorError) {
        console.error('Error checking advisor:', advisorError);
        return { success: false, error: 'Failed to validate sim: ' + advisorError.message };
      }

      if (!advisorExists) {
        console.error('Advisor not found or does not belong to user:', advisorId);
        
        // Additional debugging - check what advisors exist for this user
        const { data: userAdvisors, error: userAdvisorsError } = await supabase
          .from('advisors')
          .select('id, name, user_id')
          .eq('user_id', user.id);
        
        console.log('Available user advisors:', userAdvisors);
        console.log('User advisors error:', userAdvisorsError);
        
        return { 
          success: false, 
          error: `Sim not found or you don't have permission to access it. Found ${userAdvisors?.length || 0} sims for your account.` 
        };
      }

      console.log(`Processing file for sim: ${advisorExists.name} (${advisorExists.id})`);
      
      // First, extract text from the file
      const extractionResult = await this.extractTextFromFile(file);
      
      if (!extractionResult.success || !extractionResult.text) {
        return { 
          success: false, 
          error: extractionResult.error || 'Failed to extract text from file' 
        };
      }

      // Then process the extracted text
      return await this.processDocument(
        advisorId,
        file.name,
        extractionResult.text,
        this.getFileTypeFromFile(file),
        file.size
      );
    } catch (error: any) {
      console.error('Error in processFile:', error);
      return { success: false, error: error.message || 'Failed to process file' };
    }
  },

  // Extract text from various file types
  async extractTextFromFile(file: File): Promise<{
    success: boolean;
    text?: string;
    metadata?: any;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', this.getFileTypeFromFile(file));

      const { data, error } = await supabase.functions.invoke('extract-document-text', {
        body: formData
      });

      if (error) {
        console.error('Error extracting text:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        text: data.text,
        metadata: data.metadata
      };
    } catch (error: any) {
      console.error('Error in extractTextFromFile:', error);
      return { success: false, error: error.message || 'Failed to extract text' };
    }
  },

  // Process extracted text content
  async processDocument(
    advisorId: string, 
    title: string, 
    content: string, 
    fileType: string = 'text',
    fileSize?: number
  ): Promise<ProcessingResult> {
    try {
      console.log('Processing document for advisor:', advisorId);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User authentication error:', userError);
        return { success: false, error: 'User not authenticated. Please log in and try again.' };
      }
      
      // Validate that the advisor exists and belongs to the current user
      const { data: advisorExists, error: advisorError } = await supabase
        .from('advisors')
        .select('id, name, user_id')
        .eq('id', advisorId)
        .eq('user_id', user.id) // Ensure it belongs to current user
        .maybeSingle();

      if (advisorError) {
        console.error('Error checking advisor:', advisorError);
        return { success: false, error: 'Failed to validate advisor: ' + advisorError.message };
      }

      if (!advisorExists) {
        console.error('Advisor not found or does not belong to user:', advisorId);
        return { 
          success: false, 
          error: `Sim not found or you don't have permission to access it. Please make sure your sim is properly set up.` 
        };
      }
      
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          advisorId,
          title,
          content,
          fileType,
          fileSize
        }
      });

      if (error) {
        console.error('Error processing document:', error);
        return { success: false, error: error.message };
      }

      console.log('Document processed successfully:', data);
      return {
        success: true,
        documentId: data.documentId,
        chunksProcessed: data.chunksProcessed,
        totalChunks: data.totalChunks,
        failedChunks: data.failedChunks
      };
    } catch (error: any) {
      console.error('Error in processDocument:', error);
      return { success: false, error: error.message || 'Failed to process document' };
    }
  },

  // Determine file type from File object
  getFileTypeFromFile(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    } else if (mimeType.includes('text') || extension === 'txt') {
      return 'txt';
    } else if (mimeType.includes('wordprocessingml') || extension === 'docx') {
      return 'docx';
    } else {
      return 'text'; // Default fallback
    }
  },

  async getAdvisorDocuments(advisorId: string): Promise<AdvisorDocument[]> {
    try {
      const { data, error } = await supabase
        .from('advisor_documents')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advisor documents:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAdvisorDocuments:', error);
      return [];
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('advisor_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      console.log('Document deleted successfully:', documentId);
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      throw error;
    }
  },

  async getEmbeddingStats(advisorId: string): Promise<{ totalChunks: number; totalDocuments: number }> {
    try {
      const { data: chunksData, error: chunksError } = await supabase
        .from('advisor_embeddings')
        .select('id', { count: 'exact' })
        .eq('advisor_id', advisorId);

      const { data: docsData, error: docsError } = await supabase
        .from('advisor_documents')
        .select('id', { count: 'exact' })
        .eq('advisor_id', advisorId);

      if (chunksError || docsError) {
        console.error('Error fetching stats:', chunksError || docsError);
        return { totalChunks: 0, totalDocuments: 0 };
      }

      return {
        totalChunks: chunksData?.length || 0,
        totalDocuments: docsData?.length || 0
      };
    } catch (error) {
      console.error('Error in getEmbeddingStats:', error);
      return { totalChunks: 0, totalDocuments: 0 };
    }
  }
};
