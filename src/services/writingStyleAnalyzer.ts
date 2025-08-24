
export interface WritingStyleProfile {
  vocabularyLevel: 'casual' | 'professional' | 'academic' | 'technical';
  sentenceComplexity: 'simple' | 'moderate' | 'complex';
  formalityLevel: 'very_casual' | 'casual' | 'neutral' | 'formal' | 'very_formal';
  emotionalExpressiveness: 'reserved' | 'moderate' | 'expressive' | 'very_expressive';
  humorUsage: 'none' | 'subtle' | 'moderate' | 'frequent';
  technicalLanguage: 'minimal' | 'some' | 'frequent' | 'extensive';
  questionAsking: 'rare' | 'occasional' | 'frequent' | 'very_frequent';
  avgResponseLength: 'concise' | 'moderate' | 'detailed' | 'extensive';
  personalSharing: 'minimal' | 'some' | 'open' | 'very_open';
}

export class WritingStyleAnalyzer {
  analyzeWritingSample(writingSample: string): WritingStyleProfile {
    if (!writingSample || writingSample.trim().length === 0) {
      return this.getDefaultProfile();
    }

    const text = writingSample.toLowerCase();
    const sentences = writingSample.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    return {
      vocabularyLevel: this.assessVocabularyLevel(text, words),
      sentenceComplexity: this.assessSentenceComplexity(sentences),
      formalityLevel: this.assessFormalityLevel(text),
      emotionalExpressiveness: this.assessEmotionalExpressiveness(text),
      humorUsage: this.assessHumorUsage(text),
      technicalLanguage: this.assessTechnicalLanguage(text, words),
      questionAsking: this.assessQuestionAsking(writingSample),
      avgResponseLength: this.assessResponseLength(words.length),
      personalSharing: this.assessPersonalSharing(text)
    };
  }

  analyzeInteractionPatterns(scenarios: Array<{ question: string; expectedResponse: string }>): WritingStyleProfile {
    if (!scenarios || scenarios.length === 0) {
      return this.getDefaultProfile();
    }

    const responses = scenarios.map(s => s.expectedResponse).join(' ');
    const questions = scenarios.filter(s => s.expectedResponse.includes('?')).length;
    const totalLength = responses.length;
    const avgLength = totalLength / scenarios.length;

    return {
      vocabularyLevel: this.assessVocabularyLevel(responses.toLowerCase(), responses.split(/\s+/)),
      sentenceComplexity: this.assessSentenceComplexity(responses.split(/[.!?]+/)),
      formalityLevel: this.assessFormalityLevel(responses.toLowerCase()),
      emotionalExpressiveness: this.assessEmotionalExpressiveness(responses.toLowerCase()),
      humorUsage: this.assessHumorUsage(responses.toLowerCase()),
      technicalLanguage: this.assessTechnicalLanguage(responses.toLowerCase(), responses.split(/\s+/)),
      questionAsking: questions > scenarios.length * 0.5 ? 'frequent' : 'occasional',
      avgResponseLength: avgLength > 200 ? 'detailed' : avgLength > 100 ? 'moderate' : 'concise',
      personalSharing: this.assessPersonalSharing(responses.toLowerCase())
    };
  }

  private assessVocabularyLevel(text: string, words: string[]): WritingStyleProfile['vocabularyLevel'] {
    const advancedWords = ['utilize', 'implement', 'sophisticated', 'comprehensive', 'substantial', 'facilitate'];
    const casualWords = ['cool', 'awesome', 'stuff', 'thing', 'kinda', 'gonna', 'wanna'];
    
    const advancedCount = advancedWords.filter(word => text.includes(word)).length;
    const casualCount = casualWords.filter(word => text.includes(word)).length;
    
    if (advancedCount > casualCount + 2) return 'professional';
    if (casualCount > advancedCount + 2) return 'casual';
    return 'professional';
  }

