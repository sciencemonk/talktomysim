
export interface ChunkingOptions {
  strategy: 'fixed' | 'sliding' | 'semantic' | 'adaptive';
  maxChunkSize: number;
  overlapSize: number;
  minChunkSize?: number;
  sentenceBoundary?: boolean;
  paragraphBoundary?: boolean;
  preserveStructure?: boolean;
}

export interface DocumentChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  type: 'content' | 'heading' | 'list' | 'quote' | 'code';
  metadata: {
    wordCount: number;
    sentenceCount: number;
    keyPhrases?: string[];
    summary?: string;
  };
}

export class AdvancedChunkingService {
  
  createChunks(text: string, options: ChunkingOptions): DocumentChunk[] {
    switch (options.strategy) {
      case 'sliding':
        return this.createSlidingWindowChunks(text, options);
      case 'semantic':
        return this.createSemanticChunks(text, options);
      case 'adaptive':
        return this.createAdaptiveChunks(text, options);
      default:
        return this.createFixedChunks(text, options);
    }
  }

  private createFixedChunks(text: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { maxChunkSize, overlapSize } = options;
    
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxChunkSize, text.length);
      
      // Adjust to sentence boundary if enabled
      if (options.sentenceBoundary && endIndex < text.length) {
        const lastSentenceEnd = text.lastIndexOf('.', endIndex);
        if (lastSentenceEnd > startIndex + maxChunkSize * 0.5) {
          endIndex = lastSentenceEnd + 1;
        }
      }
      
