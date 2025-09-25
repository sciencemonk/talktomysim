import { knowledgeEnhancementService } from '@/services/knowledgeEnhancementService';

// Auto-enhance Fuller's knowledge when the app loads
export const enhanceFullerKnowledge = async () => {
  try {
    console.log('Starting automatic knowledge enhancement for Fuller...');
    
    const result = await knowledgeEnhancementService.enhanceAdvisorKnowledge(
      'c15f79c8-1c03-4c60-b9cf-6d6d62605ae8', 
      'R. Buckminster Fuller'
    );
    
    if (result.success) {
      console.log(`Successfully enhanced Fuller's knowledge: ${result.chunksProcessed} chunks from ${result.researchQueriesCount} research queries`);
    } else {
      console.error('Failed to enhance Fuller knowledge:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error enhancing Fuller knowledge:', error);
    return { success: false, error: String(error) };
  }
};