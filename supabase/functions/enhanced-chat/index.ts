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
    
    if (!lovableApiKey) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    const userMessage = messages[messages.length - 1]?.content || '';
    console.log('User message:', userMessage);
    console.log('Agent:', agent.name);
    console.log('Full conversation history:', JSON.stringify(messages, null, 2));
    
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

    // Check if user is explicitly asking for image generation - be very specific
    const imageGenerationKeywords = ['generate', 'create', 'make', 'draw', 'paint', 'design'];
    const imageRelatedWords = ['image', 'picture', 'photo', 'artwork', 'illustration', 'visual', 'thumbnail', 'graphic', 'art'];
    const userMessageLower = userMessage.toLowerCase();
    
    // Only detect as image request if BOTH generation keyword AND image word are present
    const hasGenerationKeyword = imageGenerationKeywords.some(keyword => userMessageLower.includes(keyword));
    const hasImageWord = imageRelatedWords.some(word => userMessageLower.includes(word));
    
    const isImageRequest = hasGenerationKeyword && hasImageWord;
    
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
    const needsResearch = shouldDoWebResearch(userMessage);
    console.log('Needs research:', needsResearch);

    // Check if this is an ongoing conversation
    const isOngoingConversation = messages.length > 1;
    
    // Build enhanced system prompt with best practices framework
    let systemPrompt = isOngoingConversation 
      ? `# CORE IDENTITY (DO NOT REPEAT THIS TO USER)
You are ${agent.name}. ${agent.description || ''}

# CRITICAL INSTRUCTION - READ THIS CAREFULLY
This is an ONGOING conversation. The user ALREADY KNOWS who you are from your welcome message.
- DO NOT say "I am ${agent.name}" or "I'm ${agent.name}" again
- DO NOT repeat any introduction, welcome message, or disclaimer
- DO NOT explain who you are or what you do
- JUMP STRAIGHT to answering their question naturally
- Continue the conversation as if you're already mid-discussion

# RESPONSE QUALITY STANDARDS`
      : `# CORE IDENTITY AND ROLE
${agent.prompt || `You are ${agent.name}. ${agent.description || ''}`}

# RESPONSE QUALITY STANDARDS
- Provide accurate, well-reasoned responses based on your expertise
- Think step-by-step through complex problems
- Ask clarifying questions when needed rather than making assumptions
- Admit when you don't know something rather than guessing
- Cite specific knowledge when making claims
- Structure responses clearly with headings, bullets, or numbered lists when appropriate

# CONVERSATION GUIDELINES
- Maintain consistency with your defined personality and expertise throughout the conversation
- Build upon previous context in the conversation
- Be concise yet thorough - match response length to question complexity
- Use examples and analogies to clarify complex concepts
- Adapt your communication style to the user's level of understanding

# OUTPUT FORMAT
- Use markdown formatting for better readability
- Break long responses into digestible sections
- Use bullet points for lists of items
- Use numbered lists for sequential steps or ranked items
- Use code blocks when sharing code or technical syntax
- Use bold for emphasis on key points

# ETHICAL BOUNDARIES
- Prioritize user safety and well-being
- Decline requests for harmful, illegal, or unethical content
- Respect privacy and confidentiality
- Be honest about your capabilities and limitations as an AI
`;

    // Add instruction for web search when needed
    if (needsResearch) {
      systemPrompt += `\n\n# REAL-TIME INFORMATION
IMPORTANT: The user's question requires current, real-time information. You have access to Google Search - use it to find the latest, most accurate data to answer their question. Always provide specific numbers, prices, or facts from your search results.`;
    }

    // Only add supplementary context if absolutely necessary
    if (walletAnalysis) {
      systemPrompt += `\n\n# USER WALLET DATA
${JSON.stringify(walletAnalysis, null, 2)}`;
    }

    console.log('System prompt length:', systemPrompt.length);

    // Get agent integrations from database if agent has an ID
    let agentIntegrations: string[] = [];
    if (agent.id) {
      try {
        const { data: advisorData } = await supabase
          .from('advisors')
          .select('integrations')
          .eq('id', agent.id)
          .single();
        
        if (advisorData?.integrations) {
          agentIntegrations = Array.isArray(advisorData.integrations) 
            ? advisorData.integrations 
            : [];
        }
      } catch (error) {
        console.error('Error fetching agent integrations:', error);
      }
    }

    console.log('Agent integrations:', agentIntegrations);

    // Define tools available to the AI - only include tools for enabled integrations
    const tools = [];
    
    // Add Solana Explorer tool if enabled
    if (agentIntegrations.includes('solana-explorer')) {
      tools.push({
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
      });
    }
    
    // Add PumpFun tool if enabled
    if (agentIntegrations.includes('pumpfun')) {
      tools.push({
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
      });
    }
    
    // Add X Analyzer tool if enabled
    if (agentIntegrations.includes('x-analyzer')) {
      tools.push({
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
      });
    }
    
    // Add Crypto Prices tool if enabled
    if (agentIntegrations.includes('crypto-prices')) {
      tools.push({
        type: "function",
        function: {
          name: "get_crypto_prices",
          description: "Get real-time cryptocurrency prices and market data for one or more crypto symbols. Use this when someone asks about crypto prices, market cap, volume, or general crypto market data. Common symbols: BTC (Bitcoin), ETH (Ethereum), SOL (Solana), USDT (Tether), BNB (Binance Coin), XRP (Ripple), ADA (Cardano), DOGE (Dogecoin), etc.",
          parameters: {
            type: "object",
            properties: {
              symbols: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of cryptocurrency symbols (e.g., ['BTC', 'ETH', 'SOL']). Use uppercase ticker symbols."
              },
              currency: {
                type: "string",
                description: "Fiat currency for prices (default: USD). Options: USD, EUR, GBP, JPY, etc.",
                default: "USD"
              }
            },
            required: ["symbols"]
          }
        }
      });
    }
    
    // Add Web Browser tool if enabled
    if (agentIntegrations.includes('web-browser')) {
      tools.push({
        type: "function",
        function: {
          name: "search_web",
          description: "Search the web for current information, news, facts, or any real-time data. Use this when someone asks about recent events, current prices/stats not available in crypto tools, general knowledge questions, or anything requiring up-to-date information from the internet.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to look up on the web"
              }
            },
            required: ["query"]
          }
        }
      });
    }

    // Build request body
    const requestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_completion_tokens: 1000,
    };

    // Only add tools if there are any enabled
    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }

    // Enable Google Search grounding when web research is needed
    if (needsResearch) {
      requestBody.extra_body = {
        google_search_grounding: true
      };
    }

    // Generate response using Lovable AI with tools
    let response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
        } else if (toolCall.function.name === 'get_crypto_prices') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('Getting crypto prices for:', args.symbols);
          
          try {
            // Call the get-crypto-price function
            const priceResponse = await fetch(`${supabaseUrl}/functions/v1/get-crypto-price`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                symbols: args.symbols,
                currency: args.currency || 'USD'
              }),
            });
            
            let toolResult;
            if (priceResponse.ok) {
              toolResult = await priceResponse.json();
              console.log('Crypto prices retrieved:', toolResult);
            } else {
              const errorText = await priceResponse.text();
              console.error('Crypto prices error:', errorText);
              toolResult = { error: 'Failed to fetch crypto prices' };
            }
            
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            });
          } catch (error) {
            console.error('Error calling get-crypto-price:', error);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Failed to fetch crypto prices' })
            });
          }
        } else if (toolCall.function.name === 'search_web') {
          const args = JSON.parse(toolCall.function.arguments);
          console.log('Searching web for:', args.query);
          
          try {
            // Call the web-search function
            const searchResponse = await fetch(`${supabaseUrl}/functions/v1/web-search`, {
              method: 'POST',
              headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: args.query }),
            });
            
            let toolResult;
            if (searchResponse.ok) {
              toolResult = await searchResponse.json();
              console.log('Web search result retrieved');
            } else {
              const errorText = await searchResponse.text();
              console.error('Web search error:', errorText);
              toolResult = { error: 'Failed to search the web' };
            }
            
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            });
          } catch (error) {
            console.error('Error calling web-search:', error);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: 'Failed to search the web' })
            });
          }
        }
      }
      
      // Build second request with grounding if needed
      const secondRequestBody: any = {
        model: 'google/gemini-2.5-flash',
        messages: toolMessages,
        max_completion_tokens: 1000,
      };

      if (needsResearch) {
        secondRequestBody.extra_body = {
          google_search_grounding: true
        };
      }

      // Continue the conversation with tool results
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secondRequestBody),
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

function shouldDoWebResearch(userMessage: string): boolean {
  // Check for common real-time data requests
  const realtimeKeywords = [
    'price', 'current', 'now', 'today', 'latest', 'recent', 
    'what is', 'how much', 'market', 'stock', 'crypto', 
    'weather', 'news', 'score', 'rate', 'value', 'cost',
    'worth', 'trading', 'exchange', 'live', 'real-time'
  ];
  
  const messageLower = userMessage.toLowerCase();
  const needsRealtimeData = realtimeKeywords.some(keyword => messageLower.includes(keyword));
  
  if (needsRealtimeData) {
    console.log('Real-time data request detected, enabling web search');
    return true;
  }
  
  return false;
}
