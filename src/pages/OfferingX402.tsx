import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * This component serves as a dedicated x402 endpoint for offering pages.
 * Register this URL with x402scan: /offering/{offeringId}/x402
 * It fetches the 402 response from the edge function and serves it.
 */
export default function OfferingX402() {
  const { offeringId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndServeX402 = async () => {
      if (!offeringId) {
        navigate('/');
        return;
      }

      try {
        const supabaseUrl = 'https://uovhemqkztmkoozlmqxq.supabase.co';
        const response = await fetch(
          `${supabaseUrl}/functions/v1/x402-offering-info?offeringId=${offeringId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        const data = await response.json();
        
        // Clear the page and show the JSON response
        // This makes the URL serve as a x402 endpoint
        document.documentElement.innerHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>x402 Payment Info</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Courier New', monospace;
                background-color: #1a1a1a;
                color: #00ff00;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .header {
                color: #ffff00;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">x402 Payment Required (Status: 402)</div>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </body>
          </html>
        `;
      } catch (error) {
        console.error('Error fetching x402 response:', error);
        document.documentElement.innerHTML = `
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
            <pre>Error loading x402 response: ${error.message}</pre>
          </body>
          </html>
        `;
      }
    };

    fetchAndServeX402();
  }, [offeringId, navigate]);

  return null;
}
