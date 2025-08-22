
import { supabase } from '@/integrations/supabase/client';

export interface RetrievedContext {
  relevantChunks: string[];
  contextText: string;
  sources: string[];
}

export class ContextRetrievalService {
  
  async retrieveRelevantContext(
    advisorId: string, 
    userMessage: string, 
    maxChunks: number = 5
  ): Promise<RetrievedContext> {
    try {
      // Generate embedding for the user message
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text: userMessage }
      });

      if (error || !data?.embedding) {
        console.warn('Could not generate embedding for context retrieval:', error);
        return { relevantChunks: [], contextText: '', sources: [] };
      }

      // Search for relevant chunks using vector similarity
      const { data: relevantChunks, error: searchError } = await supabase
        .rpc('search_advisor_embeddings', {
          query_embedding: data.embedding,
          target_advisor_id: advisorId,
          similarity_threshold: 0.7,
          match_count: maxChunks
        });

      if (searchError || !relevantChunks) {
        console.warn('Error searching embeddings:', searchError);
        return { relevantChunks: [], contextText: '', sources: [] };
      }

      const chunks = relevantChunks.map(chunk => chunk.chunk_text);
      const contextText = chunks.join('\n\n');
      
      // Get source document titles
      const documentIds = [...new Set(relevantChunks.map(chunk => chunk.document_id))];
      const { data: documents } = await supabase
        .from('advisor_documents')
        .select('title')
        .in('id', documentIds);

      const sources = documents?.map(doc => doc.title) || [];

      return {
        relevantChunks: chunks,
        contextText,
        sources
      };
    } catch (error) {
      console.error('Error retrieving context:', error);
      return { relevantChunks: [], contextText: '', sources: [] };
    }
  }

  async getKnowledgeBaseSummary(advisorId: string): Promise<string> {
    try {
      const { data: documents } = await supabase
        .from('advisor_documents')
        .select('title, content')
        .eq('advisor_id', advisorId)
        .limit(10);

      if (!documents || documents.length === 0) {
        return '';
      }

      // Create a summary of available knowledge
      const summaryParts = documents.map(doc => 
        `${doc.title}: ${doc.content.substring(0, 200)}...`
      );

      return `Available knowledge base includes: ${summaryParts.join(' | ')}`;
    } catch (error) {
      console.error('Error getting knowledge base summary:', error);
      return '';
    }
  }
}

export const contextRetrievalService = new ContextRetrievalService();
