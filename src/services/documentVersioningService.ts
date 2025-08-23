
import { supabase } from '@/integrations/supabase/client';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  title: string;
  content: string;
  content_hash: string;
  file_size?: number;
  change_summary?: string;
  created_at: string;
  created_by?: string;
}

export interface VersionComparison {
  additions: string[];
  deletions: string[];
  modifications: Array<{
    old: string;
    new: string;
    similarity: number;
  }>;
}

export class DocumentVersioningService {
  
  async createVersion(
    documentId: string,
    title: string,
    content: string,
    changeSummary?: string
  ): Promise<{ success: boolean; version?: DocumentVersion; error?: string }> {
    try {
      // Get current latest version using raw SQL to avoid type issues
      const { data: latestVersion, error: versionError } = await supabase.rpc('get_latest_version', {
        doc_id: documentId
      });

      // Fallback to direct query if RPC doesn't exist
      let latestVersionData = null;
      if (versionError) {
        const { data, error } = await supabase
          .from('document_versions')
          .select('version_number, content_hash')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error) {
          latestVersionData = data;
        }
      } else {
        latestVersionData = latestVersion;
      }

      // Generate content hash
      const contentHash = await this.generateContentHash(content);
      
      // Check if content has actually changed
      if (latestVersionData && latestVersionData.content_hash === contentHash) {
        return { 
          success: false, 
          error: 'No changes detected in document content' 
        };
      }

      const nextVersion = (latestVersionData?.version_number || 0) + 1;

      const { data: version, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersion,
          title,
          content,
          content_hash: contentHash,
          file_size: content.length,
          change_summary: changeSummary
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, version: version as DocumentVersion };
    } catch (error: any) {
      console.error('Error creating document version:', error);
      return { success: false, error: error.message };
    }
  }

  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentVersion[];
    } catch (error) {
      console.error('Error fetching version history:', error);
      return [];
    }
  }

  async getVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('version_number', versionNumber)
        .maybeSingle();

      if (error) throw error;
      return data as DocumentVersion | null;
    } catch (error) {
      console.error('Error fetching document version:', error);
      return null;
    }
  }

  async compareVersions(
    documentId: string, 
    version1: number, 
    version2: number
  ): Promise<VersionComparison | null> {
    try {
      const [v1, v2] = await Promise.all([
        this.getVersion(documentId, version1),
        this.getVersion(documentId, version2)
      ]);

      if (!v1 || !v2) return null;

      return this.generateComparison(v1.content, v2.content);
    } catch (error) {
      console.error('Error comparing versions:', error);
      return null;
    }
  }

  async restoreVersion(documentId: string, versionNumber: number): Promise<boolean> {
    try {
      const version = await this.getVersion(documentId, versionNumber);
      if (!version) return false;

      // Update the main document with the restored content
      const { error } = await supabase
        .from('advisor_documents')
        .update({
          title: version.title,
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      // Create a new version entry for the restoration
      await this.createVersion(
        documentId,
        version.title,
        version.content,
        `Restored from version ${versionNumber}`
      );

      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      return false;
    }
  }

  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateComparison(content1: string, content2: string): VersionComparison {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');

    const additions: string[] = [];
    const deletions: string[] = [];
    const modifications: Array<{ old: string; new: string; similarity: number }> = [];

    // Simple line-by-line comparison (can be enhanced with more sophisticated algorithms)
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 && !line2) {
        deletions.push(line1);
      } else if (!line1 && line2) {
        additions.push(line2);
      } else if (line1 !== line2) {
        const similarity = this.calculateSimilarity(line1, line2);
        modifications.push({ old: line1, new: line2, similarity });
      }
    }

    return { additions, deletions, modifications };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export const documentVersioningService = new DocumentVersioningService();
