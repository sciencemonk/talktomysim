import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, email, code, projectId } = await req.json()
    
    console.log(`Coinbase auth proxy - action: ${action}, email: ${email}`)

    let response;
    
    if (action === 'request-verification') {
      response = await fetch('https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/auth/request-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          projectId: projectId,
        }),
      })
    } else if (action === 'verify-code') {
      response = await fetch('https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code,
          projectId: projectId,
        }),
      })
    } else {
      throw new Error('Invalid action')
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Coinbase API error: ${response.status} - ${errorText}`)
      throw new Error(`Coinbase API error: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error in Coinbase auth proxy:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  }
})
