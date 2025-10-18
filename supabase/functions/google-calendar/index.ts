import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userToken, eventData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(userToken);
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get integration tokens
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'google_calendar')
      .single();

    if (integrationError || !integration) {
      throw new Error('Google Calendar not connected');
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    const expiresAt = new Date(integration.token_expires_at);
    if (expiresAt <= new Date()) {
      accessToken = await refreshAccessToken(integration.refresh_token);
      
      // Update token in database
      await supabase
        .from('user_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('id', integration.id);
    }

    // Perform calendar operations
    let result;
    switch (action) {
      case 'list_events': {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        result = await response.json();
        break;
      }

      case 'create_event': {
        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          }
        );
        result = await response.json();
        break;
      }

      case 'delete_event': {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventData.eventId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        result = { success: response.ok };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
