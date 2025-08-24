
import { SimData } from './simService';
import { personalityModelingService, PersonalityModel } from './personalityModelingService';

export interface GeneratedPrompt {
  systemPrompt: string;
  welcomeMessage: string;
  personalityTraits: string[];
  contextualInstructions: string;
  personalityModel: PersonalityModel;
}

export class PromptGenerationService {
  
  generateSystemPrompt(simData: SimData, knowledgeContext?: string): GeneratedPrompt {
    // Generate comprehensive personality model
    const personalityModel = personalityModelingService.generatePersonalityModel(simData);
    
    // Build the layered prompt structure
    const systemPrompt = this.buildLayeredPrompt(personalityModel, knowledgeContext);
    
    return {
      systemPrompt,
      welcomeMessage: simData.welcome_message || this.generateWelcomeMessage(personalityModel),
      personalityTraits: this.extractPersonalityTraits(personalityModel),
      contextualInstructions: this.buildContextualInstructions(personalityModel),
      personalityModel
    };
  }

  private buildLayeredPrompt(model: PersonalityModel, knowledgeContext?: string): string {
    const layers = [
      this.buildIdentityLayer(model),
      this.buildPersonalityLayer(model),
      this.buildKnowledgeLayer(knowledgeContext),
      this.buildInteractionLayer(model),
      this.buildAwarenessLayer(model)
    ].filter(Boolean);

    return layers.join('\n\n');
  }

  private buildIdentityLayer(model: PersonalityModel): string {
    return `IDENTITY LAYER:
${personalityModelingService.generatePersonalityPrompt(model)}`;
  }

  private buildPersonalityLayer(model: PersonalityModel): string {
    const communicationGuidelines = this.buildCommunicationGuidelines(model);
    
    return `PERSONALITY LAYER:
Your authentic communication style reflects:
- Vocabulary Level: ${model.communicationStyle.vocabularyLevel}
- Formality: ${model.communicationStyle.formalityLevel}
- Emotional Expression: ${model.communicationStyle.emotionalExpressiveness}
- Response Length Preference: ${model.communicationStyle.avgResponseLength}

${communicationGuidelines}`;
  }

  private buildKnowledgeLayer(knowledgeContext?: string): string {
    if (!knowledgeContext) {
      return `KNOWLEDGE LAYER:
Draw from your stated expertise and background when relevant to conversations.
Use your knowledge naturally without explicitly mentioning sources.`;
    }

    return `KNOWLEDGE LAYER:
RELEVANT CONTEXT FROM YOUR KNOWLEDGE BASE:
${knowledgeContext}

Integration Guidelines:
- Use this information naturally when relevant to the conversation
- Don't explicitly mention "my knowledge base" or "according to my documents"
- Integrate knowledge seamlessly as if recalling from personal expertise
- Prioritize information that aligns with your stated areas of expertise`;
  }

  private buildInteractionLayer(model: PersonalityModel): string {
    return `INTERACTION LAYER:
Conversation Flow Guidelines:
${model.conversationalPatterns.responsePatterns.map(pattern => `- ${pattern}`).join('\n')}

Topic Engagement:
${model.conversationalPatterns.topicPreferences.slice(0, 3).map(pref => `- ${pref}`).join('\n')}

Interaction Style: ${model.conversationalPatterns.interactionApproach}`;
  }

  private buildAwarenessLayer(model: PersonalityModel): string {
    return `AWARENESS LAYER - CRITICAL INSTRUCTIONS:
${model.selfAwareness.simIdentity}

STRICT OPERATIONAL BOUNDARIES:
${model.selfAwareness.boundaries.map(boundary => `- ${boundary}`).join('\n')}

SCHEDULING AND CONTACT PROTOCOL:
- You CANNOT schedule meetings, set appointments, or access calendars
- When someone wants to meet ${model.coreIdentity.name}:
  1. Collect their contact information (email/phone)
  2. Ask about their availability preferences or meeting purpose
  3. Tell them "${model.coreIdentity.name} will reach out directly to coordinate"
  4. NEVER propose specific times or confirm meetings

RESPONSE AUTHENTICITY:
- Always respond as ${model.coreIdentity.name} would, using their communication style
- Reference appropriate personal background and expertise naturally
- Maintain consistency with their personality across all interactions
- If uncertain about how ${model.coreIdentity.name} would respond, ask clarifying questions`;
  }

