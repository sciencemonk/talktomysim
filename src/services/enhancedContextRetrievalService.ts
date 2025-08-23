import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  documentTypes?: string[];
  dateRange?: { start: Date; end: Date };
  minSimilarity?: number;
  maxResults?: number;
}

export interface RetrievedContext {
  relevantChunks: string[];
  contextText: string;
  sources: Array<{
    title: string;
    documentId: string;
    similarity: number;
    documentType: string;
    uploadDate: string;
  }>;
  searchMetrics: {
    totalChunks: number;
    averageSimilarity: number;
    searchTime: number;
  };
}

export interface HybridSearchResult {
  vectorResults: any[];
  keywordResults: any[];
  combinedResults: any[];
  searchStrategy: 'vector' | 'keyword' | 'hybrid';
}

export class EnhancedContextRetrievalService {
  
  async retrieveRelevantContext(
    advisorId: string, 
    userMessage: string, 
    filters: SearchFilters = {}
  ): Promise<RetrievedContext> {
    const startTime = Date.now();
    
    try {
      // Set default filters
      const searchFilters = {
        minSimilarity: filters.minSimilarity || 0.7,
        maxResults: filters.maxResults || 5,
        ...filters
      };

      // Perform hybrid search
      const hybridResults = await this.performHybridSearch(
        advisorId, 
        userMessage, 
        searchFilters
      );

      // Process and rank results
      const rankedResults = this.rankAndCombineResults(hybridResults);
      
      // Apply filters and limits
      const filteredResults = this.applyFilters(rankedResults, searchFilters);

      // Get source documents with metadata
      const sources = await this.getSourcesWithMetadata(filteredResults);

      const chunks = filteredResults.map(chunk => chunk.chunk_text);
      const contextText = chunks.join('\n\n');

      const searchTime = Date.now() - startTime;
      const averageSimilarity = filteredResults.reduce((sum, chunk) => sum + chunk.similarity, 0) / filteredResults.length;

      return {
        relevantChunks: chunks,
        contextText,
        sources,
        searchMetrics: {
          totalChunks: filteredResults.length,
          averageSimilarity: averageSimilarity || 0,
          searchTime
        }
      };
    } catch (error) {
      console.error('Error in enhanced context retrieval:', error);
      return { 
        relevantChunks: [], 
        contextText: '', 
        sources: [],
        searchMetrics: { totalChunks: 0, averageSimilarity: 0, searchTime: 0 }
      };
    }
  }

