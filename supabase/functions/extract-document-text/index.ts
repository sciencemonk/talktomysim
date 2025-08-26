
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TextExtractionResult {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    language?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string

    if (!file) {
      throw new Error('No file provided')
    }

    console.log(`Processing file: ${file.name}, type: ${fileType}`)

    let extractedText = ''
    let metadata: any = {}

    switch (fileType.toLowerCase()) {
      case 'pdf':
        const result = await extractPDFText(file)
        extractedText = result.text
        metadata = result.metadata
        break
      
      case 'txt':
        extractedText = await file.text()
        break
      
      case 'docx':
        // For now, treat as text - in production you'd use a DOCX parser
        extractedText = await file.text()
        break
      
      default:
        // Try to extract as plain text
        extractedText = await file.text()
    }

    // Clean and preprocess the text
    const cleanedText = preprocessText(extractedText)
    
    // Add word count to metadata
    metadata.wordCount = cleanedText.split(/\s+/).length

    console.log(`Extracted ${metadata.wordCount} words from ${file.name}`)

    return new Response(
      JSON.stringify({
        text: cleanedText,
        metadata
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in extract-document-text function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract text from document'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function extractPDFText(file: File): Promise<TextExtractionResult> {
  try {
    console.log(`Attempting to extract text from PDF: ${file.name}`)
    
    // For now, since PDF parsing is complex, let's use a workaround
    // In production, you'd want to use a proper PDF parsing service like:
    // - PDF.js (Mozilla's PDF parser)
    // - PDFtk server
    // - Adobe PDF Services API
    // - Or other third-party services
    
    // Temporary solution: Inform user that PDF parsing needs improvement
    throw new Error(`PDF text extraction is not fully supported yet. Please convert your PDF to a text file (.txt) or copy-paste the content directly using the "Paste Text" tab. We're working on improving PDF support.`)
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw error
  }
}

function preprocessText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with processing
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Clean up line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim()
}
