import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: string;
  content: string;
}

interface Agent {
  id?: string;
  name: string;
  type: string;
  subject: string;
  description: string;
  prompt: string;
  gradeLevel?: string;
  learningObjective?: string;
}

// Timeout wrapper for async operations
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
  ]);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { messages, agent, userId }: { messages: ChatMessage[], agent: Agent, userId?: string } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let userWalletAddress = null;
    let walletAnalysis = null;
    
    if (userId) {
      try {
        // Get user's wallet address for potential wallet analysis
        const profilePromise = supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', userId)
          .single();
        
        const { data: profile } = await withTimeout(profilePromise, 2000, { data: null, error: null }) as any;
        userWalletAddress = profile?.wallet_address;
      } catch (profileError) {
        console.error('Error fetching profile data:', profileError);
      }
    }
    
    console.log('User wallet:', userWalletAddress);
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!lovableApiKey || !perplexityApiKey) {
      throw new Error('Missing API keys');
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('User message:', userMessage);
    console.log('Agent:', agent.name);
    
    // Check if user is asking about wallet/crypto and they have a wallet
    const needsWalletAnalysis = userWalletAddress && 
      (userMessage.toLowerCase().includes('wallet') || 
       userMessage.toLowerCase().includes('holdings') || 
       userMessage.toLowerCase().includes('portfolio') ||
       userMessage.toLowerCase().includes('tokens') ||
       userMessage.toLowerCase().includes('crypto') ||
       userMessage.toLowerCase().includes('sol') ||
       userMessage.toLowerCase().includes('balance') ||
       userMessage.toLowerCase().includes('coin'));
    
    if (needsWalletAnalysis) {
      console.log('Fetching wallet analysis...');
      try {
        const walletResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-wallet`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: userWalletAddress }),
        });
        
        if (walletResponse.ok) {
          walletAnalysis = await walletResponse.json();
          console.log('Wallet analysis retrieved:', walletAnalysis);
        }
      } catch (error) {
        console.error('Error fetching wallet analysis:', error);
      }
    }

    // Check if user is asking for image generation with more flexible detection
    const imageGenerationKeywords = ['generate', 'create', 'make', 'draw', 'paint', 'design', 'need'];
    const imageRelatedWords = ['image', 'picture', 'photo', 'artwork', 'illustration', 'visual', 'thumbnail', 'graphic', 'art'];
    const userMessageLower = userMessage.toLowerCase();
    
    // Check if message contains generation keyword + image word, OR just describes creating something visual
    const hasGenerationKeyword = imageGenerationKeywords.some(keyword => userMessageLower.includes(keyword));
    const hasImageWord = imageRelatedWords.some(word => userMessageLower.includes(word));
    
    // Also detect if they're describing something to be created (for + a/an + noun pattern)
    const isDescribingCreation = /\b(for|of|showing|with)\s+(a|an)\s+\w+/.test(userMessageLower) && 
                                 (hasGenerationKeyword || userMessageLower.includes('thumbnail'));
    
    const isImageRequest = (hasGenerationKeyword && hasImageWord) || isDescribingCreation;
    
    if (isImageRequest) {
      console.log('Detected image generation request:', userMessage);
      try {
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-image', {
          body: { prompt: userMessage }
        });
        
        if (imageError) {
          console.error('Image generation error:', imageError);
          throw imageError;
        }
        
        console.log('Image generated successfully');
        
        return new Response(
          JSON.stringify({ 
            content: `I've generated the image for you based on your description!`,
            image: imageData.image,
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0
            },
            researchUsed: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Image generation error:', error);
        // Continue to regular chat if image generation fails
      }
    }

    // Determine if web research is needed
    const needsResearch = await shouldDoWebResearch(userMessage, agent, lovableApiKey);
    console.log('Needs research:', needsResearch);

    let researchContext = '';
    if (needsResearch) {
      console.log('Performing web research...');
      researchContext = await performWebResearch(userMessage, agent, perplexityApiKey);
      console.log('Research context length:', researchContext.length);
    }

    // Use ONLY the agent's prompt as the system prompt - nothing more
    let systemPrompt = agent.prompt || `You are ${agent.name}. ${agent.description || ''}`;

    // Only add supplementary context if absolutely necessary
    if (walletAnalysis) {
      systemPrompt += `\n\nWallet data available: ${JSON.stringify(walletAnalysis, null, 2)}`;
    }

    if (researchContext) {
      systemPrompt += `\n\nRecent research: ${researchContext}`;
    }

    console.log('System prompt length:', systemPrompt.length);

    // Define tools available to the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "analyze_solana_wallet",
          description: "Analyze a Solana wallet address to get balance, tokens, and transaction history. Use this whenever someone asks about a specific Solana wallet address or provides one.",
          parameters: {
            type: "object",
            properties: {
              wallet_address: {
                type: "string",
                description: "The Solana wallet address to analyze (base58 encoded public key)"
              }
            },
            required: ["wallet_address"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_pumpfun_token",
          description: "Analyze a PumpFun token by its contract address (CA/mint address) to get trading activity, volume, momentum, and risk assessment. Use this when someone mentions a token contract address, asks about a PumpFun token, or wants token analysis. IMPORTANT: Pass the FULL address exactly as provided by the user, including any 'pump' suffix if present.",
          parameters: {
            type: "object",
            properties: {
              token_address: {
                type: "string",
                description: "The COMPLETE Solana token contract address exactly as provided by the user, including any 'pump' suffix. DO NOT strip or modify the address in any way."
              }
            },
            required: ["token_address"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_x_account",
          description: "Generate a comprehensive intelligence report on an X (Twitter) account including engagement metrics, posting frequency, follower insights, and activity patterns. Use this when someone asks about a Twitter/X account, mentions @username, or wants social media intelligence.",
          parameters: {
            type: "object",
            properties: {
              username: {
                type: "string",
                description: "The X (Twitter) username (without the @ symbol)"
              }
            },
            required: ["username"]
          }
        }
      }
    ];

    // Generate response using Lovable AI with tools
    let response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools: tools,
        tool_choice: "auto",
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI API error:', error);
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    let data = await response.json();
    console.log('Lovable AI response:', JSON.stringify(data, null, 2));

    // Check if the AI wants to call a tool
    if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
      console.log('AI requested tool calls:', data.choices[0].message.tool_calls);
      
      // Process each tool call
      const toolMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
        data.choices[0].message // Include the assistant's message with tool calls
      ];
      
      for (const toolCall of data.choices[0].message.tool_calls) {
        if (toolCall.function.name === 'analyze_solana_wallet') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('Analyzing wallet:', args.wallet_address);
          
          try {
            // Call the analyze-wallet function
            const walletResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-wallet`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ walletAddress: args.wallet_address }),
            });
            
            let toolResult;
            if (walletResponse.ok) {
              toolResult = await walletResponse.json();
              console.log('Wallet analysis result:', toolResult);
            } else {
              toolResult = { error: 'Failed to analyze wallet' };
            }
            
            // Add the tool result to messages
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            });
          } catch (error) {
            console.error('Error calling analyze-wallet:', error);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Failed to analyze wallet' })
            });
          }
        } else if (toolCall.function.name === 'analyze_pumpfun_token') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('Analyzing PumpFun token:', args.token_address);
          
          try {
            // Call the analyze-pumpfun-token function
            const tokenResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-pumpfun-token`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ tokenAddress: args.token_address }),
            });
            
            let toolResult;
            if (tokenResponse.ok) {
              toolResult = await tokenResponse.json();
              console.log('PumpFun token analysis result:', toolResult);
            } else {
              toolResult = { error: 'Failed to analyze token' };
            }
            
            // Add the tool result to messages
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            });
          } catch (error) {
            console.error('Error calling analyze-pumpfun-token:', error);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Failed to analyze token' })
            });
          }
        } else if (toolCall.function.name === 'analyze_x_account') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('Analyzing X account:', args.username);
          
          try {
            // Call the x-intelligence function
            const xResponse = await fetch(`${supabaseUrl}/functions/v1/x-intelligence`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: args.username.replace('@', '') }),
            });
            
            let toolResult;
            if (xResponse.ok) {
              toolResult = await xResponse.json();
              console.log('X Intelligence report result:', toolResult);
            } else {
              const errorText = await xResponse.text();
              console.error('X Intelligence error:', errorText);
              toolResult = { error: 'Failed to analyze X account' };
            }
            
            // Add the tool result to messages - format report concisely
            let formattedContent = toolResult;
            if (toolResult.success && toolResult.report) {
              const report = toolResult.report;
              formattedContent = {
                username: report.username,
                displayName: report.displayName,
                bio: report.bio,
                followers: report.metrics.followers,
                following: report.metrics.following,
                totalTweets: report.metrics.totalTweets,
                verified: report.verified,
                insights: report.insights,
                ...(report.engagement && { engagement: report.engagement }),
                ...(report.activity && { activity: report.activity })
              };
            }
            
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(formattedContent)
            });
          } catch (error) {
            console.error('Error calling x-intelligence:', error);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Failed to analyze X account' })
            });
          }
        }
      }
      
      // Continue the conversation with tool results
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: toolMessages,
          max_completion_tokens: 1000,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Lovable AI API error (tool response):', error);
        throw new Error(`Lovable AI API error: ${response.status}`);
      }
      
      data = await response.json();
      console.log('Lovable AI final response:', data);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from Lovable AI');
    }

    // Track credit usage for the sim owner
    if (agent.id) {
      try {
        // Get the sim owner's user_id
        const { data: advisor } = await supabase
          .from('advisors')
          .select('user_id')
          .eq('id', agent.id)
          .single();

        if (advisor?.user_id) {
          // Deduct credit for public chat
          const usageType = 'public_chat';
          
          // Deduct credit using the database function
          const { data: creditResult, error: creditError } = await supabase
            .rpc('deduct_credit', {
              p_user_id: advisor.user_id,
              p_usage_type: usageType
            });

          if (creditError) {
            console.error('Error deducting credit:', creditError);
          } else if (creditResult === false) {
            // User is out of credits
            return new Response(
              JSON.stringify({ 
                error: 'Credit limit reached. Please upgrade your plan or wait until next month.' 
              }),
              {
                status: 429, // Too Many Requests
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }
      } catch (creditErr) {
        console.error('Error in credit tracking:', creditErr);
        // Continue anyway - don't block chat on credit tracking errors
      }
    }

    return new Response(
      JSON.stringify({
        content: data.choices[0].message.content,
        usage: data.usage,
        researchUsed: needsResearch
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in enhanced-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeEmotionalContext(userMessage: string, openaiApiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze the emotional undertone of this user message. Classify it as one of:
- FACTUAL: Simple question seeking information
- EMOTIONAL: Asking about feelings, reactions, or personal responses
- CHALLENGING: Pushing back, questioning, or probing
- PERSONAL: Intimate or sensitive topic
- CASUAL: Light conversation or greeting

Respond with just the category and a brief note, e.g., "EMOTIONAL - asking about personal feelings regarding legacy"`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'CASUAL';
  } catch (error) {
    console.error('Error analyzing emotional context:', error);
    return 'CASUAL';
  }
}

async function shouldGiveSimpleAnswer(userMessage: string, openaiApiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Determine if this user question requires a simple, direct answer or can benefit from a more detailed response.

            Return "SIMPLE" if the question is:
            - Basic "what is" or "tell me about" questions for common terms
            - Simple definitions or explanations
            - Quick factual questions
            - Basic informational queries
            - Questions that can be answered in 1-2 sentences

            Return "DETAILED" if the question:
            - Asks for analysis, opinions, or interpretation
            - Requests advice or problem-solving
            - Shows interest in philosophical or complex topics
            - Asks "how" or "why" for complex subjects

            Respond with only "SIMPLE" or "DETAILED".`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
    return decision === 'SIMPLE';
  } catch (error) {
    console.error('Error determining answer complexity:', error);
    return false; // Default to detailed response on error
  }
}

async function shouldDoWebResearch(userMessage: string, agent: Agent, lovableApiKey: string): Promise<boolean> {
  try {
    // Check for common real-time data requests
    const realtimeKeywords = [
      'price', 'current', 'now', 'today', 'latest', 'recent', 
      'what is', 'how much', 'market', 'stock', 'crypto', 
      'weather', 'news', 'score', 'rate', 'value'
    ];
    
    const messageLower = userMessage.toLowerCase();
    const needsRealtimeData = realtimeKeywords.some(keyword => messageLower.includes(keyword));
    
    // If it's clearly a real-time data request, do research immediately
    if (needsRealtimeData) {
      console.log('Real-time data request detected, performing research');
      return true;
    }
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are determining if web research is needed to answer a user's question accurately.

            The user is talking to ${agent.name}, a specialized AI agent.
            
            Return "YES" for web research if the question:
            - Asks about real-time data (prices, weather, news, scores, etc.)
            - Requests current or latest information
            - Asks about specific concepts, inventions, or ideas associated with ${agent.name}
            - Requests factual information that should be verified
            - Mentions specific terms, projects, or concepts that may need accurate details
            - Could benefit from current or comprehensive information
            - Is asking "what is" about any specific concept or term
            - Seeks information about historical figures, their work, or contributions
            
            Return "NO" only if the question is:
            - Purely philosophical or opinion-based
            - About general concepts that don't need specific facts
            - Simple greetings or casual conversation
            
            When in doubt, choose "YES" - it's better to research and provide accurate information.
            
            Respond with only "YES" or "NO".`
          },
          {
            role: 'user',
            content: `User asking ${agent.name}: ${userMessage}`
          }
        ],
        max_completion_tokens: 10,
      }),
    });

    const data = await response.json();
    const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
    return decision === 'YES';
  } catch (error) {
    console.error('Error determining research need:', error);
    return true; // Default to research on error - better to over-research than under-research
  }
}

async function performWebResearch(userMessage: string, agent: Agent, perplexityApiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are researching information for ${agent.name} about ${agent.subject}. 
            Provide current, accurate, factual information with specific details like prices, numbers, and data.
            Focus on real-time information when relevant (prices, market data, current events).
            Be concise and precise.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      return '';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error performing web research:', error);
    return '';
  }
}