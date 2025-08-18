
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_REALTIME_MODEL = Deno.env.get('OPENAI_REALTIME_MODEL') ?? 'gpt-4o-realtime-preview-2024-10-01';

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
      // Connect to OpenAI Realtime API with correct URL and headers
      const openAIUrl = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
      console.log('Connecting to OpenAI:', openAIUrl);
      
      openAISocket = new WebSocket(openAIUrl, [], {
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
          // Handle both text and binary messages
          const messageData = typeof event.data === 'string' ? event.data : event.data;
          
          // If it's text, try to parse and check for errors
          if (typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              console.log('Received from OpenAI:', data.type || 'unknown');
              
              // Handle error events specifically
              if (data.type === 'error') {
                console.error('OpenAI API Error:', JSON.stringify(data.error, null, 2));
                // Forward the complete error object to client
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'error',
                    error: data.error
                  }));
                }
                return;
              }
            } catch (parseError) {
              // If JSON parsing fails, still forward the message
              console.log('Received non-JSON text from OpenAI');
            }
          }
          
          // Forward all messages to client (both text and binary)
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(messageData);
          }
        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ 
            type: 'error', 
            error: { 
              code: 'connection_error',
              message: 'OpenAI connection error' 
            }
          }));
        }
      };

      openAISocket.onclose = (event) => {
        console.log('OpenAI WebSocket closed:', event.code, event.reason);
        closeConnections('openai');
      };

    } catch (error) {
      console.error('Error creating OpenAI WebSocket:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: 'error', 
          error: {
            code: 'connection_failed',
            message: 'Failed to connect to OpenAI'
          }
        }));
        socket.close();
      }
    }
  };

  socket.onmessage = (event) => {
    try {
      // Forward all messages (text and binary) to OpenAI without modification
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        const messageData = typeof event.data === 'string' ? event.data : event.data;
        
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            console.log('Received from client:', data.type || 'unknown');
          } catch {
            console.log('Received non-JSON text from client');
          }
        }
        
        openAISocket.send(messageData);
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
