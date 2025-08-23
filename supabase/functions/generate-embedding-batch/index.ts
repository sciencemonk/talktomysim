
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { texts } = await req.json()

    if (!texts || !Array.isArray(texts)) {
      throw new Error('Texts array is required')
    }

    if (texts.length === 0) {
      return new Response(
        JSON.stringify({ embeddings: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (texts.length > 100) {
      throw new Error('Batch size cannot exceed 100 texts')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log(`Processing batch of ${texts.length} texts for embeddings`)

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: texts
      }),
    })

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`)
    }

    const embeddingData = await embeddingResponse.json()
    
    if (!embeddingData.data || !Array.isArray(embeddingData.data)) {
      throw new Error('Invalid response format from OpenAI')
    }

    // Extract embeddings in the correct order
    const embeddings = embeddingData.data
      .sort((a: any, b: any) => a.index - b.index)
      .map((item: any) => item.embedding)

    console.log(`Successfully generated ${embeddings.length} embeddings`)

    return new Response(
      JSON.stringify({ 
        embeddings,
        usage: embeddingData.usage,
        processed: embeddings.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in generate-embedding-batch function:', error)
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
