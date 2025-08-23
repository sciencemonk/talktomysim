
import { supabase } from '@/integrations/supabase/client';

export interface DocumentSummary {
  id: string;
  document_id: string;
  summary_text: string;
  key_points: string[];
  auto_tags: string[];
  summary_type: 'auto' | 'extractive' | 'abstractive';
  confidence_score: number;
  created_at: string;
}

export interface AutoTaggingResult {
  tags: string[];
  categories: string[];
  confidence: number;
  suggested_title?: string;
}

export class DocumentSummarizationService {
  
  async generateSummary(
    documentId: string,
    content: string,
    summaryType: 'auto' | 'extractive' | 'abstractive' = 'auto'
  ): Promise<{ success: boolean; summary?: DocumentSummary; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-document-summary', {
        body: {
          documentId,
          content,
          summaryType
        }
      });

      if (error) throw error;

      const summary: DocumentSummary = {
        id: data.id,
        document_id: documentId,
        summary_text: data.summary,
        key_points: data.keyPoints || [],
        auto_tags: data.tags || [],
        summary_type: summaryType,
        confidence_score: data.confidence || 0.8,
        created_at: new Date().toISOString()
      };

      return { success: true, summary };
    } catch (error: any) {
      console.error('Error generating summary:', error);
      return { success: false, error: error.message };
    }
  }

  async autoTagDocument(content: string, title?: string): Promise<AutoTaggingResult> {
    try {
      const { data, error } = await supabase.functions.invoke('auto-tag-document', {
        body: { content, title }
      });

      if (error) throw error;

      return {
        tags: data.tags || [],
        categories: data.categories || [],
        confidence: data.confidence || 0.7,
        suggested_title: data.suggestedTitle
      };
    } catch (error: any) {
      console.error('Error auto-tagging document:', error);
      return {
        tags: [],
        categories: [],
        confidence: 0
      };
    }
  }

  async generateExtractiveSummary(content: string, maxSentences: number = 3): Promise<string> {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length <= maxSentences) {
      return sentences.join('. ').trim() + '.';
    }

    // Score sentences based on word frequency and position
    const wordFreq = this.calculateWordFrequency(content);
    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;
      
      // Boost score for sentences at the beginning and end
      const positionBoost = index < 3 ? 1.2 : (index >= sentences.length - 3 ? 1.1 : 1.0);
      
      return { sentence: sentence.trim(), score: score * positionBoost, index };
    });

    // Select top sentences maintaining original order
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);

    return topSentences.join('. ') + '.';
  }

  async categorizeDocument(content: string): Promise<string[]> {
    const categories = [
      'Technology', 'Business', 'Science', 'Health', 'Education',
      'Finance', 'Legal', 'Marketing', 'Research', 'Documentation',
      'Policy', 'Training', 'Manual', 'Report', 'Analysis'
    ];

    const contentLower = content.toLowerCase();
    const matchedCategories: Array<{ category: string; score: number }> = [];

    for (const category of categories) {
      const keywords = this.getCategoryKeywords(category);
      let score = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      if (score > 0) {
        matchedCategories.push({ category, score });
      }
    }

    return matchedCategories
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.category);
  }

  private calculateWordFrequency(text: string): { [word: string]: number } {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: { [word: string]: number } = {};
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other']);

    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Normalize frequencies
    const maxFreq = Math.max(...Object.values(frequency));
    Object.keys(frequency).forEach(word => {
      frequency[word] = frequency[word] / maxFreq;
    });

    return frequency;
  }

  private getCategoryKeywords(category: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Technology': ['software', 'hardware', 'programming', 'algorithm', 'database', 'system', 'network', 'application', 'development', 'code'],
      'Business': ['strategy', 'management', 'revenue', 'profit', 'market', 'customer', 'sales', 'business', 'company', 'organization'],
      'Science': ['research', 'experiment', 'analysis', 'hypothesis', 'data', 'study', 'theory', 'method', 'result', 'conclusion'],
      'Health': ['medical', 'patient', 'treatment', 'diagnosis', 'health', 'clinical', 'therapy', 'medicine', 'disease', 'care'],
      'Education': ['learning', 'student', 'teacher', 'curriculum', 'education', 'training', 'course', 'lesson', 'knowledge', 'skill'],
      'Finance': ['financial', 'investment', 'money', 'budget', 'cost', 'price', 'economy', 'market', 'banking', 'capital'],
      'Legal': ['legal', 'law', 'regulation', 'compliance', 'contract', 'agreement', 'policy', 'rule', 'court', 'justice'],
      'Marketing': ['marketing', 'advertising', 'brand', 'campaign', 'promotion', 'customer', 'target', 'audience', 'content', 'social'],
      'Research': ['research', 'study', 'analysis', 'investigation', 'survey', 'findings', 'methodology', 'results', 'data', 'evidence'],
      'Documentation': ['document', 'manual', 'guide', 'instruction', 'procedure', 'process', 'specification', 'standard', 'reference', 'documentation']
    };

    return keywordMap[category] || [];
  }
}

export const documentSummarizationService = new DocumentSummarizationService();
