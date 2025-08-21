
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

export const documentService = {
  // Upload and process a document for an advisor
  async processDocument(
    advisorId: string, 
    title: string, 
    content: string, 
    fileType: string = 'text',
    fileSize?: number
  ): Promise<{ success: boolean; documentId?: string; chunksProcessed?: number; error?: string }> {
    try {
      console.log('Processing document for advisor:', advisorId);
      
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
        chunksProcessed: data.chunksProcessed
      };
    } catch (error: any) {
      console.error('Error in processDocument:', error);
      return { success: false, error: error.message || 'Failed to process document' };
    }
  },

  // Get all documents for an advisor
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

  // Delete a document and its embeddings
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

  // Get embedding statistics for an advisor
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
