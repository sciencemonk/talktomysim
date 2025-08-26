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

      // Validate the extracted text to ensure it's not binary data
      const extractedText = extractionResult.text;
      console.log('DocumentService: About to process document with extracted text length:', extractedText.length);
      
      // Check if the text contains too much binary/non-readable content
      const readableRatio = this.calculateReadableRatio(extractedText);
      if (readableRatio < 0.5) {
        console.error('DocumentService: Extracted text appears to be mostly binary data. Readable ratio:', readableRatio);
        return {
          success: false,
          error: 'Failed to extract readable text from file. The file might be corrupted, encrypted, or in an unsupported format.'
        };
      }
      
      console.log('DocumentService: Text readability check passed. Readable ratio:', readableRatio);
      
      const result = await this.processDocument(
        advisorId,
        file.name,
        extractedText,
        this.getFileTypeFromFile(file),
        file.size
      );
      console.log('DocumentService: Document processing result:', result);
      return result;
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

  // Process extracted text content using the working generate-embedding function
  async processDocument(
    advisorId: string, 
    title: string, 
    content: string, 
    fileType: string = 'text',
    fileSize?: number
  ): Promise<ProcessingResult> {
    try {
      console.log('DocumentService: Processing document for advisor:', advisorId);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('DocumentService: User authentication error:', userError);
        return { success: false, error: 'User not authenticated. Please log in and try again.' };
      }
      
      // Validate that the advisor exists and belongs to the current user
      console.log('DocumentService: Checking advisor ownership for user:', user.id, 'advisor:', advisorId);
      const { data: advisorExists, error: advisorError } = await supabase
        .from('advisors')
        .select('id, name, user_id')
        .eq('id', advisorId)
        .eq('user_id', user.id) // Ensure it belongs to current user
        .maybeSingle();

      if (advisorError) {
        console.error('DocumentService: Error checking advisor:', advisorError);
        return { success: false, error: 'Failed to validate advisor: ' + advisorError.message };
      }

      if (!advisorExists) {
        console.error('DocumentService: Advisor not found or does not belong to user:', advisorId);
        console.log('DocumentService: User ID:', user.id);
        
        // Debug: Check if the advisor exists at all
        const { data: anyAdvisor, error: debugError } = await supabase
          .from('advisors')
          .select('id, name, user_id')
          .eq('id', advisorId)
          .maybeSingle();
        
        if (debugError) {
          console.error('DocumentService: Debug advisor check failed:', debugError);
        } else if (anyAdvisor) {
          console.log('DocumentService: Advisor exists but belongs to different user:', anyAdvisor.user_id);
        } else {
          console.log('DocumentService: Advisor does not exist at all');
        }
        
        return { 
          success: false, 
          error: `Sim not found or you don't have permission to access it. Please make sure your sim is properly set up.` 
        };
      }

      console.log('DocumentService: Advisor validation successful:', advisorExists);

      // Step 1: Create the document record first
      console.log('DocumentService: Creating document record...');
      console.log('DocumentService: Insert data:', {
        advisor_id: advisorId,
        title: title,
        content: content.substring(0, 100) + '...',
        file_type: fileType,
        file_size: fileSize
      });

      // First, let's test if we can query the table at all
      const { data: testQuery, error: testError } = await supabase
        .from('advisor_documents')
        .select('count')
        .limit(1);
      
      console.log('DocumentService: Test query result:', testQuery, 'error:', testError);

      const { data: documentData, error: documentError } = await supabase
        .from('advisor_documents')
        .insert({
          advisor_id: advisorId,
          title: title,
          content: content,
          file_type: fileType,
          file_size: fileSize,
          upload_date: new Date().toISOString(),
          processed_at: null // Will be updated after successful processing
        })
        .select('id')
        .single();

      if (documentError) {
        console.error('DocumentService: Error creating document:', documentError);
        return { success: false, error: `Failed to create document: ${documentError.message}` };
      }

      const documentId = documentData.id;
      console.log('DocumentService: Document created with ID:', documentId);

      // Step 2: Split content into chunks
      const chunks = this.splitIntoChunks(content, 500, 50);
      console.log(`DocumentService: Split content into ${chunks.length} chunks`);

      // Step 3: Generate embeddings and store them using the working generate-embedding function
      let successfulChunks = 0;
      let failedChunks = 0;
      const batchSize = 10; // Process in smaller batches

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        console.log(`DocumentService: Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (chunks ${i}-${i + batch.length - 1})`);
        
        const embeddings = [];
        
        // Generate embeddings for this batch using the working generate-embedding function
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const chunkIndex = i + j;
          
          try {
            console.log(`DocumentService: Generating embedding for chunk ${chunkIndex}`);
            const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
              body: { text: chunk.text }
            });

            if (embeddingError || !embeddingData?.embedding) {
              console.error(`DocumentService: Failed to generate embedding for chunk ${chunkIndex}:`, embeddingError);
              failedChunks++;
              continue;
            }

            // Convert embedding array to vector format for PostgreSQL
            const vectorString = `[${embeddingData.embedding.join(',')}]`;

            embeddings.push({
              advisor_id: advisorId,
              document_id: documentId,
              chunk_text: chunk.text,
              chunk_index: chunkIndex,
              embedding: vectorString
            });

          } catch (chunkError) {
            console.error(`DocumentService: Error processing chunk ${chunkIndex}:`, chunkError);
            failedChunks++;
          }
        }

        // Save embeddings for this batch
        if (embeddings.length > 0) {
          try {
            const { error: embeddingError } = await supabase
              .from('advisor_embeddings')
              .insert(embeddings);

            if (embeddingError) {
              console.error(`DocumentService: Error saving batch ${Math.floor(i / batchSize) + 1}:`, embeddingError);
              failedChunks += embeddings.length;
            } else {
              console.log(`DocumentService: Successfully saved batch ${Math.floor(i / batchSize) + 1} with ${embeddings.length} embeddings`);
              successfulChunks += embeddings.length;
            }
          } catch (batchError) {
            console.error(`DocumentService: Error processing batch ${Math.floor(i / batchSize) + 1}:`, batchError);
            failedChunks += embeddings.length;
          }
        }

        // Add delay between batches to respect rate limits
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      }

      // Step 4: Update document with processed_at timestamp
      if (successfulChunks > 0) {
        const { error: updateError } = await supabase
          .from('advisor_documents')
          .update({ processed_at: new Date().toISOString() })
          .eq('id', documentId);

        if (updateError) {
          console.error('DocumentService: Error updating document processed_at:', updateError);
        } else {
          console.log('DocumentService: Document marked as processed');
        }
      }

      console.log(`DocumentService: Successfully processed document with ${successfulChunks}/${chunks.length} embeddings saved`);
      
      return {
        success: true,
        documentId: documentId,
        chunksProcessed: successfulChunks,
        totalChunks: chunks.length,
        failedChunks: failedChunks
      };
    } catch (error: any) {
      console.error('DocumentService: Error in processDocument:', error);
      return { success: false, error: error.message || 'Failed to process document' };
    }
  },

  // Helper function to calculate what percentage of text is readable
  calculateReadableRatio(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const totalChars = text.length;
    const readableChars = (text.match(/[a-zA-Z0-9\s.,!?;:'"()\-\n\r]/g) || []).length;
    
    return readableChars / totalChars;
  },

  // Helper function to split text into chunks
  splitIntoChunks(text: string, maxChunkSize: number = 500, overlapSize: number = 50): Array<{text: string, startChar: number, endChar: number}> {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      let end = Math.min(start + maxChunkSize, text.length);
      
      // Try to break at sentence boundaries if we're not at the end
      if (end < text.length) {
        const sentenceEnd = text.lastIndexOf('.', end);
        const questionEnd = text.lastIndexOf('?', end);
        const exclamationEnd = text.lastIndexOf('!', end);
        
        const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
        if (bestEnd > start + maxChunkSize * 0.5) {
          end = bestEnd + 1;
        }
      }
      
      const chunkText = text.slice(start, end).trim();
      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          startChar: start,
          endChar: end
        });
      }
      
      // Move start forward, accounting for overlap
      start = Math.max(start + 1, end - overlapSize);
    }
    
    return chunks;
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
      console.log('DocumentService: Fetching documents for advisor ID:', advisorId);
      
      // Get the current user for debugging
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('DocumentService: User authentication error:', userError);
        return [];
      }
      console.log('DocumentService: Current user ID:', user.id);
      
      const { data, error } = await supabase
        .from('advisor_documents')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DocumentService: Error fetching advisor documents:', error);
        console.error('DocumentService: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      console.log('DocumentService: Successfully fetched documents:', data?.length || 0, 'documents');
      return data || [];
    } catch (error) {
      console.error('DocumentService: Error in getAdvisorDocuments:', error);
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
