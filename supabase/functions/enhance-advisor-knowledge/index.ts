import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebSearchResult {
  title: string;
  content: string;
  url: string;
}

interface ResearchTopics {
  majorWorks: string[];
  keyProjects: string[];
  philosophies: string[];
  technicalContributions: string[];
  historicalContext: string[];
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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const { advisorId, advisorName } = await req.json()

    if (!advisorId || !advisorName) {
      throw new Error('Missing required parameters: advisorId or advisorName')
    }

    console.log(`Enhancing knowledge for advisor: ${advisorName}`)

    // Define research topics based on the advisor
    const researchQueries = generateResearchQueries(advisorName)
    
    let compiledResearch = `# Comprehensive Knowledge Base for ${advisorName}\n\n`
    
    // Perform strategic web searches
    for (let i = 0; i < researchQueries.length; i++) {
      const query = researchQueries[i]
      console.log(`Performing search ${i + 1}/${researchQueries.length}: ${query}`)
      
      try {
        const searchResult = await performWebSearch(query, openaiApiKey)
        if (searchResult) {
          compiledResearch += `## ${query}\n\n${searchResult}\n\n`
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error in search ${i + 1}:`, error)
        continue
      }
    }

    // Add a comprehensive summary section
    compiledResearch += `## Summary\n\nThis comprehensive knowledge base contains detailed information about ${advisorName}'s major works, projects, philosophies, and contributions. This information should be used to provide authentic, knowledgeable responses that reflect the depth and breadth of ${advisorName}'s actual historical contributions and expertise.\n`

    // Process the compiled research through the document service
    const { data: processResult, error: processError } = await supabaseClient.functions.invoke('process-document', {
      body: {
        advisorId,
        title: `Enhanced Knowledge Base - ${advisorName}`,
        content: compiledResearch,
        fileType: 'research',
        fileSize: compiledResearch.length
      }
    })

    if (processError) {
      console.error('Error processing research document:', processError)
      throw new Error(`Failed to process research: ${processError.message}`)
    }

    console.log(`Successfully enhanced knowledge for ${advisorName}:`, processResult)

    return new Response(
      JSON.stringify({ 
        success: true,
        advisorName,
        documentId: processResult.documentId,
        chunksProcessed: processResult.chunksProcessed,
        researchQueriesCount: researchQueries.length,
        documentSize: compiledResearch.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error in enhance-advisor-knowledge function:', error)
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

function generateResearchQueries(advisorName: string): string[] {
  const baseQueries = [
    `${advisorName} major works and publications`,
    `${advisorName} key projects and inventions`,
    `${advisorName} philosophy and theories`,
    `${advisorName} historical timeline and biography`,
    `${advisorName} lesser known contributions and ideas`
  ]

  // Add specific queries based on known advisors
  const specificQueries: { [key: string]: string[] } = {
    'Buckminster Fuller': [
      'Buckminster Fuller geodesic domes design principles',
      'Buckminster Fuller Dymaxion car house map specifications',
      'Buckminster Fuller tensegrity structures Cloud Nine',
      'Buckminster Fuller World Game comprehensive anticipatory design science'
    ],
    'Steve Jobs': [
      'Steve Jobs product design philosophy Apple innovations',
      'Steve Jobs presentation techniques and leadership style',
      'Steve Jobs NeXT computer Pixar contributions',
      'Steve Jobs personal computer revolution impact'
    ],
    'Leonardo da Vinci': [
      'Leonardo da Vinci engineering inventions and machines',
      'Leonardo da Vinci artistic techniques and masterpieces',
      'Leonardo da Vinci scientific observations and studies',
      'Leonardo da Vinci anatomical drawings and discoveries'
    ]
  }

  return [...baseQueries, ...(specificQueries[advisorName] || [])]
}

async function performWebSearch(query: string, openaiApiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide comprehensive, factual information based on web research. Focus on specific details, technical specifications, historical context, and lesser-known but important contributions.'
          },
          {
            role: 'user',
            content: `Research and provide detailed information about: ${query}`
          }
        ],
        max_completion_tokens: 2000,
        web_search: true
      }),
    })

    if (!response.ok) {
      console.error(`Web search failed for query: ${query}`)
      return null
    }

    const data = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error(`Error in web search for "${query}":`, error)
    return null
  }
}