      const chunkText = text.slice(startIndex, endIndex).trim();
      
      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          index: chunkIndex++,
          startChar: startIndex,
          endChar: endIndex,
          type: this.determineChunkType(chunkText),
          metadata: this.generateMetadata(chunkText)
        });
      }
      
      startIndex = Math.max(startIndex + maxChunkSize - overlapSize, endIndex);
    }
    
    return chunks;
  }

  private createSlidingWindowChunks(text: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const { maxChunkSize, overlapSize } = options;
    const stepSize = maxChunkSize - overlapSize;
    
    let chunkIndex = 0;
    
    for (let i = 0; i < text.length; i += stepSize) {
      let endIndex = Math.min(i + maxChunkSize, text.length);
      
      // Adjust for sentence boundaries
      if (options.sentenceBoundary && endIndex < text.length) {
        const sentenceEnd = text.indexOf('.', endIndex);
        if (sentenceEnd !== -1 && sentenceEnd - i < maxChunkSize * 1.2) {
          endIndex = sentenceEnd + 1;
        }
      }
      
      const chunkText = text.slice(i, endIndex).trim();
      
      if (chunkText.length >= (options.minChunkSize || 50)) {
        chunks.push({
          text: chunkText,
          index: chunkIndex++,
          startChar: i,
          endChar: endIndex,
          type: this.determineChunkType(chunkText),
          metadata: this.generateMetadata(chunkText)
        });
      }
    }
    
    return chunks;
  }

  private createSemanticChunks(text: string, options: ChunkingOptions): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkStartChar = 0;
    let chunkIndex = 0;
    let globalCharIndex = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      // Check if adding this paragraph would exceed the chunk size
      if (currentChunk.length + trimmedParagraph.length > options.maxChunkSize && currentChunk.length > 0) {
        // Create chunk from current content
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          startChar: chunkStartChar,
          endChar: chunkStartChar + currentChunk.length,
          type: this.determineChunkType(currentChunk),
          metadata: this.generateMetadata(currentChunk)
        });
        
        // Start new chunk with overlap if specified
        const overlap = this.getOverlapText(currentChunk, options.overlapSize);
        currentChunk = overlap + (overlap ? '\n\n' : '') + trimmedParagraph;
        chunkStartChar = globalCharIndex - overlap.length;
      } else {
        // Add paragraph to current chunk
        if (currentChunk.length > 0) {
          currentChunk += '\n\n';
        } else {
          chunkStartChar = globalCharIndex;
        }
        currentChunk += trimmedParagraph;
      }
      
      globalCharIndex += paragraph.length + 2; // +2 for paragraph separator
    }
    
    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startChar: chunkStartChar,
        endChar: chunkStartChar + currentChunk.length,
        type: this.determineChunkType(currentChunk),
        metadata: this.generateMetadata(currentChunk)
      });
    }
    
    return chunks;
  }

  private createAdaptiveChunks(text: string, options: ChunkingOptions): DocumentChunk[] {
    // Adaptive chunking adjusts size based on content density and structure
    const chunks: DocumentChunk[] = [];
    
    // Analyze text structure
    const structure = this.analyzeTextStructure(text);
    
    let currentPosition = 0;
    let chunkIndex = 0;
    
    for (const section of structure.sections) {
      const sectionText = text.slice(section.start, section.end);
      const adaptedChunkSize = this.calculateAdaptiveChunkSize(
        sectionText,
        section.type,
        options.maxChunkSize
      );
      
      const sectionChunks = this.createFixedChunks(sectionText, {
        ...options,
        maxChunkSize: adaptedChunkSize
      });
      
      // Adjust positions and indices
      sectionChunks.forEach(chunk => {
        chunks.push({
          ...chunk,
          index: chunkIndex++,
          startChar: chunk.startChar + section.start,
          endChar: chunk.endChar + section.start
        });
      });
    }
    
    return chunks;
  }

  private determineChunkType(text: string): DocumentChunk['type'] {
    const trimmed = text.trim();
    
    if (trimmed.match(/^#{1,6}\s/)) return 'heading';
    if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) return 'list';
    if (trimmed.match(/^>\s/)) return 'quote';
    if (trimmed.match(/^```/) || trimmed.includes('```')) return 'code';
    
    return 'content';
  }

  private generateMetadata(text: string): DocumentChunk['metadata'] {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      keyPhrases: this.extractKeyPhrases(text)
    };
  }

  private extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) return text;
    
    const sentences = text.split(/[.!?]+/);
    let overlap = '';
    
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i].trim();
      if (overlap.length + sentence.length <= overlapSize) {
        overlap = sentence + (overlap ? '. ' : '') + overlap;
      } else {
        break;
      }
    }
    
    return overlap || text.slice(-overlapSize);
  }

  private analyzeTextStructure(text: string): { sections: Array<{ start: number; end: number; type: string }> } {
    const sections = [];
    const lines = text.split('\n');
    
    let currentStart = 0;
    let currentType = 'content';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      let lineType = 'content';
      
      if (line.match(/^#{1,6}\s/)) lineType = 'heading';
      else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) lineType = 'list';
      else if (line.match(/^>\s/)) lineType = 'quote';
      else if (line.match(/^```/)) lineType = 'code';
      
      if (lineType !== currentType) {
        if (i > 0) {
          sections.push({
            start: currentStart,
            end: lines.slice(0, i).join('\n').length,
            type: currentType
          });
        }
        currentStart = lines.slice(0, i).join('\n').length;
        currentType = lineType;
      }
    }
    
    // Add final section
    sections.push({
      start: currentStart,
      end: text.length,
      type: currentType
    });
    
    return { sections };
  }

  private calculateAdaptiveChunkSize(text: string, sectionType: string, baseSize: number): number {
    switch (sectionType) {
      case 'heading':
        return Math.min(baseSize * 0.5, 300); // Smaller chunks for headings
      case 'list':
        return baseSize * 0.8; // Slightly smaller for lists
      case 'code':
        return baseSize * 1.2; // Larger chunks for code
      case 'quote':
        return baseSize * 0.9; // Slightly smaller for quotes
      default:
        return baseSize;
    }
  }
}

export const advancedChunkingService = new AdvancedChunkingService();
