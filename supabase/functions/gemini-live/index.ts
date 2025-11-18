import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
  if (!GOOGLE_API_KEY) {
    socket.close(1008, "Google API key not configured");
    return response;
  }

  let geminiSocket: WebSocket | null = null;
  let systemInstruction = "You are a helpful AI sales agent. You assist customers with product inquiries and purchases.";
  let greetingMessage = "";

  socket.onopen = () => {
    console.log("Client connected to Gemini Live relay");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle initialization message with system prompt
      if (message.type === 'init') {
        systemInstruction = message.systemInstruction || systemInstruction;
        greetingMessage = message.greetingMessage || "";
        
        // Connect to Gemini Live API
        const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GOOGLE_API_KEY}`;
        geminiSocket = new WebSocket(geminiUrl);

        geminiSocket.onopen = () => {
          console.log("Connected to Gemini Live API");
          
          // Send setup message to Gemini
          const setupMessage = {
            setup: {
              model: "models/gemini-2.0-flash-exp",
              generation_config: {
                response_modalities: ["AUDIO"],
                speech_config: {
                  voice_config: {
                    prebuilt_voice_config: {
                      voice_name: "Puck"
                    }
                  }
                }
              }
            }
          };
          
          // Add system instruction if provided
          if (systemInstruction) {
            setupMessage.setup['system_instruction'] = {
              parts: [{ text: systemInstruction }]
            };
          }
          
          console.log("Sending setup:", JSON.stringify(setupMessage));
          geminiSocket?.send(JSON.stringify(setupMessage));
        };

        geminiSocket.onmessage = (geminiEvent) => {
          try {
            const data = JSON.parse(geminiEvent.data);
            console.log("Received from Gemini:", data.setupComplete ? "Setup complete" : JSON.stringify(data).substring(0, 100));
            
            // Check if setup is complete
            if (data.setupComplete) {
              // Send greeting message if provided
              if (greetingMessage) {
                console.log("Sending greeting message:", greetingMessage);
                geminiSocket?.send(JSON.stringify({
                  client_content: {
                    turns: [{
                      role: 'user',
                      parts: [{ text: greetingMessage }]
                    }],
                    turn_complete: true
                  }
                }));
              }
              
              // Notify client that connection is ready
              socket.send(JSON.stringify({ type: 'ready' }));
            }
            
            // Forward all Gemini responses to client
            socket.send(geminiEvent.data);
          } catch (e) {
            console.error("Error parsing Gemini message:", e);
            socket.send(geminiEvent.data);
          }
        };

        geminiSocket.onerror = (error) => {
          console.error("Gemini WebSocket error:", error);
          socket.send(JSON.stringify({ type: 'error', message: 'Gemini connection error' }));
        };

        geminiSocket.onclose = () => {
          console.log("Gemini connection closed");
          socket.send(JSON.stringify({ type: 'disconnected' }));
        };
      }
      // Forward client audio/text to Gemini
      else if (geminiSocket && geminiSocket.readyState === WebSocket.OPEN) {
        console.log("Forwarding to Gemini:", typeof event.data === 'string' ? event.data.substring(0, 100) : 'binary data');
        geminiSocket.send(event.data);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      socket.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (geminiSocket) {
      geminiSocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (geminiSocket) {
      geminiSocket.close();
    }
  };

  return response;
});
