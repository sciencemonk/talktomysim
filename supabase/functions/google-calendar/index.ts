import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, ...params } = await req.json();

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabaseClient
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
    if (new Date(integration.token_expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      const expiresAt = new Date(Date.now() + (newTokens.expires_in * 1000));
      await supabaseClient
        .from('user_integrations')
        .update({
          access_token: accessToken,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', integration.id);
    }

    let result;

    switch (action) {
      case 'list_events': {
        const { timeMin, timeMax, maxResults = 10 } = params;
        const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        if (timeMin) calendarUrl.searchParams.set('timeMin', timeMin);
        if (timeMax) calendarUrl.searchParams.set('timeMax', timeMax);
        calendarUrl.searchParams.set('maxResults', maxResults.toString());
        calendarUrl.searchParams.set('singleEvents', 'true');
        calendarUrl.searchParams.set('orderBy', 'startTime');

        const response = await fetch(calendarUrl.toString(), {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        result = await response.json();
        break;
      }

      case 'create_event': {
        const { summary, description, start, end, location } = params;
        
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary,
            description,
            location,
            start: { dateTime: start, timeZone: 'UTC' },
            end: { dateTime: end, timeZone: 'UTC' },
          }),
        });

        result = await response.json();
        break;
      }

      case 'delete_event': {
        const { eventId } = params;
        
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        result = { success: response.ok };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in google-calendar:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
