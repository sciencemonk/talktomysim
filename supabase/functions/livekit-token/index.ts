
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AccessToken } from "https://deno.land/x/livekit_server_sdk@1.2.7/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { roomName, participantName } = await req.json()

    if (!roomName || !participantName) {
      throw new Error('Missing roomName or participantName')
    }

    const livekitHost = Deno.env.get('LIVEKIT_WS_URL')
    const apiKey = Deno.env.get('LIVEKIT_API_KEY')
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET')

    if (!livekitHost || !apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured')
    }

    console.log('Generating LiveKit token for:', { roomName, participantName })

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '10m',
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    const token = at.toJwt()

    return new Response(
      JSON.stringify({ 
        token,
        wsUrl: livekitHost
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in livekit-token function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
