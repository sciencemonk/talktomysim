import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  let openAISocket: WebSocket | null = null;
  let systemInstruction = "You are a helpful AI sales agent.";

  socket.onopen = () => {
    console.log("Client connected to OpenAI Realtime relay");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle initialization message
      if (message.type === 'init') {
        systemInstruction = message.systemInstruction || systemInstruction;
        
        // Connect to OpenAI Realtime API with authentication in URL
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
              openAISocket?.send(JSON.stringify({
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
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000
                  },
                  temperature: 0.8
                }
              }));
            }
            
            // When session is updated, notify client ready
            if (data.type === 'session.updated') {
              console.log("Session updated, client ready");
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
