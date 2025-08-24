
import { SimData } from './simService';
import { WritingStyleProfile, writingStyleAnalyzer } from './writingStyleAnalyzer';

export interface PersonalityModel {
  coreIdentity: {
    name: string;
    title: string;
    role: string;
    location?: string;
    background: string;
  };
  communicationStyle: WritingStyleProfile;
  expertiseProfile: {
    primaryAreas: string[];
    experienceLevel: number;
    confidenceAreas: string[];
    interests: string[];
  };
  conversationalPatterns: {
    welcomeStyle: string;
    responsePatterns: string[];
    topicPreferences: string[];
    interactionApproach: string;
  };
  selfAwareness: {
    simIdentity: string;
    representationRole: string;
    boundaries: string[];
  };
}

export class PersonalityModelingService {
  
  generatePersonalityModel(simData: SimData): PersonalityModel {
    // Analyze writing style from multiple sources
    const writingStyleFromSample = simData.writing_sample 
      ? writingStyleAnalyzer.analyzeWritingSample(simData.writing_sample)
      : writingStyleAnalyzer.analyzeInteractionPatterns(simData.sample_scenarios || []);
    
    const writingStyleFromScenarios = simData.sample_scenarios 
      ? writingStyleAnalyzer.analyzeInteractionPatterns(simData.sample_scenarios)
      : null;
    
    // Combine writing styles (prioritize scenarios over sample if both exist)
    const communicationStyle = writingStyleFromScenarios || writingStyleFromSample;

    return {
      coreIdentity: this.buildCoreIdentity(simData),
      communicationStyle,
      expertiseProfile: this.buildExpertiseProfile(simData),
      conversationalPatterns: this.buildConversationalPatterns(simData, communicationStyle),
      selfAwareness: this.buildSelfAwareness(simData)
    };
  }

  private buildCoreIdentity(simData: SimData) {
    return {
      name: simData.full_name || simData.name,
      title: simData.professional_title || 'Professional',
      role: simData.current_profession || 'AI Assistant',
      location: simData.location,
      background: this.synthesizeBackground(simData)
    };
  }

  private buildExpertiseProfile(simData: SimData) {
    const areas = [];
    if (simData.areas_of_expertise) areas.push(simData.areas_of_expertise);
    if (simData.current_profession) areas.push(simData.current_profession);
    if (simData.category) areas.push(simData.category);

    return {
      primaryAreas: areas,
      experienceLevel: simData.years_experience || 0,
      confidenceAreas: simData.skills || [],
      interests: simData.interests || []
    };
  }

  private buildConversationalPatterns(simData: SimData, style: WritingStyleProfile) {
    const scenarios = simData.sample_scenarios || [];
    
    return {
      welcomeStyle: this.analyzeWelcomeStyle(simData.welcome_message),
      responsePatterns: this.extractResponsePatterns(scenarios),
      topicPreferences: this.identifyTopicPreferences(simData),
      interactionApproach: this.determineInteractionApproach(style, scenarios)
    };
  }

  private buildSelfAwareness(simData: SimData) {
    const name = simData.full_name || simData.name;
    
    return {
      simIdentity: `I am ${name}'s Sim - a digital representation trained on their knowledge, communication style, and expertise`,
      representationRole: `I represent ${name} and aim to respond as they would, while being transparent about my nature as an AI`,
      boundaries: [
        'I cannot schedule meetings or access external systems',
        'I can collect contact information for follow-up by the real person',
        'I aim to be helpful while staying true to my represented person\'s style and knowledge',
        'I will direct complex or sensitive matters to the real person when appropriate'
      ]
    };
  }

  private synthesizeBackground(simData: SimData): string {
    const parts = [];
    
    if (simData.additional_background) {
      parts.push(simData.additional_background);
    }
    
    if (simData.education) {
      parts.push(`Educational background: ${simData.education}`);
    }
    
    if (simData.years_experience && simData.current_profession) {
      parts.push(`${simData.years_experience} years of experience in ${simData.current_profession}`);
    }
    
    return parts.join('. ');
  }

  private analyzeWelcomeStyle(welcomeMessage?: string): string {
    if (!welcomeMessage) return 'warm_professional';
    
    const message = welcomeMessage.toLowerCase();
    
    if (message.includes('hey') || message.includes('hi there')) return 'casual_friendly';
    if (message.includes('hello') && message.includes('pleased')) return 'formal_welcoming';
    if (message.includes('!')) return 'enthusiastic';
    
    return 'warm_professional';
  }

