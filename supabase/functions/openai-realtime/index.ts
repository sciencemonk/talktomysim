import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    socket.close(1008, "OpenAI API key not configured");
    return response;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let openAISocket: WebSocket | null = null;
  let systemInstruction = "You are a helpful AI sales agent.";
  let products: any[] = [];
  let store: any = null;

  socket.onopen = () => {
    console.log("Client connected to OpenAI Realtime relay");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle initialization message
      if (message.type === 'init') {
        const { storeId } = message;
        
        // Fetch store and products
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', storeId)
          .single();
        
        if (storeError || !storeData) {
          console.error('Error fetching store:', storeError);
          socket.send(JSON.stringify({ type: 'error', message: 'Store not found' }));
          return;
        }
        
        store = storeData;
        
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        products = productsData || [];
        
        // Build system instruction like text agent
        let productContext = '';
        if (products.length > 0) {
          productContext = '\n\nAVAILABLE PRODUCTS:\n' + products.map((p: any) => 
            `- ${p.title} ($${p.price} ${p.currency || 'USD'}): ${p.description}${p.delivery_info ? ` | Delivery: ${p.delivery_info}` : ''}`
          ).join('\n');
        } else {
          productContext = '\n\nNote: No products are currently available in the catalog.';
        }
        
        let productIdMapping = '';
        if (products.length > 0) {
          productIdMapping = '\n\nPRODUCT IDs (use these exact IDs with show_product tool):\n' + 
            products.map((p: any) => `- "${p.title}": ${p.id}`).join('\n');
        }
        
        systemInstruction = `You are an AI shopping assistant for ${store.store_name || 'this store'}.

GREETING: Start with a brief hello and ask for the visitor's name.

YOUR ROLE:
Help customers discover products and guide them through shopping. Keep responses concise and natural. Use the customer's name occasionally once you know it.

${productContext}${productIdMapping}

CRITICAL GUIDELINES:
- Keep responses SHORT - 1-2 sentences max unless answering detailed questions
- ALWAYS combine tool calls with text (e.g., "Check out {Product Name}!")
- Use show_product tool ONLY when FIRST introducing a NEW product
- Answer follow-up questions about shown products with text ONLY - NO repeat tools
- When customer asks general questions, respond with TEXT ONLY
- Use exact product IDs from the list above when calling show_product
- REMEMBER: Most of your messages should be helpful text, not product cards`;
        
        console.log('System instruction built for store:', store.store_name);
        
        // Connect to OpenAI Realtime API
        const model = "gpt-4o-realtime-preview-2024-10-01";
        const openAIUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
        
        openAISocket = new WebSocket(openAIUrl, [
          "realtime",
          `openai-insecure-api-key.${OPENAI_API_KEY}`,
          "openai-beta.realtime-v1"
        ]);

        openAISocket.onopen = () => {
          console.log("Connected to OpenAI Realtime API");
          socket.send(JSON.stringify({ type: 'connected' }));
        };

        openAISocket.onmessage = (openAIEvent) => {
          try {
            const data = JSON.parse(openAIEvent.data);
            console.log("Received from OpenAI:", data.type);
            
            // When session is created, send configuration
            if (data.type === 'session.created') {
              console.log("Session created, sending configuration");
              
              const tools = products.length > 0 ? [
                {
                  type: "function",
                  name: "show_product",
                  description: "Display a product card with details, image, and purchase button to the customer",
                  parameters: {
                    type: "object",
                    properties: {
                      product_id: {
                        type: "string",
                        description: "The ID of the product to display"
                      }
                    },
                    required: ["product_id"]
                  }
                },
                {
                  type: "function",
                  name: "initiate_purchase",
                  description: "Open the checkout page for a product when customer wants to buy it. Use this when customer expresses intent to purchase, checkout, or buy a product.",
                  parameters: {
                    type: "object",
                    properties: {
                      product_id: {
                        type: "string",
                        description: "The ID of the product to purchase"
                      }
                    },
                    required: ["product_id"]
                  }
                },
                {
                  type: "function",
                  name: "navigate_to_product",
                  description: "Navigate to a specific product's detail page. Use when customer wants to see more details about a product or when discussing a specific product in depth.",
                  parameters: {
                    type: "object",
                    properties: {
                      product_id: {
                        type: "string",
                        description: "The ID of the product to navigate to"
                      }
                    },
                    required: ["product_id"]
                  }
                },
                {
                  type: "function",
                  name: "navigate_to_store",
                  description: "Navigate back to the main store page showing all products. Use when customer wants to browse more products or return to the main catalog.",
                  parameters: {
                    type: "object",
                    properties: {}
                  }
                }
              ] : [];
              
              const sessionConfig: any = {
                type: 'session.update',
                session: {
                  modalities: ["text", "audio"],
                  instructions: systemInstruction,
                  voice: "alloy",
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: {
                    model: "whisper-1"
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.6, // Higher threshold = more deliberate, less accidental interruption
                    prefix_padding_ms: 200, // Reduced padding for faster interruption
                    silence_duration_ms: 700 // Shorter silence needed to stop talking
                  },
                  temperature: 0.8
                }
              };
              
              if (tools.length > 0) {
                sessionConfig.session.tools = tools;
                sessionConfig.session.tool_choice = "auto";
              }
              
              openAISocket?.send(JSON.stringify(sessionConfig));
            }
            
            // Handle function calls
            if (data.type === 'response.function_call_arguments.done') {
              console.log("Function call received:", data);
              const args = JSON.parse(data.arguments);
              
              if (data.name === 'show_product') {
                const product = products.find((p: any) => p.id === args.product_id);
                if (product) {
                  socket.send(JSON.stringify({
                    type: 'show_product',
                    product: product
                  }));
                }
                
                // Send function result back to OpenAI
                openAISocket?.send(JSON.stringify({
                  type: 'conversation.item.create',
                  item: {
                    type: 'function_call_output',
                    call_id: data.call_id,
                    output: JSON.stringify({ success: true, message: `Displayed ${product?.title}` })
                  }
                }));
                
                openAISocket?.send(JSON.stringify({ type: 'response.create' }));
              }
              
              if (data.name === 'initiate_purchase') {
                const product = products.find((p: any) => p.id === args.product_id);
                if (product) {
                  socket.send(JSON.stringify({
                    type: 'initiate_purchase',
                    productId: product.id
                  }));
                }
                
                // Send function result back to OpenAI
                openAISocket?.send(JSON.stringify({
                  type: 'conversation.item.create',
                  item: {
                    type: 'function_call_output',
                    call_id: data.call_id,
                    output: JSON.stringify({ success: true, message: `Opening checkout for ${product?.title}` })
                  }
                }));
                
                openAISocket?.send(JSON.stringify({ type: 'response.create' }));
              }
              
              if (data.name === 'navigate_to_product') {
                const product = products.find((p: any) => p.id === args.product_id);
                if (product) {
                  socket.send(JSON.stringify({
                    type: 'navigate_to_product',
                    productId: product.id
                  }));
                }
                
                // Send function result back to OpenAI
                openAISocket?.send(JSON.stringify({
                  type: 'conversation.item.create',
                  item: {
                    type: 'function_call_output',
                    call_id: data.call_id,
                    output: JSON.stringify({ success: true, message: `Navigating to ${product?.title}` })
                  }
                }));
                
                openAISocket?.send(JSON.stringify({ type: 'response.create' }));
              }
              
              if (data.name === 'navigate_to_store') {
                socket.send(JSON.stringify({
                  type: 'navigate_to_store'
                }));
                
                // Send function result back to OpenAI
                openAISocket?.send(JSON.stringify({
                  type: 'conversation.item.create',
                  item: {
                    type: 'function_call_output',
                    call_id: data.call_id,
                    output: JSON.stringify({ success: true, message: 'Navigating back to store' })
                  }
                }));
                
                openAISocket?.send(JSON.stringify({ type: 'response.create' }));
              }
            }
            
            // When session is updated, send greeting and notify client
            if (data.type === 'session.updated') {
              console.log("Session updated, sending greeting");
              
              // Send greeting as text message
              const greetingText = store.greeting_message || `Hello! Welcome to ${store.store_name}. How can I help you today?`;
              
              openAISocket?.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'message',
                  role: 'user',
                  content: [{
                    type: 'input_text',
                    text: greetingText
                  }]
                }
              }));
              
              openAISocket?.send(JSON.stringify({ type: 'response.create' }));
              
              socket.send(JSON.stringify({ type: 'ready' }));
            }
            
            // Forward all OpenAI responses to client
            socket.send(openAIEvent.data);
          } catch (e) {
            console.error("Error parsing OpenAI message:", e);
            socket.send(openAIEvent.data);
          }
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
        };

        openAISocket.onclose = () => {
          console.log("OpenAI connection closed");
          socket.send(JSON.stringify({ type: 'disconnected' }));
        };
      }
      // Forward client messages to OpenAI
      else if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      socket.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
