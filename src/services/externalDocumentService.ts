
import { supabase } from '@/integrations/supabase/client';
import { documentService } from './documentService';

export interface WebScrapingConfig {
  url: string;
  selector?: string;
  maxDepth?: number;
  followLinks?: boolean;
  respectRobots?: boolean;
}

export interface APIDocumentConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  dataPath?: string; // JSON path to extract content
}

export interface ExternalDocumentResult {
  success: boolean;
  documentId?: string;
  title?: string;
  content?: string;
  error?: string;
  metadata?: {
    source: string;
    extractedAt: string;
    contentLength: number;
  };
}

export class ExternalDocumentService {
  
  async scrapeWebPage(
    advisorId: string,
    config: WebScrapingConfig
  ): Promise<ExternalDocumentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-web-content', {
        body: {
          url: config.url,
          selector: config.selector,
          maxDepth: config.maxDepth || 1,
          followLinks: config.followLinks || false,
          respectRobots: config.respectRobots !== false
        }
      });

      if (error) throw error;

      if (!data.content || data.content.trim().length === 0) {
        return {
          success: false,
          error: 'No content extracted from the webpage'
        };
      }

      // Process the scraped content as a document
      const title = data.title || this.extractTitleFromUrl(config.url);
      const result = await documentService.processDocument(
        advisorId,
        title,
        data.content,
        'web',
        data.content.length
      );

      if (result.success) {
        return {
          success: true,
          documentId: result.documentId,
          title,
          content: data.content,
          metadata: {
            source: config.url,
            extractedAt: new Date().toISOString(),
            contentLength: data.content.length
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to process scraped content'
        };
      }
    } catch (error: any) {
      console.error('Error scraping web content:', error);
      return {
        success: false,
        error: error.message || 'Web scraping failed'
      };
    }
  }

  async fetchFromAPI(
    advisorId: string,
    config: APIDocumentConfig,
    title?: string
  ): Promise<ExternalDocumentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-api-content', {
        body: {
          endpoint: config.endpoint,
          method: config.method,
          headers: config.headers,
          body: config.body,
          dataPath: config.dataPath
        }
      });

      if (error) throw error;

      if (!data.content) {
        return {
          success: false,
          error: 'No content received from API'
        };
      }

      const documentTitle = title || `API Document - ${new Date().toISOString()}`;
      const content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2);

      const result = await documentService.processDocument(
        advisorId,
        documentTitle,
        content,
        'api',
        content.length
      );

      if (result.success) {
        return {
          success: true,
          documentId: result.documentId,
          title: documentTitle,
          content,
          metadata: {
            source: config.endpoint,
            extractedAt: new Date().toISOString(),
            contentLength: content.length
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to process API content'
        };
      }
    } catch (error: any) {
      console.error('Error fetching from API:', error);
      return {
        success: false,
        error: error.message || 'API fetch failed'
      };
    }
  }

  async importFromGoogleDocs(
    advisorId: string,
    documentId: string,
    accessToken: string
  ): Promise<ExternalDocumentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('import-google-docs', {
        body: {
          documentId,
          accessToken
        }
      });

      if (error) throw error;

      const result = await documentService.processDocument(
        advisorId,
        data.title,
        data.content,
        'google_docs',
        data.content.length
      );

      if (result.success) {
        return {
          success: true,
          documentId: result.documentId,
          title: data.title,
          content: data.content,
          metadata: {
            source: `Google Docs: ${documentId}`,
            extractedAt: new Date().toISOString(),
            contentLength: data.content.length
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to process Google Docs content'
        };
      }
    } catch (error: any) {
      console.error('Error importing from Google Docs:', error);
      return {
        success: false,
        error: error.message || 'Google Docs import failed'
      };
    }
  }

  async syncExternalDocument(
    documentId: string,
    source: 'web' | 'api' | 'google_docs',
    config: WebScrapingConfig | APIDocumentConfig | { documentId: string; accessToken: string }
  ): Promise<{ success: boolean; updated: boolean; error?: string }> {
    try {
      // Get current document
      const { data: currentDoc } = await supabase
        .from('advisor_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!currentDoc) {
        return { success: false, updated: false, error: 'Document not found' };
      }

      let newContent = '';
      let newTitle = currentDoc.title;

      // Fetch updated content based on source
      switch (source) {
        case 'web':
          const webResult = await this.scrapeWebPage(currentDoc.advisor_id, config as WebScrapingConfig);
          if (!webResult.success) {
            return { success: false, updated: false, error: webResult.error };
          }
          newContent = webResult.content || '';
          break;

        case 'api':
          const apiResult = await this.fetchFromAPI(currentDoc.advisor_id, config as APIDocumentConfig);
          if (!apiResult.success) {
            return { success: false, updated: false, error: apiResult.error };
          }
          newContent = apiResult.content || '';
          break;

        case 'google_docs':
          const gdocsConfig = config as { documentId: string; accessToken: string };
          const gdocsResult = await this.importFromGoogleDocs(currentDoc.advisor_id, gdocsConfig.documentId, gdocsConfig.accessToken);
          if (!gdocsResult.success) {
            return { success: false, updated: false, error: gdocsResult.error };
          }
          newContent = gdocsResult.content || '';
          newTitle = gdocsResult.title || currentDoc.title;
          break;
      }

      // Check if content has changed
      if (newContent === currentDoc.content) {
        return { success: true, updated: false };
      }

      // Update document
      const { error } = await supabase
        .from('advisor_documents')
        .update({
          title: newTitle,
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Regenerate embeddings for updated content
      await documentService.processDocument(
        currentDoc.advisor_id,
        newTitle,
        newContent,
        currentDoc.file_type
      );

      return { success: true, updated: true };
    } catch (error: any) {
      console.error('Error syncing external document:', error);
      return { success: false, updated: false, error: error.message };
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const segments = path.split('/').filter(s => s.length > 0);
      
      if (segments.length > 0) {
        return segments[segments.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '') // Remove file extension
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
      }
      
      return urlObj.hostname;
    } catch {
      return 'Web Document';
    }
  }
}

export const externalDocumentService = new ExternalDocumentService();
