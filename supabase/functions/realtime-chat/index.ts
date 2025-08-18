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
  let sessionConfigured = false;

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

  socket.onopen = async () => {
    console.log('Client WebSocket connected');
    
    try {
      // First, let's try to get an ephemeral token from OpenAI
      console.log('Getting ephemeral token from OpenAI...');
      const tokenResponse = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_REALTIME_MODEL,
          voice: 'alloy',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Failed to get ephemeral token:', errorText);
        throw new Error(`Failed to get ephemeral token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Got ephemeral token successfully');

      if (!tokenData.client_secret?.value) {
        throw new Error('No ephemeral token received');
      }

      const ephemeralKey = tokenData.client_secret.value;
      const openAIUrl = `wss://api.openai.com/v1/realtime?model=${OPENAI_REALTIME_MODEL}`;
      console.log('Connecting to OpenAI with ephemeral token:', openAIUrl);

      // Now create WebSocket connection using the ephemeral token
      openAISocket = new WebSocket(openAIUrl, [], {
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      openAISocket.onopen = () => {
        console.log('Connected to OpenAI Realtime API');
        
        // Set up app-level keepalive ping every 25 seconds
        keepaliveInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({type: "ping"}));
          }
          if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
            openAISocket.send(JSON.stringify({type: "ping"}));
          }
        }, 25000);
      };

      openAISocket.onmessage = (event) => {
        try {
          const messageData = typeof event.data === 'string' ? event.data : event.data;
          
          if (typeof event.data === 'string') {
            try {
              const data = JSON.parse(event.data);
              console.log('Received from OpenAI:', data.type || 'unknown');
              
              // Handle session.created event - this is when we know the session is ready
              if (data.type === 'session.created') {
                console.log('OpenAI session created, ready for configuration');
                sessionConfigured = true;
              }
              
              // Handle error events specifically
              if (data.type === 'error') {
                console.error('OpenAI API Error:', JSON.stringify(data.error, null, 2));
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({
                    type: 'error',
                    error: data.error
                  }));
                }
                return;
              }
            } catch (parseError) {
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
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        const messageData = typeof event.data === 'string' ? event.data : event.data;
        
        if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            console.log('Received from client:', data.type || 'unknown');
            
            // Only forward session.update after session is created
            if (data.type === 'session.update' && !sessionConfigured) {
              console.log('Delaying session.update until session.created is received');
              // Wait a bit and try again
              setTimeout(() => {
                if (sessionConfigured && openAISocket && openAISocket.readyState === WebSocket.OPEN) {
                  openAISocket.send(event.data);
                }
              }, 100);
              return;
            }
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
