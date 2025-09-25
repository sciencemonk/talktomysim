import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeEnhancementResult {
  success: boolean;
  advisorName?: string;
  documentId?: string;
  chunksProcessed?: number;
  researchQueriesCount?: number;
  documentSize?: number;
  error?: string;
}

export const knowledgeEnhancementService = {
  // Enhance knowledge for a specific advisor
  async enhanceAdvisorKnowledge(
    advisorId: string, 
    advisorName: string
  ): Promise<KnowledgeEnhancementResult> {
    try {
      console.log('Enhancing knowledge for advisor:', advisorName);
      
      const { data, error } = await supabase.functions.invoke('enhance-advisor-knowledge', {
        body: {
          advisorId,
          advisorName
        }
      });

      if (error) {
        console.error('Error enhancing advisor knowledge:', error);
        return { success: false, error: error.message };
      }

      console.log('Knowledge enhancement completed:', data);
      return {
        success: true,
        advisorName: data.advisorName,
        documentId: data.documentId,
        chunksProcessed: data.chunksProcessed,
        researchQueriesCount: data.researchQueriesCount,
        documentSize: data.documentSize
      };
    } catch (error: any) {
      console.error('Error in enhanceAdvisorKnowledge:', error);
      return { success: false, error: error.message || 'Failed to enhance advisor knowledge' };
    }
  },

  // Enhance knowledge for all active advisors
  async enhanceAllAdvisorsKnowledge(): Promise<KnowledgeEnhancementResult[]> {
    try {
      // Get all active advisors
      const { data: advisors, error } = await supabase
        .from('advisors')
        .select('id, name')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching advisors:', error);
        throw new Error(`Failed to fetch advisors: ${error.message}`);
      }

      const results: KnowledgeEnhancementResult[] = [];

      // Process each advisor sequentially to avoid overwhelming the API
      for (const advisor of advisors || []) {
        console.log(`Processing advisor: ${advisor.name}`);
        
        const result = await this.enhanceAdvisorKnowledge(advisor.id, advisor.name);
        results.push(result);
        
        // Add delay between advisors to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;
    } catch (error: any) {
      console.error('Error in enhanceAllAdvisorsKnowledge:', error);
      return [{ success: false, error: error.message || 'Failed to enhance all advisors knowledge' }];
    }
  },

  // Check if an advisor already has enhanced knowledge
  async hasEnhancedKnowledge(advisorId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('advisor_documents')
        .select('id')
        .eq('advisor_id', advisorId)
        .eq('file_type', 'research')
        .limit(1);

      if (error) {
        console.error('Error checking enhanced knowledge:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in hasEnhancedKnowledge:', error);
      return false;
    }
  }
};