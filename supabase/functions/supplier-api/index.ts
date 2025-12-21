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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, supplierId, endpoint, apiKey, authType, headers: customHeaders } = await req.json();

    if (action === 'test') {
      // Test API connection
      if (!endpoint) {
        return new Response(
          JSON.stringify({ success: false, error: 'API endpoint is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Testing API connection to:', endpoint);

      // Build headers based on auth type
      const requestHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...customHeaders,
      };

      if (apiKey) {
        switch (authType) {
          case 'bearer':
            requestHeaders['Authorization'] = `Bearer ${apiKey}`;
            break;
          case 'api_key':
            requestHeaders['X-API-Key'] = apiKey;
            break;
          case 'basic':
            requestHeaders['Authorization'] = `Basic ${btoa(apiKey)}`;
            break;
          case 'custom':
            // API key is already in custom headers
            break;
        }
      }

      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: requestHeaders,
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let responsePreview = '';
          
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            responsePreview = JSON.stringify(data, null, 2).substring(0, 500);
          } else {
            responsePreview = (await response.text()).substring(0, 500);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              status: response.status,
              message: 'Connection successful',
              preview: responsePreview
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              status: response.status,
              error: `API returned status ${response.status}: ${response.statusText}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to connect: ${fetchError.message}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'fetch_products') {
      // Fetch products from supplier API
      if (!supplierId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Supplier ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get supplier from database
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (supplierError || !supplier) {
        return new Response(
          JSON.stringify({ success: false, error: 'Supplier not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!supplier.api_endpoint) {
        return new Response(
          JSON.stringify({ success: false, error: 'Supplier has no API endpoint configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching products from:', supplier.name);

      // Build headers
      const requestHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(supplier.api_headers || {}),
      };

      if (supplier.api_key) {
        switch (supplier.auth_type) {
          case 'bearer':
            requestHeaders['Authorization'] = `Bearer ${supplier.api_key}`;
            break;
          case 'api_key':
            requestHeaders['X-API-Key'] = supplier.api_key;
            break;
          case 'basic':
            requestHeaders['Authorization'] = `Basic ${btoa(supplier.api_key)}`;
            break;
        }
      }

      try {
        const response = await fetch(supplier.api_endpoint, {
          method: 'GET',
          headers: requestHeaders,
        });

        if (!response.ok) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `API returned status ${response.status}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        
        // Update last sync time
        await supabase
          .from('suppliers')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', supplierId);

        // Try to extract products array from common response structures
        let products = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data.products) {
          products = data.products;
        } else if (data.items) {
          products = data.items;
        } else if (data.data) {
          products = Array.isArray(data.data) ? data.data : [data.data];
        } else {
          products = [data];
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            products: products.slice(0, 50), // Limit to 50 products
            total: products.length,
            supplier: supplier.name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to fetch products: ${fetchError.message}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
