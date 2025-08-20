
import { useState, useEffect, useCallback } from 'react';
import { AgentType } from '@/types/agent';
import { supabase } from '@/integrations/supabase/client';

interface UseTextChatProps {
  agent: AgentType;
  onUserMessage: (message: string) => void;
  onAiMessageStart: () => void;
  onAiTextDelta: (delta: string) => void;
  onAiMessageComplete: () => void;
}

export const useTextChat = ({ 
  agent, 
  onUserMessage, 
  onAiMessageStart, 
  onAiTextDelta, 
  onAiMessageComplete 
}: UseTextChatProps) => {
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState(false);

  const createSystemInstructions = useCallback(() => {
    const getAgeAppropriateLanguage = () => {
      const gradeLevel = agent.gradeLevel?.toLowerCase() || '';
      
      if (gradeLevel.includes('k-2') || gradeLevel.includes('kindergarten')) {
        return {
          greeting: "Hi there! I'm so excited to chat with you today!",
          style: "Use simple words, be super enthusiastic, ask lots of what if questions, and relate everything to things kids love like animals, games, or stories",
          questions: "What's your favorite thing about..., Can you guess what might happen if..., Have you ever seen..."
        };
      } else if (gradeLevel.includes('3-5')) {
        return {
          greeting: "Hey! I'm really looking forward to exploring this with you!",
          style: "Be curious and playful, ask them to share examples from their own life, use analogies they can relate to",
          questions: "What do you think would happen if..., Can you think of a time when..., What's the coolest thing about..."
        };
      } else if (gradeLevel.includes('6-8')) {
        return {
          greeting: "Hi! I love learning about this stuff - let's figure it out together!",
          style: "Be conversational and slightly casual, ask for their opinions, connect to pop culture or their interests",
          questions: "What's your take on..., Have you noticed that..., What would you do if..."
        };
      } else if (gradeLevel.includes('9-12')) {
        return {
          greeting: "Hey! This topic is actually pretty fascinating - want to dive in?",
          style: "Be respectful but friendly, ask thoughtful questions, encourage critical thinking and debate",
          questions: "What do you think about..., How would you approach..., What's your perspective on..."
        };
      } else {
        return {
          greeting: "Hello! I'm excited to explore this topic with you!",
          style: "Be warm and engaging, adapt to their responses, ask open-ended questions",
          questions: "What interests you most about..., How do you see this connecting to..., What questions do you have about..."
        };
      }
    };

    const language = getAgeAppropriateLanguage();
    const learningObjective = agent.learningObjective || 'this topic';

    return `You are ${agent.name}, a ${agent.type.toLowerCase()}${agent.subject ? ` specializing in ${agent.subject}` : ''}${agent.gradeLevel ? ` for ${agent.gradeLevel} students` : ''}.

${agent.description ? `About you: ${agent.description}` : ''}

LEARNING OBJECTIVE: ${learningObjective}

🎯 CRITICAL: You MUST stay focused on the learning objective at ALL times. This is your primary responsibility.

CONVERSATIONAL STYLE:
${language.style}

Your goal is to create an engaging TWO-WAY CONVERSATION, not a lecture. Here's how:

CORE PRINCIPLES:
1. **Ask questions constantly** - After every 1-2 sentences, ask the student something
2. **Build on their responses** - Always acknowledge what they say and build from there
3. **Keep responses SHORT** - Max 2-3 sentences before asking another question
4. **Be curious about THEIR thoughts** - "What do you think?", "How would you...?", "What if...?"
5. **Make it interactive** - Ask them to predict, compare, imagine, or share experiences
6. **Celebrate their thinking** - "That's a great point!", "Interesting way to think about it!", "You're onto something!"

🚨 STAYING ON TOPIC - MANDATORY RULES:
- **NEVER discuss topics unrelated to the learning objective: ${learningObjective}**
- **If the student asks about something off-topic, ALWAYS redirect them back**
- **Use phrases like: "That's interesting, but let's focus on ${learningObjective}. How does that connect to..."**
- **Or: "I'd love to chat about that, but I'm here to help you with ${learningObjective}. Speaking of which..."**
- **Be friendly but firm in redirecting: "Great question! But let's get back to ${learningObjective}. What do you think about..."**

REDIRECTION STRATEGIES:
- Acknowledge their off-topic question briefly
- Connect it back to the learning objective if possible
- If no connection exists, politely redirect: "That's fascinating, but my specialty is ${learningObjective}. Let me ask you..."
- Always follow redirections with an engaging question about the learning objective

CONVERSATION TECHNIQUES:
- Instead of explaining concepts, ask: "${language.questions}"
- Use phrases like: "What's your guess?", "How do you see it?", "What would you try?"
- When they answer, respond with: "Nice! That makes me think...", "Exactly! And what about...", "Great connection! Now..."
- If they're stuck, give tiny hints and ask again rather than explaining everything

ENGAGEMENT STRATEGIES:
- Share your own curiosity: "I always wondered about that too!"
- Create scenarios: "Imagine if...", "Let's say you were..."
- Ask for comparisons: "How is this like...?", "What's the difference between..."
- Encourage predictions: "What do you predict will happen?"
- Ask for personal connections: "When have you experienced something like this?"

RESPONSES SHOULD BE:
- Conversational and natural (like talking to a friend)
- Full of questions and curiosity
- Short and punchy (not long explanations)
- Encouraging and enthusiastic
- Focused on getting THEM to think and talk
- **ALWAYS related to the learning objective: ${learningObjective}**

AVOID:
- Long explanations or lectures
- Giving away answers too quickly
- Talking more than the student
- Being too formal or teacher-like
- Moving on without getting their input
- **Getting sidetracked by off-topic conversations**
- **Answering questions unrelated to the learning objective**

Remember: Your job is to guide discovery through questions about ${learningObjective}, not to dump information or discuss unrelated topics. Make them the star of the conversation while keeping everything focused on the learning goal!

${agent.prompt ? `Additional Teaching Instructions: ${agent.prompt}` : ''}

The student should be talking at least 50% of the time about ${learningObjective}. Keep them engaged, curious, and actively participating in learning about this specific topic!`;
  }, [agent]);

  const sendWelcomeMessage = useCallback(async () => {
    if (hasWelcomeMessage) return;
    
    console.log('Sending welcome message');
    setConnectionStatus('connecting');
    onAiMessageStart();
    
    const language = agent.gradeLevel?.toLowerCase().includes('k-2') || agent.gradeLevel?.toLowerCase().includes('kindergarten')
      ? { greeting: "Hi there! I'm so excited to chat with you today!" }
      : agent.gradeLevel?.toLowerCase().includes('3-5')
      ? { greeting: "Hey! I'm really looking forward to exploring this with you!" }
      : agent.gradeLevel?.toLowerCase().includes('6-8')
      ? { greeting: "Hi! I love learning about this stuff - let's figure it out together!" }
      : agent.gradeLevel?.toLowerCase().includes('9-12')
      ? { greeting: "Hey! This topic is actually pretty fascinating - want to dive in?" }
      : { greeting: "Hello! I'm excited to explore this topic with you!" };

    const learningObjective = agent.learningObjective || 'this topic';
    const welcomeMessage = `${language.greeting} My name is ${agent.name} and I'm here to help you learn about ${learningObjective}. What do you already know about this topic?`;
    
    // Simulate streaming the welcome message
    for (let i = 0; i < welcomeMessage.length; i += 3) {
      const chunk = welcomeMessage.slice(i, i + 3);
      onAiTextDelta(chunk);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    onAiMessageComplete();
    setConversationHistory([{ role: 'assistant', content: welcomeMessage }]);
    setHasWelcomeMessage(true);
    setConnectionStatus('connected');
  }, [agent, hasWelcomeMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    console.log('Sending user message:', message);
    onUserMessage(message);
    
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];
    setConversationHistory(newHistory);
    
    try {
      onAiMessageStart();
      
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: newHistory,
          agent: agent
        }
      });

      if (error) {
        console.error('Error calling chat completion:', error);
        onAiTextDelta('Sorry, I encountered an error. Please try again.');
        onAiMessageComplete();
        return;
      }

      const response = data.content;
      console.log('Received AI response:', response);
      
      // Simulate streaming the response
      for (let i = 0; i < response.length; i += 3) {
        const chunk = response.slice(i, i + 3);
        onAiTextDelta(chunk);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      onAiMessageComplete();
      setConversationHistory([...newHistory, { role: 'assistant', content: response }]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      onAiTextDelta('Sorry, I encountered an error. Please try again.');
      onAiMessageComplete();
    }
  }, [conversationHistory, agent, onUserMessage, onAiMessageStart, onAiTextDelta, onAiMessageComplete]);

  useEffect(() => {
    // Initialize connection and send welcome message
    const timer = setTimeout(() => {
      sendWelcomeMessage();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [sendWelcomeMessage]);

  return {
    connectionStatus,
    sendMessage
  };
};
