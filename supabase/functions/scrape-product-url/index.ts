import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SSRF Protection: Validate URL to prevent internal network access
function isValidExternalUrl(urlString: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(urlString);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }
    
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost and loopback addresses
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }
    
    // Block private IP ranges
    const privateIpPatterns = [
      /^10\./,                                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,          // 172.16.0.0/12
      /^192\.168\./,                              // 192.168.0.0/16
      /^169\.254\./,                              // Link-local
      /^0\./,                                     // 0.0.0.0/8
      /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT
      /^192\.0\.0\./,                             // IETF Protocol Assignments
      /^198\.1[8-9]\./,                           // Benchmark testing
      /^fc00:/i,                                  // IPv6 private
      /^fe80:/i,                                  // IPv6 link-local
      /^::ffff:(?:10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/i, // IPv4-mapped IPv6 private
    ];
    
    for (const pattern of privateIpPatterns) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
    }
    
    // Block cloud metadata endpoints
    const metadataEndpoints = [
      '169.254.169.254',      // AWS/GCP/Azure metadata
      'metadata.google.internal',
      'metadata.goog',
    ];
    
    if (metadataEndpoints.includes(hostname)) {
      return { valid: false, error: 'Cloud metadata endpoints are not allowed' };
    }
    
    // Block internal hostnames
    const internalPatterns = [
      /\.internal$/i,
      /\.local$/i,
      /\.localhost$/i,
      /\.corp$/i,
    ];
    
    for (const pattern of internalPatterns) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Internal hostnames are not allowed' };
      }
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Extract JSON-LD structured data
function extractJsonLd(html: string): any {
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (!jsonLdMatches) return null;

  for (const match of jsonLdMatches) {
    try {
      const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
      const data = JSON.parse(jsonContent);
      
      // Handle array of schemas
      const schemas = Array.isArray(data) ? data : [data];
      
      for (const schema of schemas) {
        if (schema['@type'] === 'Product' || schema['@type']?.includes('Product')) {
          return schema;
        }
        // Check @graph for Product
        if (schema['@graph']) {
          const product = schema['@graph'].find((item: any) => 
            item['@type'] === 'Product' || item['@type']?.includes('Product')
          );
          if (product) return product;
        }
      }
    } catch (e) {
      console.log('Failed to parse JSON-LD:', e);
    }
  }
  return null;
}

