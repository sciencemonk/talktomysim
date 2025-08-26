
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { advisorId, title, content, fileType = 'text', fileSize } = await req.json()

    console.log('Processing document:', { advisorId, title, fileType, contentLength: content?.length })

    if (!advisorId || !title || !content) {
      console.error('Missing required fields:', { advisorId, title, contentLength: content?.length })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: advisorId, title, and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // First, create the document record
    const { data: documentData, error: documentError } = await supabaseClient
      .from('advisor_documents')
      .insert({
        advisor_id: advisorId,
        title: title,
        content: content,
        file_type: fileType,
        file_size: fileSize,
        upload_date: new Date().toISOString(),
        processed_at: null // Will be updated after successful processing
      })
      .select('id')
      .single()

    if (documentError) {
      console.error('Error creating document:', documentError)
      return new Response(
        JSON.stringify({ error: `Failed to create document: ${documentError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const documentId = documentData.id
    console.log('Document created with ID:', documentId)

    // Split content into chunks
    const chunks = splitIntoChunks(content, 500, 50)
    console.log(`Split content into ${chunks.length} chunks`)

    let successfulChunks = 0
    let failedChunks = 0
    const batchSize = 15 // Process in smaller batches to avoid timeouts

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(chunks.length / batchSize)} (chunks ${i}-${i + batch.length - 1})`)
      
      try {
        const embeddings = []
        
        // Generate embeddings for this batch
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const chunkIndex = i + j; // Global chunk index
          
          try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: chunk.text,
                model: 'text-embedding-ada-002'
              })
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error(`OpenAI API error for chunk ${chunkIndex}: ${response.status} ${errorText}`)
              failedChunks++
              continue
            }

            const embeddingData = await response.json()
            const embedding = embeddingData.data[0].embedding

            // Convert embedding array to vector format for PostgreSQL
            const vectorString = `[${embedding.join(',')}]`;

            embeddings.push({
              advisor_id: advisorId,
              document_id: documentId,
              chunk_text: chunk.text,
              chunk_index: chunkIndex,
              embedding: vectorString // Use vector format, not JSON string
            })
          } catch (chunkError) {
            console.error('Error processing chunk:', chunkError)
            failedChunks++
          }
        }

        // Save embeddings for this batch
        if (embeddings.length > 0) {
          const { error: embeddingError } = await supabaseClient
            .from('advisor_embeddings')
            .insert(embeddings)

          if (embeddingError) {
            console.error(`Error saving batch ${i}-${i + batch.length - 1}:`, embeddingError)
            failedChunks += embeddings.length
          } else {
            console.log(`Successfully saved batch ${i}-${i + batch.length - 1} with ${embeddings.length} embeddings`)
            successfulChunks += embeddings.length
          }
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i}-${i + batch.length - 1}:`, batchError)
        failedChunks += batch.length
      }
    }

    // Update document with processed_at timestamp
    const { error: updateError } = await supabaseClient
      .from('advisor_documents')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document processed_at:', updateError)
    } else {
      console.log('Document processing completed and marked as processed')
    }

    console.log(`Successfully processed document with ${successfulChunks}/${chunks.length} embeddings saved`)
    
    const result = {
      success: true,
      documentId: documentId,
      chunksProcessed: successfulChunks,
      totalChunks: chunks.length,
      failedChunks: failedChunks
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in process-document function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function splitIntoChunks(text: string, maxChunkSize: number = 500, overlapSize: number = 50): Array<{text: string, startChar: number, endChar: number}> {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    let end = Math.min(start + maxChunkSize, text.length)
    
    // Try to break at sentence boundaries if we're not at the end
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end)
      const questionEnd = text.lastIndexOf('?', end)
      const exclamationEnd = text.lastIndexOf('!', end)
      
      const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd)
      if (bestEnd > start + maxChunkSize * 0.5) {
        end = bestEnd + 1
      }
    }
    
    const chunkText = text.slice(start, end).trim()
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        startChar: start,
        endChar: end
      })
    }
    
    // Move start forward, accounting for overlap
    start = Math.max(start + 1, end - overlapSize)
  }
  
  return chunks
}
