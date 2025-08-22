
import { SimData } from './simService';

export interface GeneratedPrompt {
  systemPrompt: string;
  welcomeMessage: string;
  personalityTraits: string[];
  contextualInstructions: string;
}

export class PromptGenerationService {
  
  generateSystemPrompt(simData: SimData, knowledgeContext?: string): GeneratedPrompt {
    const personalitySection = this.buildPersonalitySection(simData);
    const communicationSection = this.buildCommunicationSection(simData);
    const expertiseSection = this.buildExpertiseSection(simData);
    const knowledgeSection = knowledgeContext ? this.buildKnowledgeSection(knowledgeContext) : '';
    
    const systemPrompt = `You are ${simData.full_name || simData.name}, ${simData.professional_title || 'an AI assistant'}.

${personalitySection}

${communicationSection}

${expertiseSection}

${knowledgeSection}

CONVERSATION STYLE:
- Be authentic to your personality and background
- Use your expertise to provide valuable insights
- Maintain a conversational, engaging tone
- Ask thoughtful follow-up questions when appropriate
- Share relevant personal experiences or knowledge when helpful
- Stay true to your established communication patterns

Remember: You are not just an AI assistant - you are ${simData.full_name || simData.name} with your own unique background, expertise, and personality.`;

    const personalityTraits = this.extractPersonalityTraits(simData);
    
    return {
      systemPrompt,
      welcomeMessage: simData.welcome_message || `Hello! I'm ${simData.full_name || simData.name}. How can I help you today?`,
      personalityTraits,
      contextualInstructions: this.buildContextualInstructions(simData)
    };
  }

  private buildPersonalitySection(simData: SimData): string {
    const sections = [];
    
    if (simData.additional_background) {
      sections.push(`BACKGROUND:\n${simData.additional_background}`);
    }
    
    if (simData.location) {
      sections.push(`You are based in ${simData.location}.`);
    }
    
    if (simData.education) {
      sections.push(`EDUCATION: ${simData.education}`);
    }
    
    if (simData.years_experience) {
      sections.push(`You have ${simData.years_experience} years of professional experience.`);
    }
    
    if (simData.interests && simData.interests.length > 0) {
      sections.push(`INTERESTS: ${simData.interests.join(', ')}`);
    }
    
    if (simData.skills && simData.skills.length > 0) {
      sections.push(`KEY SKILLS: ${simData.skills.join(', ')}`);
    }
    
    return sections.join('\n\n');
  }

  private buildCommunicationSection(simData: SimData): string {
    if (!simData.sample_scenarios || simData.sample_scenarios.length === 0) {
      return 'COMMUNICATION STYLE:\n- Be helpful, professional, and engaging\n- Adapt your tone to match the context of the conversation';
    }
    
    const scenarios = simData.sample_scenarios;
    const communicationPatterns = this.analyzeCommuncationPatterns(scenarios);
    
    return `COMMUNICATION STYLE:
Based on your typical interactions, you should:
${communicationPatterns.map(pattern => `- ${pattern}`).join('\n')}

EXAMPLE RESPONSES STYLE:
${scenarios.slice(0, 2).map(scenario => 
  `When asked: "${scenario.question}"\nYour response style: "${scenario.expectedResponse}"`
).join('\n\n')}`;
  }

  private buildExpertiseSection(simData: SimData): string {
    const sections = [];
    
    if (simData.current_profession) {
      sections.push(`CURRENT ROLE: ${simData.current_profession}`);
    }
    
    if (simData.areas_of_expertise) {
      sections.push(`AREAS OF EXPERTISE: ${simData.areas_of_expertise}`);
    }
    
    if (simData.category) {
      sections.push(`PRIMARY FOCUS: ${simData.category}`);
    }
    
    return sections.length > 0 ? sections.join('\n') : '';
  }

  private buildKnowledgeSection(knowledgeContext: string): string {
    return `RELEVANT KNOWLEDGE:
${knowledgeContext}

Use this information to inform your responses when relevant, but don't explicitly mention that you're referencing a knowledge base.`;
  }

  private analyzeCommuncationPatterns(scenarios: any[]): string[] {
    const patterns = [];
    
    // Analyze response length
    const avgLength = scenarios.reduce((sum, s) => sum + s.expectedResponse.length, 0) / scenarios.length;
    if (avgLength > 200) {
      patterns.push('Provide detailed, thorough explanations');
    } else if (avgLength < 100) {
      patterns.push('Keep responses concise and to the point');
    } else {
      patterns.push('Balance detail with clarity in your responses');
    }
    
    // Analyze question asking
    const questionCount = scenarios.filter(s => s.expectedResponse.includes('?')).length;
    if (questionCount > scenarios.length * 0.5) {
      patterns.push('Ask engaging follow-up questions to deepen the conversation');
    }
    
    // Analyze formality
    const formalIndicators = scenarios.filter(s => 
      s.expectedResponse.includes('would') || 
      s.expectedResponse.includes('please') ||
      s.expectedResponse.includes('kindly')
    ).length;
    
    if (formalIndicators > scenarios.length * 0.5) {
      patterns.push('Maintain a professional and courteous tone');
    } else {
      patterns.push('Use a friendly, conversational tone');
    }
    
    return patterns;
  }

  private extractPersonalityTraits(simData: SimData): string[] {
    const traits = [];
    
    if (simData.interests && simData.interests.length > 0) {
      traits.push(`Interested in: ${simData.interests.join(', ')}`);
    }
    
    if (simData.years_experience && simData.years_experience > 10) {
      traits.push('Experienced professional');
    } else if (simData.years_experience && simData.years_experience > 5) {
      traits.push('Seasoned professional');
    }
    
    if (simData.education) {
      traits.push('Well-educated');
    }
    
    if (simData.sample_scenarios && simData.sample_scenarios.length > 2) {
      traits.push('Communicative and engaging');
    }
    
    return traits;
  }

  private buildContextualInstructions(simData: SimData): string {
    return `Always remember you are ${simData.full_name || simData.name}${simData.professional_title ? `, ${simData.professional_title}` : ''}. 
Draw upon your background and expertise naturally in conversations. 
${simData.areas_of_expertise ? `Your specialty areas include: ${simData.areas_of_expertise}` : ''}`;
  }
}

export const promptGenerationService = new PromptGenerationService();
