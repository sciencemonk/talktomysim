import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeId } = await req.json();

    if (!storeId) {
      throw new Error('Store ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get store credentials
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('shopify_store_url, shopify_access_token')
      .eq('id', storeId)
      .single();

    if (storeError) throw storeError;

    if (!store?.shopify_store_url || !store?.shopify_access_token) {
      throw new Error('Shopify credentials not configured');
    }

    console.log('Fetching products from Shopify:', store.shopify_store_url);

    // Fetch products from Shopify using GraphQL
    const shopifyResponse = await fetch(
      `https://${store.shopify_store_url}/admin/api/2025-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': store.shopify_access_token,
        },
        body: JSON.stringify({
          query: `
            query {
              products(first: 100) {
                edges {
                  node {
                    id
                    title
                    description
                    status
                    variants(first: 1) {
                      edges {
                        node {
                          price
                        }
                      }
                    }
                    images(first: 4) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      }
    );

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', errorText);
      throw new Error(`Shopify API error: ${shopifyResponse.status}`);
    }

    const shopifyData = await shopifyResponse.json();
    console.log('Shopify response:', JSON.stringify(shopifyData));

    if (shopifyData.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(shopifyData.errors)}`);
    }

    const products = shopifyData.data?.products?.edges || [];
    console.log(`Found ${products.length} products`);

    let syncedCount = 0;

    // Sync products to our database
    for (const { node: product } of products) {
      if (product.status !== 'ACTIVE') continue;

      const price = parseFloat(product.variants.edges[0]?.node?.price || '0');
      const imageUrls = product.images.edges.map((edge: any) => edge.node.url);

      const { error: insertError } = await supabase
        .from('products')
        .upsert({
          store_id: storeId,
          title: product.title,
          description: product.description || '',
          price,
          currency: 'USD',
          image_urls: imageUrls,
          is_active: true,
        }, {
          onConflict: 'store_id,title'
        });

      if (insertError) {
        console.error('Error inserting product:', insertError);
      } else {
        syncedCount++;
      }
    }

    console.log(`Successfully synced ${syncedCount} products`);

    return new Response(
      JSON.stringify({ success: true, synced: syncedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-shopify-products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
