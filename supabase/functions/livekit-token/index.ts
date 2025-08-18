
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_WS_URL = Deno.env.get('LIVEKIT_WS_URL');

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_WS_URL) {
      throw new Error('LiveKit credentials not configured');
    }

    const { roomName, participantName, agentPrompt } = await req.json();

    // Generate JWT token for LiveKit
    const payload = {
      iss: LIVEKIT_API_KEY,
      sub: participantName,
      aud: 'livekit',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      nbf: Math.floor(Date.now() / 1000),
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      },
    };

    // Create JWT token (simplified for demo - in production use proper JWT library)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signature = await createHMAC(`${header}.${payloadEncoded}`, LIVEKIT_API_SECRET);
    const token = `${header}.${payloadEncoded}.${signature}`;

    // Start LiveKit agent with OpenAI integration
    await startLiveKitAgent(roomName, agentPrompt);

    return new Response(JSON.stringify({ 
      token,
      wsUrl: LIVEKIT_WS_URL 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function startLiveKitAgent(roomName: string, agentPrompt: string) {
  // This would typically trigger your LiveKit agent to join the room
  // For now, we'll just log the intent
  console.log(`Starting LiveKit agent for room: ${roomName} with prompt: ${agentPrompt}`);
  
  // In a real implementation, you would:
  // 1. Start a LiveKit Python agent process
  // 2. Have it connect to the room using the OpenAI Realtime API
  // 3. Handle voice-to-voice conversation
}