// Extract Open Graph meta tags
function extractOpenGraph(html: string): any {
  const ogData: any = {};
  
  const ogMatches = html.matchAll(/<meta[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi);
  for (const match of ogMatches) {
    ogData[match[1]] = match[2];
  }
  
  // Also try reverse order (content before property)
  const ogMatchesAlt = html.matchAll(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:([^"']+)["'][^>]*>/gi);
  for (const match of ogMatchesAlt) {
    ogData[match[2]] = match[1];
  }
  
  return Object.keys(ogData).length > 0 ? ogData : null;
}

// Extract price from common patterns
function extractPrice(html: string): number | null {
  // Common price patterns
  const pricePatterns = [
    /["']price["']\s*:\s*["']?(\d+(?:\.\d{2})?)["']?/i,
    /data-price=["'](\d+(?:\.\d{2})?)["']/i,
    /class=["'][^"']*price[^"']*["'][^>]*>[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /৳\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) return price;
    }
  }
  return null;
}

// Extract product image
function extractImage(html: string, baseUrl: string): string | null {
  // Try common image patterns
  const patterns = [
    /<img[^>]*class=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*id=["'][^"']*product[^"']*["'][^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*main[^"']*["']/i,
    /data-zoom-image=["']([^"']+)["']/i,
    /data-large_image=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let imgUrl = match[1];
      if (!imgUrl.startsWith('http')) {
        try {
          imgUrl = new URL(imgUrl, baseUrl).href;
        } catch (e) {
          continue;
        }
      }
      return imgUrl;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('User authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is an admin
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roles) {
      console.log('Admin role check failed:', roleError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin user authenticated:', user.id);

    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SSRF Protection: Validate URL
    const urlValidation = isValidExternalUrl(url);
    if (!urlValidation.valid) {
      console.log('URL validation failed:', urlValidation.error);
      return new Response(
        JSON.stringify({ success: false, error: urlValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching URL:', url);

    // Fetch with multiple user agents as fallback
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    ];

    let html = '';
    let pageResponse: Response | null = null;

    // Set timeout for fetch to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      for (const ua of userAgents) {
        try {
          pageResponse = await fetch(url, {
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Referer': new URL(url).origin,
            },
            signal: controller.signal,
            redirect: 'follow',
          });
          
          // Validate redirect didn't go to internal URL
          const finalUrl = pageResponse.url;
          const redirectValidation = isValidExternalUrl(finalUrl);
          if (!redirectValidation.valid) {
            console.log('Redirect to invalid URL blocked:', finalUrl);
            return new Response(
              JSON.stringify({ success: false, error: 'Redirect to blocked URL' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (pageResponse.ok) {
            html = await pageResponse.text();
            console.log('Successfully fetched with UA:', ua.substring(0, 30));
            break;
          }
        } catch (e) {
          console.log('Fetch failed with UA:', ua.substring(0, 30), e);
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (!html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not fetch the URL. The website might be blocking requests.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetched HTML length:', html.length);

    // Try structured data extraction first
    let productData: any = null;
    
    // 1. Try JSON-LD (most reliable)
    const jsonLd = extractJsonLd(html);
    if (jsonLd) {
      console.log('Found JSON-LD product data');
      productData = {
        name: jsonLd.name || null,
        description: (jsonLd.description || '').substring(0, 500),
        price: jsonLd.offers?.price || jsonLd.offers?.[0]?.price || extractPrice(html),
        original_price: jsonLd.offers?.highPrice || null,
        image_url: Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image || null,
        brand: jsonLd.brand?.name || jsonLd.brand || null,
        specifications: jsonLd.additionalProperty?.reduce((acc: any, prop: any) => {
          acc[prop.name] = prop.value;
          return acc;
        }, {}) || {},
      };
    }

    // 2. Try Open Graph as supplement/fallback
    const ogData = extractOpenGraph(html);
    if (ogData) {
      console.log('Found Open Graph data');
      if (!productData) {
        productData = {
          name: ogData.title || null,
          description: (ogData.description || '').substring(0, 500),
          price: extractPrice(html),
          original_price: null,
          image_url: ogData.image || null,
          brand: ogData.site_name || null,
          specifications: {},
        };
      } else {
        // Supplement missing fields
        productData.name = productData.name || ogData.title;
        productData.description = productData.description || ogData.description?.substring(0, 500);
        productData.image_url = productData.image_url || ogData.image;
      }
    }

    // 3. Use AI extraction if structured data is incomplete
    if (!productData || !productData.name || !productData.price) {
      console.log('Using AI extraction for missing data');
      
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        // Return partial data if we have some
        if (productData && productData.name) {
          return new Response(
            JSON.stringify({ success: true, product: productData, sourceUrl: url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: false, error: 'AI service not configured and no structured data found' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean HTML - remove scripts, styles, comments for smaller payload
      let cleanHtml = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Truncate to avoid token limits but keep more content
      const truncatedHtml = cleanHtml.substring(0, 80000);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a product data extractor. Extract product information from HTML.
Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "name": "product name",
  "description": "concise description max 500 chars",
  "price": 0,
  "original_price": null,
  "image_url": "absolute URL to main product image",
  "brand": "brand name or null",
  "specifications": {}
}
For price, extract numeric value only. Look for:
- Schema.org data, meta tags, price classes
- Currency symbols: ৳, $, ₹, €, £
- Product images in main content area
Return null for fields you cannot find.`
            },
            {
              role: 'user',
              content: `URL: ${url}\n\nExtract product data:\n${truncatedHtml}`
            }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        console.log('AI response received, length:', content.length);

        try {
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
          }
          const aiProduct = JSON.parse(cleanContent);
          
          // Merge AI data with existing structured data
          productData = {
            name: productData?.name || aiProduct.name,
            description: productData?.description || aiProduct.description,
            price: productData?.price || aiProduct.price,
            original_price: productData?.original_price || aiProduct.original_price,
            image_url: productData?.image_url || aiProduct.image_url,
            brand: productData?.brand || aiProduct.brand,
            specifications: { ...productData?.specifications, ...aiProduct.specifications },
          };
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Try to extract from partial data
          if (!productData) {
            const extractedImage = extractImage(html, url);
            productData = {
              name: html.match(/<title>([^<]+)<\/title>/i)?.[1] || null,
              description: null,
              price: extractPrice(html),
              original_price: null,
              image_url: extractedImage,
              brand: null,
              specifications: {},
            };
          }
        }
      }
    }

    // Final validation
    if (!productData || !productData.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not extract product information. The page may require JavaScript or have an unusual structure.',
          partial: productData 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure image URL is absolute
    if (productData.image_url && !productData.image_url.startsWith('http')) {
      try {
        productData.image_url = new URL(productData.image_url, new URL(url).origin).href;
      } catch (e) {
        console.error('Failed to resolve image URL:', e);
      }
    }

    // Clean up price
    if (typeof productData.price === 'string') {
      productData.price = parseFloat(productData.price.replace(/[^0-9.]/g, '')) || 0;
    }

    console.log('Successfully extracted product:', productData.name);

    return new Response(
      JSON.stringify({ success: true, product: productData, sourceUrl: url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping URL:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to scrape URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
