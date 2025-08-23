
import { supabase } from '@/integrations/supabase/client';

export interface EmbeddingBatch {
  texts: string[];
  batchSize: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  successful: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

export class OptimizedEmbeddingService {
  private readonly maxBatchSize = 100; // OpenAI's batch limit
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second base delay

  async generateEmbeddingsBatch(
    texts: string[],
    options: { batchSize?: number; maxRetries?: number } = {}
  ): Promise<BatchEmbeddingResult> {
    const batchSize = Math.min(options.batchSize || 50, this.maxBatchSize);
    const maxRetries = options.maxRetries || this.maxRetries;

    const results: number[][] = [];
    const errors: Array<{ index: number; error: string }> = [];
    let successful = 0;
    let failed = 0;

    // Split texts into batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchStartIndex = i;

      try {
        console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
        
        const batchResults = await this.generateBatchWithRetry(batch, maxRetries);
        
        // Add successful embeddings to results
        batchResults.forEach((embedding, index) => {
          if (embedding) {
            results[batchStartIndex + index] = embedding;
            successful++;
          } else {
            errors.push({
              index: batchStartIndex + index,
              error: 'Failed to generate embedding'
            });
            failed++;
          }
        });

      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed completely:`, error);
        
        // Mark entire batch as failed
        batch.forEach((_, index) => {
          errors.push({
            index: batchStartIndex + index,
            error: error instanceof Error ? error.message : 'Unknown batch error'
          });
          failed++;
        });
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await this.delay(200); // 200ms between batches
      }
    }

    return {
      embeddings: results,
      successful,
      failed,
      errors
    };
  }

  private async generateBatchWithRetry(
    texts: string[],
    maxRetries: number
  ): Promise<(number[] | null)[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-embedding-batch', {
          body: { texts }
        });

        if (error) throw new Error(error.message || 'Embedding generation failed');
        if (!data?.embeddings) throw new Error('No embeddings returned');

        return data.embeddings;

      } catch (error) {
        lastError = error as Error;
        console.error(`Batch attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  async generateSingleEmbedding(text: string): Promise<number[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embedding', {
        body: { text }
      });

      if (error || !data?.embedding) {
        console.error('Single embedding generation failed:', error);
        return null;
      }

      return data.embedding;
    } catch (error) {
      console.error('Error generating single embedding:', error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility method to estimate token count (rough approximation)
  estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  // Utility method to split long texts into smaller chunks if needed
  splitLongText(text: string, maxTokens: number = 8191): string[] {
    const estimatedTokens = this.estimateTokenCount(text);
    
    if (estimatedTokens <= maxTokens) {
      return [text];
    }

    const chunks: string[] = [];
    const maxChars = maxTokens * 4; // Rough conversion
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChars) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) chunks.push(currentChunk + '.');
        currentChunk = trimmedSentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk + '.');
    
    return chunks;
  }
}

export const optimizedEmbeddingService = new OptimizedEmbeddingService();