  private async performHybridSearch(
    advisorId: string,
    userMessage: string,
    filters: SearchFilters
  ): Promise<HybridSearchResult> {
    // Generate embedding for vector search
    const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
      body: { text: userMessage }
    });

    if (embeddingError || !embeddingData?.embedding) {
      console.warn('Could not generate embedding, falling back to keyword search');
      return this.performKeywordSearch(advisorId, userMessage, filters);
    }

    // Perform vector similarity search
    const vectorResults = await this.performVectorSearch(
      advisorId,
      embeddingData.embedding,
      filters
    );

    // Perform keyword search
    const keywordResults = await this.performKeywordSearch(advisorId, userMessage, filters);

    // Combine and deduplicate results
    const combinedResults = this.combineSearchResults(vectorResults.vectorResults, keywordResults.keywordResults);

    return {
      vectorResults: vectorResults.vectorResults,
      keywordResults: keywordResults.keywordResults,
      combinedResults,
      searchStrategy: vectorResults.vectorResults.length > 0 ? 
        (keywordResults.keywordResults.length > 0 ? 'hybrid' : 'vector') : 
        'keyword'
    };
  }

  private async performVectorSearch(
    advisorId: string,
    queryEmbedding: number[],
    filters: SearchFilters
  ) {
    const { data: vectorResults, error: searchError } = await supabase
      .rpc('search_advisor_embeddings', {
        query_embedding: JSON.stringify(queryEmbedding),
        target_advisor_id: advisorId,
        similarity_threshold: filters.minSimilarity || 0.7,
        match_count: (filters.maxResults || 5) * 2 // Get more for filtering
      });

    if (searchError) {
      console.warn('Vector search error:', searchError);
      return { vectorResults: [] };
    }

    return { vectorResults: vectorResults || [] };
  }

  private async performKeywordSearch(
    advisorId: string,
    userMessage: string,
    filters: SearchFilters
  ): Promise<HybridSearchResult> {
    // Extract keywords from user message
    const keywords = this.extractKeywords(userMessage);
    
    if (keywords.length === 0) {
      return {
        vectorResults: [],
        keywordResults: [],
        combinedResults: [],
        searchStrategy: 'keyword'
      };
    }

    // Build text search query
    const searchQuery = keywords.join(' | ');

    const { data: keywordResults, error: searchError } = await supabase
      .from('advisor_embeddings')
      .select(`
        id,
        document_id,
        chunk_text,
        chunk_index,
        created_at,
        advisor_documents!inner(title, file_type, upload_date)
      `)
      .eq('advisor_id', advisorId)
      .textSearch('chunk_text', searchQuery)
      .limit(filters.maxResults || 5);

    if (searchError) {
      console.warn('Keyword search error:', searchError);
      return {
        vectorResults: [],
        keywordResults: [],
        combinedResults: [],
        searchStrategy: 'keyword'
      };
    }

    // Add artificial similarity score for keyword results
    const enhancedResults = (keywordResults || []).map(result => ({
      ...result,
      similarity: this.calculateKeywordSimilarity(userMessage, result.chunk_text)
    }));

    return {
      vectorResults: [],
      keywordResults: enhancedResults,
      combinedResults: enhancedResults,
      searchStrategy: 'keyword'
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - remove stop words and short words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  private calculateKeywordSimilarity(query: string, text: string): number {
    const queryWords = new Set(this.extractKeywords(query));
    const textWords = new Set(this.extractKeywords(text));
    
    const intersection = new Set([...queryWords].filter(x => textWords.has(x)));
    const union = new Set([...queryWords, ...textWords]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private combineSearchResults(vectorResults: any[], keywordResults: any[]): any[] {
    const resultMap = new Map();
    
    // Add vector results with higher weight
    vectorResults.forEach(result => {
      resultMap.set(result.id, {
        ...result,
        combinedScore: result.similarity * 0.7 + 0.3, // Boost vector results
        searchType: 'vector'
      });
    });
    
    // Add keyword results, combining scores if already exists
    keywordResults.forEach(result => {
      if (resultMap.has(result.id)) {
        const existing = resultMap.get(result.id);
        resultMap.set(result.id, {
          ...existing,
          combinedScore: Math.max(existing.combinedScore, existing.similarity * 0.7 + result.similarity * 0.3),
          searchType: 'hybrid'
        });
      } else {
        resultMap.set(result.id, {
          ...result,
          combinedScore: result.similarity * 0.6, // Lower weight for keyword-only
          searchType: 'keyword'
        });
      }
    });
    
    return Array.from(resultMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }

  private rankAndCombineResults(hybridResults: HybridSearchResult): any[] {
    return hybridResults.combinedResults
      .sort((a, b) => (b.combinedScore || b.similarity || 0) - (a.combinedScore || a.similarity || 0));
  }

  private applyFilters(results: any[], filters: SearchFilters): any[] {
    let filtered = results;

    // Apply document type filter
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      filtered = filtered.filter(result => 
        result.advisor_documents && 
        filters.documentTypes!.includes(result.advisor_documents.file_type)
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(result => {
        if (!result.advisor_documents?.upload_date) return false;
        const uploadDate = new Date(result.advisor_documents.upload_date);
        return uploadDate >= filters.dateRange!.start && uploadDate <= filters.dateRange!.end;
      });
    }

    // Apply similarity threshold
    const minSimilarity = filters.minSimilarity || 0.7;
    filtered = filtered.filter(result => 
      (result.combinedScore || result.similarity || 0) >= minSimilarity
    );

    // Apply result limit
    return filtered.slice(0, filters.maxResults || 5);
  }

  private async getSourcesWithMetadata(results: any[]) {
    const documentIds = [...new Set(results.map(chunk => chunk.document_id))];
    
    if (documentIds.length === 0) return [];

    const { data: documents } = await supabase
      .from('advisor_documents')
      .select('id, title, file_type, upload_date')
      .in('id', documentIds);

    const documentMap = new Map(
      (documents || []).map(doc => [doc.id, doc])
    );

    return results.map(result => {
      const doc = documentMap.get(result.document_id);
      return {
        title: doc?.title || 'Unknown Document',
        documentId: result.document_id,
        similarity: result.combinedScore || result.similarity || 0,
        documentType: doc?.file_type || 'unknown',
        uploadDate: doc?.upload_date || ''
      };
    }).filter((source, index, self) => 
      index === self.findIndex(s => s.documentId === source.documentId)
    );
  }

  async getKnowledgeBaseSummary(advisorId: string): Promise<string> {
    try {
      const { data: documents } = await supabase
        .from('advisor_documents')
        .select('title, content, file_type, upload_date')
        .eq('advisor_id', advisorId)
        .order('upload_date', { ascending: false })
        .limit(10);

      if (!documents || documents.length === 0) {
        return '';
      }

      // Group by file type for better summary
      const documentsByType = documents.reduce((acc, doc) => {
        const type = doc.file_type || 'text';
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc);
        return acc;
      }, {} as Record<string, any[]>);

      const summaryParts = Object.entries(documentsByType).map(([type, docs]) => {
        const titles = docs.map(doc => doc.title).join(', ');
        return `${type.toUpperCase()} files (${docs.length}): ${titles}`;
      });

      return `Knowledge base contains ${documents.length} documents: ${summaryParts.join(' | ')}`;
    } catch (error) {
      console.error('Error getting knowledge base summary:', error);
      return '';
    }
  }
}

export const enhancedContextRetrievalService = new EnhancedContextRetrievalService();
