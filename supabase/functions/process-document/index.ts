
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
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

    console.log(`Processing document "${title}" for advisor: ${advisorId}`)
    console.log(`Content length: ${content.length} characters`)

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

    // Enhanced chunking with semantic boundaries and overlap
    const chunks = createSemanticChunks(content, {
      maxChunkSize: 800,
      overlapSize: 100,
      preserveParagraphs: true
    })
    
    console.log(`Created ${chunks.length} semantic chunks`)

    // Generate embeddings for each chunk with retry logic
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embeddings = []
    let successfulEmbeddings = 0
    let failedEmbeddings = 0
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.text.length} chars)`)
      
      try {
        const embedding = await generateEmbeddingWithRetry(chunk.text, openaiApiKey, 3)
        
        embeddings.push({
          document_id: document.id,
          advisor_id: advisorId,
          chunk_text: chunk.text,
          chunk_index: chunk.index,
          embedding: embedding,
          start_char: chunk.startChar,
          end_char: chunk.endChar
        })
        
        successfulEmbeddings++
      } catch (error) {
        console.error(`Failed to generate embedding for chunk ${i}:`, error)
        failedEmbeddings++
        
        // Continue processing other chunks even if one fails
        continue
      }
    }

    console.log(`Successfully processed ${successfulEmbeddings} chunks, ${failedEmbeddings} failed`)

    if (embeddings.length === 0) {
      throw new Error('Failed to generate any embeddings for the document')
    }

    // Save all embeddings to the database in batches
    const batchSize = 50
    let totalSaved = 0
    
    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize)
      
      const { error: embeddingsError } = await supabaseClient
        .from('advisor_embeddings')
        .insert(batch)

      if (embeddingsError) {
        console.error(`Error saving batch ${i}-${i + batch.length}:`, embeddingsError)
        // Continue with other batches
      } else {
        totalSaved += batch.length
      }
    }

    // Update document as processed
    await supabaseClient
      .from('advisor_documents')
      .update({ 
        processed_at: new Date().toISOString(),
        file_size: content.length 
      })
      .eq('id', document.id)

    console.log(`Successfully processed document with ${totalSaved}/${embeddings.length} embeddings saved`)

    return new Response(
      JSON.stringify({ 
        success: true,
        documentId: document.id,
        chunksProcessed: totalSaved,
        totalChunks: chunks.length,
        failedChunks: failedEmbeddings
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in process-document function:', error)
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

function createSemanticChunks(text: string, options: {
  maxChunkSize: number;
  overlapSize: number;
  preserveParagraphs: boolean;
}): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  
  // First, split by paragraphs if preserveParagraphs is true
  const paragraphs = options.preserveParagraphs 
    ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    : [text]
  
  let currentChunk = ''
  let chunkStartChar = 0
  let chunkIndex = 0
  let globalCharIndex = 0
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()
    
    // If adding this paragraph would exceed the chunk size
    if (currentChunk.length + trimmedParagraph.length > options.maxChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
        startChar: chunkStartChar,
        endChar: chunkStartChar + currentChunk.length
      })
      
      // Start new chunk with overlap from previous chunk
      const overlap = getOverlapText(currentChunk, options.overlapSize)
      currentChunk = overlap + (overlap ? '\n\n' : '') + trimmedParagraph
      chunkStartChar = globalCharIndex - overlap.length
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n'
      } else {
        chunkStartChar = globalCharIndex
      }
      currentChunk += trimmedParagraph
    }
    
    globalCharIndex += paragraph.length + 2 // +2 for paragraph separator
  }
  
  // Add the last chunk if it exists
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      startChar: chunkStartChar,
      endChar: chunkStartChar + currentChunk.length
    })
  }
  
  return chunks
}

function getOverlapText(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) return text
  
  // Try to break at sentence boundary
  const sentences = text.split(/[.!?]+/)
  let overlap = ''
  
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i].trim()
    if (overlap.length + sentence.length <= overlapSize) {
      overlap = sentence + (overlap ? '. ' : '') + overlap
    } else {
      break
    }
  }
  
  // If no good sentence break, just take the last N characters
  if (!overlap) {
    overlap = text.slice(-overlapSize)
  }
  
  return overlap
}

async function generateEmbeddingWithRetry(text: string, apiKey: string, maxRetries: number): Promise<number[]> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
      
    } catch (error) {
      lastError = error as Error
      console.error(`Embedding attempt ${attempt}/${maxRetries} failed:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Failed to generate embedding after retries')
}