  private extractResponsePatterns(scenarios: Array<{question: string; expectedResponse: string}>): string[] {
    if (!scenarios || scenarios.length === 0) {
      return ['Provide helpful, contextual responses', 'Ask clarifying questions when needed'];
    }

    const patterns = [];
    
    // Analyze response styles
    const avgLength = scenarios.reduce((sum, s) => sum + s.expectedResponse.length, 0) / scenarios.length;
    if (avgLength > 200) {
      patterns.push('Provide detailed, comprehensive explanations');
    } else if (avgLength < 100) {
      patterns.push('Give concise, focused responses');
    }
    
    // Check for question-asking tendency
    const asksQuestions = scenarios.filter(s => s.expectedResponse.includes('?')).length;
    if (asksQuestions > scenarios.length * 0.4) {
      patterns.push('Ask follow-up questions to engage deeper');
    }
    
    // Check for personal sharing
    const sharesPersonal = scenarios.filter(s => 
      s.expectedResponse.toLowerCase().includes('i ') || 
      s.expectedResponse.toLowerCase().includes('my ')
    ).length;
    if (sharesPersonal > scenarios.length * 0.3) {
      patterns.push('Share relevant personal experiences and perspectives');
    }

    return patterns.length > 0 ? patterns : ['Provide helpful, contextual responses'];
  }

  private identifyTopicPreferences(simData: SimData): string[] {
    const preferences = [];
    
    if (simData.interests && simData.interests.length > 0) {
      preferences.push(...simData.interests.map(interest => `Shows enthusiasm for ${interest}`));
    }
    
    if (simData.areas_of_expertise) {
      preferences.push(`Demonstrates expertise in ${simData.areas_of_expertise}`);
    }
    
    if (simData.current_profession) {
      preferences.push(`Draws from professional experience in ${simData.current_profession}`);
    }
    
    return preferences;
  }

  private determineInteractionApproach(style: WritingStyleProfile, scenarios: Array<any>): string {
    if (style.formalityLevel === 'formal' || style.formalityLevel === 'very_formal') {
      return 'professional_consultative';
    }
    
    if (style.emotionalExpressiveness === 'expressive' || style.emotionalExpressiveness === 'very_expressive') {
      return 'enthusiastic_engaging';
    }
    
    if (style.questionAsking === 'frequent' || style.questionAsking === 'very_frequent') {
      return 'curious_exploratory';
    }
    
    return 'balanced_helpful';
  }

  generatePersonalityPrompt(model: PersonalityModel): string {
    const styleGuidelines = writingStyleAnalyzer.generateStyleGuidelines(model.communicationStyle);
    
    return `CORE IDENTITY:
You are ${model.coreIdentity.name}, ${model.coreIdentity.title}${model.coreIdentity.location ? ` based in ${model.coreIdentity.location}` : ''}.
${model.coreIdentity.background}

SELF-AWARENESS:
${model.selfAwareness.simIdentity}
${model.selfAwareness.representationRole}

KEY BOUNDARIES:
${model.selfAwareness.boundaries.map(b => `- ${b}`).join('\n')}

COMMUNICATION STYLE:
${styleGuidelines.map(g => `- ${g}`).join('\n')}

RESPONSE PATTERNS:
${model.conversationalPatterns.responsePatterns.map(p => `- ${p}`).join('\n')}

EXPERTISE & INTERESTS:
${model.expertiseProfile.primaryAreas.length > 0 ? `Primary expertise: ${model.expertiseProfile.primaryAreas.join(', ')}` : ''}
${model.expertiseProfile.interests.length > 0 ? `Personal interests: ${model.expertiseProfile.interests.join(', ')}` : ''}
${model.expertiseProfile.experienceLevel > 0 ? `Professional experience: ${model.expertiseProfile.experienceLevel} years` : ''}

TOPIC PREFERENCES:
${model.conversationalPatterns.topicPreferences.map(t => `- ${t}`).join('\n')}

INTERACTION APPROACH: ${this.getInteractionDescription(model.conversationalPatterns.interactionApproach)}`;
  }

  private getInteractionDescription(approach: string): string {
    switch (approach) {
      case 'professional_consultative':
        return 'Maintain a professional, consultative demeanor while being approachable';
      case 'enthusiastic_engaging':
        return 'Bring energy and enthusiasm to conversations while being genuinely helpful';
      case 'curious_exploratory':
        return 'Ask thoughtful questions to understand needs and explore topics deeply';
      default:
        return 'Balance professionalism with warmth, adapting to the conversation context';
    }
  }
}

export const personalityModelingService = new PersonalityModelingService();
