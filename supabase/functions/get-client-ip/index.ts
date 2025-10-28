import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try multiple headers to get the client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    // x-forwarded-for can contain multiple IPs, take the first one (client IP)
    let clientIp = forwardedFor?.split(',')[0].trim() || 
                   realIp || 
                   cfConnectingIp || 
                   'unknown';

    console.log('[get-client-ip] Client IP detected:', clientIp);
    console.log('[get-client-ip] Headers:', {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
      'cf-connecting-ip': cfConnectingIp
    });

    return new Response(
      JSON.stringify({ ip: clientIp }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[get-client-ip] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, ip: 'unknown' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