  private assessSentenceComplexity(sentences: string[]): WritingStyleProfile['sentenceComplexity'] {
    const avgWordsPerSentence = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgWordsPerSentence > 20) return 'complex';
    if (avgWordsPerSentence > 12) return 'moderate';
    return 'simple';
  }

  private assessFormalityLevel(text: string): WritingStyleProfile['formalityLevel'] {
    const formalMarkers = ['please', 'would', 'could', 'kindly', 'sincerely', 'respectfully'];
    const casualMarkers = ['hey', 'yeah', 'nope', 'cool', 'awesome', 'totally'];
    
    const formalCount = formalMarkers.filter(marker => text.includes(marker)).length;
    const casualCount = casualMarkers.filter(marker => text.includes(marker)).length;
    
    if (formalCount > casualCount + 1) return 'formal';
    if (casualCount > formalCount + 1) return 'casual';
    return 'neutral';
  }

  private assessEmotionalExpressiveness(text: string): WritingStyleProfile['emotionalExpressiveness'] {
    const emotionalMarkers = ['!', 'love', 'hate', 'excited', 'frustrated', 'amazing', 'terrible', 'incredible'];
    const count = emotionalMarkers.filter(marker => text.includes(marker)).length;
    
    if (count > 4) return 'very_expressive';
    if (count > 2) return 'expressive';
    if (count > 0) return 'moderate';
    return 'reserved';
  }

  private assessHumorUsage(text: string): WritingStyleProfile['humorUsage'] {
    const humorMarkers = ['lol', 'haha', 'funny', 'joke', 'kidding', '😂', '😄', 'amusing'];
    const count = humorMarkers.filter(marker => text.includes(marker)).length;
    
    if (count > 3) return 'frequent';
    if (count > 1) return 'moderate';
    if (count > 0) return 'subtle';
    return 'none';
  }

  private assessTechnicalLanguage(text: string, words: string[]): WritingStyleProfile['technicalLanguage'] {
    const techWords = ['api', 'database', 'algorithm', 'framework', 'infrastructure', 'methodology', 'optimization'];
    const count = techWords.filter(word => text.includes(word)).length;
    
    if (count > 5) return 'extensive';
    if (count > 2) return 'frequent';
    if (count > 0) return 'some';
    return 'minimal';
  }

  private assessQuestionAsking(text: string): WritingStyleProfile['questionAsking'] {
    const questionCount = (text.match(/\?/g) || []).length;
    const sentenceCount = (text.match(/[.!?]/g) || []).length;
    const ratio = questionCount / Math.max(sentenceCount, 1);
    
    if (ratio > 0.3) return 'very_frequent';
    if (ratio > 0.2) return 'frequent';
    if (ratio > 0.1) return 'occasional';
    return 'rare';
  }

  private assessResponseLength(wordCount: number): WritingStyleProfile['avgResponseLength'] {
    if (wordCount > 300) return 'extensive';
    if (wordCount > 150) return 'detailed';
    if (wordCount > 50) return 'moderate';
    return 'concise';
  }

  private assessPersonalSharing(text: string): WritingStyleProfile['personalSharing'] {
    const personalMarkers = ['i feel', 'i think', 'my experience', 'personally', 'in my opinion', 'i believe'];
    const count = personalMarkers.filter(marker => text.includes(marker)).length;
    
    if (count > 4) return 'very_open';
    if (count > 2) return 'open';
    if (count > 0) return 'some';
    return 'minimal';
  }

  private getDefaultProfile(): WritingStyleProfile {
    return {
      vocabularyLevel: 'professional',
      sentenceComplexity: 'moderate',
      formalityLevel: 'neutral',
      emotionalExpressiveness: 'moderate',
      humorUsage: 'subtle',
      technicalLanguage: 'some',
      questionAsking: 'occasional',
      avgResponseLength: 'moderate',
      personalSharing: 'some'
    };
  }

  generateStyleGuidelines(profile: WritingStyleProfile): string[] {
    const guidelines: string[] = [];

    // Vocabulary and complexity
    if (profile.vocabularyLevel === 'casual') {
      guidelines.push('Use everyday, conversational language and avoid overly formal terms');
    } else if (profile.vocabularyLevel === 'professional') {
      guidelines.push('Use professional vocabulary while remaining accessible');
    } else if (profile.vocabularyLevel === 'technical') {
      guidelines.push('Feel free to use technical terminology and industry-specific language');
    }

    // Sentence structure
    if (profile.sentenceComplexity === 'simple') {
      guidelines.push('Keep sentences clear and straightforward');
    } else if (profile.sentenceComplexity === 'complex') {
      guidelines.push('Use detailed explanations with complex sentence structures when appropriate');
    }

    // Formality
    if (profile.formalityLevel === 'casual' || profile.formalityLevel === 'very_casual') {
      guidelines.push('Maintain a friendly, informal tone');
    } else if (profile.formalityLevel === 'formal' || profile.formalityLevel === 'very_formal') {
      guidelines.push('Use a professional, courteous tone');
    }

    // Emotional expression
    if (profile.emotionalExpressiveness === 'expressive' || profile.emotionalExpressiveness === 'very_expressive') {
      guidelines.push('Express emotions and enthusiasm naturally in responses');
    } else if (profile.emotionalExpressiveness === 'reserved') {
      guidelines.push('Maintain a calm, measured tone');
    }

    // Humor
    if (profile.humorUsage === 'frequent' || profile.humorUsage === 'moderate') {
      guidelines.push('Include appropriate humor and light-heartedness in conversations');
    }

    // Questions
    if (profile.questionAsking === 'frequent' || profile.questionAsking === 'very_frequent') {
      guidelines.push('Ask engaging follow-up questions to deepen the conversation');
    }

    // Response length
    if (profile.avgResponseLength === 'concise') {
      guidelines.push('Keep responses brief and to the point');
    } else if (profile.avgResponseLength === 'detailed' || profile.avgResponseLength === 'extensive') {
      guidelines.push('Provide thorough, comprehensive responses with examples and details');
    }

    // Personal sharing
    if (profile.personalSharing === 'open' || profile.personalSharing === 'very_open') {
      guidelines.push('Share relevant personal experiences and perspectives when appropriate');
    }

    return guidelines;
  }
}

export const writingStyleAnalyzer = new WritingStyleAnalyzer();
