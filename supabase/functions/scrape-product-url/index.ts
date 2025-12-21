import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching URL:', url);

    // Fetch the webpage
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!pageResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch URL: ${pageResponse.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await pageResponse.text();
    console.log('Fetched HTML length:', html.length);

    // Use Lovable AI to extract product information
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate HTML to avoid token limits
    const truncatedHtml = html.substring(0, 50000);

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
            content: `You are a product data extractor. Analyze the HTML and extract product information. 
Return ONLY a valid JSON object with these fields:
{
  "name": "product name",
  "description": "product description (keep it concise, max 500 chars)",
  "price": 0 (numeric value only, no currency symbols),
  "original_price": 0 (if there's a discounted price, this is the original. null if no discount),
  "image_url": "main product image URL (full absolute URL)",
  "brand": "brand name if available",
  "specifications": {} (key-value pairs of product specs like color, size, etc)
}
If you cannot find a field, use null. For price, extract the numeric value only.
IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no explanations.`
          },
          {
            role: 'user',
            content: `Extract product information from this HTML:\n\nURL: ${url}\n\nHTML:\n${truncatedHtml}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('AI API error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to analyze page content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    console.log('AI response:', content);

    // Parse the JSON response
    let productData;
    try {
      // Clean up the response - remove any markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }
      productData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse product data', rawContent: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure image URL is absolute
    if (productData.image_url && !productData.image_url.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        productData.image_url = new URL(productData.image_url, baseUrl.origin).href;
      } catch (e) {
        console.error('Failed to resolve image URL:', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, product: productData, sourceUrl: url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scraping URL:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to scrape URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
