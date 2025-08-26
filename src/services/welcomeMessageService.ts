import { supabase } from '@/integrations/supabase/client';
import { AgentType } from '@/types/agent';

interface ConversationSummary {
  conversation_id: string;
  message_count: number;
  last_message_date: string;
  topics?: string[];
  sentiment?: string;
}

interface WelcomeMessageContext {
  recentConversations: ConversationSummary[];
  totalConversations: number;
  totalMessages: number;
  lastActive?: string;
  topTopics?: string[];
}

class WelcomeMessageService {
  /**
   * Generate a dynamic welcome message for the owner based on conversation history and context
   */
  async generateOwnerWelcomeMessage(agent: AgentType): Promise<string> {
    try {
      // Get conversation context
      const context = await this.getConversationContext(agent.id);
      
      // If we have no context, return a default message
      if (!context || context.totalConversations === 0) {
        return this.getDefaultOwnerWelcomeMessage(agent);
      }
      
      // Generate a welcome message based on the context
      return this.createContextualWelcomeMessage(agent, context);
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return this.getDefaultOwnerWelcomeMessage(agent);
    }
  }

  /**
   * Get conversation context for the agent
   */
  private async getConversationContext(agentId: string): Promise<WelcomeMessageContext | null> {
    try {
      // Get recent conversations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, message_count, updated_at, metadata')
        .eq('advisor_id', agentId)
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return null;
      }
      
      // Get total conversations and messages
      const { data: stats, error: statsError } = await supabase
        .rpc('get_conversation_insights', {
          target_advisor_id: agentId,
          days_back: 30
        });
      
      if (statsError) {
        console.error('Error fetching conversation stats:', statsError);
      }
      
      // Format conversations
      const recentConversations: ConversationSummary[] = conversations.map(conv => ({
        conversation_id: conv.id,
        message_count: conv.message_count || 0,
        last_message_date: conv.updated_at,
        topics: conv.metadata?.topics || [],
        sentiment: conv.metadata?.sentiment
      }));
      
      // Extract top topics
      const topicCounts: Record<string, number> = {};
      recentConversations.forEach(conv => {
        if (conv.topics) {
          conv.topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          });
        }
      });
      
      const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic);
      
      // Get last active time
      const lastActive = recentConversations.length > 0 
        ? recentConversations[0].last_message_date 
        : undefined;
      
      return {
        recentConversations,
        totalConversations: stats?.[0]?.total_conversations || recentConversations.length,
        totalMessages: stats?.[0]?.total_messages || recentConversations.reduce((sum, conv) => sum + conv.message_count, 0),
        lastActive,
        topTopics: topTopics.length > 0 ? topTopics : undefined
      };
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return null;
    }
  }

  /**
   * Create a contextual welcome message based on conversation history
   */
  private createContextualWelcomeMessage(agent: AgentType, context: WelcomeMessageContext): string {
    const agentName = agent.name;
    const ownerName = agent.full_name || 'there';
    
    // Format the last active time
    let lastActiveText = '';
    if (context.lastActive) {
      const lastActiveDate = new Date(context.lastActive);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        lastActiveText = "today";
      } else if (diffDays === 1) {
        lastActiveText = "yesterday";
      } else if (diffDays < 7) {
        lastActiveText = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        lastActiveText = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      } else {
        lastActiveText = `${Math.floor(diffDays / 30)} months ago`;
      }
    }
    
    // Generate welcome message templates based on context
    const templates = [
      // Recent activity template
      context.recentConversations.length > 0 && lastActiveText
        ? `Hi ${ownerName}! Welcome back. Your last conversation was ${lastActiveText}. You've had ${context.totalConversations} conversations in the past month. How can I assist you today?`
        : null,
      
      // Topic-focused template
      context.topTopics && context.topTopics.length > 0
        ? `Hello ${ownerName}! I see we've been discussing ${context.topTopics.join(', ')} recently. Would you like to continue with one of these topics or discuss something new?`
        : null,
      
      // Activity summary template
      context.totalMessages > 0
        ? `Hi ${ownerName}! You've had ${context.totalConversations} conversations with ${context.totalMessages} messages in the past month. What would you like to work on today?`
        : null,
      
      // Default template with context
      `Welcome back, ${ownerName}! I'm your personal Sim assistant. How can I help you today?`
    ];
    
    // Return the first non-null template
    return templates.find(t => t !== null) || this.getDefaultOwnerWelcomeMessage(agent);
  }

  /**
   * Get a default welcome message for the owner
   */
  private getDefaultOwnerWelcomeMessage(agent: AgentType): string {
    const agentName = agent.name;
    const ownerName = agent.full_name || 'there';
    
    return `Hi ${ownerName}! I'm your personal Sim assistant. What would you like to discuss or work on today?`;
  }
}

export const welcomeMessageService = new WelcomeMessageService();
