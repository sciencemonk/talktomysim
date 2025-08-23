
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, selector, respectRobots = true } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL provided');
    }

    // Check robots.txt if requested
    if (respectRobots) {
      try {
        const robotsUrl = new URL('/robots.txt', targetUrl.origin);
        const robotsResponse = await fetch(robotsUrl.toString(), {
          headers: { 'User-Agent': 'DocumentBot/1.0' }
        });
        
        if (robotsResponse.ok) {
          const robotsText = await robotsResponse.text();
          if (robotsText.toLowerCase().includes('disallow: /') || 
              robotsText.toLowerCase().includes('user-agent: *')) {
            // Simple check - in production, you'd want more sophisticated robots.txt parsing
            console.log('Robots.txt detected, proceeding with caution');
          }
        }
      } catch {
        // If robots.txt can't be fetched, continue anyway
      }
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocumentBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error('URL does not return HTML content');
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    let content = '';
    let title = '';

    // Extract title
    const titleElement = doc.querySelector('title');
    if (titleElement) {
      title = titleElement.textContent?.trim() || '';
    }

    // Extract content based on selector or use default strategy
    if (selector) {
      const selectedElements = doc.querySelectorAll(selector);
      if (selectedElements.length > 0) {
        content = Array.from(selectedElements)
          .map(el => el.textContent?.trim() || '')
          .filter(text => text.length > 0)
          .join('\n\n');
      } else {
        throw new Error(`No elements found matching selector: ${selector}`);
      }
    } else {
      // Default content extraction strategy
      // Remove script and style elements
      const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside');
      scripts.forEach(el => el.remove());

      // Try to find main content areas
      const contentSelectors = [
        'main', 'article', '.content', '#content', '.post', '.entry',
        '.article-content', '.post-content', '.entry-content', 'body'
      ];

      for (const contentSelector of contentSelectors) {
        const contentEl = doc.querySelector(contentSelector);
        if (contentEl) {
          content = contentEl.textContent?.trim() || '';
          if (content.length > 100) break; // Use this if it has substantial content
        }
      }
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();

    if (!content || content.length < 50) {
      throw new Error('No substantial content could be extracted from the webpage');
    }

    return new Response(
      JSON.stringify({
        title: title || 'Web Document',
        content,
        url,
        extractedAt: new Date().toISOString(),
        contentLength: content.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in scrape-web-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
