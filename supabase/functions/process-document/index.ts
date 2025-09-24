
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChunk {
  text: string;
  index: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { advisorId, title, content, fileType, fileSize } = await req.json()

    if (!advisorId || !title || !content) {
      throw new Error('Missing required parameters: advisorId, title, or content')
    }

    console.log('Processing document for advisor:', advisorId)

    // First, save the document to the advisor_documents table
    const { data: document, error: docError } = await supabaseClient
      .from('advisor_documents')
      .insert({
        advisor_id: advisorId,
        title: title,
        content: content,
        file_type: fileType || 'text',
        file_size: fileSize || content.length
      })
      .select()
      .single()

    if (docError) {
      console.error('Error saving document:', docError)
      throw new Error(`Failed to save document: ${docError.message}`)
    }

    // Split content into chunks (approximately 1000 characters each)
    const chunks = splitIntoChunks(content, 1000)
    console.log(`Split document into ${chunks.length} chunks`)

    // Generate embeddings for each chunk
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embeddings = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}/${chunks.length}`)
      
      // Generate embedding using OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: chunk.text
        }),
      })

      if (!embeddingResponse.ok) {
        console.error(`Failed to generate embedding for chunk ${i}`)
        continue
      }

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      embeddings.push({
        document_id: document.id,
        advisor_id: advisorId,
        chunk_text: chunk.text,
        chunk_index: chunk.index,
        embedding: embedding
      })
    }

    // Save all embeddings to the database
    const { error: embeddingsError } = await supabaseClient
      .from('advisor_embeddings')
      .insert(embeddings)

    if (embeddingsError) {
      console.error('Error saving embeddings:', embeddingsError)
      throw new Error(`Failed to save embeddings: ${embeddingsError.message}`)
    }

    // Update document as processed
    await supabaseClient
      .from('advisor_documents')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', document.id)

    console.log(`Successfully processed document with ${embeddings.length} embeddings`)

    return new Response(
      JSON.stringify({ 
        success: true,
        documentId: document.id,
        chunksProcessed: embeddings.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in process-document function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function splitIntoChunks(text: string, maxChunkSize: number): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  const sentences = text.split(/[.!?]+/)
  
  let currentChunk = ''
  let chunkIndex = 0
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue
    
    const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence
    
    if (potentialChunk.length > maxChunkSize && currentChunk) {
      // Save current chunk and start new one
      chunks.push({
        text: currentChunk + '.',
        index: chunkIndex++
      })
      currentChunk = trimmedSentence
    } else {
      currentChunk = potentialChunk
    }
  }
  
  // Add the last chunk if it exists
  if (currentChunk) {
    chunks.push({
      text: currentChunk + '.',
      index: chunkIndex
    })
  }
  
  return chunks
}