  private buildCommunicationGuidelines(model: PersonalityModel): string {
    const guidelines = [];

    // Formality guidelines
    if (model.communicationStyle.formalityLevel === 'casual' || model.communicationStyle.formalityLevel === 'very_casual') {
      guidelines.push('Use a friendly, conversational tone without being overly formal');
    } else if (model.communicationStyle.formalityLevel === 'formal' || model.communicationStyle.formalityLevel === 'very_formal') {
      guidelines.push('Maintain professional courtesy and formal language structures');
    } else {
      guidelines.push('Balance professionalism with approachability');
    }

    // Response length guidelines
    if (model.communicationStyle.avgResponseLength === 'concise') {
      guidelines.push('Keep responses brief and to the point');
    } else if (model.communicationStyle.avgResponseLength === 'detailed' || model.communicationStyle.avgResponseLength === 'extensive') {
      guidelines.push('Provide comprehensive, detailed responses with examples and explanations');
    }

    // Question asking guidelines
    if (model.communicationStyle.questionAsking === 'frequent' || model.communicationStyle.questionAsking === 'very_frequent') {
      guidelines.push('Ask engaging follow-up questions to deepen the conversation');
    }

    // Emotional expression guidelines
    if (model.communicationStyle.emotionalExpressiveness === 'expressive' || model.communicationStyle.emotionalExpressiveness === 'very_expressive') {
      guidelines.push('Express enthusiasm and emotions naturally in your responses');
    } else if (model.communicationStyle.emotionalExpressiveness === 'reserved') {
      guidelines.push('Maintain a calm, measured tone in your responses');
    }

    return guidelines.map(g => `- ${g}`).join('\n');
  }

  private generateWelcomeMessage(model: PersonalityModel): string {
    const name = model.coreIdentity.name;
    const style = model.conversationalPatterns.welcomeStyle;

    switch (style) {
      case 'casual_friendly':
        return `Hey there! I'm ${name}'s Sim. What can I help you with today?`;
      case 'formal_welcoming':
        return `Hello! I'm pleased to meet you. I'm ${name}'s digital representation. How may I assist you?`;
      case 'enthusiastic':
        return `Hi! I'm ${name}'s Sim and I'm excited to chat with you! What would you like to talk about?`;
      default:
        return `Hello! I'm ${name}'s Sim. I'm here to help and answer questions just as ${name} would. What can I do for you?`;
    }
  }

  private extractPersonalityTraits(model: PersonalityModel): string[] {
    const traits = [];
    
    traits.push(`Communication: ${model.communicationStyle.formalityLevel} and ${model.communicationStyle.emotionalExpressiveness}`);
    
    if (model.expertiseProfile.primaryAreas.length > 0) {
      traits.push(`Expertise: ${model.expertiseProfile.primaryAreas.join(', ')}`);
    }
    
    if (model.expertiseProfile.interests.length > 0) {
      traits.push(`Interests: ${model.expertiseProfile.interests.join(', ')}`);
    }
    
    traits.push(`Response style: ${model.communicationStyle.avgResponseLength} responses`);
    
    if (model.communicationStyle.questionAsking === 'frequent') {
      traits.push('Asks engaging follow-up questions');
    }

    return traits;
  }

  private buildContextualInstructions(model: PersonalityModel): string {
    return `Always remember you are ${model.coreIdentity.name}'s Sim. 
Respond authentically using their communication style and expertise.
${model.expertiseProfile.primaryAreas.length > 0 ? `Your expertise areas: ${model.expertiseProfile.primaryAreas.join(', ')}` : ''}
${model.expertiseProfile.interests.length > 0 ? `Your interests: ${model.expertiseProfile.interests.join(', ')}` : ''}`;
  }
}

export const promptGenerationService = new PromptGenerationService();
