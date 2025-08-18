import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log('WebSocket upgrade requested');

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openAISocket: WebSocket | null = null;
  let keepaliveInterval: number | null = null;
  let isClosing = false;

  const cleanup = () => {
    if (keepaliveInterval) {
      clearInterval(keepaliveInterval);
      keepaliveInterval = null;
    }
  };

  const closeConnections = (initiator: 'client' | 'openai') => {
    if (isClosing) return;
    isClosing = true;
    
    cleanup();
    
    if (initiator === 'client' && openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    } else if (initiator === 'openai' && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    try {
      // Connect to OpenAI Realtime API with proper authentication
      openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", [], {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      openAISocket.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
        
        // Set up keepalive ping every 25 seconds
        keepaliveInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.ping();
          }
          if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
            openAISocket.ping();
          }
        }, 25000);
      };

      openAISocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received from OpenAI:', data.type);
          
          // If we receive session.created, send our session configuration
          if (data.type === 'session.created') {
            const sessionConfig = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: "You are a helpful AI tutor. Be conversational and engaging.",
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
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            
            openAISocket.send(JSON.stringify(sessionConfig));
            console.log('Sent session configuration after session.created');
          }
          
          // Forward all messages to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
        }
      };

      openAISocket.onclose = (event) => {
        console.log('OpenAI WebSocket closed:', event.code, event.reason);
        closeConnections('openai');
      };

    } catch (error) {
      console.error('Error creating OpenAI WebSocket:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'error', message: 'Failed to connect to OpenAI' }));
        socket.close();
      }
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received from client:', data.type);
      
      // Forward client messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error('Error processing client message:', error);
    }
  };

  socket.onclose = (event) => {
    console.log('Client WebSocket disconnected:', event.code, event.reason);
    closeConnections('client');
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  return response;
});
