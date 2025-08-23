
import { supabase } from '@/integrations/supabase/client';

export interface EscalationRule {
  id: string;
  advisor_id: string;
  score_threshold: number;
  message_count_threshold: number;
  urgency_keywords: string[];
  value_keywords: string[];
  vip_keywords: string[];
  custom_keywords: string[];
  contact_capture_enabled: boolean;
  contact_capture_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationCapture {
  id: string;
  conversation_id: string;
  advisor_id: string;
  email?: string;
  phone?: string;
  name?: string;
  trigger_reason: string;
  conversation_score: number;
  message_count: number;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  notes?: string;
  created_at: string;
}

export interface ConversationAnalysis {
  score: number;
  intent: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  keywords_detected: string[];
  should_escalate: boolean;
  trigger_reason?: string;
}

class EscalationService {
  async getEscalationRules(advisorId: string): Promise<EscalationRule | null> {
    const { data, error } = await supabase
      .from('escalation_rules')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching escalation rules:', error);
      return null;
    }

    return data;
  }

  async createOrUpdateEscalationRules(advisorId: string, rules: Partial<EscalationRule>): Promise<EscalationRule | null> {
    const existingRules = await this.getEscalationRules(advisorId);

    if (existingRules) {
      const { data, error } = await supabase
        .from('escalation_rules')
        .update({
          ...rules,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRules.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating escalation rules:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('escalation_rules')
        .insert({
          advisor_id: advisorId,
          ...rules
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating escalation rules:', error);
        return null;
      }

      return data;
    }
  }

  async getConversationCaptures(advisorId: string): Promise<ConversationCapture[]> {
    const { data, error } = await supabase
      .from('conversation_captures')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversation captures:', error);
      return [];
    }

    // Type assertion to ensure proper typing of status field
    return (data || []).map(capture => ({
      ...capture,
      status: capture.status as 'new' | 'contacted' | 'converted' | 'archived'
    }));
  }

  async createConversationCapture(capture: Omit<ConversationCapture, 'id' | 'created_at'>): Promise<ConversationCapture | null> {
    const { data, error } = await supabase
      .from('conversation_captures')
      .insert(capture)
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation capture:', error);
      return null;
    }

    // Type assertion to ensure proper typing of status field
    return {
      ...data,
      status: data.status as 'new' | 'contacted' | 'converted' | 'archived'
    };
  }

  async updateCaptureStatus(captureId: string, status: ConversationCapture['status'], notes?: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversation_captures')
      .update({ status, notes })
      .eq('id', captureId);

    if (error) {
      console.error('Error updating capture status:', error);
      return false;
    }

    return true;
  }

  analyzeMessage(content: string, rules: EscalationRule): ConversationAnalysis {
    const lowerContent = content.toLowerCase();
    let score = 0;
    let urgency_level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let intent = 'general';
    const keywords_detected: string[] = [];

    // Check urgency keywords
    const urgencyFound = rules.urgency_keywords.some(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        keywords_detected.push(keyword);
        return true;
      }
      return false;
    });

    if (urgencyFound) {
      score += 3;
      urgency_level = 'high';
      intent = 'urgent_request';
    }

    // Check value keywords
    const valueFound = rules.value_keywords.some(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        keywords_detected.push(keyword);
        return true;
      }
      return false;
    });

    if (valueFound) {
      score += 4;
      intent = 'sales_inquiry';
    }

    // Check VIP keywords
    const vipFound = rules.vip_keywords.some(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        keywords_detected.push(keyword);
        return true;
      }
      return false;
    });

    if (vipFound) {
      score += 5;
      urgency_level = 'critical';
      intent = 'vip_inquiry';
    }

    // Check custom keywords
    const customFound = rules.custom_keywords.some(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        keywords_detected.push(keyword);
        return true;
      }
      return false;
    });

    if (customFound) {
      score += 2;
    }

    // Additional scoring based on content analysis
    if (lowerContent.includes('?')) score += 1; // Questions
    if (lowerContent.length > 200) score += 1; // Longer messages
    if (lowerContent.includes('help')) score += 1; // Help requests

    const should_escalate = score >= rules.score_threshold;
    const trigger_reason = should_escalate 
      ? `Score: ${score} (threshold: ${rules.score_threshold}), Keywords: ${keywords_detected.join(', ')}`
      : undefined;

    return {
      score,
      intent,
      urgency_level,
      keywords_detected,
      should_escalate,
      trigger_reason
    };
  }
}

export const escalationService = new EscalationService();
